import './viewer.css';
import { loadScene } from './registry';
import { MountSession, panelForHash } from './core/mount-session';

const labs = [...document.querySelectorAll<HTMLElement>('[data-equipment-lab]')];
if (labs.length) {
  const session = new MountSession();
  const ids = labs.map(lab => lab.id);
  let active = labs.find(lab => lab.id === panelForHash(location.hash, ids)) ?? labs[0];
  const resets = new Map<HTMLElement, () => void>();

  for (const lab of labs) {
    const button = lab.querySelector<HTMLButtonElement>('[data-load]')!;
    const status = lab.querySelector<HTMLElement>('[data-status]')!;
    const compare = lab.querySelector<HTMLButtonElement>('[data-compare]')!;
    const partPanel = lab.querySelector<HTMLDetailsElement>('.lab-parts-panel')!;
    const initiallyOpen = partPanel.open;
    const originalContent = [...lab.querySelectorAll<HTMLElement>('.lab-narration, .lab-part-detail, [data-product-state]')]
      .map(element => ({ element, html: element.innerHTML }));
    const reset = () => {
      lab.dataset.state = 'idle'; lab.dataset.playing = 'false';
      delete lab.dataset.time; delete lab.dataset.phase; delete lab.dataset.suspended; delete lab.dataset.mode;
      lab.dataset.compare = 'false';
      compare.setAttribute('aria-pressed', 'false'); compare.textContent = '放大对照';
      partPanel.open = initiallyOpen;
      lab.querySelector<HTMLElement>('[data-placeholder]')!.hidden = false;
      const playback = lab.querySelector<HTMLElement>('[data-playback]');
      if (playback) playback.hidden = true;
      originalContent.forEach(({ element, html }) => { element.innerHTML = html; });
      button.textContent = '加载 3D 模型 ↗';
      button.disabled = location.protocol === 'file:';
      status.textContent = button.disabled
        ? '请通过项目本地 HTTP 预览打开 3D；直接双击 HTML 时可继续阅读图文。'
        : '点击加载当前设备；切换设备会释放旧模型，返回后可重新加载。';
    };
    resets.set(lab, reset);
    reset(); lab.hidden = lab !== active;
    compare.disabled = false;
    compare.addEventListener('click', () => {
      const expanded = lab.dataset.compare !== 'true';
      lab.dataset.compare = String(expanded);
      compare.setAttribute('aria-pressed', String(expanded));
      compare.textContent = expanded ? '收起对照' : '放大对照';
    });

    function showFailure(error: unknown) {
      if (active !== lab) return;
      session.clear();
      console.error('3D 模型加载失败：', error);
      lab.dataset.state = 'error';
      lab.querySelector<HTMLElement>('[data-placeholder]')!.hidden = false;
      button.textContent = '重新加载 3D 模型'; button.disabled = false;
      status.textContent = '3D 暂时无法显示，可能是资源加载或 WebGL 支持问题。可重试，或继续查看实拍与正文。';
    }

    button.addEventListener('click', async () => {
      if (active !== lab || lab.dataset.state === 'loading' || lab.dataset.state === 'ready') return;
      button.disabled = true; lab.dataset.state = 'loading';
      button.textContent = '正在准备模型…';
      status.textContent = '正在加载本地 3D 模块，不会上传照片。';
      try {
        await session.load(async () => {
          const [{ mountViewer }, definition] = await Promise.all([import('./viewer'), loadScene(lab.dataset.scene ?? '')]);
          return () => {
            const viewer = mountViewer(lab, definition, showFailure);
            lab.dataset.state = 'ready';
            lab.querySelector<HTMLElement>('[data-placeholder]')!.hidden = true;
            lab.querySelector<HTMLCanvasElement>('canvas')?.focus({ preventScroll: true });
            status.textContent = definition.readyMessage;
            return viewer;
          };
        });
      } catch (error) { showFailure(error); }
    });
  }

  function syncHash(focus: boolean) {
    const next = labs.find(lab => lab.id === panelForHash(location.hash, ids));
    if (!next) return; // 正文、资料等锚点不能意外切换设备。
    const changed = next !== active;
    if (changed) {
      session.clear(); resets.get(active)!(); active.hidden = true;
      active = next; active.hidden = false;
    }
    // 目标可能刚从 hidden 恢复，浏览器原生锚点滚动先于 hashchange。
    active.scrollIntoView({ block: 'start', behavior: 'instant' });
    if (focus && changed) active.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
  }
  window.addEventListener('hashchange', () => syncHash(true));
  // 模块执行后重新定位初始深链接，避免隐藏面板引起位置偏移。
  requestAnimationFrame(() => {
    try { document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ block: 'start', behavior: 'instant' }); }
    catch { /* 无效片段保留默认设备。 */ }
  });
  window.addEventListener('pagehide', () => { session.clear(); resets.get(active)!(); });
  window.addEventListener('pageshow', event => { if (event.persisted) syncHash(false); });
}
