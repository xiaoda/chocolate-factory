import { describe, expect, it, vi } from 'vitest';
import { Mesh } from 'three';
import { createProcessScene } from '../src/scenes/enrobed';
import { evaluateScene } from '../src/core/timeline';

describe('物料与工序场景', () => {
  it('实体外层逐渐出现，倒退会恢复芯体与全部效果', () => {
    const scene = createProcessScene();
    const snapshot = () => {
      const result: unknown[] = [];
      scene.root.traverse(n => result.push([n.name, n.visible, n.position.toArray(), n.scale.toArray()]));
      return result;
    };
    scene.applyState(evaluateScene(0)); const first = snapshot();
    expect(scene.root.getObjectByName('shell-0')!.visible).toBe(false);
    scene.applyState(evaluateScene(26));
    expect(scene.root.getObjectByName('shell-0')!.visible).toBe(true);
    expect(scene.root.getObjectByName('chocolateCurtain')!.visible).toBe(true);
    scene.applyState(evaluateScene(54)); const middle = snapshot();
    scene.applyState(evaluateScene(75));
    expect(scene.root.getObjectByName('inputReference')!.visible).toBe(true);
    scene.applyState(evaluateScene(54)); expect(snapshot()).toEqual(middle);
    scene.applyState(evaluateScene(0)); expect(snapshot()).toEqual(first);
    expect(scene.root.getObjectByName('inputReference')!.visible).toBe(false);
    scene.dispose();
  });
  it('不逐帧创建几何，销毁幂等', () => {
    const scene = createProcessScene();
    const meshes: Mesh[] = []; scene.root.traverse(n => { if (n instanceof Mesh) meshes.push(n); });
    const geometries = meshes.map(n => n.geometry);
    for (let t = 0; t <= 75; t++) scene.applyState(evaluateScene(t));
    expect(meshes.map(n => n.geometry)).toEqual(geometries);
    const spy = vi.spyOn(meshes[0].geometry, 'dispose');
    scene.dispose(); scene.dispose(); expect(spy).toHaveBeenCalledTimes(1);
  });
});
