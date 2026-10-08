import { TimelinePlayer } from '../core/playback';
import type { PhaseState, ProcessData } from '../core/types';

const clockText = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
const setText = (element: HTMLElement, text: string) => { if (element.textContent !== text) element.textContent = text; };

export function bindProcessControls<T extends PhaseState>(lab: HTMLElement, player: TimelinePlayer, onChange: () => void, data: ProcessData, describe: (state: T) => string) {
  const region = lab.querySelector<HTMLElement>('[data-playback]')!;
  const play = lab.querySelector<HTMLButtonElement>('[data-play]')!;
  const slider = lab.querySelector<HTMLInputElement>('[data-seek]')!;
  slider.max = String(data.duration);
  const time = lab.querySelector<HTMLElement>('[data-time]')!;
  const buttons = [...lab.querySelectorAll<HTMLButtonElement>('[data-phase]')];
  const listeners: (() => void)[] = [];
  const on = (target: EventTarget, type: string, fn: EventListener) => { target.addEventListener(type, fn); listeners.push(() => target.removeEventListener(type, fn)); };
  let currentPhase = -1;
  function jump(index: number) {
    const phase = data.phases[Math.max(0, Math.min(data.phases.length - 1, index))];
    player.pause(); player.seek((phase.start + phase.end) / 2); onChange();
  }
  on(play, 'click', () => { if (player.playing) player.pause(); else player.play(); onChange(); });
  on(lab.querySelector('[data-restart]')!, 'click', () => { player.restart(); onChange(); });
  on(slider, 'input', () => { player.pause(); player.seek(Number(slider.value)); onChange(); });
  buttons.forEach((button, index) => on(button, 'click', () => jump(index)));
  on(lab.querySelector('[data-previous]')!, 'click', () => jump(currentPhase - 1));
  on(lab.querySelector('[data-next]')!, 'click', () => jump(currentPhase + 1));
  region.hidden = false;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const motionHint = lab.querySelector<HTMLElement>('[data-motion-hint]')!;
  const updateMotion = () => {
    motionHint.hidden = !motion.matches;
    if (motion.matches) { player.pause(); onChange(); }
  };
  motionHint.hidden = !motion.matches;
  on(motion, 'change', updateMotion);
  return {
    update(state: T) {
      const phase = data.phases[state.phaseIndex];
      setText(play, player.playing ? 'Ⅱ 暂停' : state.time === data.duration ? '↺ 再看一遍' : '▶ 播放工序');
      play.setAttribute('aria-pressed', String(player.playing));
      slider.value = String(state.time);
      slider.setAttribute('aria-valuetext', `教学进度 ${clockText(state.time)}，${phase.title}`);
      setText(time, `${clockText(state.time)} / ${clockText(data.duration)}`);
      lab.dataset.time = state.time.toFixed(3);
      lab.dataset.playing = String(player.playing);
      lab.dataset.suspended = String(player.suspended);
      setText(lab.querySelector<HTMLElement>('[data-product-state]')!, describe(state));
      if (currentPhase === state.phaseIndex) return;
      currentPhase = state.phaseIndex;
      lab.dataset.phase = state.phaseId;
      buttons.forEach((button, i) => { if (i === currentPhase) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current'); });
      lab.querySelector<HTMLButtonElement>('[data-previous]')!.disabled = currentPhase === 0;
      lab.querySelector<HTMLButtonElement>('[data-next]')!.disabled = currentPhase === data.phases.length - 1;
      lab.querySelector<HTMLElement>('[data-phase-title]')!.textContent = `${String(currentPhase + 1).padStart(2, '0')} / ${phase.title}`;
      for (const key of ['input', 'action', 'output', 'note'] as const) lab.querySelector<HTMLElement>(`[data-caption-${key}]`)!.textContent = phase.caption[key];
      const references = lab.querySelector<HTMLElement>('[data-phase-references]')!;
      references.replaceChildren();
      phase.stepIds.forEach(id => {
        const index = data.steps.findIndex(step => step.id === id);
        const link = document.createElement('a'); link.href = `#step-${data.steps[index].number}`; link.textContent = `${data.steps[index].label} ↗`; references.append(link);
      });
    },
    dispose() { listeners.forEach(fn => fn()); region.hidden = true; },
  };
}
