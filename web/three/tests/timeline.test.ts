import { describe, expect, it } from 'vitest';
import { evaluateScene, TimelinePlayer, DURATION } from '../src/core/timeline';

describe('确定性工序时间轴', () => {
  it('阶段边界唯一，首尾和非法输入均受约束', () => {
    const boundaries = [0, 12, 30, 44, 63, 75];
    const phases = ['inputs', 'coating', 'control', 'cooling', 'output', 'output'];
    boundaries.forEach((time, i) => {
      expect(evaluateScene(time).phaseId).toBe(phases[i]);
      if (i > 0 && i < 5) expect(evaluateScene(time - 0.001).phaseId).toBe(phases[i - 1]);
      expect(evaluateScene(time + 0.001).phaseId).toBe(phases[i]);
    });
    expect(evaluateScene(-5).time).toBe(0);
    expect(evaluateScene(Infinity).time).toBe(0);
    expect(evaluateScene(NaN).time).toBe(0);
    expect(evaluateScene(90).time).toBe(DURATION);
  });
  it('正播倒播重复求值相同，包覆和冷却不越界', () => {
    const snapshots = new Map<number, ReturnType<typeof evaluateScene>>();
    for (let t = 0; t <= DURATION; t += 0.25) {
      const state = evaluateScene(t);
      snapshots.set(t, state);
      state.products.forEach(p => {
        expect(p.coverage).toBeGreaterThanOrEqual(0);
        expect(p.coverage).toBeLessThanOrEqual(1);
        expect(p.cooling).toBeGreaterThanOrEqual(0);
        expect(p.cooling).toBeLessThanOrEqual(1);
        if (t <= 44) expect(p.cooling).toBe(0);
        if (p.x < -0.66) expect(p.coverage).toBe(0);
      });
    }
    for (let t = DURATION; t >= 0; t -= 0.25) expect(evaluateScene(t)).toEqual(snapshots.get(t));
    expect(evaluateScene(0).products[0].x).toBe(-1.5);
    expect(evaluateScene(75).products.every(p => p.coverage === 1 && p.cooling === 1)).toBe(true);
    expect(evaluateScene(44).products[0].x).toBeCloseTo(1.85);
  });
});

describe('播放意图与临时挂起', () => {
  it('默认不播放，暂停后稳定；跳转不会累计旧帧时差', () => {
    const p = new TimelinePlayer();
    p.advance(1000); expect(p.time).toBe(0);
    p.play(); p.advance(2000); p.advance(3000); expect(p.time).toBe(1);
    p.pause(); p.advance(10000); expect(p.time).toBe(1);
    p.seek(22); p.play(); p.advance(20000); p.advance(21000); expect(p.time).toBe(23);
    p.seek(5); p.advance(30000); expect(p.time).toBe(5);
  });
  it('离屏挂起不改变用户意图，用户暂停后不能自动恢复', () => {
    const p = new TimelinePlayer(); p.play(); p.advance(0); p.advance(1000);
    p.setSuspended(true); p.advance(100000); expect(p.time).toBe(1); expect(p.playing).toBe(true);
    p.setSuspended(false); p.advance(110000); p.advance(111000); expect(p.time).toBe(2);
    p.setSuspended(true); p.pause(); p.setSuspended(false); p.advance(120000);
    expect(p.playing).toBe(false); expect(p.time).toBe(2);
  });
  it('播完停止，不自动循环；重播和结束后播放从头开始', () => {
    const p = new TimelinePlayer(); p.seek(74); p.play(); p.advance(0); p.advance(3000);
    expect(p.time).toBe(75); expect(p.playing).toBe(false);
    p.advance(4000); expect(p.time).toBe(75);
    p.play(); expect(p.time).toBe(0); expect(p.playing).toBe(true);
    p.seek(30); p.restart(); expect(p.time).toBe(0);
    p.advance(NaN); expect(p.time).toBe(0);
  });
});
