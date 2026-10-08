import type { SceneState } from '../core/timeline';

export function productLabel(state: SceneState) {
  const p = state.products[0];
  if (p.coverage === 0) return '跟踪芯体 · 尚未涂层';
  if (p.coverage < 1) return '正在包覆 · 顶部与底部';
  if (p.cooling === 1) return '涂层已定型 · 待检查';
  if (p.cooling > 0) return '正在冷却 · 逐渐定型';
  return '已包覆 · 仍需冷却';
}

export function flowLabels(state: SceneState) {
  return [
    { id: 'coreInput', text: state.phaseId === 'output' ? '输入对照 · 原芯体' : '芯体进入 →', show: state.phaseId === 'inputs' || state.phaseId === 'output' },
    { id: 'chocolateInput', text: '巧克力料 ↓', show: state.phaseId === 'inputs' || state.phaseId === 'coating' },
    { id: 'coating', text: '淋涂 ＋ 底涂', show: state.phaseId === 'coating' },
    { id: 'recovery', text: '多余料回收 ↶', show: state.phaseId === 'control' },
    { id: 'cooling', text: '冷却段 · 补充示意', show: true },
    { id: 'product', text: productLabel(state), show: true },
  ];
}
