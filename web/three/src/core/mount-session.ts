import type { ViewerHandle } from './types';

/** 独占查看器。模块可以迟到，但过期请求连 WebGL 构造都不会执行。 */
export class MountSession {
  private generation = 0;
  private handle: ViewerHandle | undefined;

  clear() {
    this.generation++;
    const previous = this.handle;
    this.handle = undefined;
    previous?.dispose();
  }

  async load(prepare: () => Promise<() => ViewerHandle>): Promise<boolean> {
    this.clear();
    const token = this.generation;
    try {
      const mount = await prepare();
      if (token !== this.generation) return false;
      const handle = mount();
      if (token !== this.generation) { handle.dispose(); return false; }
      this.handle = handle;
      return true;
    } catch (error) {
      if (token !== this.generation) return false;
      throw error;
    }
  }
}

export function panelForHash(hash: string, ids: readonly string[]): string | undefined {
  try {
    const id = decodeURIComponent(hash.replace(/^#/, ''));
    return ids.includes(id) ? id : undefined;
  } catch { return undefined; }
}
