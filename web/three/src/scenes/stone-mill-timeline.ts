import data from '../../generated/stone-mill.json';
import type { PhaseState } from '../core/types';

export const GRINDING_DURATION = data.duration;
export const GRAIN_COUNT = 96;
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (t: number, start: number, end: number) => { const p = clamp((t - start) / (end - start)); return p * p * (3 - 2 * p); };
const fract = (n: number) => n - Math.floor(n);

// smoothstep 的积分：从静止平滑起转，结果阶段平滑停住，不靠逐帧累加。
function integratedRamp(t: number, start: number, end: number) {
  const d = end - start, x = clamp((t - start) / d);
  return d * (x ** 3 - x ** 4 / 2) + Math.max(0, t - end);
}

export interface GrainState { position: [number, number, number]; size: number; visible: boolean; falling: boolean; spin: number }
export interface GrindingState extends PhaseState {
  phaseProgress: number; feedProgress: number; fineness: number; paste: number; angle: number;
  grains: GrainState[];
}

const seeds = Array.from({ length: GRAIN_COUNT }, (_, i) => ({
  arrival: 0.7 + i / (GRAIN_COUNT - 1) * 7.7,
  radius: 0.7 + fract(i * 0.618033) * 0.48,
  angle: -0.65 + fract(i * 0.414213) * 1.3,
  spread: fract(i * 0.754878) * Math.PI * 2,
  size: 0.058 + fract(i * 0.31231) * 0.027,
  height: fract(i * 0.38197) * 0.018,
}));

/** 所有粒子、形态和机械位置均由教学时间决定；不是物理或加工参数模拟。 */
export function evaluateGrinding(seconds: number): GrindingState {
  const time = Number.isFinite(seconds) ? Math.max(0, Math.min(GRINDING_DURATION, seconds)) : 0;
  const phaseIndex = Math.max(0, data.phases.findIndex((p, i) => time >= p.start && (time < p.end || i === data.phases.length - 1)));
  const phase = data.phases[phaseIndex];
  const fineness = smooth(time, 10, 42), paste = smooth(time, 24, 46);
  const angle = 0.58 * (integratedRamp(time, 10, 13) - integratedRamp(time, 41, 46));
  const spread = smooth(time, 10, 24);
  const grains = seeds.map((seed, i): GrainState => {
    const fall = clamp((time - seed.arrival + 1.25) / 1.25);
    const falling = time < seed.arrival;
    const a = seed.angle + spread * seed.spread + angle;
    const x = Math.sin(a) * seed.radius, z = Math.cos(a) * seed.radius;
    // 落料阶段只落在前方开口，避免穿越横梁、中心轴和石辊。
    const position: [number, number, number] = falling
      ? [x * fall + Math.sin(seed.angle) * 0.28 * (1 - fall), 1.49 + seed.height + 1.45 * (1 - fall * fall), z * fall + 0.98 * (1 - fall)]
      : [x, 1.49 + seed.height, z];
    return { position, falling, visible: time >= seed.arrival - 1.25 && paste < 0.995,
      size: seed.size * (1 - fineness * 0.68) * (1 - paste), spin: i * 1.713 + angle };
  });
  return { time, phaseId: phase.id, phaseIndex, phaseProgress: clamp((time - phase.start) / (phase.end - phase.start)),
    feedProgress: smooth(time, 0, 8.4), fineness, paste, angle, grains };
}

export function grindingMaterialLabel(state: GrindingState) {
  if (state.phaseId === 'feeding') return '盘内物料 · 可可碎粒';
  if (state.phaseId === 'crushing') return '盘内物料 · 颗粒逐渐细化';
  if (state.phaseId === 'liquefying') return '盘内物料 · 细小固体与可可脂逐渐形成浆态';
  return '研磨结果 · 可可液块，不是脱脂可可粉';
}
