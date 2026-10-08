import type { SceneDefinition } from './core/types';

/** 显式白名单与独立懒加载入口；不会按来自 DOM 的路径导入任意文件。 */
export async function loadScene(id: string): Promise<SceneDefinition> {
  switch (id) {
    case 'enrobed': return (await import('./scenes/enrobed-view')).enrobedScene;
    case 'stone-mill': return (await import('./scenes/stone-mill-view')).stoneMillScene;
    default: throw new Error(`未知设备场景：${id}`);
  }
}
