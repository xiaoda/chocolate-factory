import copy
import json
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from scene_content import STONE_MILL_SCENE
from export_scene_data import build_scene_data, export_scenes


class StoneSceneTests(unittest.TestCase):
    def test_animation_reuses_original_step_and_keeps_its_number(self):
        data = build_scene_data(STONE_MILL_SCENE)
        self.assertEqual(data['pageSlug'], 'chocolate')
        self.assertEqual(data['status'], 'animated-prototype')
        self.assertEqual(data['duration'], 60)
        self.assertEqual([p['id'] for p in data['phases']], ['feeding', 'crushing', 'liquefying', 'result'])
        self.assertTrue(all(p['stepIds'] == ['nib-grinding'] for p in data['phases']))
        self.assertEqual(data['steps'][0]['id'], 'nib-grinding')
        self.assertEqual(data['steps'][0]['number'], 3)
        self.assertIn('待核实', data['boundary'])
        self.assertIn('教学', data['boundary'])

    def test_static_scene_cannot_pretend_to_have_animation(self):
        data = copy.deepcopy(STONE_MILL_SCENE)
        data.update(status='static-prototype', duration=0, phases=[])
        self.assertEqual(build_scene_data(data)['duration'], 0)
        data['duration'] = 75
        with self.assertRaises(ValueError): build_scene_data(data)
        data = copy.deepcopy(STONE_MILL_SCENE)
        data['stepIds'] = ['missing']
        with self.assertRaises(ValueError): build_scene_data(data)

    def test_all_scene_export(self):
        with tempfile.TemporaryDirectory() as tmp:
            paths = export_scenes(Path(tmp))
            self.assertEqual({p.name for p in paths}, {'enrobed.json', 'stone-mill.json', 'five-roll.json'})
            self.assertEqual(json.loads((Path(tmp) / 'enrobed.json').read_text('utf-8'))['duration'], 75)
