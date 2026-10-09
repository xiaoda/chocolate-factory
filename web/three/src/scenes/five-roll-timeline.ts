import data from '../../generated/five-roll.json';
import { FIVE_ROLL_LAYOUT, ROLL_RADIUS } from '../machines/five-roll-layout';
import type { PhaseState } from '../core/types';

export const REFINING_DURATION = data.duration;
// 单位仅服务动画；相邻反向、逐级增大，不代表展品 rpm 或传动比。
export const ROLL_SPEEDS = [-0.45, 0.65, -0.9, 1.2, -1.5] as const;
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (t: number, a: number, b: number) => { const p = clamp((t - a) / (b - a)); return p * p * (3 - 2 * p); };
const firstContact = Math.atan2(FIVE_ROLL_LAYOUT[1][0] - FIVE_ROLL_LAYOUT[0][0], FIVE_ROLL_LAYOUT[1][1] - FIVE_ROLL_LAYOUT[0][1]);
export const ROLL_ARCS = [[1.1, firstContact], [firstContact - Math.PI, -1.5 * Math.PI],
  [-Math.PI / 2, Math.PI / 2], [-Math.PI / 2, -1.5 * Math.PI], [-Math.PI / 2, 2.5]] as const;

/** 沿辊面由入端走向出端；θ 与绕 X 轴的旋转角符号相反。 */
export function rollSurfacePoint(index: number, progress: number, radius = ROLL_RADIUS): [number, number] {
  const [start, end] = ROLL_ARCS[index], [y, z] = FIVE_ROLL_LAYOUT[index];
  const angle = start + (end - start) * clamp(progress);
  return [y + radius * Math.sin(angle), z + radius * Math.cos(angle)];
}

function rampIntegral(t: number, start: number, end: number) {
  const d = end - start, p = clamp((t - start) / d);
  return d * (p ** 3 - p ** 4 / 2) + Math.max(0, t - end);
}

export interface RefiningState extends PhaseState {
  angles: number[]; coverage: number[]; motion: number;
  feed: number; bank: number; fineness: number; output: number;
}

export function evaluateRefining(seconds: number): RefiningState {
  const time = Number.isFinite(seconds) ? Math.max(0, Math.min(REFINING_DURATION, seconds)) : 0;
  const phaseIndex = Math.max(0, data.phases.findIndex((p, i) => time >= p.start && (time < p.end || i === data.phases.length - 1)));
  const phase = data.phases[phaseIndex];
  const motion = rampIntegral(time, 8, 11) - rampIntegral(time, 46, 50);
  const feed = smooth(time, 1, 8);
  return { time, phaseId: phase.id, phaseIndex, motion, angles: ROLL_SPEEDS.map(speed => motion ? speed * motion : 0),
    coverage: [[8, 10], [10, 20], [20, 28], [28, 36], [36, 43]].map(([a, b]) => smooth(time, a, b)),
    feed, bank: feed * (1 - smooth(time, 40, 48)), fineness: smooth(time, 10, 48), output: smooth(time, 43, 50) };
}

export function refiningMaterialLabel(state: RefiningState) {
  if (state.phaseId === 'premix') return '待精磨物料 · 已预混，非整豆';
  if (state.phaseId === 'nip') return '辊面物料 · 正在形成并传递料膜';
  if (state.phaseId === 'transfer') return '逐级精磨 · 固体颗粒细化，不是溶解';
  if (state.phaseId === 'scraping') return '典型刮取 · 看侧面原理图，非展品出口复原';
  return '精磨结果 · 粉片状混合料，仍需后续精炼';
}
