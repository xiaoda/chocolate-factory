import { expect, test, vi } from 'vitest';
import { Mesh } from 'three';
import { createRefiningProcess } from '../src/scenes/five-roll-process';
import { evaluateRefining } from '../src/scenes/five-roll-timeline';
import { diagramFilmPath, diagramRollCentre } from '../src/ui/five-roll-diagram';

test('过程几何预分配，前进和倒退只更新现有对象', () => {
  const process = createRefiningProcess();
  const ids: string[] = []; process.root.traverse(node => ids.push(node.uuid));
  process.applyState(evaluateRefining(60));
  for (let i = 0; i < 5; i++) {
    const film = process.root.getObjectByName(`roll-film-${i + 1}`) as Mesh;
    expect(film.visible).toBe(true); expect(film.geometry.drawRange.count).toBeGreaterThan(0);
  }
  process.applyState(evaluateRefining(0));
  for (let i = 0; i < 5; i++) expect(process.root.getObjectByName(`roll-film-${i + 1}`)!.visible).toBe(false);
  const after: string[] = []; process.root.traverse(node => after.push(node.uuid));
  expect(after).toEqual(ids);
  process.dispose();
});

test('过程释放幂等；释放后更新不再写几何', () => {
  const process = createRefiningProcess();
  const mesh = process.root.getObjectByName('roll-film-1') as Mesh;
  const dispose = vi.spyOn(mesh.geometry, 'dispose');
  process.dispose(); process.dispose(); process.applyState(evaluateRefining(30));
  expect(dispose).toHaveBeenCalledTimes(1); expect(process.root.children).toHaveLength(0);
});

test('原理图共用辊位，弧线长度随覆盖增长且无非法坐标', () => {
  expect(diagramRollCentre(0)[0]).toBeLessThan(diagramRollCentre(1)[0]);
  expect(diagramRollCentre(0)[1]).toBeGreaterThan(diagramRollCentre(1)[1]);
  for (let i = 0; i < 5; i++) {
    expect(diagramFilmPath(i, 0)).toBe('');
    expect(diagramFilmPath(i, 1).length).toBeGreaterThan(diagramFilmPath(i, 0.25).length);
    expect(diagramFilmPath(i, 1)).not.toMatch(/NaN|Infinity/);
  }
});
