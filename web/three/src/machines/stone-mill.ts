import { Color, CylinderGeometry, Float32BufferAttribute, Group, LatheGeometry, Mesh, MeshStandardMaterial, SphereGeometry, TorusGeometry, Vector2, Vector3 } from 'three';
import { box, cylinder } from '../geometry/primitives';
import { batchStaticMeshes } from '../geometry/batch';
import { machineResources } from '../core/machine-resources';
import type { StoneMillInstance } from '../core/types';

/** 只还原照片可见轮廓；不推定传动关系、出料阀或真实尺寸。 */
export function createStoneMill(): StoneMillInstance {
  const root = new Group(); root.name = 'stoneMillRoot';
  const parts = Object.fromEntries(['bowl', 'stones', 'bridge', 'drive'].map(id => {
    const group = new Group(); group.name = id; root.add(group); return [id, group];
  }));
  const shell = new MeshStandardMaterial({ color: 0xc5c8b7, roughness: 0.52, metalness: 0.25 });
  const edge = new MeshStandardMaterial({ color: 0xadb3a5, roughness: 0.44, metalness: 0.45 });
  const brown = new MeshStandardMaterial({ color: 0x573528, roughness: 0.5, metalness: 0.22 });
  const dark = new MeshStandardMaterial({ color: 0x30392e, roughness: 0.6 });
  const red = new MeshStandardMaterial({ color: 0x9e4636, roughness: 0.7 });
  const stone = new MeshStandardMaterial({ vertexColors: true, roughness: 1 });
  const materials = [shell, edge, brown, dark, red, stone];
  const add = (group: Group, mesh: Mesh, name: string) => { mesh.name = name; mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return mesh; };

  // 盘底和有厚度的盘壁：上部保持真正的开口。
  cylinder(parts.bowl, 1.56, 0.59, [0, 1.055, 0], shell);
  const bed = cylinder(parts.bowl, 1.43, 0.1, [0, 1.39, 0], edge); bed.name = 'grindingBed';
  const profile = [[1.43, 1.35], [1.59, 1.35], [1.59, 1.77], [1.46, 1.77], [1.43, 1.35]].map(([r, y]) => new Vector2(r, y));
  const frontWall = add(parts.bowl, new Mesh(new LatheGeometry(profile, 40, -Math.PI / 2, Math.PI), shell), 'bowl-front');
  const backWall = add(parts.bowl, new Mesh(new LatheGeometry(profile, 40, Math.PI / 2, Math.PI), shell), 'bowl-back');
  const rim = add(parts.bowl, new Mesh(new TorusGeometry(1.515, 0.026, 6, 80), edge), 'rim');
  rim.rotation.x = Math.PI / 2; rim.position.y = 1.773;

  // 两只浅色石辊。颜色由顶点位置确定，没有贴图文件或随机帧状态。
  const stoneGeometry = new CylinderGeometry(0.53, 0.53, 0.65, 64, 12);
  const positions = stoneGeometry.attributes.position, colors: number[] = [];
  const base = new Color(0xc1b9a0);
  for (let i = 0; i < positions.count; i++) {
    const noise = Math.sin(positions.getX(i) * 127.1 + positions.getY(i) * 311.7 + positions.getZ(i) * 74.7) * 43758.5453;
    const shade = 0.75 + (noise - Math.floor(noise)) * 0.34;
    colors.push(base.r * shade, base.g * shade, base.b * shade);
  }
  stoneGeometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  // 几何轴固定为 X；之后只绕 X 自转，不让轴线随欧拉角摆动。
  stoneGeometry.rotateZ(Math.PI / 2);
  const rollers = [-0.7, 0.7].map((x, i) => {
    const mesh = add(parts.stones, new Mesh(stoneGeometry, stone), i === 0 ? 'stone-left' : 'stone-right');
    mesh.position.set(x, 1.97, 0.05); return mesh;
  });
  cylinder(parts.stones, 0.12, 2.55, [0, 1.97, 0.05], brown, 'x');
  cylinder(parts.stones, 0.18, 1.29, [0, 2.045, 0.05], brown);
  for (const x of [-1.08, 1.08]) cylinder(parts.stones, 0.16, 0.11, [x, 1.97, 0.05], edge, 'x');

  // 侧立柱、横梁和左端调节手柄。小销帽是视觉参照，不是操作指引。
  for (const x of [-1.38, 1.38]) {
    box(parts.bridge, [0.18, 1.02, 0.25], [x, 2.27, 0.05], brown, 0.02);
    box(parts.bridge, [0.29, 0.085, 0.35], [x, 1.79, 0.05], brown, 0.016);
    box(parts.bridge, [0.25, 0.32, 0.31], [x, 2.64, 0.05], shell, 0.055);
  }
  box(parts.bridge, [3.13, 0.21, 0.32], [0, 2.79, 0.05], shell, 0.06);
  box(parts.bridge, [0.42, 0.25, 0.29], [0, 2.64, 0.05], shell, 0.035);
  cylinder(parts.bridge, 0.075, 0.045, [0, 2.76, 0.225], edge, 'z');
  cylinder(parts.bridge, 0.03, 0.56, [-1.65, 2.77, 0.05], edge);
  cylinder(parts.bridge, 0.058, 0.27, [-1.55, 2.77, 0.05], edge, 'x');
  for (const y of [2.47, 3.07]) { const ball = add(parts.bridge, new Mesh(new SphereGeometry(0.068, 12, 8), dark), 'handle-knob'); ball.position.set(-1.65, y, 0.05); }
  for (const x of [-1.15, -0.85, 0.85]) cylinder(parts.bridge, 0.025, 0.018, [x, 2.91, 0.05], red);
  for (const x of [-1.02, 1.02]) {
    cylinder(parts.bridge, 0.013, 0.58, [x, 2.39, 0.06], edge);
    for (let i = 0; i < 9; i++) cylinder(parts.bridge, 0.024, 0.014, [x, 2.12 + i * 0.055, 0.06], edge);
  }
  cylinder(parts.bridge, 0.037, 0.11, [0, 2.95, 0.05], shell);

  cylinder(parts.drive, 1.23, 0.57, [0, 0.345, 0], shell);
  cylinder(parts.drive, 1.29, 0.09, [0, 0.07, 0], edge);
  cylinder(parts.drive, 1.36, 0.15, [0, 0.705, 0], brown);
  box(parts.drive, [0.49, 0.19, 0.64], [-1.43, 0.9, 0.19], shell, 0.045);
  cylinder(parts.drive, 0.22, 0.48, [-1.55, 0.48, 0.18], brown, 'z');
  cylinder(parts.drive, 0.19, 0.035, [-1.55, 0.48, 0.44], edge, 'z');
  for (let i = 0; i < 6; i++) box(parts.drive, [0.3, 0.027, 0.41], [-1.55, 0.34 + i * 0.05, 0.16], edge, 0.004);
  // 前侧机构的功能不确定，仅保留轮廓，不制作出料管。
  box(parts.drive, [0.35, 0.68, 0.11], [-0.77, 1.1, 1.37], shell, 0.024);
  cylinder(parts.drive, 0.022, 0.33, [-0.9, 1.42, 1.46], edge);
  const lever = add(parts.drive, new Mesh(new SphereGeometry(0.06, 12, 8), dark), 'front-lever'); lever.position.set(-0.9, 1.595, 1.46);
  box(parts.drive, [0.4, 0.21, 0.02], [0.06, 1.12, 1.565], brown, 0.018);
  box(parts.drive, [0.31, 0.12, 0.013], [0.06, 1.12, 1.585], dark, 0.009);
  for (const x of [-0.09, 0.21]) cylinder(parts.drive, 0.015, 0.025, [x, 1.18, 1.6], edge, 'z');

  const exclusions = new Set([bed, frontWall, backWall, rim, ...rollers]);
  Object.values(parts).forEach(part => batchStaticMeshes(part, exclusions));
  const resources = machineResources(root, parts, materials);
  return {
    root, parts,
    ports: { materialIn: { position: new Vector3(0, 1.85, 0.95), direction: new Vector3(0, -1, 0) } },
    anchors: {
      bowl: new Vector3(1.12, 1.75, 0.95), stones: new Vector3(-0.7, 2.48, 0.18),
      bridge: new Vector3(0.68, 2.88, 0.13), drive: new Vector3(-1.57, 0.67, 0.5),
    },
    setView(mode) { frontWall.visible = mode === 'exterior'; rim.visible = mode === 'exterior'; },
    // 仅用于教学运动示意；固定件不参与运动，不认定本展品的实际传动。
    setGrindingAngle(value) {
      const angle = Number.isFinite(value) ? value : 0;
      bed.rotation.y = angle;
      rollers.forEach(roller => { roller.rotation.x = angle * roller.position.x / 0.53; });
    },
    ...resources,
  };
}
