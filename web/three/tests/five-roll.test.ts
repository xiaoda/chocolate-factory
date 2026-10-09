import { expect, test, vi } from 'vitest';
import { Mesh, Vector3 } from 'three';
import { createFiveRoll } from '../src/machines/five-roll';
import { loadScene } from '../src/registry';

test('五根独立水平辊筒、四组部件，不虚构物料口', () => {
  const machine = createFiveRoll();
  expect(Object.keys(machine.parts)).toEqual(['rollers', 'frame', 'drive', 'controls']);
  expect(Object.keys(machine.ports)).toEqual([]);
  const rollers = machine.parts.rollers.children.filter(node => /^roller-\d$/.test(node.name));
  expect(rollers).toHaveLength(5);
  expect(rollers.every(node => node instanceof Mesh && node.rotation.z === Math.PI / 2)).toBe(true);
  expect(new Set(rollers.map(node => node.position.y)).size).toBe(5);
  expect(rollers[0].position.z).toBeGreaterThan(rollers[1].position.z);
  machine.dispose();
});

test('辊组观察只隐藏罩体，完整外观可恢复', () => {
  const machine = createFiveRoll();
  const cover = machine.root.getObjectByName('side-cover')!;
  const guard = machine.root.getObjectByName('upper-guard')!;
  machine.setView('working');
  expect(cover.visible).toBe(false); expect(guard.visible).toBe(false);
  expect(Object.values(machine.parts).every(part => part.visible)).toBe(true);
  machine.setView('exterior');
  expect(cover.visible).toBe(true); expect(guard.visible).toBe(true);
  machine.dispose();
});

test('高亮可恢复，共享资源只释放一次', () => {
  const machine = createFiveRoll();
  const roller = machine.root.getObjectByName('roller-1') as Mesh;
  const original = roller.material;
  const geometryDispose = vi.spyOn(roller.geometry, 'dispose');
  machine.selectPart('rollers');
  expect(roller.material).not.toBe(original);
  machine.selectPart(null); expect(roller.material).toBe(original);
  machine.selectPart('drive'); machine.dispose(); machine.dispose();
  expect(geometryDispose).toHaveBeenCalledTimes(1);
  expect(machine.root.children).toHaveLength(0);
});

test('转动只绕辊轴，非法角度和倒退能复位', () => {
  const machine = createFiveRoll();
  const roller = machine.root.getObjectByName('roller-1') as Mesh;
  const axisBefore = new Vector3(0, 1, 0).applyQuaternion(roller.quaternion);
  machine.setRollAngles([2, -3, 4, -5, 6]);
  expect(roller.rotation.x).toBe(2);
  expect(new Vector3(0, 1, 0).applyQuaternion(roller.quaternion).distanceTo(axisBefore)).toBeLessThan(1e-10);
  machine.setRollAngles([NaN]); expect(roller.rotation.x).toBe(0);
  machine.setRollAngles([0, 0, 0, 0, 0]); expect(roller.rotation.x).toBe(0);
  machine.dispose();
});

test('动画适配器不自动播放，完整外观只隐藏教学叠加，倒退可还原', async () => {
  const definition = await loadScene('five-roll');
  expect(definition.initialMode).toBe('working');
  const instance = definition.create();
  const { player, update } = instance.animation!;
  expect(player.duration).toBe(60); expect(player.playing).toBe(false);
  expect(instance.labels.map(label => label.id)).toEqual(['materialIn', 'film', 'result']);
  expect(definition.parts.map(part => part.id)).toEqual(Object.keys(instance.machine.parts));
  player.seek(45); update();
  expect(instance.labels[2].show).toBe(true);
  instance.machine.setView('exterior'); update();
  expect(instance.root.getObjectByName('refiningProcessRoot')!.visible).toBe(false);
  expect(instance.labels.every(label => !label.show)).toBe(true);
  expect(player.time).toBe(45);
  instance.machine.setView('working'); update();
  expect(instance.root.getObjectByName('refiningProcessRoot')!.visible).toBe(true);
  expect(instance.labels[2].show).toBe(true);
  player.seek(0); update();
  expect(instance.root.getObjectByName('roll-film-5')!.visible).toBe(false);
  expect(instance.labels[0].show).toBe(true);
  expect(instance.labels[2].show).toBe(false);
  expect(instance.root.getObjectByName('roller-1')!.rotation.x).toBe(0);
  instance.dispose(); instance.dispose();
  expect(instance.root.children).toHaveLength(0);
});
