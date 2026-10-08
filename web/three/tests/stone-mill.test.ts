import { Box3, Mesh, Vector3 } from 'three';
import { expect, it, vi } from 'vitest';
import { createStoneMill } from '../src/machines/stone-mill';

it('双石辊、开口圆盘与外观部件对应，未知出料口不伪造接口', () => {
  const model = createStoneMill();
  expect(Object.keys(model.parts)).toEqual(['bowl', 'stones', 'bridge', 'drive']);
  expect(model.root.getObjectByName('stone-left')).toBeDefined();
  expect(model.root.getObjectByName('stone-right')).toBeDefined();
  expect((model.root.getObjectByName('bowl-front') as Mesh).geometry.type).toBe('LatheGeometry');
  expect(model.ports.materialIn.direction.toArray()).toEqual([0, -1, 0]);
  expect(model.ports.materialOut).toBeUndefined();
  const size = new Box3().setFromObject(model.root).getSize(new Vector3());
  expect(size.x).toBeGreaterThan(3); expect(size.y).toBeGreaterThan(2.5);
  expect(size.toArray().every(v => Number.isFinite(v) && v < 5)).toBe(true);
  Object.values(model.anchors).forEach(v => expect(v.toArray().every(Number.isFinite)).toBe(true));
  model.dispose();
});
it('工作示意可复原；高亮不污染共享材质，销毁幂等', () => {
  const model = createStoneMill();
  const wall = model.root.getObjectByName('bowl-front') as Mesh;
  const stone = model.root.getObjectByName('stone-left') as Mesh;
  const original = stone.material;
  model.setView('working'); expect(wall.visible).toBe(false);
  model.setView('exterior'); expect(wall.visible).toBe(true);
  model.selectPart('stones'); expect(stone.material).not.toBe(original);
  model.selectPart(null); expect(stone.material).toBe(original);
  const release = vi.spyOn(stone.geometry, 'dispose');
  model.dispose(); model.dispose(); expect(release).toHaveBeenCalledTimes(1);
});
