import { Group, InstancedMesh, Mesh } from 'three';
import type { Material } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/** 只合并同一部件内不运动的网格，保留热点分组、独立外壳及动态网带。 */
export function batchStaticMeshes(parent: Group, excluded: Set<Mesh>) {
  const groups = new Map<Material, Mesh[]>();
  for (const child of parent.children) {
    if (!(child instanceof Mesh) || child instanceof InstancedMesh || excluded.has(child) || Array.isArray(child.material)) continue;
    const group = groups.get(child.material) ?? []; group.push(child); groups.set(child.material, group);
  }
  for (const [material, meshes] of groups) {
    if (meshes.length < 2) continue;
    const copies = meshes.map(mesh => {
      mesh.updateMatrix();
      const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
      return geometry.applyMatrix4(mesh.matrix);
    });
    const geometry = mergeGeometries(copies, false);
    copies.forEach(copy => copy.dispose());
    if (!geometry) throw new Error('静态几何合批失败');
    const merged = new Mesh(geometry, material);
    merged.name = `${parent.name}-batch`; merged.castShadow = true; merged.receiveShadow = true;
    meshes.forEach(mesh => { parent.remove(mesh); mesh.geometry.dispose(); });
    parent.add(merged);
  }
}
