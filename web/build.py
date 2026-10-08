"""生成无需运行时依赖的工艺手册。执行：python web/build.py。"""
from pathlib import Path
from html import escape as e
import shutil
import struct
import argparse
from three_markup import render_equipment_lab
from content import PAGES, SOURCES, REFERENCES

HERE = Path(__file__).resolve().parent
OUT = HERE / 'dist'
PHOTOS = HERE.parent / 'photos'
MANIFEST = {}

def size(path):
    data = path.read_bytes()
    i = 2
    while i < len(data):
        if data[i] != 255:
            i += 1
            continue
        while data[i] == 255:
            i += 1
        marker = data[i]
        i += 1
        if marker in (0xD8, 0xD9):
            continue
        length = int.from_bytes(data[i:i+2], 'big')
        if marker in (0xC0, 0xC1, 0xC2):
            height, width = struct.unpack('>HH', data[i+3:i+7])
            return width, height
        i += length
    raise ValueError(f'无法读取 JPEG 尺寸：{path}')

def asset(key):
    if isinstance(key, int):
        src = PHOTOS / f'微信图片_20261003231051_{key}_293.jpg'
        rel = f'assets/photos/{key:02}.jpg'
        dest = OUT / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dest)
        MANIFEST[key] = src.name
        return rel, *size(src)
    ref = REFERENCES[key]
    return f'assets/reference/{ref["file"]}', ref['width'], ref['height']

def image(key, alt, eager=False):
    path, w, h = asset(key)
    loading = 'eager' if eager else 'lazy'
    priority = ' fetchpriority="high"' if eager else ''
    return f'<img src="{path}" width="{w}" height="{h}" alt="{e(alt)}" loading="{loading}" decoding="async"{priority}>'

def figure(key, caption, plate=None, hero=False):
    path, w, h = asset(key)
    evidence = f'你的实拍 · 照片 {key:02}' if isinstance(key, int) else '资料图 · 非本次参观'
    credit = ''
    if not isinstance(key, int):
        ref = REFERENCES[key]
        credit = f'<small class="credit">{e(ref["author"])} · {e(ref["license"])} · <a href="{ref["url"]}" target="_blank" rel="noopener noreferrer">图片来源 ↗</a></small>'
    plate_link = ''
    if plate:
        plate_path, _, _ = asset(plate)
        plate_link = f'<a class="plate-link" href="{plate_path}" data-lightbox data-caption="照片 {plate} · 对应设备展牌；展牌内容不等于通用生产参数。">阅读展牌 {plate} <span aria-hidden="true">↗</span></a>'
    return f'''<figure class="photo {'hero-photo' if hero else ''}">
    <a class="photo-link" href="{path}" data-lightbox data-caption="{e(caption, quote=True)}" aria-label="放大照片：{e(caption, quote=True)}">{image(key,caption,hero)}<span class="photo-label">{evidence}</span><span class="expand" aria-hidden="true">↗</span></a>
    <figcaption>{e(caption)}{credit}{plate_link}</figcaption></figure>'''

def head(title, description, with_3d=False):
    extra = '<link rel="stylesheet" href="assets/three/viewer.css"><script type="module" src="assets/three/viewer.js"></script>' if with_3d else ''
    return f'''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="{e(description,quote=True)}"><meta name="theme-color" content="#38251e">
<title>{e(title)} · 可可工艺笔记</title><link rel="icon" href="assets/icon.svg" type="image/svg+xml">
<link rel="stylesheet" href="assets/style.css"><script src="assets/app.js" defer></script>{extra}</head><body>
<a class="skip" href="#main">跳到正文</a><div class="reading-track" aria-hidden="true"><div id="reading-progress"></div></div>
<header class="site-header"><div class="header-inner"><a class="brand" href="index.html" aria-label="可可工艺笔记首页"><span class="brand-mark" aria-hidden="true">可</span><span>可可工艺笔记<small>从博物馆，看懂制造</small></span></a>
<nav aria-label="主导航"><a href="index.html#collection">工艺目录 <span aria-hidden="true">↗</span></a><a href="index.html#about">阅读说明</a></nav><span class="edition">参观照片图解 / 01</span></div></header>'''

