import { expect, it } from 'vitest';
import { TimelinePlayer } from '../src/core/playback';

it('公共时钟不绑定涂层机的 75 秒', () => {
  const player = new TimelinePlayer(18);
  player.seek(17); player.play(); player.advance(0); player.advance(2000);
  expect(player.time).toBe(18); expect(player.playing).toBe(false);
  player.restart(); expect(player.time).toBe(0);
  player.advance(2000); player.setSuspended(true); player.advance(8000);
  expect(player.time).toBe(0);
  player.setSuspended(false); player.advance(9000); player.advance(9500);
  expect(player.time).toBe(0.5);
  for (const duration of [0, -1, NaN, Infinity]) expect(() => new TimelinePlayer(duration)).toThrow();
});
