import data from '../../generated/enrobed.json';

export const DURATION = data.duration;
export const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const timeInRange = (value: number) => Number.isFinite(value) ? Math.max(0, Math.min(DURATION, value)) : 0;
export interface ProductState { x: number; coverage: number; cooling: number; control: number; vibration: number }
export interface SceneState {
  time: number;
  phaseId: string;
  phaseIndex: number;
  phaseProgress: number;
  products: ProductState[];
  flow: boolean;
  beltOffset: number;
}

/** 所有位置与状态只依赖教学时间。顺播、倒退、跳转不累积误差。 */
export function evaluateScene(seconds: number): SceneState {
  const time = timeInRange(seconds);
  const phaseIndex = Math.max(0, data.phases.findIndex((p, i) => time >= p.start && (time < p.end || i === data.phases.length - 1)));
  const phase = data.phases[phaseIndex];
  const phaseProgress = clamp01((time - phase.start) / (phase.end - phase.start));
  const positions = [-1.5, -1.5, 0.28, 1.85, 4.2, 4.2];
  const x = positions[phaseIndex] + (positions[phaseIndex + 1] - positions[phaseIndex]) * phaseProgress;
  const products = [0, 1, 2].map(index => {
    const px = x - index * 0.42;
    return {
      x: px,
      coverage: clamp01((px + 0.5 + 0.16) / 0.32),
      control: clamp01((px - 0.15) / 1.2),
      cooling: time <= data.phases[3].start ? 0 : clamp01((px - 2.1) / 1.2),
      vibration: px > 0.15 && px < 1.35 ? Math.sin(time * 22) * 0.003 : 0,
    };
  });
  return { time, phaseId: phase.id, phaseIndex, phaseProgress, products,
    flow: time >= data.phases[1].start && time < data.phases[3].start,
    beltOffset: ((x + 1.5) % (3.54 / 93)),
  };
}

/** playing 是用户意图；suspended 是页面暂不可见，两者不能混为一谈。 */
export class TimelinePlayer {
  time = 0;
  playing = false;
  suspended = false;
  private previous: number | null = null;
  play() { if (this.time >= DURATION) this.time = 0; this.playing = true; this.previous = null; }
  pause() { this.playing = false; this.previous = null; }
  restart() { this.time = 0; this.play(); }
  seek(seconds: number) { this.time = timeInRange(seconds); this.previous = null; if (this.time === DURATION) this.pause(); }
  setSuspended(value: boolean) { if (value !== this.suspended) this.previous = null; this.suspended = value; }
  advance(timestamp: number) {
    if (!Number.isFinite(timestamp)) return;
    if (!this.playing || this.suspended) { this.previous = null; return; }
    if (this.previous !== null) this.time = Math.min(DURATION, this.time + Math.max(0, timestamp - this.previous) / 1000);
    this.previous = timestamp;
    if (this.time === DURATION) this.pause();
  }
}
