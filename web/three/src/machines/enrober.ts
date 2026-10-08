import { BoxGeometry, CylinderGeometry, Group, InstancedMesh, Matrix4, Mesh, MeshStandardMaterial, Quaternion, TorusGeometry, Vector3 } from 'three';
import type { BufferGeometry, Material } from 'three';
import { createMaterials } from '../geometry/materials';
import { box, cylinder, pipe } from '../geometry/primitives';
import type { MachineInstance } from '../core/types';
import { batchStaticMeshes } from '../geometry/batch';

/** 比例来自照片观察，不表示精确测量。未展示真实隐藏机构。 */
export function createEnrober(): MachineInstance {
  const root = new Group();
  root.name = 'enroberRoot';
  const m = createMaterials();
  const parts = Object.fromEntries(['cabinet', 'conveyor', 'coatingHead', 'blowerGuide'].map(name => {
    const group = new Group();
    group.name = name;
    root.add(group);
    return [name, group];
  }));
  const { cabinet, conveyor, coatingHead, blowerGuide } = parts;
  const cutaway: Mesh[] = [];

  // 主机柜：右侧主体、左前方控制箱、柜缝与四只脚轮。
  box(cabinet, [1.72, 1.17, 1.08], [0.18, 0.8, 0], m.shell, 0.055);
  box(cabinet, [1.79, 0.065, 1.16], [0.18, 1.42, 0], m.steel);
  box(cabinet, [0.76, 1.12, 0.038], [0.59, 0.79, 0.56], m.panel);
  box(cabinet, [0.018, 1.08, 0.02], [0.17, 0.8, 0.586], m.darkSteel, 0);
  cylinder(cabinet, 0.032, 0.035, [0.26, 0.86, 0.61], m.darkSteel, 'z');
  box(cabinet, [0.98, 1.07, 0.48], [-0.64, 0.76, 0.63], m.shell, 0.04);
  box(cabinet, [1.025, 0.065, 0.55], [-0.64, 1.32, 0.64], m.steel);
  box(cabinet, [0.83, 0.78, 0.025], [-0.64, 0.79, 0.885], m.darkSteel, 0.014);
  box(cabinet, [0.785, 0.735, 0.035], [-0.64, 0.79, 0.91], m.panel, 0.012);
  box(cabinet, [0.29, 0.15, 0.035], [-0.68, 0.93, 0.944], m.dark, 0.006);
  box(cabinet, [0.21, 0.045, 0.01], [-0.68, 0.95, 0.966], m.brass, 0);
  cylinder(cabinet, 0.065, 0.048, [-0.64, 1.17, 0.95], m.darkSteel, 'z');
  cylinder(cabinet, 0.045, 0.06, [-0.64, 1.17, 0.98], m.dark, 'z');
  [-0.87, -0.65, -0.42].forEach((x, i) => {
    cylinder(cabinet, 0.053, 0.035, [x, 0.72, 0.958], m.steel, 'z');
    cylinder(cabinet, 0.032, 0.05, [x, 0.72, 0.984], [m.red, m.green, m.dark][i], 'z');
    cylinder(cabinet, 0.039, 0.04, [x, 0.56, 0.957], m.dark, 'z');
  });
  box(cabinet, [0.69, 0.034, 0.25], [-0.64, 0.43, 1.01], m.steel, 0.008);
  cylinder(cabinet, 0.085, 0.035, [-0.92, 1.373, 0.75], m.brass);
  cylinder(cabinet, 0.065, 0.07, [-0.92, 1.42, 0.75], m.red);
  box(cabinet, [0.25, 0.075, 0.02], [-0.9, 1.1, 0.944], m.brass, 0.002);
  for (const [x, z] of [[-0.92, 0.7], [-0.55, -0.42], [0.83, -0.42], [0.83, 0.43]]) {
    box(cabinet, [0.09, 0.13, 0.1], [x, 0.2, z], m.steel, 0.012);
    cylinder(cabinet, 0.095, 0.065, [x, 0.1, z], m.dark, 'z');
    cylinder(cabinet, 0.037, 0.074, [x, 0.1, z], m.steel, 'z');
  }

  // 真实开孔网带，不是一块贴着条纹的实心传送板。
  for (const z of [-0.44, 0.44]) {
    box(conveyor, [3.78, 0.13, 0.085], [0, 1.52, z], m.steel, 0.012);
    box(conveyor, [3.5, 0.032, 0.035], [0, 1.63, z * 1.06], m.darkSteel, 0.004);
  }
  for (const x of [-1.82, 1.82]) cylinder(conveyor, 0.07, 0.85, [x, 1.52, 0], m.darkSteel, 'z');
  const belt = new Group(); belt.name = 'belt'; conveyor.add(belt);
  const crossWires = new InstancedMesh(new CylinderGeometry(0.008, 0.008, 0.81, 5), m.darkSteel, 94);
  const matrix = new Matrix4();
  const rotateZ = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2);
  for (let i = 0; i < 94; i++) {
    matrix.compose(new Vector3(-1.77 + i * 3.54 / 93, 1.571, 0), rotateZ, new Vector3(1, 1, 1));
    crossWires.setMatrixAt(i, matrix);
  }
  belt.add(crossWires);
  const lengthWires = new InstancedMesh(new BoxGeometry(3.54, 0.011, 0.008), m.steel, 18);
  for (let i = 0; i < 18; i++) lengthWires.setMatrixAt(i, new Matrix4().makeTranslation(0, 1.581, -0.39 + i * 0.78 / 17));
  belt.add(lengthWires);
  box(conveyor, [1.48, 0.035, 0.9], [-0.15, 1.43, 0], m.darkSteel, 0.01).name = 'collectionTray';
  box(conveyor, [0.34, 0.075, 0.045], [1.42, 1.73, -0.38], m.darkSteel);

  // 开口料槽与供料弯管，保留照片左侧醒目的轮廓。
  box(coatingHead, [0.38, 0.045, 0.76], [-0.67, 1.84, 0], m.steel);
  for (const x of [-0.85, -0.49]) box(coatingHead, [0.025, 0.29, 0.78], [x, 1.99, 0], m.panel, 0.005);
  for (const z of [-0.38, 0.38]) {
    const wall = box(coatingHead, [0.38, 0.29, 0.027], [-0.67, 1.99, z], m.steel, 0.005);
    if (z > 0) cutaway.push(wall);
  }
  box(coatingHead, [0.04, 0.12, 0.67], [-0.5, 1.77, 0], m.darkSteel, 0.003);
  for (const z of [-0.38, 0.38]) cylinder(coatingHead, 0.022, 0.31, [-0.73, 1.71, z], m.steel);
  pipe(coatingHead, [[-0.94, 1.48, -0.31], [-0.94, 2.24, -0.31], [-0.79, 2.29, -0.3], [-0.67, 2.15, -0.26]], 0.045, m.steel);

  // 控量区：高位双立柱罩体、手轮和带波纹的蓝色软管。
  for (const z of [-0.39, 0.39]) {
    cylinder(blowerGuide, 0.028, 1.05, [0.66, 2.04, z], m.steel);
    cylinder(blowerGuide, 0.049, 0.045, [0.66, 1.58, z], m.darkSteel);
  }
  const hood = box(blowerGuide, [0.75, 0.045, 1.05], [0.66, 2.56, 0], m.panel, 0.015);
  hood.rotation.z = -0.07;
  cutaway.push(hood);
  for (const z of [-0.49, 0.49]) box(blowerGuide, [0.76, 0.13, 0.025], [0.66, 2.49, z], m.steel, 0.005);
  cylinder(blowerGuide, 0.018, 0.22, [0.66, 2.65, 0], m.darkSteel);
  cylinder(blowerGuide, 0.065, 0.022, [0.66, 2.73, 0], m.dark);
  box(blowerGuide, [0.28, 0.19, 0.38], [0.15, 1.9, -0.17], m.steel);
  box(blowerGuide, [0.08, 0.04, 0.6], [0.23, 1.76, 0], m.darkSteel, 0.005);
  const hose = pipe(blowerGuide, [[0.14, 2, -0.19], [0.17, 2.21, -0.27], [0.51, 2.2, -0.4], [0.72, 1.8, -0.41], [0.85, 1.51, -0.43]], 0.069, m.blue);
  const rings = new InstancedMesh(new TorusGeometry(0.071, 0.008, 5, 12), m.blue, 24);
  for (let i = 0; i < 24; i++) {
    const t = i / 23;
    const q = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), hose.getTangentAt(t));
    rings.setMatrixAt(i, new Matrix4().compose(hose.getPointAt(t), q, new Vector3(1, 1, 1)));
  }
  blowerGuide.add(rings);
  Object.values(parts).forEach(part => batchStaticMeshes(part, new Set(cutaway)));

  let disposed = false;
  const highlighted = new Map<Mesh, Material | Material[]>();
  function selectPart(id: string | null) {
    for (const [mesh, original] of highlighted) {
      const temporary = mesh.material;
      (Array.isArray(temporary) ? temporary : [temporary]).forEach(material => material.dispose());
      mesh.material = original;
    }
    highlighted.clear();
    if (disposed || !id || !parts[id]) return;
    parts[id].traverse(node => {
      if (!(node instanceof Mesh)) return;
      highlighted.set(node, node.material);
      const tint = (material: Material) => {
        const clone = material.clone();
        if (clone instanceof MeshStandardMaterial) {
          clone.emissive.setHex(0xb17a3b);
          clone.emissiveIntensity = 0.18;
        }
        return clone;
      };
      node.material = Array.isArray(node.material) ? node.material.map(tint) : tint(node.material);
    });
  }

  return {
    root, parts,
    ports: {
      coreIn: { position: new Vector3(-1.9, 1.61, 0), direction: new Vector3(1, 0, 0) },
      chocolateIn: { position: new Vector3(-0.67, 2.15, -0.26), direction: new Vector3(0, -1, 0) },
      coatedOut: { position: new Vector3(1.9, 1.61, 0), direction: new Vector3(1, 0, 0) },
      returnFlow: { position: new Vector3(-0.15, 1.43, 0), direction: new Vector3(0, -1, 0) },
    },
    anchors: {
      conveyor: new Vector3(-1.54, 1.67, 0.38),
      coatingHead: new Vector3(-0.65, 2.18, 0.38),
      blowerGuide: new Vector3(0.73, 2.63, 0.43),
      cabinet: new Vector3(-0.6, 0.89, 0.99),
    },
    selectPart,
    setView(mode) { cutaway.forEach(mesh => { mesh.visible = mode === 'exterior'; }); },
    setBeltOffset(offset) { crossWires.position.x = offset; },
    dispose() {
      if (disposed) return;
      selectPart(null);
      disposed = true;
      const geometries = new Set<BufferGeometry>();
      const materials = new Set<Material>(Object.values(m));
      root.traverse(node => {
        if (node instanceof Mesh) {
          geometries.add(node.geometry);
          (Array.isArray(node.material) ? node.material : [node.material]).forEach(material => materials.add(material));
          if (node instanceof InstancedMesh) node.dispose();
        }
      });
      geometries.forEach(g => g.dispose());
      materials.forEach(material => material.dispose());
      root.clear();
    },
  };
}
