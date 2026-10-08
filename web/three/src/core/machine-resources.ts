import { Group, InstancedMesh, Mesh, MeshStandardMaterial } from 'three';
import type { BufferGeometry, Material } from 'three';

/** 共用的部件高亮与资源归属；取消高亮先恢复原材质，共享资源只释放一次。 */
export function machineResources(root: Group, parts: Record<string, Group>, extraMaterials: Material[] = []) {
  let disposed = false;
  const highlighted = new Map<Mesh, Material | Material[]>();
  function selectPart(id: string | null) {
    for (const [mesh, original] of highlighted) {
      (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(material => material.dispose());
      mesh.material = original;
    }
    highlighted.clear();
    if (disposed || !id || !parts[id]) return;
    parts[id].traverse(node => {
      if (!(node instanceof Mesh)) return;
      highlighted.set(node, node.material);
      const tint = (material: Material) => {
        const clone = material.clone();
        if (clone instanceof MeshStandardMaterial) { clone.emissive.setHex(0xb17a3b); clone.emissiveIntensity = 0.18; }
        return clone;
      };
      node.material = Array.isArray(node.material) ? node.material.map(tint) : tint(node.material);
    });
  }
  return {
    selectPart,
    dispose() {
      if (disposed) return;
      selectPart(null); disposed = true;
      const geometries = new Set<BufferGeometry>(), materials = new Set<Material>(extraMaterials);
      root.traverse(node => {
        if (!(node instanceof Mesh)) return;
        geometries.add(node.geometry);
        (Array.isArray(node.material) ? node.material : [node.material]).forEach(m => materials.add(m));
        if (node instanceof InstancedMesh) node.dispose();
      });
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); root.clear();
    },
  };
}
