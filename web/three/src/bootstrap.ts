import './viewer.css';
import type { ViewerHandle } from './core/types';

const lab = document.querySelector<HTMLElement>('[data-equipment-lab]');
if (lab) {
  const button = lab.querySelector<HTMLButtonElement>('[data-load]')!;
  const status = lab.querySelector<HTMLElement>('[data-status]')!;
  let viewer: ViewerHandle | undefined;
  let loading = false;
  let generation = 0;
  const compare = lab.querySelector<HTMLButtonElement>('[data-compare]')!;
  compare.disabled = false;
  compare.addEventListener('click', () => {
    const expanded = lab.dataset.compare !== 'true';
    lab.dataset.compare = String(expanded);
    compare.setAttribute('aria-pressed', String(expanded));
    compare.textContent = expanded ? '收起对照' : '放大对照';
  });

  function showFailure(error: unknown) {
    viewer = undefined;
    console.error('3D 模型加载失败：', error);
    lab!.dataset.state = 'error';
    lab!.querySelector<HTMLElement>('[data-placeholder]')!.hidden = false;
    button.textContent = '重新加载 3D 模型';
    button.disabled = false;
    status.textContent = '3D 暂时无法显示，可能是资源加载或 WebGL 支持问题。可重试，或继续查看实拍与正文。';
  }

  if (location.protocol === 'file:') {
    status.textContent = '请通过项目本地 HTTP 预览打开 3D；直接双击 HTML 时可继续阅读图文。';
    button.disabled = true;
  } else {
    button.disabled = false;
  }

  button.addEventListener('click', async () => {
    if (loading || viewer) return;
    loading = true;
    const currentGeneration = ++generation;
    button.disabled = true;
    lab.dataset.state = 'loading';
    button.textContent = '正在准备模型…';
    status.textContent = '正在加载本地 3D 模块，不会上传照片。';
    try {
      const { mountViewer } = await import('./viewer');
      if (currentGeneration !== generation) return;
      viewer = mountViewer(lab, showFailure);
      lab.dataset.state = 'ready';
      lab.querySelector<HTMLElement>('[data-placeholder]')!.hidden = true;
      lab.querySelector<HTMLCanvasElement>('canvas')?.focus({ preventScroll: true });
      status.textContent = '模型已就绪。当前为静态造型样板，工序动画尚未接入。';
    } catch (error) {
      if (currentGeneration === generation) showFailure(error);
    } finally {
      if (currentGeneration === generation) loading = false;
    }
  });

  // 显式离开时释放；往返缓存恢复为可重新加载，避免旧 WebGL 上下文悬挂。
  window.addEventListener('pagehide', () => {
    generation++;
    loading = false;
    viewer?.dispose();
    viewer = undefined;
    lab.dataset.state = 'idle';
    lab.querySelector<HTMLElement>('[data-placeholder]')!.hidden = false;
    button.textContent = '加载 3D 模型 ↗';
    button.disabled = false;
    status.textContent = '模型已释放，可再次加载；原有图文仍可阅读。';
  });
}
