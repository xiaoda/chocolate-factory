"""不依赖第三方包的静态交付检查。"""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import unittest

ROOT = Path(__file__).parent / 'dist'
NAMES = ['index', 'chocolate', 'coins', 'enrobed', 'panned', 'filled', 'lollipop', 'fondant', 'cut-candy', 'milk-tablets']

class Document(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags = []
        self.ids = []
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if 'id' in attrs:
            self.ids.append(attrs['id'])

class SiteTests(unittest.TestCase):
    def test_animation_directory_links(self):
        home = (ROOT / 'index.html').read_text('utf-8')
        if 'id="animations"' not in home:
            self.skipTest('本次为纯图文构建')
        from equipment_catalog import animation_entries
        cards = [attrs for tag, attrs in Document(home).tags if tag == 'a' and attrs.get('class') == 'animation-card']
        self.assertEqual({a['href'] for a in cards}, {entry['href'] for entry in animation_entries()})
        self.assertNotIn('assets/three/', home)
        for name in NAMES:
            html = (ROOT / f'{name}.html').read_text('utf-8')
            self.assertIn('href="index.html#animations"', html)
        for entry in animation_entries():
            text = (ROOT / f"{entry['pageSlug']}.html").read_text('utf-8')
            switcher = text.split('<nav class="animation-switcher"', 1)[1].split('</nav>', 1)[0]
            self.assertEqual(switcher.count('aria-current="page"'), 1)
            self.assertEqual(text.count('class="step-animation-link"'), len(entry['stepIds']))

    def test_optional_three_integration(self):
        text = (ROOT / 'enrobed.html').read_text('utf-8')
        if 'id="equipment-3d"' not in text:
            self.skipTest('本次为纯图文构建')
        self.assertIn('互动工序样板', text)
        self.assertIn('补充工序示意', text)
        self.assertNotIn('工序动画尚未接入', text)
        self.assertEqual(text.count('data-phase="'), 5)
        self.assertIn('type="module" src="assets/three/viewer.js"', text)
        stone = (ROOT / 'chocolate.html').read_text('utf-8')
        self.assertIn('data-scene="stone-mill"', stone)
        self.assertIn('研磨工序样板', stone)
        self.assertNotIn('研磨动画尚未接入', stone)
        self.assertIn('data-playback hidden', stone)
        self.assertEqual(stone.count('data-phase="'), 4)
        self.assertIn('max="60"', stone)
        self.assertIn('href="#step-3"', stone)
        folder = ROOT / 'assets/three'
        for name in ['viewer.js', 'viewer.css', 'THIRD_PARTY_LICENSES.md']:
            self.assertTrue((folder / name).is_file(), name)
        self.assertTrue(list((folder / 'chunks').glob('*.js')))
        for name in NAMES:
            if name not in ('enrobed', 'chocolate'):
                self.assertNotIn('assets/three/', (ROOT / f'{name}.html').read_text('utf-8'))

    def test_content_sources(self):
        from content import PAGES, SOURCES
        self.assertEqual(len(PAGES), 9)
        self.assertEqual(len({p['slug'] for p in PAGES}), 9)
        for page in PAGES:
            with self.subTest(page=page['slug']):
                for key in page['sources']:
                    self.assertIn(key, SOURCES)
                for step in page['steps']:
                    for key in step.get('refs', []):
                        self.assertIn(key, page['sources'])
                    for key in ('input','output','action','why'):
                        self.assertTrue(step[key])
                for related in page['related']:
                    self.assertIn(related, NAMES)

    def test_all_pages_exist(self):
        for name in NAMES:
            self.assertTrue((ROOT / f'{name}.html').is_file(), name)

    def test_documents(self):
        for name in NAMES:
            with self.subTest(page=name):
                path = ROOT / f'{name}.html'
                self.assertTrue(path.exists())
                text = path.read_text('utf-8')
                doc = Document(text)
                self.assertIn('lang="zh-CN"', text)
                self.assertEqual(sum(t == 'h1' for t, a in doc.tags), 1)
                self.assertEqual(len(doc.ids), len(set(doc.ids)), 'duplicate ids')
                self.assertTrue(any(t == 'meta' and a.get('name') == 'viewport' for t, a in doc.tags))
                self.assertTrue(any(t == 'main' for t, a in doc.tags))
                self.assertIn('不是生产操作规程', text)
                if name != 'index':
                    for required in ['id="process"', 'id="steps"', 'id="knowledge"', 'id="sources"', '实拍', '资料补全']:
                        self.assertIn(required, text)
                for tag, attrs in doc.tags:
                    if tag == 'img':
                        self.assertTrue(attrs.get('alt'), 'missing alt')
                        self.assertTrue(attrs.get('width') and attrs.get('height'), 'missing dimensions')
                    for key in ['src', 'href']:
                        if key not in attrs:
                            continue
                        url = urlsplit(attrs[key])
                        if url.scheme or url.netloc:
                            continue
                        target = (path.parent / unquote(url.path)).resolve() if url.path else path
                        self.assertTrue(target.is_relative_to(ROOT.resolve()))
                        self.assertTrue(target.exists(), f'broken link: {attrs[key]}')
                        if url.fragment and target.suffix == '.html':
                            targetdoc = Document(target.read_text('utf-8'))
                            self.assertIn(unquote(url.fragment), targetdoc.ids, attrs[key])

if __name__ == '__main__':
    unittest.main(verbosity=2)
