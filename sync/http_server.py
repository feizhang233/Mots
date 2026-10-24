"""Bounded HTTP transport: authentication, Origin checks, parsing and throttling."""

from collections import OrderedDict, deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import ipaddress
import json
import re
import sqlite3
import threading
import time
from urllib.parse import urlsplit

from .protocol import (
    BASE, MAX_BODY, SyncError, reject_json_constant, unique_json_object,
)


def origin_allowed(origin):
    """Native clients omit Origin; browser origins must be explicit and trusted."""
    if origin is None:
        return True
    try:
        parsed = urlsplit(origin)
        if (parsed.username is not None or parsed.password is not None or parsed.path
                or parsed.query or parsed.fragment or parsed.port == 0):
            return False
        if (parsed.scheme == "https" and parsed.hostname == "mots.feizhang233.com"
                and parsed.port in {None, 443}):
            return True
        if parsed.scheme not in {"http", "https"}:
            return False
        if parsed.hostname == "localhost":
            return True
        return ipaddress.ip_address(parsed.hostname or "").is_loopback
    except ValueError:
        return False


class CreationLimiter:
    def __init__(self, limit=10, window=3600, global_limit=60):
        self.limit = limit
        self.window = window
        self.global_limit = global_limit
        self.clients = OrderedDict()
        self.all_requests = deque()
        self.lock = threading.Lock()

    def allow(self, client):
        now = time.monotonic()
        with self.lock:
            while self.all_requests and self.all_requests[0] <= now - self.window:
                self.all_requests.popleft()
            queue = self.clients.pop(client, deque())
            while queue and queue[0] <= now - self.window:
                queue.popleft()
            self.clients[client] = queue
            while len(self.clients) > 2048:
                self.clients.popitem(last=False)
            if len(queue) >= self.limit or len(self.all_requests) >= self.global_limit:
                return False
            queue.append(now)
            self.all_requests.append(now)
            return True


class SyncHTTPServer(ThreadingHTTPServer):
    daemon_threads = True

    def __init__(self, address, store, *, max_body=MAX_BODY, create_limit=10,
                 create_window=3600, create_global_limit=60):
        self.store = store
        self.max_body = max_body
        self.limiter = CreationLimiter(create_limit, create_window, create_global_limit)
        self.slots = threading.BoundedSemaphore(8)
        super().__init__(address, SyncHandler)

    def process_request(self, request, client_address):
        if not self.slots.acquire(blocking=False):
            try:
                request.sendall(b"HTTP/1.1 503 Service Unavailable\r\nContent-Length: 0\r\nConnection: close\r\n\r\n")
            finally:
                self.shutdown_request(request)
            return
        try:
            super().process_request(request, client_address)
        except BaseException:
            self.slots.release()
            raise

    def process_request_thread(self, request, client_address):
        try:
            super().process_request_thread(request, client_address)
        finally:
            self.slots.release()

    def handle_error(self, request, client_address):
        # Deliberately no request/header/body tracebacks: pairing codes are credentials.
        pass


class SyncHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    server_version = "MotsSync/1"
    sys_version = ""

    def setup(self):
        super().setup()
        self.connection.settimeout(15)

    def log_message(self, format, *args):
        pass

    def check_origin(self):
        origins = self.headers.get_all("Origin", [])
        if len(origins) > 1 or not origin_allowed(origins[0] if origins else None):
            raise SyncError(403, "Origin not allowed")

    def authenticate(self):
        values = self.headers.get_all("Authorization", [])
        match = re.fullmatch(r"(?i:Bearer) (mots-[A-Za-z0-9_-]{43})", values[0]) if len(values) == 1 else None
        digest = self.server.store.authenticate(match[1]) if match else None
        if digest is None:
            raise SyncError(401, "Invalid pairing code")
        return digest

    def respond(self, status, payload):
        body = json.dumps(payload, ensure_ascii=True, separators=(",", ":")).encode("ascii")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Connection", "close")
        self.send_header("Vary", "Origin")
        origin = self.headers.get("Origin")
        if origin is not None and origin_allowed(origin):
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type")
            self.send_header("Access-Control-Max-Age", "600")
        if status in {429, 503}:
            self.send_header("Retry-After", "60")
        self.end_headers()
        self.close_connection = True
        self.wfile.write(body)

    def fail(self, error):
        self.respond(error.status, {"error": error.message})

    def handle_expect_100(self):
        try:
            self.check_origin()
            if self.path in {BASE + "/exchange", BASE + "/deletions"}:
                self.authenticate()
        except SyncError as error:
            self.fail(error)
            return False
        return super().handle_expect_100()

    def read_json(self):
        lengths = self.headers.get_all("Content-Length", [])
        if self.headers.get("Transfer-Encoding") is not None or len(lengths) != 1 or not re.fullmatch(r"[0-9]+", lengths[0]):
            raise SyncError(400, "Invalid body length")
        if len(lengths[0]) > 20:
            raise SyncError(413, "Request body too large")
        length = int(lengths[0])
        if length > self.server.max_body:
            raise SyncError(413, "Request body too large")
        if self.headers.get_content_type() != "application/json":
            raise SyncError(400, "Expected JSON body")
        try:
            raw = self.rfile.read(length)
            if len(raw) != length:
                raise SyncError(400, "Incomplete request body")
            return json.loads(raw.decode("utf-8"), parse_constant=reject_json_constant,
                              object_pairs_hook=unique_json_object)
        except (UnicodeError, ValueError, RecursionError):
            raise SyncError(400, "Invalid JSON body") from None

    def do_POST(self):
        try:
            self.check_origin()
            if self.path == BASE + "/exchange":
                # Authenticate before inspecting or reading the request body.
                digest = self.authenticate()
                result = self.server.store.exchange(digest, self.read_json())
            elif self.path == BASE + "/deletions":
                digest = self.authenticate()
                result = self.server.store.exchange_deletions(digest, self.read_json())
            elif self.path == BASE + "/create":
                # Ignore forwarded IP headers; only the actual peer is trusted.
                if not self.server.limiter.allow(self.client_address[0]):
                    raise SyncError(429, "Pairing creation rate limit reached")
                if self.read_json() != {}:
                    raise SyncError(400, "Expected empty JSON object")
                result = self.server.store.create()
            else:
                raise SyncError(404, "Endpoint not found")
            self.respond(200, result)
        except SyncError as error:
            self.fail(error)
        except (OSError, sqlite3.Error):
            self.respond(503, {"error": "Storage temporarily unavailable"})
        except Exception:
            self.respond(500, {"error": "Exchange unavailable"})

    def do_GET(self):
        try:
            self.check_origin()
            if self.path != BASE + "/health":
                raise SyncError(404, "Endpoint not found")
            self.respond(200, {"version": 1, "status": "ok"})
        except SyncError as error:
            self.fail(error)

    def do_OPTIONS(self):
        try:
            self.check_origin()
            if self.path not in {BASE + "/create", BASE + "/exchange", BASE + "/deletions", BASE + "/health"}:
                raise SyncError(404, "Endpoint not found")
            method = self.headers.get("Access-Control-Request-Method", "POST")
            requested = {value.strip().lower() for value in self.headers.get("Access-Control-Request-Headers", "").split(",") if value.strip()}
            if method not in {"POST", "GET"} or not requested <= {"authorization", "content-type"}:
                raise SyncError(403, "Preflight not allowed")
            self.respond(200, {"version": 1})
        except SyncError as error:
            self.fail(error)
