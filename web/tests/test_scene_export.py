"""场景映射与导出：使用副本测试，不改写正文。"""
import copy
import json
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from content import PAGES, SOURCES
from scene_content import ENROBED_SCENE
from export_scene_data import build_scene_data, export_scene


class SceneExportTests(unittest.TestCase):
    def setUp(self):
        self.scene = copy.deepcopy(ENROBED_SCENE)
        self.pages = copy.deepcopy(PAGES)

    def build(self):
        return build_scene_data(self.scene, self.pages, SOURCES)

    def test_reuses_prose_and_marks_schematic(self):
        data = self.build()
        page = next(p for p in self.pages if p['slug'] == 'enrobed')
        self.assertEqual(len(data['steps']), 5)
        self.assertEqual(data['steps'][0]['input'], page['steps'][0]['input'])
        self.assertEqual(data['photos']['machine'], 'assets/photos/25.jpg')
        self.assertEqual(data['duration'], 75)
        self.assertEqual(data['phases'][3]['evidence'], 'schematic')
        self.assertEqual(data['status'], 'static-prototype')

    def test_invalid_phase_sequences(self):
        for change in ['overlap', 'gap', 'zero', 'nan', 'missing_end']:
            with self.subTest(change=change):
                self.scene = copy.deepcopy(ENROBED_SCENE)
                if change == 'overlap': self.scene['phases'][1]['start'] = 11
                if change == 'gap': self.scene['phases'][1]['start'] = 13
                if change == 'zero': self.scene['phases'][0]['end'] = 0
                if change == 'nan': self.scene['phases'][0]['end'] = float('nan')
                if change == 'missing_end': self.scene['duration'] = 80
                with self.assertRaises(ValueError): self.build()

    def test_rejects_duplicate_or_unknown_references(self):
        for change in ['phase_id', 'step_id', 'unknown_step', 'unknown_source', 'missing_source']:
            with self.subTest(change=change):
                self.setUp()
                steps = next(p for p in self.pages if p['slug'] == 'enrobed')['steps']
                if change == 'phase_id': self.scene['phases'][1]['id'] = self.scene['phases'][0]['id']
                if change == 'step_id': steps[1]['id'] = steps[0]['id']
                if change == 'unknown_step': self.scene['phases'][0]['stepIds'] = ['unknown']
                if change == 'unknown_source': self.scene['phases'][0]['refs'] = ['unknown']
                if change == 'missing_source': self.scene['phases'][0]['refs'] = []
                with self.assertRaises(ValueError): self.build()

    def test_export_round_trip(self):
        with tempfile.TemporaryDirectory() as tmp:
            destination = Path(tmp) / 'generated' / 'enrobed.json'
            export_scene(destination)
            data = json.loads(destination.read_text('utf-8'))
            self.assertEqual(data, self.build())


if __name__ == '__main__':
    unittest.main(verbosity=2)