def foot():
    return '''<footer class="site-footer wrap"><div><a class="footer-brand" href="index.html">可可工艺笔记</a><p>从你的实拍出发，把机器连回产品。</p></div><p class="disclaimer">用于理解典型工艺，不是生产操作规程。<br>配方、食品安全控制与保质期须另行验证。</p><a class="backtop" href="#main">回到顶部 ↑</a></footer>
<dialog id="photo-dialog" aria-labelledby="dialog-caption"><div class="dialog-bar"><span>照片细读</span><a id="photo-original" href="index.html" target="_blank" rel="noopener">打开原图 ↗</a><button id="close-photo" type="button" aria-label="关闭照片">关闭 ×</button></div><div class="dialog-image"><img id="dialog-image" alt="放大的参观照片或资料图" width="1280" height="960"></div><p id="dialog-caption"></p></dialog>
</body></html>'''

def source_links(keys):
    return ''.join(f'<a class="inline-source" href="#source-{k}">资料 {e(SOURCES[k][0].split(" · ")[0])} ↙</a>' for k in keys)

def detail(page, idx, with_3d=False):
    slug, name = page['slug'], page['name']
    steps = page['steps']
    step_html = []
    for n, step in enumerate(steps, 1):
        pic = figure(step['photo'], step['caption'], step.get('plate')) if 'photo' in step else ''
        marker = f'展牌依据 · 照片 {step["evidence_photo"]}' if step.get('evidence_photo') else ('实拍对应＋工艺补全' if isinstance(step.get('photo'), int) else '资料补全')
        step_html.append(f'''<section class="step {'has-photo' if pic else 'text-step'}" id="step-{n}" aria-labelledby="step-title-{n}">
        <div class="step-number">{n:02}</div><div class="step-copy"><div class="eyebrow">{e(step['label'])} <span class="evidence">{marker}</span></div><h3 id="step-title-{n}">{e(step['title'])}</h3>
        <dl class="transformation"><div><dt>进入</dt><dd>{e(step['input'])}</dd></div><div><dt>得到</dt><dd>{e(step['output'])}</dd></div></dl>
        <p>{e(step['action'])}</p><div class="takeaway"><strong>看懂这一点</strong><p>{e(step['why'])}</p></div><div class="source-short">{source_links(step.get('refs',[]))}</div></div>{pic}</section>''')
    flow = ''.join(f'<li><a href="#step-{n}"><span>{n:02}</span>{e(s["label"])}</a></li>' for n,s in enumerate(steps,1))
    sidenav = ''.join(f'<a href="#step-{n}"><span>{n:02}</span>{e(s["label"])}</a>' for n,s in enumerate(steps,1))
    insight = ''.join(f'<article><span class="insight-no">0{i}</span><h3>{e(t)}</h3><p>{e(b)}</p></article>' for i,(t,b) in enumerate(page['insights'],1))
    refhtml = ''.join(f'<li id="source-{k}"><a href="{SOURCES[k][1]}" target="_blank" rel="noopener noreferrer">{e(SOURCES[k][0])} ↗</a></li>' for k in page['sources'])
    used = sorted({s['photo'] for s in steps if isinstance(s.get('photo'),int)} | {s['plate'] for s in steps if s.get('plate')} | {page['hero']})
    photos = ''.join(f'<a href="{asset(k)[0]}" data-lightbox data-caption="你的参观实拍 · 照片 {k}">照片 {k:02}</a>' for k in used)
    related = [p for p in PAGES if p['slug'] in page['related']]
    relatedhtml = ''.join(f'<a href="{p["slug"]}.html"><span>{e(p["name"])}</span><span aria-hidden="true">↗</span></a>' for p in related)
    prev = PAGES[idx-1] if idx else None
    nex = PAGES[(idx+1) % len(PAGES)]
    prevlink = f'<a href="{prev["slug"]}.html">← 上一篇 · {prev["name"]}</a>' if prev else '<a href="index.html">← 返回工艺总览</a>'
    badge = '巧克力工艺' if page['category']=='chocolate' else '糖果工艺'
    enhanced = with_3d and slug == 'enrobed'
    lab = render_equipment_lab() if enhanced else ''
    return head(name,page['summary'], enhanced) + f'''
<main id="main"><div class="wrap"><div class="breadcrumb"><a href="index.html">工艺总览</a><span>/</span><span>{idx+1:02} · {name}</span><button class="print-button" type="button" data-print>打印本页 ↗</button></div>
<section class="detail-hero"><div class="hero-copy"><div class="eyebrow accent">工艺笔记 {idx+1:02} / {badge}</div><p class="product-label">{name} <span>— {page['kicker']}</span></p><h1>{page['title']}</h1><p class="lede">{page['summary']}</p><a class="button" href="#process">先看流程 <span aria-hidden="true">↓</span></a><span class="readtime">约 {page['minutes']} 分钟读懂</span></div>{figure(page['hero'],page['hero_caption'],hero=True)}</section>
<div class="material-strip"><div><span>从什么开始</span><strong>{page['ingredients']}</strong></div><div><span>最后得到什么</span><strong>{page['result']}</strong></div><div><span>一句话原理</span><strong>{page['principle']}</strong></div></div>
<section class="process-summary" id="process"><div class="section-heading"><div><p class="eyebrow accent">先把顺序记住</p><h2>一眼看懂流程</h2></div><p>点击任一步，跳到图文解释 ↓</p></div><ol class="flow-list">{flow}</ol><p class="boundary"><strong>这张流程图的边界</strong>{page['boundary']}</p></section>
{lab}<div class="reading-layout"><aside class="step-nav" aria-label="本页步骤"><p class="eyebrow">本页阅读路线</p><a href="#process">流程速览</a>{sidenav}<a href="#knowledge">容易混淆的地方</a><a href="#sources">照片与参考资料</a><div class="nav-note">现场照片负责定位设备，<br>补充资料负责连接流程。</div></aside>
<div class="article-body"><section id="steps"><div class="section-heading"><div><p class="eyebrow accent">跟着物料走一遍</p><h2>每一步，发生了什么？</h2></div></div>{''.join(step_html)}</section>
<section class="knowledge" id="knowledge"><div class="section-heading"><div><p class="eyebrow accent">多懂一点</p><h2>容易混淆的地方</h2></div></div><div class="insight-grid">{insight}</div></section>
<section class="self-check"><p class="eyebrow">30 秒自测</p><h2>{page['quiz'][0]}</h2><details><summary>想好了吗？展开答案</summary><p>{page['quiz'][1]}</p></details></section>
<section id="sources" class="sources"><p class="eyebrow accent">有据可查</p><h2>照片与参考资料</h2><p>实拍依据来自你拍下的机器与展牌；行业资料用于补齐未拍到的步骤，不代表这些展品曾属于同一条生产线。</p><details><summary>查看本页实拍照片（{len(used)} 张）</summary><div class="photo-index">{photos}</div><p class="small">照片编号沿用原文件名。点击可放大，原照片未作内容修改。</p></details><details><summary>查看补充资料与外部链接（{len(page['sources'])} 项）</summary><ul>{refhtml}</ul><p class="small">外部资料需要联网。本地正文和照片无需联网。</p></details></section>
<section class="related"><p class="eyebrow">把工艺连起来</p><h2>接下来可以看</h2><div>{relatedhtml}</div></section></div></div>
<nav class="chapter-nav" aria-label="相邻工艺">{prevlink}<a href="{nex['slug']}.html">下一篇 · {nex['name']} →</a></nav></div></main>''' + foot()

