import { Group, MeshStandardMaterial } from 'three';
import { box, cylinder } from '../geometry/primitives';
import type { ProductState } from '../core/timeline';
import { batchStaticMeshes } from '../geometry/batch';

export function createBiscuit(index: number) {
  const root = new Group(); root.name = `product-${index}`;
  const biscuit = new MeshStandardMaterial({ color: 0xd8a956, roughness: 0.95 });
  const indent = new MeshStandardMaterial({ color: 0xa5793e, roughness: 1 });
  const chocolate = new MeshStandardMaterial({ color: 0x482215, roughness: 0.26 });
  box(root, [0.32, 0.1, 0.32], [0, 0, 0], biscuit, 0.023);
  for (const x of [-0.09, 0, 0.09]) for (const z of [-0.09, 0, 0.09]) cylinder(root, 0.011, 0.003, [x, 0.051, z], indent);
  batchStaticMeshes(root, new Set());
  // 独立顶层、侧面、端面与底层，不能以更换芯体颜色代替包覆。
  const shell = new Group(); shell.name = `shell-${index}`; root.add(shell);
  const top = box(shell, [0.36, 0.026, 0.36], [0, 0.063, 0], chocolate, 0.009);
  const bottom = box(shell, [0.36, 0.018, 0.36], [0, -0.059, 0], chocolate, 0.006);
  const sides = [-1, 1].map(sign => box(shell, [0.36, 0.13, 0.02], [0, 0, sign * 0.17], chocolate, 0.006));
  const front = box(shell, [0.02, 0.13, 0.36], [0.17, 0, 0], chocolate, 0.006);
  const back = box(shell, [0.02, 0.13, 0.36], [-0.17, 0, 0], chocolate, 0.006);
  return {
    root,
    applyState(state: ProductState) {
      root.position.set(state.x, 1.655 + state.vibration, 0);
      shell.visible = state.coverage > 0;
      for (const mesh of [top, bottom, ...sides]) {
        mesh.scale.x = Math.max(0.0001, state.coverage);
        mesh.position.x = 0.18 * (1 - state.coverage);
      }
      const thickness = 1 - state.control * 0.35;
      top.scale.y = thickness; top.position.y = 0.05 + 0.013 * thickness;
      front.visible = state.coverage > 0;
      back.visible = state.coverage >= 1;
      chocolate.roughness = 0.26 + state.cooling * 0.28;
    },
  };
}
