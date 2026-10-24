#!/usr/bin/env python3
"""Private, bounded, standard-library-only Mots progress exchange service."""

import argparse
import os
from pathlib import Path
import sys

# Keep the installed script entrypoint and package imports equivalent.
if not __package__:
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    __package__ = "sync"

from .http_server import CreationLimiter, SyncHandler, SyncHTTPServer, origin_allowed
from .protocol import (
    BASE, CODE, DELETION_FIELDS, DEVICE, FIELDS, MAX_BODY, MAX_CLOCK, MAX_GROUPS,
    MAX_RECORDS, RESERVED, SyncError, deletion_rank, identifier, rank,
    reject_json_constant, unique_json_object, validated_deletions, validated_records,
)
from .store import SyncStore


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8011)
    parser.add_argument("--database", required=True, type=Path)
    args = parser.parse_args()
    os.umask(0o077)
    server = SyncHTTPServer((args.host, args.port), SyncStore(args.database))
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
