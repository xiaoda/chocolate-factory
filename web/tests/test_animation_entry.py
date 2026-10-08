"""动画入口只生成普通链接，不向首页和纯图文版引入查看器。"""
from copy import deepcopy
from html.parser import HTMLParser
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import build
from equipment_catalog import animation_entries
from scene_content import SCENES


class Links(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.links = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            self.links.append(dict(attrs))


class AnimationEntryTests(unittest.TestCase):
    def test_catalog_uses_scene_contract(self):
        entries = animation_entries()
        self.assertEqual([x['id'] for x in entries], ['stone-mill', 'enrobed'])
        for entry in entries:
            scene = SCENES[entry['id']]
            self.assertEqual(entry['duration'], scene['duration'])
            self.assertEqual(entry['phaseCount'], len(scene['phases']))
            self.assertEqual(entry['photo'], scene['photos']['machine'])
            self.assertEqual(entry['href'], f"{scene.get('pageSlug', scene['id'])}.html#equipment-3d")
            self.assertEqual(set(entry['stepIds']), {sid for phase in scene['phases'] for sid in phase['stepIds']})

    def test_static_scene_is_not_advertised_as_animation(self):
        scenes = deepcopy(SCENES)
        scenes['stone-mill'].update(status='static-prototype', duration=0, phases=[])
        with patch('equipment_catalog.SCENES', scenes):
            self.assertEqual([x['id'] for x in animation_entries()], ['enrobed'])

    def build_in(self, folder, enhanced):
        root = Path(folder) / 'dist'
        if enhanced:
            (root / 'assets/three').mkdir(parents=True)
            for file in ('viewer.js', 'viewer.css'):
                (root / 'assets/three' / file).write_text('/* fixture */', encoding='utf-8')
        with patch.object(build, 'OUT', root), patch.object(build, 'HERE', Path(folder)):
            build.build_site(with_3d=enhanced)
        return root

    def test_home_cards_and_global_navigation_do_not_load_three(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = self.build_in(tmp, True)
            home = (root / 'index.html').read_text('utf-8')
            self.assertIn('id="animations"', home)
            cards = [a for a in Links(home).links if 'animation-card' in a.get('class', '').split()]
            self.assertEqual({a['href'] for a in cards}, {x['href'] for x in animation_entries()})
            self.assertIn('60 秒', home)
            self.assertIn('75 秒', home)
            self.assertIn('设备实拍', home)
            for page in root.glob('*.html'):
                html = page.read_text('utf-8')
                self.assertIn('href="index.html#animations"', html)
                if page.stem not in ('chocolate', 'enrobed'):
                    self.assertNotIn('assets/three/', html)

    def test_switcher_marks_current_device_and_preserves_step_numbers(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = self.build_in(tmp, True)
            for entry in animation_entries():
                html = (root / f"{entry['pageSlug']}.html").read_text('utf-8')
                switcher = html.split('<nav class="animation-switcher"', 1)[1].split('</nav>', 1)[0]
                links = Links(switcher).links
                current = [a for a in links if a.get('aria-current') == 'page']
                self.assertEqual(len(current), 1)
                self.assertEqual(current[0]['href'], '#equipment-3d')
                other = next(x for x in animation_entries() if x['id'] != entry['id'])
                self.assertIn(other['href'], [a['href'] for a in links])
                steps = next(p for p in build.PAGES if p['slug'] == entry['pageSlug'])['steps']
                for number, step in enumerate(steps, 1):
                    section = html.split(f'id="step-{number}"', 1)[1].split('</section>', 1)[0]
                    self.assertEqual('class="step-animation-link"' in section, step.get('id') in entry['stepIds'])
                expected = 1 if entry['id'] == 'stone-mill' else 5
                self.assertEqual(html.count('class="flow-animation-link"'), expected)

    def test_plain_build_has_no_animation_links(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = self.build_in(tmp, False)
            for page in root.glob('*.html'):
                html = page.read_text('utf-8')
                for unwanted in ('#equipment-3d', '#animations', 'assets/three/', 'animation-card', 'animation-switcher'):
                    self.assertNotIn(unwanted, html)


if __name__ == '__main__':
    unittest.main(verbosity=2)
