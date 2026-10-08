import { describe, expect, it } from 'vitest';
import { evaluateGrinding, GRINDING_DURATION, GRAIN_COUNT } from '../src/scenes/stone-mill-timeline';

describe('石磨教学时间轴', () => {
  it('四阶段边界连续，非法时间和越界时间安全处理', () => {
    expect(GRINDING_DURATION).toBe(60);
    expect([0, 10, 28, 46, 60].map(t => evaluateGrinding(t).phaseId)).toEqual(['feeding', 'crushing', 'liquefying', 'result', 'result']);
    expect(evaluateGrinding(-1)).toEqual(evaluateGrinding(0));
    expect(evaluateGrinding(NaN)).toEqual(evaluateGrinding(0));
    expect(evaluateGrinding(Infinity)).toEqual(evaluateGrinding(0));
    expect(evaluateGrinding(100)).toEqual(evaluateGrinding(60));
  });
  it('物料由碎粒变为浆态，不会无限投料，结果阶段停止运动', () => {
    const coarse = evaluateGrinding(12), paste = evaluateGrinding(46);
    expect(coarse.grains).toHaveLength(GRAIN_COUNT);
    expect(coarse.grains.every(g => g.visible && !g.falling)).toBe(true);
    expect(coarse.paste).toBe(0);
    expect(paste.paste).toBe(1);
    expect(paste.grains.every(g => !g.visible)).toBe(true);
    expect(evaluateGrinding(60).angle).toBe(paste.angle);
    expect(evaluateGrinding(0).angle).toBe(0);
    expect(evaluateGrinding(30).angle).toBeGreaterThan(coarse.angle);
  });
  it('顺播、倒退和直接跳转具有相同状态，所有粒子留在投料/料盘范围内', () => {
    const expected = evaluateGrinding(19);
    for (const t of [0, 37, 60, 3, 51]) evaluateGrinding(t);
    expect(evaluateGrinding(19)).toEqual(expected);
    for (let t = 0; t <= 60; t += 0.25) {
      const state = evaluateGrinding(t);
      expect([state.angle, state.paste, state.fineness].every(Number.isFinite)).toBe(true);
      for (const grain of state.grains) {
        expect([...grain.position, grain.size].every(Number.isFinite)).toBe(true);
        if (!grain.visible) continue;
        expect(Math.hypot(grain.position[0], grain.position[2]) + grain.size).toBeLessThan(1.43);
        expect(grain.position[1]).toBeGreaterThanOrEqual(1.44);
      }
    }
  });
  it('开始和停止时没有角度跳变，浆态比例不随倒放留下残影', () => {
    for (const t of [10, 13, 41, 46]) expect(Math.abs(evaluateGrinding(t + 0.001).angle - evaluateGrinding(t - 0.001).angle)).toBeLessThan(0.002);
    expect(evaluateGrinding(60).paste).toBe(1);
    expect(evaluateGrinding(0).paste).toBe(0);
  });
});
