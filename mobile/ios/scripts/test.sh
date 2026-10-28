#!/usr/bin/env bash
set -euo pipefail
project_root="$(cd "$(dirname "$0")/../../.." && pwd)"
ios_root="$project_root/mobile/ios"
test_directory="$(mktemp -d "${TMPDIR:-/tmp}/mots-ios-tests.XXXXXX")"
trap 'rm -rf "$test_directory"' EXIT

# Xcode and these Foundation-only harnesses share one source manifest. SwiftUI stays in the app list.
model_sources=()
while IFS= read -r relative_path; do
  model_sources+=("$ios_root/Mots/$relative_path")
done < <(python3 -c 'import json,sys; print("\n".join(json.load(open(sys.argv[1]))["model"]))' "$ios_root/scripts/sources.json")

run_suite() {
  local suite_name="$1"
  shift
  xcrun swiftc -module-cache-path "$test_directory/modules" -parse-as-library \
    "${model_sources[@]}" "$ios_root/Tests/$suite_name.swift" \
    -o "$test_directory/$suite_name"
  "$test_directory/$suite_name" "$@"
}

run_suite StudyModelsTests
run_suite StudyStoreTests "$ios_root/Mots/Resources/catalog.json"
run_suite ListMeaningTests
run_suite CardPagingTests
run_suite GrammarStudyStoreTests "$ios_root/Mots/Resources/catalog.json"
run_suite ProgressSyncTests
run_suite WordDeletionTests
