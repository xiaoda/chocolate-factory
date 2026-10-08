import { Group, Mesh, MeshStandardMaterial, TorusGeometry, Vector3 } from 'three';
import type { BufferGeometry, Material } from 'three';
import { box, cylinder, pipe } from '../geometry/primitives';
import { createBiscuit } from '../products/biscuit';
import { createCoating } from '../effects/coating';
import { createFlow } from '../effects/flow';
import type { SceneState } from '../core/timeline';

/** 与照片设备分开管理：所有扩展台面、回流路径和冷却区域都是工序示意。 */
export function createProcessScene() {
  const root = new Group(); root.name = 'processSchematic';
  const steel = new MeshStandardMaterial({ color: 0xb8c4b2, metalness: 0.35, roughness: 0.5 });
  const belt = new MeshStandardMaterial({ color: 0x59685a, roughness: 0.8 });
  const cool = new MeshStandardMaterial({ color: 0x81b6be, roughness: 0.6 });
  const warm = new MeshStandardMaterial({ color: 0xba8444, roughness: 0.6 });
  box(root, [0.72, 0.07, 0.9], [-2.12, 1.545, 0], steel, 0.015);
  box(root, [2.65, 0.09, 0.91], [3.2, 1.535, 0], steel, 0.02);
  box(root, [2.6, 0.015, 0.78], [3.2, 1.588, 0], belt, 0.005);
  for (const x of [2.12, 4.24]) for (const z of [-0.34, 0.34]) box(root, [0.075, 1.48, 0.075], [x, 0.75, z], steel, 0.01);
  for (const x of [2.15, 3.3]) {
    pipe(root, [[x, 1.6, -0.47], [x, 2.1, -0.47], [x, 2.21, 0], [x, 2.1, 0.47], [x, 1.6, 0.47]], 0.025, cool);
  }
  box(root, [1.15, 0.06, 0.12], [2.725, 1.68, -0.5], cool, 0.01);
  const coolingAir = new Group(); root.add(coolingAir); coolingAir.name = 'coolingAir';
  for (const x of [2.3, 2.65, 3]) pipe(coolingAir, [[x, 2.07, -0.15], [x + 0.04, 1.9, 0.02], [x, 1.77, 0.15]], 0.012, cool);
  const coating = createCoating(); root.add(coating.root);
  // 旁路箭头贴近可见管路；不把柜内未拍到的隐藏管路当成实测结构。
  const supply = createFlow([[-1.03, 1.52, -0.27], [-1.03, 2.28, -0.27], [-0.82, 2.37, -0.27], [-0.67, 2.16, -0.26]], 0x825026);
  const recovery = createFlow([[-0.1, 1.46, 0.46], [-0.1, 1.13, 0.62], [-0.83, 1.13, 0.62], [-1.07, 1.49, 0.22]], 0x825026);
  root.add(supply.root, recovery.root);
  const blower = createFlow([[0.25, 1.86, 0.18], [0.31, 1.78, 0.22], [0.45, 1.73, 0.25]], 0x93c5ca, 4);
  root.add(blower.root);
  const products = [0, 1, 2].map(createBiscuit); products.forEach(p => root.add(p.root));
  const inputReference = createBiscuit(3);
  inputReference.root.name = 'inputReference';
  inputReference.applyState({ x: -2.12, coverage: 0, cooling: 0, control: 0, vibration: 0 });
  root.add(inputReference.root);
  const tracker = new Mesh(new TorusGeometry(0.26, 0.012, 6, 40), warm);
  tracker.rotation.x = -Math.PI / 2; root.add(tracker); tracker.name = 'trackedProduct';
  // 料液方向小漏斗标记：不暗示此处已完成调温。
  cylinder(root, 0.064, 0.04, [-0.67, 2.17, -0.26], warm);
  const anchors = {
    coreInput: new Vector3(-2.12, 1.82, 0.22),
    chocolateInput: new Vector3(-1.05, 2.45, -0.26),
    coating: new Vector3(-0.5, 1.65, 0.49),
    recovery: new Vector3(-0.2, 1.15, 0.73),
    cooling: new Vector3(2.72, 2.35, 0),
    product: new Vector3(-1.5, 1.85, 0),
  };
  let disposed = false;
  return {
    root, anchors,
    applyState(state: SceneState) {
      if (disposed) return;
      products.forEach((product, i) => product.applyState(state.products[i]));
      inputReference.root.visible = state.phaseId === 'output';
      coating.update(state.time, state.flow);
      supply.update(state.time, state.flow);
      recovery.update(state.time, state.flow);
      blower.update(state.time, state.phaseId === 'control');
      coolingAir.visible = state.phaseId === 'cooling';
      coolingAir.position.y = state.phaseId === 'cooling' ? Math.sin(state.time * 3) * 0.025 : 0;
      tracker.position.set(state.products[0].x, 1.603, 0);
      anchors.product.set(state.products[0].x, 1.89, 0);
    },
    dispose() {
      if (disposed) return; disposed = true;
      const geometries = new Set<BufferGeometry>(), materials = new Set<Material>();
      root.traverse(n => { if (n instanceof Mesh) { geometries.add(n.geometry); (Array.isArray(n.material) ? n.material : [n.material]).forEach(m => materials.add(m)); } });
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); root.clear();
    },
  };
}
