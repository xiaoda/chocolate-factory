import { expect, test, vi } from 'vitest';
import { MountSession, panelForHash } from '../src/core/mount-session';

function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

test('切换后旧异步加载不创建查看器', async () => {
  const session = new MountSession();
  const pending = deferred<() => { dispose(): void }>();
  const staleFactory = vi.fn(() => ({ dispose: vi.fn() }));
  const load = session.load(() => pending.promise);
  session.clear(); pending.resolve(staleFactory);
  expect(await load).toBe(false); expect(staleFactory).not.toHaveBeenCalled();
});

test('晚到的 A 不替换 B；重复释放幂等', async () => {
  const session = new MountSession();
  const pending = deferred<() => { dispose(): void }>();
  const staleFactory = vi.fn(() => ({ dispose: vi.fn() }));
  const dispose = vi.fn();
  const a = session.load(() => pending.promise);
  expect(await session.load(async () => () => ({ dispose }))).toBe(true);
  pending.resolve(staleFactory); expect(await a).toBe(false);
  expect(staleFactory).not.toHaveBeenCalled();
  session.clear(); session.clear(); expect(dispose).toHaveBeenCalledTimes(1);
});

test('加载新设备前释放当前设备', async () => {
  const session = new MountSession(), dispose = vi.fn();
  await session.load(async () => () => ({ dispose }));
  await session.load(async () => { expect(dispose).toHaveBeenCalledTimes(1); return () => ({ dispose: vi.fn() }); });
  session.clear();
});

test('同步挂载中失效的句柄也被释放', async () => {
  const session = new MountSession(), dispose = vi.fn();
  expect(await session.load(async () => () => { session.clear(); return { dispose }; })).toBe(false);
  expect(dispose).toHaveBeenCalledTimes(1);
  session.clear(); expect(dispose).toHaveBeenCalledTimes(1);
});

test('当前错误向 UI 抛出，可重试；旧错误被忽略', async () => {
  const session = new MountSession(), pending = deferred<() => { dispose(): void }>();
  const old = session.load(() => pending.promise);
  session.clear(); pending.reject(new Error('旧请求失败')); expect(await old).toBe(false);
  await expect(session.load(async () => { throw new Error('当前失败'); })).rejects.toThrow('当前失败');
  await expect(session.load(async () => () => { throw new Error('挂载失败'); })).rejects.toThrow('挂载失败');
  expect(await session.load(async () => () => ({ dispose() {} }))).toBe(true);
  session.clear();
});

test('深链接只匹配本页设备；正文锚点不强制切换', () => {
  const ids = ['equipment-3d', 'equipment-five-roll'];
  expect(panelForHash('#equipment-five-roll', ids)).toBe('equipment-five-roll');
  expect(panelForHash('#equipment-3d', ids)).toBe('equipment-3d');
  expect(panelForHash('#step-4', ids)).toBeUndefined();
  expect(panelForHash('#%XX', ids)).toBeUndefined();
  expect(panelForHash('', ids)).toBeUndefined();
});
