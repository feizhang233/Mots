.PHONY: help build check test test-web test-sync test-tools serve package prepare sync-vps ios-assets ios-check ios-build ios-preview-build
.DEFAULT_GOAL := build

help:
	@printf '%s\n' 'build       Build Web and shared catalogs' 'test        Check generated output and run all Web/server/tool tests' 'test-web    Run Web regression suites' 'test-sync   Run synchronization HTTP tests' 'test-tools  Run deployment and data integrity tests' 'ios-check   Generate Xcode project and run native tests' 'serve       Build and serve Web on localhost:4173' 'package     Verify and generate offline HTML/project ZIP' 'prepare     Verify and prepare release checksums' 'sync-vps    Verify and deploy to the configured Mots server'

build:
	python3 scripts/import-japanese-grammar.py
	python3 web/scripts/build.py
	python3 scripts/sync-data.py

check:
	python3 web/scripts/build.py --check
	python3 scripts/sync-data.py --check
	@for script in web/dist/*.js; do node --check "$$script" || exit $$?; done

test: check test-web test-sync test-tools

test-web: check
	node web/tests/run.cjs

test-sync:
	python3 -m unittest discover -s sync -p 'test_*.py'

test-tools:
	python3 tests/deploy_test.py
	python3 tests/data_sync_test.py
	python3 tests/french_examples_test.py

serve: build
	python3 -m http.server 4173 --bind 127.0.0.1 --directory web/dist

package: test
	python3 scripts/package.py

prepare: test
	python3 deploy/prepare.py

sync-vps:
	python3 deploy/sync.py

# Native iOS app. Shared data/audio are owned by database/runtime/.
ios-assets:
	node mobile/ios/scripts/export-content.cjs
	python3 mobile/ios/scripts/generate-project.py

ios-check: ios-assets
	node mobile/ios/scripts/export-content.cjs --check
	bash mobile/ios/scripts/test.sh
	python3 mobile/ios/Tests/project_test.py

ios-build: ios-assets
	xcodebuild -project mobile/ios/Mots.xcodeproj -scheme Mots -configuration Release -destination 'generic/platform=iOS' -derivedDataPath mobile/ios/build/device CODE_SIGNING_ALLOWED=NO build

ios-preview-build: ios-assets
	xcodebuild -project mobile/ios/Mots.xcodeproj -scheme Mots -configuration Debug -destination 'platform=macOS,variant=Mac Catalyst' -derivedDataPath mobile/ios/build/catalyst CODE_SIGNING_ALLOWED=NO build
