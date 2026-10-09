import { ACESFilmicToneMapping, Color, DirectionalLight, GridHelper, HemisphereLight, LineSegments, Mesh, MeshStandardMaterial, OrthographicCamera, PCFShadowMap, PlaneGeometry, Scene, Vector3, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { MachineInstance, SceneDefinition, SceneInstance, ViewerHandle } from './core/types';

/** 单一帧循环：播放时刷新；暂停后按需绘制；不可见时保留用户意图并挂起。 */
export function mountViewer(lab: HTMLElement, definition: SceneDefinition, onFailure?: (error: Error) => void): ViewerHandle {
  const host = lab.querySelector<HTMLElement>('[data-canvas-host]')!;
  const pinLayer = lab.querySelector<HTMLElement>('[data-pins]')!;
  const controlsElement = lab.querySelector<HTMLElement>('[data-view-controls]')!;
  const legend = lab.querySelector<HTMLElement>('[data-stage-legend]')!;
  const gesture = lab.querySelector<HTMLElement>('[data-gesture]')!;
  const partButtons = [...lab.querySelectorAll<HTMLButtonElement>('[data-part]')];
  const scene = new Scene();
  const camera = new OrthographicCamera(-3, 3, 2, -2, 0.1, 80);
  let renderer: WebGLRenderer | undefined;
  let controls: OrbitControls | undefined;
  let machine: MachineInstance | undefined;
  let instance: SceneInstance | undefined;
  let processControls: ViewerHandle | undefined;
  let disposed = false;
  let frame = 0;
  let visible = true;
  let renderedFrames = 0;
  const cleanup: (() => void)[] = [];
  const pins = new Map<string, HTMLButtonElement>();
  const labels = new Map<string, HTMLDivElement>();
  const projected = new Vector3();
  const centre = new Vector3(...definition.view.centre);
  const partPanel = lab.querySelector<HTMLDetailsElement>('.lab-parts-panel')!;

  function on(target: EventTarget, name: string, listener: EventListener) {
    target.addEventListener(name, listener);
    cleanup.push(() => target.removeEventListener(name, listener));
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    instance?.animation?.player.pause();
    lab.dataset.playing = 'false';
    cancelAnimationFrame(frame);
    cleanup.forEach(fn => fn());
    controls?.dispose();
    processControls?.dispose();
    if (instance) { scene.remove(instance.root); instance.dispose(); }
    scene.traverse(node => {
      if (node instanceof Mesh || node instanceof LineSegments) {
        node.geometry.dispose();
        (Array.isArray(node.material) ? node.material : [node.material]).forEach(material => material.dispose());
      }
      if (node instanceof DirectionalLight) node.shadow.dispose();
    });
    renderer?.dispose();
    // 切换设备时主动归还上下文；先移除监听器，避免主动释放触发失败 UI。
    renderer?.forceContextLoss();
    host.replaceChildren();
    pinLayer.replaceChildren();
    [host, pinLayer, controlsElement, legend, gesture].forEach(element => { element.hidden = true; });
    partButtons.forEach(button => { button.disabled = true; button.setAttribute('aria-pressed', 'false'); });
  }

  function updateContent() {
    instance?.animation?.update();
    for (const label of instance?.labels ?? []) {
      const element = labels.get(label.id);
      if (element) { if (element.textContent !== label.text) element.textContent = label.text; element.dataset.active = String(label.show); }
    }
  }

  function render(timestamp: number) {
    frame = 0;
    if (disposed || !visible || document.hidden || !renderer || !machine) return;
    instance?.animation?.player.advance(timestamp);
    updateContent();
    renderer.render(scene, camera);
    const width = host.clientWidth, height = host.clientHeight;
    for (const [id, button] of pins) {
      const point = machine.anchors[id].clone().applyMatrix4(machine.root.matrixWorld).project(camera);
      const x = (point.x * 0.5 + 0.5) * width;
      const y = (-point.y * 0.5 + 0.5) * height;
      button.hidden = !partPanel.open || point.z < -1 || point.z > 1 || x < 16 || x > width - 16 || y < 16 || y > height - 16;
      button.style.left = `${x}px`;
      button.style.top = `${y}px`;
    }
    const placed: { left: number; right: number; top: number; bottom: number }[] = [];
    if (instance) for (const label of instance.labels) {
      const element = labels.get(label.id)!;
      projected.copy(label.anchor).applyMatrix4(instance.root.matrixWorld).project(camera);
      const x = (projected.x * 0.5 + 0.5) * width;
      let y = (-projected.y * 0.5 + 0.5) * height;
      element.hidden = element.dataset.active !== 'true' || projected.z < -1 || projected.z > 1 || y < 10 || y > height - 35 || x < 0 || x > width;
      if (element.hidden) continue;
      const labelWidth = element.offsetWidth, labelHeight = element.offsetHeight;
      const left = Math.max(labelWidth / 2 + 5, Math.min(width - labelWidth / 2 - 5, x));
      // 优先保留被跟踪产品标签；其他标签上移，避免窄屏重叠。
      for (let attempt = 0; attempt < 6; attempt++) {
        const collision = placed.find(rect => left + labelWidth / 2 + 4 > rect.left && left - labelWidth / 2 - 4 < rect.right && y > rect.top - 5 && y - labelHeight < rect.bottom + 5);
        if (!collision) break;
        y = collision.top - 7;
      }
      y = Math.max(labelHeight + 6, y);
      placed.push({ left: left - labelWidth / 2, right: left + labelWidth / 2, top: y - labelHeight, bottom: y });
      element.style.left = `${left}px`;
      element.style.top = `${y}px`;
    }
    // 小型可观察信息，便于浏览器验收；不暴露全局 three.js 对象。
    renderer.domElement.dataset.frames = String(++renderedFrames);
    renderer.domElement.dataset.drawCalls = String(renderer.info.render.calls);
    renderer.domElement.dataset.triangles = String(renderer.info.render.triangles);
    renderer.domElement.dataset.zoom = camera.zoom.toFixed(3);
    renderer.domElement.dataset.geometries = String(renderer.info.memory.geometries);
    renderer.domElement.dataset.textures = String(renderer.info.memory.textures);
    if (instance?.animation?.player.playing) requestRender();
  }

  function requestRender() {
    if (!frame && !disposed && visible && !document.hidden) frame = requestAnimationFrame(render);
  }

  function resize() {
    if (!renderer || disposed) return;
    const width = host.clientWidth, height = host.clientHeight;
    if (width <= 0 || height <= 0) return;
    const aspect = width / height;
    const viewHeight = Math.max(definition.view.minHeight, definition.view.minWidth / aspect);
    camera.left = -viewHeight * aspect / 2;
    camera.right = viewHeight * aspect / 2;
    camera.top = viewHeight / 2;
    camera.bottom = -viewHeight / 2;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio, matchMedia('(max-width:760px)').matches ? 1.5 : 2));
    renderer.setSize(width, height, false);
    requestRender();
  }

  function setView(view: string) {
    if (!controls) return;
    const offset = view === 'front' ? new Vector3(0, 1.05, 7) : view === 'top' ? new Vector3(0, 7, 0.001) : new Vector3(4.3, 3.15, 6.2);
    camera.position.copy(centre).add(offset);
    camera.zoom = 1;
    camera.updateProjectionMatrix();
    controls.target.copy(centre);
    controls.update();
    lab.querySelectorAll<HTMLButtonElement>('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === view)));
    requestRender();
  }

  function zoom(factor: number) {
    camera.zoom = Math.max(0.65, Math.min(2.4, camera.zoom * factor));
    camera.updateProjectionMatrix();
    controls?.update();
    requestRender();
  }

  function selectPart(id: string) {
    const part = definition.parts.find(p => p.id === id);
    if (!part) return;
    partPanel.open = true;
    machine?.selectPart(id);
    partButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.part === id)));
    pins.forEach((button, key) => button.setAttribute('aria-pressed', String(key === id)));
    lab.querySelector<HTMLElement>('[data-part-tag]')!.textContent = part.evidence === 'photo' ? '外观参照实拍 · 结构简化' : '展牌与典型原理参照';
    lab.querySelector<HTMLElement>('[data-part-title]')!.textContent = `${part.number} / ${part.name}`;
    lab.querySelector<HTMLElement>('[data-part-description]')!.textContent = part.description;
    lab.dataset.compare = 'false';
    lab.querySelector('[data-compare]')?.setAttribute('aria-pressed', 'false');
    lab.querySelector('[data-compare]')!.textContent = '放大对照';
    requestRender();
  }

  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFShadowMap;
    renderer.domElement.tabIndex = 0;
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.setAttribute('aria-label', definition.description);
    host.append(renderer.domElement);
    [host, pinLayer, controlsElement, legend, gesture].forEach(element => { element.hidden = false; });

    scene.background = new Color(0xeee9de);
    scene.add(new HemisphereLight(0xfff9eb, 0x969f86, 2.5));
    const key = new DirectionalLight(0xfff0d6, 3.4);
    key.position.set(-3, 7, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -6, right: 6, top: 5, bottom: -5, near: 0.1, far: 20 });
    key.shadow.bias = -0.0005;
    key.shadow.normalBias = 0.025;
    scene.add(key);
    const fill = new DirectionalLight(0xd4e5eb, 1.8); fill.position.set(5, 3, -4); scene.add(fill);

    const floor = new Mesh(new PlaneGeometry(100, 100), new MeshStandardMaterial({ color: 0xeee9de, roughness: 1 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -0.18; floor.receiveShadow = true; scene.add(floor);
    const plinth = new Mesh(new RoundedBoxGeometry(...definition.view.platformSize, 3, 0.07), new MeshStandardMaterial({ color: 0xd8cbb4, roughness: 0.85 }));
    plinth.position.set(definition.view.platformX, -0.08, 0.16); plinth.castShadow = true; plinth.receiveShadow = true; scene.add(plinth);
    const grid = new GridHelper(14, 28, 0xd9d3c4, 0xd9d3c4);
    grid.material.transparent = true;
    grid.material.opacity = 0.4;
    grid.position.y = -0.176;
    scene.add(grid);
    instance = definition.create(); machine = instance.machine; scene.add(instance.root);
    machine.setView(definition.initialMode); lab.dataset.mode = definition.initialMode;
    lab.dataset.playing = 'false';
    processControls = instance.animation?.bindControls(lab, () => { updateContent(); requestRender(); });
    for (const label of instance.labels) {
      const element = document.createElement('div'); element.className = `lab-flow-label lab-flow-${label.id}`;
      element.setAttribute('aria-hidden', 'true'); labels.set(label.id, element); pinLayer.append(element);
    }
    on(partPanel, 'toggle', requestRender);
    lab.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.mode === definition.initialMode));
      on(button, 'click', () => {
        const mode = button.dataset.mode as 'working' | 'exterior';
        machine?.setView(mode); lab.dataset.mode = mode;
        lab.querySelectorAll('[data-mode]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
        requestRender();
      });
    });

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = false;
    controls.minPolarAngle = 0.001;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minZoom = 0.65;
    controls.maxZoom = 2.4;
    controls.rotateSpeed = 0.65;
    controls.zoomSpeed = 0.7;
    controls.addEventListener('change', requestRender);
    cleanup.push(() => controls?.removeEventListener('change', requestRender));
    controls.addEventListener('start', () => lab.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', 'false')));

    for (const part of definition.parts) {
      const button = document.createElement('button');
      button.className = 'lab-pin'; button.type = 'button'; button.textContent = part.number;
      button.setAttribute('aria-label', `查看${part.name}`); button.setAttribute('aria-pressed', 'false');
      on(button, 'click', () => selectPart(part.id));
      pins.set(part.id, button); pinLayer.append(button);
    }
    partButtons.forEach(button => { button.disabled = false; on(button, 'click', () => selectPart(button.dataset.part!)); });
    lab.querySelectorAll<HTMLButtonElement>('[data-view]').forEach(button => on(button, 'click', () => setView(button.dataset.view!)));
    on(lab.querySelector('[data-reset]')!, 'click', () => setView('perspective'));
    lab.querySelectorAll<HTMLButtonElement>('[data-zoom]').forEach(button => on(button, 'click', () => zoom(button.dataset.zoom === 'in' ? 1.16 : 1 / 1.16)));
    on(renderer.domElement, 'keydown', event => {
      const e = event as KeyboardEvent;
      if (e.key === '+' || e.key === '=') { e.preventDefault(); zoom(1.12); }
      else if (e.key === '-') { e.preventDefault(); zoom(1 / 1.12); }
      else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        const offset = camera.position.clone().sub(centre);
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') offset.applyAxisAngle(new Vector3(0, 1, 0), e.key === 'ArrowLeft' ? -0.12 : 0.12);
        else offset.y = Math.max(0.35, Math.min(12, offset.y + (e.key === 'ArrowUp' ? 0.5 : -0.5)));
        camera.position.copy(centre).add(offset); controls?.update(); requestRender();
        lab.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', 'false'));
      }
    });
    on(renderer.domElement, 'webglcontextlost', event => {
      event.preventDefault(); dispose(); onFailure?.(new Error('WebGL 上下文已丢失，可重新加载模型。'));
    });
    function updateVisibility() {
      const suspended = !visible || document.hidden;
      instance?.animation?.player.setSuspended(suspended);
      if (suspended) { cancelAnimationFrame(frame); frame = 0; }
      updateContent(); requestRender();
    }
    on(document, 'visibilitychange', updateVisibility);
    const observer = new ResizeObserver(resize); observer.observe(host); cleanup.push(() => observer.disconnect());
    // 手机端侧面原理图在画布下方；任一教学画面可见即可继续同一时间轴。
    const visibility = new Map<Element, boolean>();
    const intersection = new IntersectionObserver(entries => {
      entries.forEach(entry => visibility.set(entry.target, entry.isIntersecting));
      visible = [...visibility.values()].some(Boolean); updateVisibility();
    });
    [host, ...lab.querySelectorAll('[data-animation-region]')].forEach(region => intersection.observe(region));
    cleanup.push(() => intersection.disconnect());
    updateVisibility(); setView('perspective'); resize();
    return { dispose };
  } catch (error) {
    dispose();
    throw error;
  }
}
