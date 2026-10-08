import { expect, it } from 'vitest';
import data from '../generated/enrobed.json';

it('互动样板包含完整的阶段讲解和补充示意边界', () => {
  expect(data.status).toBe('animated-prototype');
  expect(data.parts.map(p => p.id)).toEqual(['conveyor', 'coatingHead', 'blowerGuide', 'cabinet']);
  expect(data.phases.at(-1)?.end).toBe(data.duration);
  expect(data.boundary).toContain('简化示意');
  expect(data.boundary).toContain('非真实加工时长');
  for (const phase of data.phases) {
    for (const key of ['input', 'action', 'output', 'note'] as const) expect(phase.caption[key].length).toBeGreaterThan(5);
  }
});
