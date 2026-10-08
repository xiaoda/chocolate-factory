import { InstancedMesh, Mesh, MeshStandardMaterial } from 'three';
import { expect, it, vi } from 'vitest';
import { createGrindingProcess } from '../src/scenes/stone-mill-process';
import { evaluateGrinding, GRAIN_COUNT } from '../src/scenes/stone-mill-timeline';

it('粒子和浆态是独立几何，跳转还原状态且不增建网格', () => {
  const process = createGrindingProcess();
  const nibs = process.root.getObjectByName('nibs') as InstancedMesh;
  const paste = process.root.getObjectByName('cocoa-paste') as Mesh;
  expect(nibs.count).toBe(GRAIN_COUNT);
  process.applyState(evaluateGrinding(14));
  const before = Array.from(nibs.instanceMatrix.array);
  const nodes: string[] = []; process.root.traverse(n => nodes.push(n.uuid));
  for (let t = 0; t <= 60; t++) process.applyState(evaluateGrinding(t));
  expect(nibs.visible).toBe(false);
  expect(paste.visible).toBe(true);
  expect((paste.material as MeshStandardMaterial).opacity).toBe(1);
  process.applyState(evaluateGrinding(14));
  expect(Array.from(nibs.instanceMatrix.array)).toEqual(before);
  expect(paste.visible).toBe(false);
  expect(nibs.visible).toBe(true);
  const after: string[] = []; process.root.traverse(n => after.push(n.uuid));
  expect(after).toEqual(nodes);
  process.dispose();
});

it('物料资源按实例释放一次，不伪造出口组件', () => {
  const process = createGrindingProcess();
  const nibs = process.root.getObjectByName('nibs') as InstancedMesh;
  const geometry = vi.spyOn(nibs.geometry, 'dispose'), instance = vi.spyOn(nibs, 'dispose');
  expect(process.root.getObjectByName('materialOut')).toBeUndefined();
  process.applyState(evaluateGrinding(37));
  process.dispose(); process.dispose();
  expect(geometry).toHaveBeenCalledTimes(1);
  expect(instance).toHaveBeenCalledTimes(1);
  expect(process.root.children).toHaveLength(0);
});
