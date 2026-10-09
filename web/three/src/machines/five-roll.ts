import { Group, MeshStandardMaterial, Vector3 } from 'three';
import { box, cylinder } from '../geometry/primitives';
import { batchStaticMeshes } from '../geometry/batch';
import { machineResources } from '../core/machine-resources';
import type { FiveRollInstance } from '../core/types';
import { FIVE_ROLL_LAYOUT, ROLL_RADIUS, ROLL_LENGTH } from './five-roll-layout';

/** 照片 19／20 的外形样板：不推定尺寸、辊向、隐藏传动或进出料口。 */
export function createFiveRoll(): FiveRollInstance {
  const root = new Group(); root.name = 'fiveRollRoot';
  const parts = Object.fromEntries(['rollers', 'frame', 'drive', 'controls'].map(id => {
    const group = new Group(); group.name = id; root.add(group); return [id, group];
  }));
  const shell = new MeshStandardMaterial({ color: 0xd5d4bd, roughness: 0.58, metalness: 0.18 });
  const edge = new MeshStandardMaterial({ color: 0xacae98, roughness: 0.5, metalness: 0.3 });
  const steel = new MeshStandardMaterial({ color: 0x959e9e, roughness: 0.33, metalness: 0.62 });
  const dark = new MeshStandardMaterial({ color: 0x303c38, roughness: 0.55, metalness: 0.3 });
  const dial = new MeshStandardMaterial({ color: 0xf2e7cd, roughness: 0.75 });
  const red = new MeshStandardMaterial({ color: 0x9c4637, roughness: 0.65 });
  const green = new MeshStandardMaterial({ color: 0x547464, roughness: 0.65 });
  const materials = [shell, edge, steel, dark, dial, red, green];

  // X 为辊轴，Z 向正面；下部错位只表达照片轮廓，不是精密辊隙。
  const centres = FIVE_ROLL_LAYOUT;
  const rollers = centres.map(([y, z], index) => {
    const roller = cylinder(parts.rollers, ROLL_RADIUS, ROLL_LENGTH, [0, y, z], steel, 'x');
    roller.name = `roller-${index + 1}`;
    for (const x of [-1.43, 1.43]) cylinder(parts.rollers, 0.30, 0.07, [x, y, z], edge, 'x');
    return roller;
  });

  box(parts.frame, [4.16, 0.28, 1.94], [0, 0.14, 0], shell, 0.09);
  for (const x of [-1.76, 1.76]) {
    box(parts.frame, [0.63, 3.83, 1.62], [x, 2.03, -0.07], shell, 0.16);
    box(parts.frame, [0.81, 0.16, 1.84], [x, 0.3, -0.01], edge, 0.04);
    box(parts.frame, [0.44, 0.18, 1.34], [x, 3.99, -0.07], shell, 0.045);
    // 外侧连接帽为外观轮廓，不画罩内传动。
    for (const [y, z] of centres) cylinder(parts.frame, 0.16, 0.08, [x + Math.sign(x) * 0.34, y, z], edge, 'x');
  }
  box(parts.frame, [3.02, 0.12, 0.14], [0, 3.92, -0.67], dark, 0.015);
  const guard = box(parts.frame, [2.91, 0.15, 0.70], [0, 3.86, 0.17], shell, 0.045);
  guard.name = 'upper-guard';

  // 左上电机与侧罩；蓝色光纹不作为辊面纹理复刻。
  const sideCover = box(parts.drive, [0.47, 2.65, 1.33], [-2.18, 2.74, -0.48], shell, 0.22);
  sideCover.name = 'side-cover';
  box(parts.drive, [1.23, 0.15, 0.85], [-1.51, 4.05, -0.2], dark, 0.03);
  cylinder(parts.drive, 0.38, 1.15, [-1.50, 4.47, -0.22], dark, 'x');
  for (let i = 0; i < 11; i++) cylinder(parts.drive, 0.41, 0.035, [-1.98 + i * 0.093, 4.47, -0.22], dark, 'x');
  cylinder(parts.drive, 0.35, 0.09, [-2.13, 4.47, -0.22], edge, 'x');
  cylinder(parts.drive, 0.25, 0.10, [-0.87, 4.47, -0.22], dark, 'x');
  for (const x of [-1.85, -1.16]) box(parts.drive, [0.16, 0.22, 0.48], [x, 4.18, -0.22], dark, 0.025);

  // 右侧长面板。小表没有数值/刻度，旋钮不绑定生产控制功能。
  box(parts.controls, [0.47, 1.83, 0.08], [1.76, 2.72, 0.782], edge, 0.045);
  for (let row = 0; row < 5; row++) {
    const y = 3.42 - row * 0.35;
    for (const x of [1.65, 1.87]) {
      cylinder(parts.controls, 0.078, 0.025, [x, y, 0.839], dark, 'z');
      cylinder(parts.controls, 0.058, 0.027, [x, y, 0.856], dial, 'z');
      box(parts.controls, [0.009, 0.047, 0.009], [x, y + 0.01, 0.877], dark, 0.002).rotation.z = -0.55;
    }
  }
  for (const y of [1.57, 1.27, 0.97]) cylinder(parts.controls, 0.09, 0.065, [1.76, y, 0.83], dark, 'z');
  box(parts.controls, [0.37, 0.65, 0.075], [-1.76, 2.43, 0.782], edge, 0.035);
  box(parts.controls, [0.24, 0.17, 0.026], [-1.76, 2.6, 0.836], dark, 0.008);
  box(parts.controls, [0.18, 0.11, 0.02], [-1.76, 2.6, 0.856], dial, 0.005);
  cylinder(parts.controls, 0.046, 0.045, [-1.85, 2.36, 0.842], red, 'z');
  cylinder(parts.controls, 0.046, 0.045, [-1.67, 2.36, 0.842], green, 'z');
  cylinder(parts.controls, 0.043, 0.045, [-1.76, 2.21, 0.842], dark, 'z');

  const exclusions = new Set([...rollers, guard, sideCover]);
  Object.values(parts).forEach(part => batchStaticMeshes(part, exclusions));
  return {
    root, parts, ports: {},
    anchors: { rollers: new Vector3(-0.5, 2.7, 0.42), frame: new Vector3(-1.8, 1.3, 0.85),
      drive: new Vector3(-1.55, 4.84, -0.22), controls: new Vector3(1.77, 2.77, 0.9) },
    setView(mode) { guard.visible = mode === 'exterior'; sideCover.visible = mode === 'exterior'; },
    setRollAngles(angles) {
      rollers.forEach((roller, i) => { roller.rotation.x = Number.isFinite(angles[i]) ? angles[i] : 0; });
    },
    ...machineResources(root, parts, materials),
  };
}
