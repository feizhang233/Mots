.PHONY: build check test serve package prepare

build:
	python3 scripts/build.py

check:
	python3 scripts/build.py --check
	node --check dist/data.js
	node --check dist/audio-manifest.js
	node --check dist/extra-audio.js
	node --check dist/select.js

test: check
	node tests/run.cjs
	python3 tests/deploy_test.py

serve: build
	python3 -m http.server 4173 --bind 127.0.0.1 --directory dist

package: test
	python3 scripts/package.py

prepare: test
	python3 deploy/prepare.py
