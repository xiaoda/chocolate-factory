import { expect, test } from 'vitest';
import { evaluateRefining, rollSurfacePoint, ROLL_SPEEDS } from '../src/scenes/five-roll-timeline';
import { FIVE_ROLL_LAYOUT, ROLL_RADIUS } from '../src/machines/five-roll-layout';

test('五段覆盖 60 秒，非法输入与端点安全', () => {
  expect([0, 10, 22, 40, 50, 60].map(t => evaluateRefining(t).phaseId)).toEqual(['premix', 'nip', 'transfer', 'scraping', 'refined', 'refined']);
  for (const n of [-1, NaN, Infinity]) expect(evaluateRefining(n).time).toBe(0);
  expect(evaluateRefining(99).time).toBe(60);
});

test('料膜按顺序建立，刮取晚于末辊成膜，倒退可复现', () => {
  expect(evaluateRefining(0).coverage).toEqual([0, 0, 0, 0, 0]);
  expect(evaluateRefining(15).coverage[1]).toBeGreaterThan(0);
  expect(evaluateRefining(15).coverage.slice(2)).toEqual([0, 0, 0]);
  for (let t = 0; t <= 60; t += 0.5) {
    const s = evaluateRefining(t);
    if (s.coverage.some(c => c > 0)) expect(s.motion).toBeGreaterThan(0);
    for (let i = 1; i < 5; i++) if (s.coverage[i] > 0) expect(s.coverage[i - 1]).toBe(1);
    if (s.output > 0) expect(s.coverage[4]).toBe(1);
    expect(s.fineness).toBeGreaterThanOrEqual(0); expect(s.fineness).toBeLessThanOrEqual(1);
  }
  const first = evaluateRefining(18);
  evaluateRefining(59);
  expect(evaluateRefining(18)).toEqual(first);
  expect(evaluateRefining(0).output).toBe(0);
});

test('相邻辊反向、速度逐级增大，结果阶段停止运动', () => {
  for (let i = 1; i < 5; i++) {
    expect(ROLL_SPEEDS[i] * ROLL_SPEEDS[i - 1]).toBeLessThan(0);
    expect(Math.abs(ROLL_SPEEDS[i])).toBeGreaterThan(Math.abs(ROLL_SPEEDS[i - 1]));
  }
  expect(evaluateRefining(0).angles).toEqual([0, 0, 0, 0, 0]);
  expect(evaluateRefining(50).angles).toEqual(evaluateRefining(60).angles);
  expect(evaluateRefining(50).motion).toBe(evaluateRefining(60).motion);
});

test('弧线贴合已确认的辊位，前后交替，不直穿辊筒', () => {
  for (let i = 0; i < 5; i++) {
    const centre = FIVE_ROLL_LAYOUT[i];
    for (const p of [0, 0.25, 0.5, 0.75, 1]) {
      const [y, z] = rollSurfacePoint(i, p);
      expect(Math.hypot(y - centre[0], z - centre[1])).toBeCloseTo(ROLL_RADIUS);
    }
    if (i < 4) {
      const a = rollSurfacePoint(i, 1), b = rollSurfacePoint(i + 1, 0);
      expect(Math.hypot(a[0] - b[0], a[1] - b[1])).toBeLessThan(0.015);
    }
    // 料膜路径的切向，与绕 X 轴的辊面运动方向相同。
    const a = rollSurfacePoint(i, 0.45), b = rollSurfacePoint(i, 0.55);
    const tangent = [-ROLL_SPEEDS[i] * (a[1] - centre[1]), ROLL_SPEEDS[i] * (a[0] - centre[0])];
    expect((b[0] - a[0]) * tangent[0] + (b[1] - a[1]) * tangent[1]).toBeGreaterThan(0);
  }
});