def index():
    cards = []
    for n,p in enumerate(PAGES,1):
        cards.append(f'''<article class="process-card" data-category="{p['category']}"><a href="{p['slug']}.html" aria-label="阅读{p['name']}制作流程"><div class="card-image">{image(p['hero'],p['hero_caption'])}<span class="card-number">{n:02}</span><span class="card-arrow" aria-hidden="true">↗</span></div><div class="card-body"><p class="eyebrow">{'巧克力工艺' if p['category']=='chocolate' else '糖果工艺'} / {len(p['steps'])} 个环节</p><h3>{p['name']}</h3><p>{p['short']}</p><span class="card-link">阅读图解 <span aria-hidden="true">→</span></span></div></a></article>''')
    return head('工艺总览','一条巧克力主线，八种产品分支。用博物馆实拍照片，看懂巧克力与糖果的制造流程。') + f'''
<main id="main"><div class="wrap"><section class="index-hero"><div class="hero-copy"><p class="eyebrow accent">一份从参观照片开始的工艺手册</p><h1>甜的背后，<br>是怎样一门工艺？</h1><p class="lede">从可可豆到巧克力，从一锅糖浆到一颗糖。<br class="desktop-break">沿着物料变化的方向，把你拍下的机器，<br class="desktop-break">串成看得懂的制作流程。</p><a class="button" href="chocolate.html">从基础巧克力开始 <span aria-hidden="true">↗</span></a><a class="text-link" href="#collection">直接选一种产品 ↓</a><div class="index-meta"><span><strong>09</strong> 条阅读路线</span><span><strong>实拍</strong> 设备与展牌</span><span><strong>图解</strong> 从原料到成品</span></div></div><div class="index-photo">{figure(8,'博物馆里的烘焙系统现场 · 让一台机器，回到它的工艺位置。',hero=True)}<span class="photo-stamp">现场观察<br><b>工艺再读</b></span></div></section>
<section class="orientation" aria-labelledby="orientation-title"><div><p class="eyebrow">先建立一张地图</p><h2 id="orientation-title">不是一条长生产线，<br>而是几种不同的制造逻辑。</h2></div><ol><li><span>01</span><div><strong>巧克力：管理脂肪结晶</strong><p>磨细、精炼、调温，再走向不同形状。</p></div></li><li><span>02</span><div><strong>糖果：管理糖体状态</strong><p>按糖浆或糖体状态，选择模压、搅打或切块。</p></div></li><li><span>03</span><div><strong>奶片：让粉体受压成型</strong><p>不走巧克力调温，也不是硬糖熬煮。</p></div></li></ol></section>
<section id="collection" class="collection"><div class="section-heading"><div><p class="eyebrow accent">选一种产品，跟着流程走</p><h2>九种工艺，各有路径。</h2></div><p>先读基础，再按兴趣分流。</p></div><div class="filter-bar"><div class="filters" aria-label="按工艺类别筛选"><button type="button" data-filter="all" aria-pressed="true">全部工艺 <span>09</span></button><button type="button" data-filter="chocolate" aria-pressed="false">巧克力 <span>05</span></button><button type="button" data-filter="candy" aria-pressed="false">糖果与奶片 <span>04</span></button></div><span class="filter-status" role="status" aria-live="polite">{len(PAGES)} 条阅读路线</span></div><div class="card-grid">{''.join(cards)}</div></section>
<section id="about" class="about"><div><p class="eyebrow accent">关于这本图解手册</p><h2>看到的、补全的，<br>分开说清楚。</h2><p>照片是起点，不是工厂的完整档案。<br>不按拍摄顺序编排，而按物料流向讲解。</p></div><div class="about-notes"><article><span class="tag">你的实拍</span><h3>机器与展牌相互对照</h3><p>在对应步骤查看设备照片，点击放大；有清晰展牌的，附展牌入口。保留原图，不给未知设备硬贴身份。</p></article><article><span class="tag light">资料补全</span><h3>把照片之外的步骤接起来</h3><p>用行业组织和制造商资料解释未拍到的环节。补充图片标明作者与许可；各页末尾列出参考链接。</p></article><article><span class="tag light">阅读边界</span><h3>学原理，不照抄生产参数</h3><p>展示的是典型制作逻辑，不是特定工厂的设备配置或配方。原料、温度、时间和检验限值仍需专业验证。</p></article></div></section></div></main>''' + foot()

