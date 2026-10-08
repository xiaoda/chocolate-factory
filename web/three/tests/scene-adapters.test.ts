import { expect, test } from 'vitest';
import { loadScene } from '../src/registry';

test('静态场景没有空动画壳，涂层场景保留独立播放器', async () => {
  const stone = (await loadScene('stone-mill')).create();
  const enrobed = (await loadScene('enrobed')).create();
  expect(stone.animation).toBeUndefined();
  expect(stone.labels.map(label => label.id)).toEqual(['materialIn']);
  expect(enrobed.animation?.player.duration).toBe(75);
  enrobed.animation!.player.seek(42);
  enrobed.animation!.update();
  expect(enrobed.labels.find(label => label.id === 'recovery')?.show).toBe(true);
  stone.dispose(); enrobed.dispose();
  expect(stone.root.children).toHaveLength(0);
  expect(enrobed.root.children).toHaveLength(0);
});
