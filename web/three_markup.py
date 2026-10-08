"""3D 区域的静态 HTML；无 JavaScript 时仍有照片与资料边界。"""
from html import escape
from export_scene_data import build_scene_data


def render_equipment_lab():
    scene = build_scene_data()
    parts = ''.join(
        f'<button type="button" class="lab-part" data-part="{escape(p["id"])}" aria-pressed="false" disabled>'
        f'<span>{escape(p["number"])}</span>{escape(p["name"])}</button>' for p in scene['parts']
    )
    return f'''
<section id="equipment-3d" class="equipment-lab" aria-labelledby="lab-title" data-equipment-lab data-state="idle">
  <header class="lab-heading">
    <div><p class="lab-kicker">设备观察室 <span>／ 01</span></p><h2 id="lab-title">巧克力涂层机</h2><p class="lab-subtitle">从照片走进结构，换个角度看机器。</p></div>
    <span class="lab-edition">静态造型样板 <b>V0.1</b></span>
  </header>
  <div class="lab-shell">
    <div class="lab-workspace">
      <div class="lab-topline"><span><i aria-hidden="true"></i> 程序化模型 · 非精密复刻</span><span>参照实拍 25 / 26</span></div>
      <div class="lab-stage" data-stage>
        <div class="lab-placeholder" data-placeholder>
          <img src="assets/photos/25.jpg" width="1280" height="1707" alt="涂层机原始实拍，作为三维模型的造型依据" loading="lazy">
          <div class="lab-placeholder-copy"><span class="lab-preview-tag">一张照片，多个观察角度</span><h3>先看清结构，<br>再跟着物料走。</h3><p>加载可旋转的 3D 造型。<br>本版先确认外形，工序动画尚未接入。</p><button class="lab-primary" type="button" data-load disabled>加载 3D 模型 <span aria-hidden="true">↗</span></button></div>
        </div>
        <div class="lab-canvas-host" data-canvas-host hidden></div>
        <div class="lab-pins" data-pins hidden></div>
        <div class="lab-stage-legend" data-stage-legend hidden><span>物料仅作位置示意</span><span>转动视角不会启动设备</span></div>
      </div>
      <div class="lab-tools" data-view-controls hidden>
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
    <aside class="lab-inspector" aria-label="部件说明与实拍对照">
      <div class="lab-inspector-heading"><span>观察笔记</span><span class="lab-tiny-number">25—26</span></div>
      <div class="lab-part-list" aria-label="选择设备部件">{parts}</div>
      <div class="lab-part-detail" aria-live="polite"><p class="lab-detail-tag" data-part-tag>先确认造型</p><h3 data-part-title>保留辨识度，省略繁琐细节。</h3><p data-part-description>网带、料槽、罩体、蓝色软管与前置控制箱，都从实拍中提取。加载后可点编号查看部件。</p></div>
      <figure class="lab-reference"><a href="assets/photos/25.jpg" data-lightbox data-caption="涂层机实拍 · 照片 25；模型为简化造型，不是精密复刻。"><img src="assets/photos/25.jpg" width="1280" height="1707" alt="模型对应的涂层机实拍照片 25" loading="lazy"><span>实拍对照 <b aria-hidden="true">↗</b></span></a><figcaption><a href="assets/photos/26.jpg" data-lightbox data-caption="涂层机说明牌 · 照片 26">阅读展牌 26 ↗</a><button type="button" data-compare aria-pressed="false" disabled>放大对照</button></figcaption></figure>
    </aside>
  </div>
  <div class="lab-materials"><div><span>进入设备</span><strong>已制好的芯体 ＋ 巧克力料</strong></div><span class="lab-material-arrow" aria-hidden="true">→</span><div><span>离开设备</span><strong>刚包覆的产品，仍需冷却</strong></div><p>台面上的物料仅作位置示意，<br>本版机器尚未运转。</p></div>
  <p class="lab-boundary"><span>模型边界</span> {escape(scene['boundary'])}</p>
  <noscript><p class="lab-noscript">3D 需要 JavaScript；设备照片、展牌和下方全部工艺正文仍可阅读。</p></noscript>
</section>
'''
