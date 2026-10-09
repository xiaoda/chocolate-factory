"""五辊动画样板及同页设备的 HTML 契约。"""
from html.parser import HTMLParser
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from export_scene_data import build_scene_data
from scene_content import SCENES, PAGE_SCENES
from equipment_catalog import equipment_entries, animation_entries
from three_markup import render_equipment_lab


class Ids(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.ids = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])


class FiveRollTests(unittest.TestCase):
    def test_animation_contract_and_original_step_number(self):
        scene = build_scene_data(SCENES['five-roll'])
        self.assertEqual(scene['status'], 'animated-prototype')
        self.assertEqual(scene['duration'], 60)
        self.assertEqual(len(scene['phases']), 5)
        self.assertEqual({sid for phase in scene['phases'] for sid in phase['stepIds']}, {'roller-refining'})
        self.assertTrue(all('roll-principle' in p['refs'] for p in scene['phases']))
        self.assertEqual([(s['id'], s['number']) for s in scene['steps']], [('roller-refining', 4)])
        self.assertEqual(scene['photos'], {'machine': 'assets/photos/19.jpg', 'plate': 'assets/photos/20.jpg'})
        self.assertEqual({p['id'] for p in scene['parts']}, {'rollers', 'frame', 'drive', 'controls'})
        self.assertEqual(PAGE_SCENES['chocolate'], ('stone-mill', 'five-roll'))

    def test_catalog_distinguishes_observation_and_animation(self):
        self.assertEqual(len(equipment_entries()), 3)
        self.assertEqual(len(animation_entries()), 3)
        entry = next(e for e in equipment_entries() if e['id'] == 'five-roll')
        self.assertTrue(entry['animated'])
        self.assertEqual(entry['href'], 'chocolate.html#equipment-five-roll')
        self.assertEqual(entry['stepIds'], ['roller-refining'])

    def test_unique_ids_and_animation_controls(self):
        stone = render_equipment_lab('stone-mill')
        five = render_equipment_lab('five-roll')
        ids = Ids(stone + five).ids
        self.assertEqual(len(ids), len(set(ids)))
        self.assertIn('id="equipment-3d"', stone)
        self.assertIn('id="equipment-five-roll"', five)
        self.assertIn('data-playback hidden', five)
        self.assertEqual(five.count('data-phase='), 5)
        self.assertIn('data-roll-diagram', five)
        self.assertIn('非展品剖面', five)
        self.assertNotIn('暂无工序动画', five)
        self.assertIn('href="#step-4"', five)
        self.assertNotIn('source-stone-motion', five)
        self.assertIn('href="#equipment-five-roll"', stone)
        self.assertIn('href="#equipment-3d"', five)


if __name__ == '__main__':
    unittest.main()
