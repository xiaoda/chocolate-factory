import { Color, CylinderGeometry, DynamicDrawUsage, Group, IcosahedronGeometry, InstancedMesh, Mesh, MeshStandardMaterial, Object3D, TorusGeometry, Vector3 } from 'three';
import { machineResources } from '../core/machine-resources';
import { evaluateGrinding, GRAIN_COUNT } from './stone-mill-timeline';
import type { GrindingState } from './stone-mill-timeline';

/** 预先分配全部物料几何，按绝对时间更新；不模拟真实流体/质量守恒。 */
export function createGrindingProcess() {
  const root = new Group(); root.name = 'grindingProcessRoot';
  const nibMaterial = new MeshStandardMaterial({ color: 0xffffff, roughness: 0.94, flatShading: true });
  const nibs = new InstancedMesh(new IcosahedronGeometry(1, 0), nibMaterial, GRAIN_COUNT);
  nibs.name = 'nibs'; nibs.castShadow = true; nibs.receiveShadow = true;
  nibs.instanceMatrix.setUsage(DynamicDrawUsage);
  // 动态粒子位置变化，不沿用初帧的包围球，否则后续状态可能被错误剔除。
  nibs.frustumCulled = false;
  const chipColor = new Color();
  for (let i = 0; i < GRAIN_COUNT; i++) {
    chipColor.setHex([0x6c3c24, 0x8b5233, 0x59301e, 0x77432a][i % 4]); nibs.setColorAt(i, chipColor);
  }
  root.add(nibs);
  const pasteMaterial = new MeshStandardMaterial({ color: 0x542b19, roughness: 0.65, transparent: true, opacity: 0 });
  const thickness = 0.055;
  const pasteGeometry = new CylinderGeometry(1.35, 1.33, thickness, 80);
  const vertices = pasteGeometry.attributes.position;
  for (let i = 0; i < vertices.count; i++) {
    const x = vertices.getX(i), z = vertices.getZ(i), radius = Math.hypot(x, z), a = Math.atan2(z, x);
    const edge = 1 + 0.009 * Math.sin(a * 3) + 0.004 * Math.cos(a * 7);
    vertices.setX(i, x * edge); vertices.setZ(i, z * edge);
    // 柔和、不规则的表面边缘，避免把可可浆画成一块硬巧克力圆饼。
    if (vertices.getY(i) > 0) vertices.setY(i, vertices.getY(i) + 0.007 * Math.sin(a * 3 + radius * 5) * radius / 1.35);
  }
  pasteGeometry.computeVertexNormals();
  const paste = new Mesh(pasteGeometry, pasteMaterial);
  paste.name = 'cocoa-paste'; paste.position.y = 1.48; paste.receiveShadow = true;
  root.add(paste);
  const swirlMaterial = new MeshStandardMaterial({ color: 0x77452c, roughness: 0.58, transparent: true, opacity: 0 });
  const swirls = new Group(); swirls.name = 'paste-swirls'; root.add(swirls);
  for (let i = 0; i < 3; i++) {
    const arc = new Mesh(new TorusGeometry(0.49 + i * 0.27, 0.012, 5, 44, Math.PI * 1.35), swirlMaterial);
    arc.rotation.x = -Math.PI / 2; arc.rotation.z = i * 1.93; swirls.add(arc);
  }
  const transform = new Object3D();
  const resources = machineResources(root, {}, [nibMaterial, pasteMaterial, swirlMaterial]);
  const anchors = { materialIn: new Vector3(0.1, 2.62, 1.05), grinding: new Vector3(-0.95, 1.9, 0.45), paste: new Vector3(1.5, 1.65, 0.65) };
  let disposed = false;
  function applyState(state: GrindingState) {
    if (disposed) return;
    nibs.visible = state.paste < 0.995;
    state.grains.forEach((grain, i) => {
      transform.position.set(...grain.position);
      transform.rotation.set(grain.spin * 0.61, grain.spin, grain.spin * 0.37);
      const size = grain.visible ? grain.size : 0;
      transform.scale.set(size, size * 0.65, size * 0.85); transform.updateMatrix();
      nibs.setMatrixAt(i, transform.matrix);
    });
    nibs.instanceMatrix.needsUpdate = true;
    paste.visible = state.paste > 0.001;
    pasteMaterial.opacity = state.paste;
    pasteMaterial.roughness = 0.78 - state.paste * 0.34;
    paste.scale.y = 0.35 + state.paste * 0.65;
    paste.position.y = 1.445 + thickness / 2 * paste.scale.y;
    swirls.visible = state.paste > 0.08;
    swirls.position.y = paste.position.y + thickness / 2 * paste.scale.y + 0.009;
    swirls.rotation.y = state.angle;
    swirlMaterial.opacity = state.paste * 0.55;
  }
  applyState(evaluateGrinding(0));
  return { root, anchors, applyState,
    dispose() { if (disposed) return; disposed = true; resources.dispose(); },
  };
}
