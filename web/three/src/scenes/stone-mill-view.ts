import { Group } from 'three';
import data from '../../generated/stone-mill.json';
import { createStoneMill } from '../machines/stone-mill';
import type { SceneDefinition } from '../core/types';
import { TimelinePlayer } from '../core/playback';
import { bindProcessControls } from '../ui/controls';
import { createGrindingProcess } from './stone-mill-process';
import { evaluateGrinding, grindingMaterialLabel } from './stone-mill-timeline';
import type { GrindingState } from './stone-mill-timeline';

export const stoneMillScene: SceneDefinition = {
  id: data.id, parts: data.parts,
  description: '石磨机典型研磨原理动画。可播放、暂停、逐步查看和旋转缩放。盘面与双石辊的运动为教学示意，不代表展品真实传动；出料方式待核实。',
  readyMessage: '研磨动画已就绪。主动播放 60 秒讲解，或点工序看静帧；运动为教学示意，非展品真实传动复原。',
  initialMode: 'working',
  view: { centre: [0, 1.35, 0.15], minHeight: 4.9, minWidth: 5.6, platformSize: [3.9, 0.15, 3.6], platformX: 0 },
  create() {
    const root = new Group(), machine = createStoneMill(), process = createGrindingProcess();
    root.add(machine.root, process.root);
    const player = new TimelinePlayer(data.duration);
    let controls: ReturnType<typeof bindProcessControls<GrindingState>> | undefined;
    const labels = [
      { id: 'materialIn', text: '可可碎粒 ↓ 投料示意', anchor: process.anchors.materialIn, show: true },
      { id: 'grinding', text: '反复碾磨 · 运动示意', anchor: process.anchors.grinding, show: false },
      { id: 'paste', text: '正在形成可可浆', anchor: process.anchors.paste, show: false },
    ];
    let disposed = false;
    return { root, machine, labels,
      animation: {
        player,
        bindControls(lab, onChange) { controls = bindProcessControls(lab, player, onChange, data, grindingMaterialLabel); return controls; },
        update() {
          const state = evaluateGrinding(player.time);
          machine.setGrindingAngle(state.angle); process.applyState(state); controls?.update(state);
          labels[0].show = state.phaseId === 'feeding';
          labels[1].show = state.phaseId === 'crushing';
          labels[2].show = state.paste > 0.05;
          labels[2].text = state.phaseId === 'result' ? '可可液块 · 结果留在盘内' : '颗粒变细，逐渐形成浆态';
        },
      },
      dispose() { if (disposed) return; disposed = true; player.pause(); machine.dispose(); process.dispose(); root.clear(); },
    };
  },
};
