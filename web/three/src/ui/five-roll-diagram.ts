import { FIVE_ROLL_LAYOUT, ROLL_RADIUS } from '../machines/five-roll-layout';
import { rollSurfacePoint, ROLL_SPEEDS } from '../scenes/five-roll-timeline';
import type { RefiningState } from '../scenes/five-roll-timeline';

const SCALE = 58;
const project = (y: number, z: number) => [153 - z * SCALE, 253 - y * SCALE];
export const diagramRollCentre = (i: number) => project(...FIVE_ROLL_LAYOUT[i]);

/** 原理图与 3D 共用路径；仅作侧面投影，不是展品剖视图。 */
export function diagramFilmPath(i: number, coverage: number) {
  if (coverage <= 0) return '';
  const count = Math.max(1, Math.ceil(coverage * 40));
  return Array.from({ length: count + 1 }, (_, n) => {
    const [x, y] = project(...rollSurfacePoint(i, coverage * n / count, ROLL_RADIUS + 0.015));
    return `${n ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
}

export function bindRefiningDiagram(lab: HTMLElement) {
  const region = lab.querySelector<HTMLElement>('[data-roll-diagram]')!;
  const host = region.querySelector<HTMLElement>('[data-roll-svg]')!;
  const comparison = region.querySelector<HTMLElement>('[data-grain-svg]')!;
  const circles = FIVE_ROLL_LAYOUT.map((_, i) => {
    const [x, y] = diagramRollCentre(i);
    const arrow = ROLL_SPEEDS[i] < 0 ? 'M -9 -8 A 12 12 0 1 1 -11 5' : 'M -11 5 A 12 12 0 1 0 -9 -8';
    return `<g><circle cx="${x}" cy="${y}" r="${ROLL_RADIUS * SCALE}" class="roll-disc"/><g data-roll-spin="${i}"><path d="${arrow}" class="roll-turn" marker-end="url(#five-roll-arrow)"/></g><text x="${x}" y="${y + 4}" class="roll-number">${i + 1}</text></g>`;
  }).join('');
  host.innerHTML = `<svg viewBox="0 0 250 244" role="img" aria-labelledby="five-roll-diagram-title five-roll-diagram-desc">
    <title id="five-roll-diagram-title">五辊侧面传料原理</title><desc id="five-roll-diagram-desc">预混料从底部双辊进入，沿前后交替的辊面向上转移，在第五辊刮取。刮取不是展品出口定位。</desc>
    <defs><marker id="five-roll-arrow" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto"><path d="M0,0 L4,2 L0,4 Z" fill="#ba863f"/></marker></defs>
    <rect x="191" y="9" width="56" height="142" rx="5" class="roll-output-zone"/>
    <text x="219" y="24" class="roll-note" text-anchor="middle">刮取示意</text>
    ${circles}
    ${FIVE_ROLL_LAYOUT.map((_, i) => `<path data-diagram-film="${i}" class="roll-film" stroke-width="${6 - i * 0.65}"/>`).join('')}
    <path d="M28 192 Q70 182 111 194" data-feed-arrow class="roll-feed" marker-end="url(#five-roll-arrow)"/>
    <text x="24" y="173" class="roll-note">已预混物料</text>
    <g data-diagram-output><path d="M169 40 L186 29 L186 40 Z" class="roll-blade"/><path d="M177 46 Q215 46 219 74" class="roll-feed" marker-end="url(#five-roll-arrow)"/>
    ${Array.from({ length: 7 }, (_, i) => `<rect data-output-flake="${i}" x="0" y="0" width="5" height="3" rx="1" fill="#70482e"/>`).join('')}
    <path d="M200 105 L203 122 L237 122 L240 105" class="roll-cup"/><path data-output-pile d="M205 118 Q220 105 235 118 Z" fill="#70482e"/></g>
    <text x="219" y="140" class="roll-note" text-anchor="middle">粉片状料</text>
  </svg>`;
  const points = Array.from({ length: 9 }, (_, i) => [24 + (i % 3) * 18, 19 + Math.floor(i / 3) * 12]);
  comparison.innerHTML = `<svg viewBox="0 0 240 70" role="img" aria-label="颗粒大小放大示意，固体变细但未消失，非粒度测量">${points.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#8e694a"/><circle data-fine-grain cx="${x + 136}" cy="${y}" r="4" fill="#8e694a"/>`).join('')}<text x="112" y="36" class="roll-note">→</text><text x="42" y="66" class="roll-note" text-anchor="middle">进入时</text><text x="178" y="66" class="roll-note" text-anchor="middle">此刻</text></svg>`;
  const spins = [...host.querySelectorAll<SVGElement>('[data-roll-spin]')];
  const films = [...host.querySelectorAll<SVGElement>('[data-diagram-film]')];
  const flakes = [...host.querySelectorAll<SVGElement>('[data-output-flake]')];
  const output = host.querySelector<SVGElement>('[data-diagram-output]')!;
  const pile = host.querySelector<SVGElement>('[data-output-pile]')!;
  const feed = host.querySelector<SVGElement>('[data-feed-arrow]')!;
  const grains = [...comparison.querySelectorAll<SVGElement>('[data-fine-grain]')];
  let disposed = false; region.hidden = false;
  return {
    update(state: RefiningState) {
      if (disposed) return;
      region.dataset.time = state.time.toFixed(3);
      region.dataset.phase = state.phaseId;
      spins.forEach((spin, i) => { const [x, y] = diagramRollCentre(i); spin.setAttribute('transform', `translate(${x} ${y}) rotate(${-state.angles[i] * 180 / Math.PI})`); });
      films.forEach((film, i) => film.setAttribute('d', diagramFilmPath(i, state.coverage[i])));
      output.setAttribute('opacity', state.output > 0 ? '1' : '0.18');
      pile.setAttribute('opacity', String(state.output));
      feed.setAttribute('opacity', state.feed > 0 && state.time < 48 ? '1' : '0.25');
      flakes.forEach((flake, i) => {
        const progress = ((Math.min(state.time, 50) - 43) * 0.6 + i / 7) % 1;
        flake.setAttribute('opacity', state.output > 0 ? String(Math.max(0, Math.min(1, 50 - state.time))) : '0');
        flake.setAttribute('transform', `translate(${210 + (i % 3) * 5} ${75 + Math.max(0, progress) * 34}) rotate(${i * 31})`);
      });
      grains.forEach(grain => grain.setAttribute('r', String(4 - state.fineness * 2.6)));
    },
    dispose() { if (disposed) return; disposed = true; host.replaceChildren(); comparison.replaceChildren(); region.hidden = true; delete region.dataset.time; delete region.dataset.phase; },
  };
}
