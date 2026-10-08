import { expect, it } from 'vitest';
import data from '../generated/enrobed.json';

it('静态样板保留后续动画映射但不声称动画已完成', () => {
  expect(data.status).toBe('static-prototype');
  expect(data.parts.map(p => p.id)).toEqual(['conveyor', 'coatingHead', 'blowerGuide', 'cabinet']);
  expect(data.phases.at(-1)?.end).toBe(data.duration);
  expect(data.boundary).toContain('简化示意');
});
