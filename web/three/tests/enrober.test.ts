import { Box3, Mesh, Vector3 } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { createEnrober } from '../src/machines/enrober';

describe('程序化涂层机', () => {
  it('包含可独立访问的工作部件和有限的进出料接口', () => {
    const machine = createEnrober();
    for (const part of ['cabinet', 'conveyor', 'coatingHead', 'blowerGuide']) {
      expect(machine.parts[part].isGroup).toBe(true);
      expect(machine.parts[part].parent).toBe(machine.root);
    }
    for (const id of ['coreIn', 'chocolateIn', 'coatedOut', 'returnFlow']) {
      const port = machine.ports[id];
      expect(port.position.toArray().every(Number.isFinite)).toBe(true);
      expect(port.direction.length()).toBeCloseTo(1);
    }
    const size = new Box3().setFromObject(machine.root).getSize(new Vector3());
    expect(size.x).toBeGreaterThan(3);
    expect(size.y).toBeGreaterThan(2);
    expect(size.toArray().every(v => Number.isFinite(v) && v > 0)).toBe(true);
    machine.dispose();
  });

  it('选择部件可恢复且不会改变其他部件的共享材质', () => {
    const machine = createEnrober();
    const other = machine.parts.cabinet.children.find(n => n instanceof Mesh) as Mesh;
    const material = other.material;
    machine.selectPart('conveyor');
    expect(other.material).toBe(material);
    machine.selectPart(null);
    expect(other.material).toBe(material);
    machine.dispose();
  });

  it('销毁幂等，共享资源只释放一次', () => {
    const machine = createEnrober();
    const mesh = machine.parts.cabinet.children.find(n => n instanceof Mesh) as Mesh;
    const dispose = vi.spyOn(mesh.geometry, 'dispose');
    machine.dispose();
    machine.dispose();
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it('工作视图只隐藏局部外壳，复位完整且网带可按绝对偏移恢复', () => {
    const machine = createEnrober();
    const visibility: boolean[] = [];
    machine.root.traverse(n => visibility.push(n.visible));
    machine.setView('working');
    let hidden = 0; machine.root.traverse(n => { if (!n.visible) hidden++; });
    expect(hidden).toBeGreaterThan(0);
    machine.setBeltOffset(0.02); machine.setBeltOffset(0);
    machine.setView('exterior');
    const restored: boolean[] = []; machine.root.traverse(n => restored.push(n.visible));
    expect(restored).toEqual(visibility);
    machine.dispose();
  });
});
