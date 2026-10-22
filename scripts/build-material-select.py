#!/usr/bin/env python3
"""Bundle the pinned official Material Web select for the offline HTML.

Install the versions in vendor/material-select/dependencies.json into a temporary
node_modules folder, then pass that folder with --node-modules. No network or
package-manager scripts run here. The full third-party licenses are embedded in
the result so the standalone HTML carries them as well as the project ZIP.
"""
import argparse
import json
import os
from pathlib import Path
import platform
import subprocess
import sys

from assets import SRC, digest, select_input_digest

ROOT = Path(__file__).resolve().parent.parent
VENDOR = ROOT / 'scripts' / 'vendor' / 'material-select'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--node-modules', required=True, type=Path)
    args = parser.parse_args()
    modules = args.node_modules.resolve()
    manifest = json.loads((VENDOR / 'dependencies.json').read_text())
    for name, entry in manifest.items():
        if name.startswith('@esbuild/'):
            continue
        package = json.loads((modules / name / 'package.json').read_text())
        if package['version'] != entry['version']:
            raise SystemExit(f'Unexpected dependency version: {name}')
    operating_system = {'darwin': 'darwin', 'linux': 'linux', 'win32': 'win32'}[sys.platform]
    architecture = {'arm64': 'arm64', 'aarch64': 'arm64', 'x86_64': 'x64', 'AMD64': 'x64'}[platform.machine()]
    binary = modules / '@esbuild' / f'{operating_system}-{architecture}' / 'bin' / 'esbuild'
    license_texts = []
    for path in sorted(VENDOR.iterdir()):
        if 'LICENSE' in path.name:
            license_texts.append(f'{path.name}\n{path.read_text()}')
    banner = '/*! @license\nBundled official Material Web select and dependencies.\n\n' + '\n\n'.join(license_texts).replace('*/', '* /') + '\n*/'
    environment = dict(os.environ)
    environment['NODE_PATH'] = str(modules)
    subprocess.run([
        str(binary), str(SRC / 'components' / 'material-select.js'),
        '--bundle', '--minify', '--format=iife', '--platform=browser',
        '--target=es2020', '--legal-comments=inline', f'--banner:js={banner}',
        f'--outfile={ROOT / "dist" / "select.js"}',
    ], env=environment, check=True)
    (VENDOR / 'build.json').write_text(json.dumps({
        'inputs_sha256': select_input_digest(),
        'bundle_sha256': digest((ROOT / 'dist/select.js').read_bytes()),
    }, indent=2) + '\n')


if __name__ == '__main__':
    main()
