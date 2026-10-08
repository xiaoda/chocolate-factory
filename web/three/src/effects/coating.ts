import { DoubleSide, Group, Mesh, MeshStandardMaterial, PlaneGeometry } from 'three';
import { box } from '../geometry/primitives';

export function createCoating() {
  const root = new Group(); root.name = 'chocolateCurtain';
  const chocolate = new MeshStandardMaterial({ color: 0x552c18, side: DoubleSide, roughness: 0.28 });
  const geometry = new PlaneGeometry(0.68, 0.32, 12, 10);
  const curtain = new Mesh(geometry, chocolate);
  curtain.rotation.y = Math.PI / 2; curtain.position.set(-0.5, 1.65, 0); root.add(curtain);
  // 网带下方的底涂接触区单独表达，全包覆不能只靠上方淋涂。
  box(root, [0.36, 0.035, 0.69], [-0.5, 1.596, 0], chocolate, 0.007).name = 'bottomCoating';
  box(root, [1.43, 0.016, 0.82], [-0.15, 1.454, 0], chocolate, 0.006).name = 'recoveredChocolate';
  const positions = geometry.attributes.position;
  return {
    root,
    update(time: number, active: boolean) {
      root.visible = active;
      for (let i = 0; i < positions.count; i++) positions.setZ(i, Math.sin(positions.getX(i) * 38 + positions.getY(i) * 17 - time * 6) * 0.006);
      positions.needsUpdate = true;
      geometry.computeVertexNormals();
    },
  };
}
