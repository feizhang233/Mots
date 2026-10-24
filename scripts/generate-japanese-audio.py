#!/usr/bin/env python3
"""Generate and decode-check the Japanese vocabulary's bundled Kyoko clips.

Requires macOS say and afconvert. Existing valid clips are reused so an
interrupted run can resume. The audio map changes only after every clip passes.
"""
from __future__ import annotations

import argparse
from array import array
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import math
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import wave

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "database/japanese/vocabulary.json"
RUNTIME = ROOT / "database/runtime"
VOICE = "Kyoko"
RATE = 160


def command(arguments: list[str]) -> None:
    subprocess.run(arguments, check=True, capture_output=True, text=True, timeout=60)


def inspect_clip(path: Path, decoded: Path) -> dict:
    data = path.read_bytes()
    if len(data) < 1000 or data[4:8] != b"ftyp":
        raise ValueError(f"Invalid M4A container: {path.name}")
    command(["afconvert", "-f", "WAVE", "-d", "LEI16", str(path), str(decoded)])
    with wave.open(str(decoded), "rb") as audio:
        frames, sample_rate = audio.getnframes(), audio.getframerate()
        channels = audio.getnchannels()
        if audio.getsampwidth() != 2:
            raise ValueError(f"Expected decoded 16-bit PCM: {path.name}")
        samples = array("h", audio.readframes(frames))
    if sys.byteorder != "little":
        samples.byteswap()
    peak = max((abs(sample) for sample in samples), default=0)
    rms = math.sqrt(sum(sample * sample for sample in samples) / max(1, len(samples)))
    duration = frames / sample_rate
    if not 0.15 <= duration <= 10 or peak < 100 or rms < 20:
        raise ValueError(f"Silent or invalid clip {path.name}: {duration=}, {peak=}, {rms=}")
    return {
        "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(),
        "durationSeconds": duration, "sampleRate": sample_rate,
        "channels": channels, "peak": peak, "rms": rms,
    }


def generate(word: dict, check: bool) -> dict:
    identifier, reading = word["id"], word["reading"]
    if not re.fullmatch(r"ja-vocab-[a-f0-9]{12}", identifier) or not reading:
        raise ValueError(f"Invalid Japanese audio source: {identifier}")
    relative = f"extra-audio/{identifier}.m4a"
    destination = RUNTIME / relative
    with tempfile.TemporaryDirectory(prefix="mots-ja-") as temporary:
        work = Path(temporary)
        decoded = work / "decoded.wav"
        try:
            details = inspect_clip(destination, decoded)
        except (OSError, ValueError, wave.Error, subprocess.CalledProcessError):
            if check:
                raise
            aiff, candidate = work / "speech.aiff", work / "speech.m4a"
            command(["say", "-v", VOICE, "-r", str(RATE), "-o", str(aiff), reading])
            command(["afconvert", "-f", "m4af", "-d", "aac ", "-b", "64000", str(aiff), str(candidate)])
            decoded.unlink(missing_ok=True)
            details = inspect_clip(candidate, decoded)
            destination.write_bytes(candidate.read_bytes())
    return {
        "id": identifier, "language": "ja", "voice": VOICE, "locale": "ja-JP",
        "rate": RATE, "term": word["term"], "text": reading,
        "path": relative, **details,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--check", action="store_true", help="Decode-check without generating or changing maps")
    args = parser.parse_args()
    source = json.loads(SOURCE.read_text())
    words = source["words"]
    if len(words) != source["entryCount"] or len({word["id"] for word in words}) != len(words):
        raise ValueError("Invalid vocabulary source count or duplicate IDs")
    (RUNTIME / "extra-audio").mkdir(exist_ok=True)
    results = []
    with ThreadPoolExecutor(max_workers=max(1, min(args.workers, 8))) as pool:
        for result in pool.map(lambda word: generate(word, args.check), words):
            results.append(result)
            if len(results) % 50 == 0:
                print(f"Validated {len(results)}/{len(words)} Japanese clips.", flush=True)
    mapping_path = RUNTIME / "extra-audio.js"
    mapping = json.loads(re.sub(r"^window\.MOTS_EXTRA_AUDIO\s*=\s*", "", mapping_path.read_text()).rstrip(";\n "))
    japanese = {"voice": VOICE, "locale": "ja-JP", "words": {item["id"]: item["path"] for item in results}}
    if args.check:
        if mapping["ja"] != japanese:
            raise ValueError("Japanese audio map differs from vocabulary")
    else:
        mapping["ja"] = japanese
        mapping_path.write_text("window.MOTS_EXTRA_AUDIO = " + json.dumps(mapping, ensure_ascii=False, indent=2) + ";\n")
        report = {
            "source": "database/japanese/vocabulary.json",
            "sourceSHA256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
            "summary": {
                "files": len(results), "bytes": sum(item["bytes"] for item in results),
                "durationSeconds": sum(item["durationSeconds"] for item in results),
                "minRMS": min(item["rms"] for item in results),
                "minPeak": min(item["peak"] for item in results),
                "minDuration": min(item["durationSeconds"] for item in results),
                "maxDuration": max(item["durationSeconds"] for item in results),
            },
            "files": results,
        }
        (RUNTIME / "extra-audio/japanese-validation.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(f"{'Checked' if args.check else 'Generated'} {len(results)} non-silent Japanese word clips.")


if __name__ == "__main__":
    main()