def build_site(with_3d=False):
    if with_3d:
        for name in ('viewer.js', 'viewer.css'):
            if not (OUT / 'assets/three' / name).is_file():
                raise FileNotFoundError(f'缺少 3D 构建产物 {name}；请运行 python web/build_all.py')
    OUT.mkdir(parents=True, exist_ok=True)
    MANIFEST.clear()
    for idx, page in enumerate(PAGES):
        (OUT / f'{page["slug"]}.html').write_text(detail(page,idx,with_3d),encoding='utf-8')
    (OUT / 'index.html').write_text(index(),encoding='utf-8')
    manifest = '# 图片来源与使用说明\n\n## 用户实拍\n\n原图位于项目 photos 文件夹，网页只复制，不改写原件。下表编号沿用原文件名。\n\n| 输出文件 | 原文件 |\n|---|---|\n'
    manifest += '\n'.join(f'| dist/assets/photos/{k:02}.jpg | {v} |' for k,v in sorted(MANIFEST.items()))
    manifest += '\n\n## 公网补充图\n\n均下载到本地用于离线阅读，未修改原始图像；页面可能通过 CSS 等比缩放/裁切展示，可打开完整原图。\n\n'
    for ref in REFERENCES.values():
        manifest += f'- `dist/assets/reference/{ref["file"]}`：{ref["title"]}；作者：{ref["author"]}；许可：{ref["license"]}；[原始文件与许可说明]({ref["url"]})。\n'
    if with_3d:
        manifest += '\n## 3D 静态样板\n\n涂层机模型由 `web/three/src/machines/enrober.ts` 的程序化几何体生成，以用户照片 25／26 为造型参考；没有使用 Blender、第三方机器模型或上传照片。尺寸、背面和隐藏连接为简化示意。three.js 及其附加组件的许可随构建保存在 `dist/assets/three/THIRD_PARTY_LICENSES.md`。\n'
    (HERE / 'ASSETS.md').write_text(manifest,encoding='utf-8')
    print(f'已生成 {len(PAGES)+1} 个 HTML；使用 {len(MANIFEST)} 张实拍。')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--with-3d', action='store_true', help='插入已构建的静态 3D 样板')
    build_site(parser.parse_args().with_3d)
