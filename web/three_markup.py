"""3D 区域的静态 HTML；无 JavaScript 时仍有照片与资料边界。"""
from html import escape
from export_scene_data import build_scene_data
from scene_content import SCENES


def render_equipment_lab(scene_id='enrobed'):
    scene = build_scene_data(SCENES[scene_id])
    animated = scene['status'] == 'animated-prototype'
    machine_photo, plate_photo = (escape(scene['photos'][key], quote=True) for key in ('machine', 'plate'))
    name = escape(scene['name'])
    machine_number = machine_photo.rsplit('/', 1)[-1].split('.')[0]
    plate_number = plate_photo.rsplit('/', 1)[-1].split('.')[0]
    if animated:
        copy = dict(number='01', title='跟着一块饼干，穿过涂层机。', subtitle='两路输入，一层新外衣。转动设备，也看懂物料的变化。',
                    edition='互动工序样板', version='V0.2', tag='从设备实拍，到工序动画', teaser='芯体进去，<br>裹上巧克力出来。',
                    hint='加载后主动播放 75 秒讲解，<br>也可逐步查看、暂停旋转。', legend='<span>金色圆环：跟踪的芯体</span><span>蓝色后段：补充工序示意</span>',
                    detail='网带、料槽、罩体、蓝色软管与前置控制箱，都从实拍中提取。工作示意隐藏局部外壳，不代表还原了真实内部结构。')
        materials = [('进入涂层机', '已制好的芯体 ＋ 巧克力料'), ('离开涂层机', '刚包覆的产品，仍需冷却'), ('独立后续工序', '冷却定型，再检查包装')]
    else:
        copy = dict(number='02', title='两只石辊，一盘可可的变化。', subtitle='先看清设备结构，再讲研磨如何发生。',
                    edition='静态造型样板', version='V0.3', tag='从设备实拍，到结构观察', teaser='圆盘之上，<br>认识一台石磨机。',
                    hint='转动、放大，点选四组部件。<br>本轮先看造型，研磨动画尚未接入。', legend='<span>投料区：位置示意</span><span>出料方式待核实 · 暂无动画</span>',
                    detail='开口圆盘、双石辊、横梁与侧面机构参照实拍简化。点编号看部件；“工作区域示意”隐藏前盘壁，便于观察接触区，不表示真实设备可这样拆开。')
        materials = [('典型研磨输入', '经过焙炒、破碎脱壳的可可碎粒'), ('典型研磨结果', '可可浆／可可液块，并非脱脂可可粉'), ('这台展品的边界', '具体出料口、取料方式待核实')]
    materials_html = '<span class="lab-material-arrow" aria-hidden="true">→</span>'.join(
        f'<div><span>{escape(label)}</span><strong>{escape(value)}</strong></div>' for label, value in materials
    )
    parts = ''.join(
        f'<button type="button" class="lab-part" data-part="{escape(p["id"])}" aria-pressed="false" disabled>'
        f'<span>{escape(p["number"])}</span>{escape(p["name"])}</button>' for p in scene['parts']
    )
    phases = ''.join(
        f'<button type="button" data-phase="{escape(p["id"])}"><span>{i + 1:02}</span>{escape(p["title"])}</button>'
        for i, p in enumerate(scene['phases'])
    )
    playback = ''
    if animated:
        caption = scene['phases'][0]['caption']
        playback = f'''
      <div class="lab-playback" data-playback hidden>
        <div class="lab-phase-list" aria-label="跳到工序关键帧">{phases}</div>
        <div class="lab-transport"><button type="button" class="lab-play" data-play aria-pressed="false">▶ 播放工序</button><button type="button" data-restart>↺ 重播</button><div class="lab-step-buttons"><button type="button" data-previous aria-label="查看上一步">← 上一步</button><button type="button" data-next aria-label="查看下一步">下一步 →</button></div></div>
        <div class="lab-progress"><label for="lab-seek">教学进度</label><input id="lab-seek" type="range" min="0" max="75" step="0.1" value="0" data-seek aria-label="教学动画进度，非真实加工时长"><output for="lab-seek" data-time aria-live="off">00:00 / 01:15</output></div>
        <p class="lab-timing-note">75 秒为讲解编排，非真实加工时间。点工序看关键帧，拖动进度即暂停。</p>
        <p class="lab-motion-hint" data-motion-hint hidden>已尊重减少动态效果偏好：默认静帧，可逐步查看，或主动播放。</p>
      </div>
'''
        narration = f'''
      <div class="lab-inspector-heading"><span>此刻，发生了什么</span><span class="lab-tiny-number">01—05</span></div>
      <section class="lab-narration" aria-live="polite" aria-atomic="true"><h3 data-phase-title>01 / 认识两路输入</h3><dl><div><dt>进入</dt><dd data-caption-input>{escape(caption['input'])}</dd></div><div><dt>动作</dt><dd data-caption-action>{escape(caption['action'])}</dd></div><div><dt>得到</dt><dd data-caption-output>{escape(caption['output'])}</dd></div></dl><p class="lab-caption-note" data-caption-note>{escape(caption['note'])}</p><div class="lab-phase-references" data-phase-references></div></section>
      <p class="lab-product-state" data-product-state>跟踪芯体 · 尚未涂层</p>
'''
    else:
        step = scene['steps'][0]
        narration = f'''
      <div class="lab-inspector-heading"><span>结构观察</span><span class="lab-tiny-number">01—04</span></div>
      <section class="lab-narration lab-static-note"><h3>先认识机器，<br>再进入研磨。</h3><p class="lab-caption-note">本版为静态造型样板，研磨动画尚未接入。投料区仅作位置提示，暂不演示石辊转向或出料路径。</p><div class="lab-phase-references"><a href="#step-{step['number']}">正文第 {step['number']} 步 · {escape(step['label'])} ↙</a></div></section>
'''
    return f'''
<section id="equipment-3d" class="equipment-lab" aria-labelledby="lab-title" data-equipment-lab data-scene="{escape(scene_id, quote=True)}" data-state="idle">
  <header class="lab-heading">
    <div><p class="lab-kicker">设备观察室 <span>／ {copy['number']}</span></p><h2 id="lab-title">{copy['title']}</h2><p class="lab-subtitle">{copy['subtitle']}</p></div>
    <span class="lab-edition">{copy['edition']} <b>{copy['version']}</b></span>
  </header>
  <div class="lab-shell">
    <div class="lab-workspace">
      <div class="lab-topline"><span><i aria-hidden="true"></i> 程序化模型 · 非精密复刻</span><span>参照实拍 {machine_number} / {plate_number}</span></div>
      <div class="lab-stage" data-stage>
        <div class="lab-placeholder" data-placeholder>
          <img src="{machine_photo}" width="1280" height="1707" alt="{name}原始实拍，作为三维模型的造型依据" loading="lazy">
          <div class="lab-placeholder-copy"><span class="lab-preview-tag">{copy['tag']}</span><h3>{copy['teaser']}</h3><p>{copy['hint']}</p><button class="lab-primary" type="button" data-load disabled>加载 3D 模型 <span aria-hidden="true">↗</span></button></div>
        </div>
        <div class="lab-canvas-host" data-canvas-host hidden></div>
        <div class="lab-pins" data-pins hidden></div>
        <div class="lab-stage-legend" data-stage-legend hidden>{copy['legend']}</div>
      </div>
{playback}
      <div class="lab-tools" data-view-controls hidden>
        <div class="lab-modes" aria-label="设备展示方式"><button type="button" data-mode="working" aria-pressed="{str(animated).lower()}">{"工作部件示意" if animated else "工作区域示意"}</button><button type="button" data-mode="exterior" aria-pressed="{str(not animated).lower()}">完整外观</button></div>
        <div class="lab-views" aria-label="选择观察角度">
          <button type="button" data-view="perspective" aria-pressed="true">立体</button>
          <button type="button" data-view="front" aria-pressed="false">正面</button>
          <button type="button" data-view="top" aria-pressed="false">俯视</button>
        </div>
        <div class="lab-zoom"><button type="button" data-zoom="in" aria-label="放大模型">＋</button><button type="button" data-zoom="out" aria-label="缩小模型">−</button><button type="button" data-reset>复位视角</button></div>
      </div>
      <p class="lab-gesture" data-gesture hidden>拖动旋转 · 滚轮 / 双指缩放 · 画布内方向键旋转、＋ / − 缩放</p>
      <p class="lab-status" role="status" aria-live="polite" data-status>点击后加载本地模型；3D 需通过 HTTP 预览，直接双击 HTML 时请阅读图文。</p>
    </div>
    <aside class="lab-inspector" aria-label="工序讲解、部件说明与实拍对照">
{narration}
      <details class="lab-parts-panel"{"" if animated else " open"}><summary>设备部件与实拍对照 <span>04</span></summary>
      <div class="lab-part-list" aria-label="选择设备部件">{parts}</div>
      <div class="lab-part-detail" aria-live="polite"><p class="lab-detail-tag" data-part-tag>外观参照实拍</p><h3 data-part-title>保留辨识度，省略繁琐细节。</h3><p data-part-description>{copy['detail']}</p></div>
      </details>
      <figure class="lab-reference"><a href="{machine_photo}" data-lightbox data-caption="{name}实拍 · 照片 {machine_number}；模型为简化造型，不是精密复刻。"><img src="{machine_photo}" width="1280" height="1707" alt="模型对应的{name}实拍照片 {machine_number}" loading="lazy"><span>实拍对照 <b aria-hidden="true">↗</b></span></a><figcaption><a href="{plate_photo}" data-lightbox data-caption="{name}说明牌 · 照片 {plate_number}">阅读展牌 {plate_number} ↗</a><button type="button" data-compare aria-pressed="false" disabled>放大对照</button></figcaption></figure>
    </aside>
  </div>
  <div class="lab-materials">{materials_html}</div>
  <p class="lab-boundary"><span>模型边界</span> {escape(scene['boundary'])}</p>
  <noscript><p class="lab-noscript">3D 需要 JavaScript；设备照片、展牌和下方全部工艺正文仍可阅读。</p></noscript>
</section>
'''
