import { expect, test } from 'vitest';
import { loadScene } from '../src/registry';

test('双设备保持独立播放器、标签和资源归属', async () => {
  const stone = (await loadScene('stone-mill')).create();
  const enrobed = (await loadScene('enrobed')).create();
  expect(stone.animation?.player.duration).toBe(60);
  expect(stone.labels.map(label => label.id)).toEqual(['materialIn', 'grinding', 'paste']);
  expect(stone.animation?.player.playing).toBe(false);
  expect(enrobed.animation?.player.duration).toBe(75);
  enrobed.animation!.player.seek(42);
  enrobed.animation!.update();
  expect(enrobed.labels.find(label => label.id === 'recovery')?.show).toBe(true);
  expect(stone.animation?.player.time).toBe(0);
  stone.animation!.player.seek(60); stone.animation!.update();
  expect(stone.labels.find(label => label.id === 'paste')?.text).toContain('可可液块');
  expect(enrobed.animation?.player.time).toBe(42);
  stone.dispose(); enrobed.dispose();
  expect(stone.root.children).toHaveLength(0);
  expect(enrobed.root.children).toHaveLength(0);
});
