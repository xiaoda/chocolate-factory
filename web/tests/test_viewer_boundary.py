"""不为文本依赖检查额外引入 Node 类型或浏览器测试依赖。"""
from pathlib import Path
import unittest


class ViewerBoundaryTests(unittest.TestCase):
    def test_common_modules_do_not_import_equipment(self):
        root = Path(__file__).resolve().parents[1] / 'three/src'
        for name in ('viewer.ts', 'ui/controls.ts', 'core/playback.ts'):
            with self.subTest(module=name):
                self.assertNotRegex(
                    (root / name).read_text('utf-8'),
                    r'''from\s+['"][^'"]*(?:enrobed|enrober|stone-mill|generated)[^'"]*['"]''',
                )
