import { expect, it } from 'vitest';
import { evaluateScene } from '../src/core/timeline';
import { flowLabels, productLabel } from '../src/ui/labels';

it('标签不把控量说成凝固，冷却边界始终可见', () => {
  expect(productLabel(evaluateScene(0))).toContain('尚未涂层');
  expect(productLabel(evaluateScene(37))).toContain('仍需冷却');
  expect(productLabel(evaluateScene(51))).toContain('正在冷却');
  expect(productLabel(evaluateScene(75))).toContain('已定型');
  for (const t of [0, 21, 37, 54, 75]) expect(flowLabels(evaluateScene(t)).find(l => l.id === 'cooling')?.show).toBe(true);
});
