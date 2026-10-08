"""在临时目录验证集成，不覆盖用户现有网页或素材。"""
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import build


class BuildIntegrationTests(unittest.TestCase):
    def test_3d_requires_assets(self):
        with tempfile.TemporaryDirectory() as tmp, patch.object(build, 'OUT', Path(tmp) / 'dist'), patch.object(build, 'HERE', Path(tmp)):
            with self.assertRaises(FileNotFoundError):
                build.build_site(with_3d=True)
            self.assertFalse((Path(tmp) / 'dist/enrobed.html').exists())

    def test_two_devices_get_shared_viewer_and_existing_assets_survive(self):
        with tempfile.TemporaryDirectory() as tmp, patch.object(build, 'OUT', Path(tmp) / 'dist'), patch.object(build, 'HERE', Path(tmp)):
            root = Path(tmp) / 'dist'
            (root / 'assets/three').mkdir(parents=True)
            for name in ['viewer.js', 'viewer.css']:
                (root / 'assets/three' / name).write_text('/* fixture */', encoding='utf-8')
            sentinel = root / 'assets/style.css'
            sentinel.write_text('existing stylesheet', encoding='utf-8')
            build.build_site(with_3d=True)
            self.assertEqual(len(list(root.glob('*.html'))), 10)
            for page in root.glob('*.html'):
                text = page.read_text('utf-8')
                self.assertEqual('assets/three/viewer.js' in text, page.stem in ('enrobed', 'chocolate'))
            text = (root / 'enrobed.html').read_text('utf-8')
            self.assertIn('互动工序样板', text)
            self.assertIn('data-playback hidden', text)
            self.assertEqual(text.count('data-phase="'), 5)
            self.assertIn('type="range"', text)
            self.assertIn('非真实加工时间', text)
            self.assertIn('id="equipment-3d"', text)
            stone = (root / 'chocolate.html').read_text('utf-8')
            self.assertIn('data-scene="stone-mill"', stone)
            self.assertIn('静态造型样板', stone)
            self.assertIn('研磨动画尚未接入', stone)
            self.assertIn('href="#step-3"', stone)
            self.assertIn('assets/photos/10.jpg', stone)
            self.assertIn('assets/photos/11.jpg', stone)
            self.assertNotIn('data-play', stone)
            self.assertNotIn('data-phase="', stone)
            self.assertNotIn('type="range"', stone)
            self.assertEqual(sentinel.read_text('utf-8'), 'existing stylesheet')

    def test_plain_build_has_no_3d_dependency(self):
        with tempfile.TemporaryDirectory() as tmp, patch.object(build, 'OUT', Path(tmp) / 'dist'), patch.object(build, 'HERE', Path(tmp)):
            build.build_site()
            for slug in ('enrobed', 'chocolate'):
                text = (Path(tmp) / f'dist/{slug}.html').read_text('utf-8')
                self.assertNotIn('assets/three/', text)


if __name__ == '__main__':
    unittest.main(verbosity=2)
