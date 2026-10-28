#!/usr/bin/env python3
"""Apply or check the authored French example network without changing word identities."""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
TENSES = {'present', 'passe_compose', 'imparfait', 'futur', 'conditionnel', 'imperatif', 'plus_que_parfait', 'mixed'}
PROVENANCE = 'Original learning examples authored for Mots, 2026-10-25; not quotations from the source handbook.'


def dump(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def normalized(text: str) -> str:
    return text.casefold().replace('’', "'").replace('œ', 'oe')


def validate(words: list[dict], records: dict) -> dict:
    by_id = {w['id']: w for w in words}
    if len(by_id) != len(words) or set(by_id) != set(records):
        raise ValueError(f'Example ID coverage differs: missing={sorted(set(by_id)-set(records))[:10]}, extra={sorted(set(records)-set(by_id))[:10]}')
    seen = set()
    graph = defaultdict(set)
    inbound = Counter()
    tenses = Counter()
    cross_topic = 0
    lengths = []
    for identifier, record in records.items():
        text = record['text']
        if not isinstance(text, str) or not text.strip() or len(text) > 2000:
            raise ValueError(f'Invalid example: {identifier}')
        fingerprint = normalized(text.strip())
        if fingerprint in seen:
            raise ValueError(f'Duplicate example: {identifier}')
        seen.add(fingerprint)
        if record['tense'] not in TENSES:
            raise ValueError(f'Invalid tense: {identifier}')
        tenses[record['tense']] += 1
        lengths.append(len(text.split()))
        linked = set()
        for link in record['related']:
            target, form = link['id'], link['form']
            if target not in by_id or target == identifier or target in linked or not form.strip():
                raise ValueError(f'Invalid related ID: {identifier}: {link}')
            if not re.search(r'(?<!\w)' + re.escape(normalized(form)) + r'(?!\w)', fingerprint):
                raise ValueError(f'Related form absent: {identifier}: {link}')
            linked.add(target)
            inbound[target] += 1
            graph[identifier].add(target)
            graph[target].add(identifier)
        if len(linked) < 2:
            raise ValueError(f'Fewer than two distinct related words: {identifier}')
        cross_topic += any(by_id[target]['category'] != by_id[identifier]['category'] for target in linked)
    ratio = tenses['present'] / len(records)
    if not .45 <= ratio <= .55:
        raise ValueError(f'Primary present proportion outside 45–55%: {ratio:.3f}')
    remaining, components = set(by_id), []
    while remaining:
        todo, component = [next(iter(remaining))], set()
        while todo:
            node = todo.pop()
            if node in component:
                continue
            component.add(node)
            todo.extend(graph[node] - component)
        remaining -= component
        components.append(len(component))
    return dict(entries=len(records), uniqueExamples=len(seen), relatedLinks=sum(inbound.values()),
                minRelated=min(len(r['related']) for r in records.values()),
                tenses=dict(tenses), primaryPresentRatio=ratio,
                crossCategoryExamples=cross_topic, connectedComponents=sorted(components, reverse=True),
                distinctRelatedTargets=len(inbound), meanWords=round(sum(lengths)/len(lengths), 2),
                minWords=min(lengths), maxWords=max(lengths))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT)
    parser.add_argument('--input', type=Path, help='Validated complete authored supplement')
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    root = args.root.resolve()
    network_path = root / 'database/french/example-network.json'
    sources = [next((root / f'database/unit{n}').glob('*.json')) for n in range(1, 17)]
    units = [json.loads(p.read_text()) for p in sources]
    words = [w for unit in units for w in unit['words']]
    if args.input:
        records = json.loads(args.input.read_text())
    else:
        records = json.loads(network_path.read_text())['examples']
    statistics = validate(words, records)
    if args.check:
        for word in words:
            record = records[word['id']]
            expected = (record['text'], record['tense'], record['related'], PROVENANCE)
            actual = (word['example'], word.get('exampleTense'), word.get('exampleRelated'), word.get('exampleSource'))
            if actual != expected:
                raise ValueError(f'Generated example drift: {word["id"]}')
        print(json.dumps(statistics, ensure_ascii=False, indent=2))
        return
    if not args.input:
        raise ValueError('--input is required when applying a new supplement')
    previous = json.loads(network_path.read_text())['examples'] if network_path.exists() else {}
    for path, unit in zip(sources, units):
        unit.setdefault('originalMethod', unit.get('method', ''))
        unit['method'] = '詞條、分類、原書頁碼與校對註記保留原整理；例句於 2026-10-25 改為 Mots 原創詞彙關聯例句。原例句保存在 french/example-network.json 的 originalText，XLSX 保留原書轉錄版本。'
        for word in unit['words']:
            record = records[word['id']]
            record.setdefault('originalText', previous.get(word['id'], {}).get('originalText', word['example']))
            word.update(example=record['text'], exampleTense=record['tense'],
                        exampleRelated=record['related'], exampleSource=PROVENANCE)
        unit['exampleMethod'] = PROVENANCE
        dump(path, unit)
    # Keep the original category metadata and replace only WORDS in the shared runtime.
    runtime_path = root / 'database/runtime/data.js'
    runtime = runtime_path.read_text()
    prefix, separator, _ = runtime.partition('window.WORDS = ')
    if not separator:
        raise ValueError('Shared vocabulary assignment was not found')
    runtime_path.write_text(prefix + separator + json.dumps(words, ensure_ascii=False, indent=2) + ';\n')
    # Do not associate new text with the old textbook recordings. Word recordings stay valid.
    audio_path = root / 'database/runtime/audio-manifest.js'
    audio = json.loads(re.sub(r'^window\.MOTS_AUDIO\s*=\s*', '', audio_path.read_text()).rstrip(';\n '))
    audio['examples'] = {}
    audio['exampleSource'] = 'Authored examples use device speech if requested; obsolete textbook clip references removed.'
    audio_path.write_text('window.MOTS_AUDIO = ' + json.dumps(audio, ensure_ascii=False, indent=2) + ';\n')
    dump(network_path, dict(schemaVersion=1, language='fr', authoredOn='2026-10-25',
                            provenance=PROVENANCE, tenseConvention='Primary clause; subordinate clauses can use other natural tenses.',
                            associationConvention='Related ID and literal inflected surface form; these are data relations, not UI navigation controls.',
                            originalWorkbookConvention='Unit XLSX files retain the original handbook transcription; current examples are maintained in JSON.',
                            statistics=statistics, examples=records))
    manifest_path = root / 'database/manifest.json'
    manifest = json.loads(manifest_path.read_text())
    manifest['totalFileBytes'] = 0
    for unit in manifest['units']:
        for item in unit['files']:
            data = (root / 'database' / item['path']).read_bytes()
            item.update(bytes=len(data), sha256=hashlib.sha256(data).hexdigest())
            manifest['totalFileBytes'] += len(data)
    manifest['exampleSource'] = 'french/example-network.json'
    manifest['xlsxRole'] = 'Original handbook transcription, including original textbook examples; current authored examples live in JSON.'
    dump(manifest_path, manifest)
    print(json.dumps(statistics, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
