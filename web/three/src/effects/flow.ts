import { Group, Mesh, MeshStandardMaterial, SphereGeometry, Vector3 } from 'three';
import { pipe } from '../geometry/primitives';
import type { Point } from '../geometry/primitives';

/** 定向移动的标记表示流向，不是黏度、流速或泵体的真实模拟。 */
export function createFlow(points: Point[], color: number, count = 6) {
  const root = new Group();
  const guide = new MeshStandardMaterial({ color, transparent: true, opacity: 0.35, roughness: 0.6 });
  const curve = pipe(root, points, 0.015, guide);
  const material = new MeshStandardMaterial({ color, roughness: 0.35 });
  const geometry = new SphereGeometry(0.029, 8, 6);
  const markers = Array.from({ length: count }, () => { const mesh = new Mesh(geometry, material); root.add(mesh); return mesh; });
  const position = new Vector3();
  return {
    root,
    update(time: number, active: boolean) {
      root.visible = active;
      markers.forEach((mesh, i) => { curve.getPointAt((time * 0.35 + i / count) % 1, position); mesh.position.copy(position); });
    },
  };
}
