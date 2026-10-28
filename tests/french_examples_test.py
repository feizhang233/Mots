"""Editorial corpus checks: reject broken links, incomplete replacement and repeated sentences."""
import copy
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('french_examples', ROOT / 'scripts/update-french-examples.py')
editor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(editor)


class FrenchExamplesTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.words = [word for n in range(1, 17) for word in json.loads(next((ROOT / f'database/unit{n}').glob('*.json')).read_text())['words']]
        cls.examples = json.loads((ROOT / 'database/french/example-network.json').read_text())['examples']

    def test_every_word_has_a_unique_connected_example(self):
        result = editor.validate(self.words, self.examples)
        self.assertEqual(result['entries'], 3846)
        self.assertEqual(result['uniqueExamples'], 3846)
        self.assertEqual(result['connectedComponents'], [3846])
        self.assertGreaterEqual(result['minRelated'], 2)
        for word in self.words:
            record = self.examples[word['id']]
            self.assertEqual(word['example'], record['text'])
            self.assertEqual(word['exampleRelated'], record['related'])
            self.assertEqual(word['exampleTense'], record['tense'])
            self.assertEqual(word['exampleSource'], editor.PROVENANCE)
            self.assertIn('originalText', record)

    def test_missing_target_is_rejected(self):
        records = dict(self.examples)
        records.pop(next(iter(records)))
        with self.assertRaisesRegex(ValueError, 'coverage differs'):
            editor.validate(self.words, records)

    def test_absent_linked_form_is_rejected(self):
        records = copy.deepcopy(self.examples)
        records[next(iter(records))]['related'][0]['form'] = 'ce-mot-ne-figure-pas-dans-la-phrase'
        with self.assertRaisesRegex(ValueError, 'Related form absent'):
            editor.validate(self.words, records)

    def test_unknown_target_and_self_link_are_rejected(self):
        for target in ('missing-word-id', next(iter(self.examples))):
            records = copy.deepcopy(self.examples)
            records[next(iter(records))]['related'][0]['id'] = target
            with self.assertRaisesRegex(ValueError, 'Invalid related ID'):
                editor.validate(self.words, records)

    def test_duplicate_sentences_are_rejected(self):
        records = copy.deepcopy(self.examples)
        first, second = list(records)[:2]
        records[second] = copy.deepcopy(records[first])
        with self.assertRaisesRegex(ValueError, 'Duplicate example'):
            editor.validate(self.words, records)

    def test_present_only_corpus_is_rejected(self):
        records = copy.deepcopy(self.examples)
        for record in records.values():
            record['tense'] = 'present'
        with self.assertRaisesRegex(ValueError, 'proportion outside'):
            editor.validate(self.words, records)


if __name__ == '__main__':
    unittest.main(verbosity=2)
