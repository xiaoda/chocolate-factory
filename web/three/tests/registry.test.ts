import { expect, it } from 'vitest';
import { loadScene } from '../src/registry';

it('只允许已注册场景，拒绝任意模块路径', async () => {
  await expect(loadScene('../viewer')).rejects.toThrow('未知');
  await expect(loadScene('constructor')).rejects.toThrow('未知');
});
it('同一场景接口容纳动画设备与静态设备', async () => {
  const animated = await loadScene('enrobed');
  const still = await loadScene('stone-mill');
  const a = animated.create(), b = still.create();
  expect(a.animation?.player.duration).toBe(75);
  expect(b.animation).toBeUndefined();
  expect(b.machine.root.name).toBe('stoneMillRoot');
  expect(still.parts.map(p => p.id)).toEqual(Object.keys(b.machine.parts));
  a.dispose(); a.dispose(); b.dispose(); b.dispose();
});
