import { Group } from 'three';
import data from '../../generated/five-roll.json';
import { createFiveRoll } from '../machines/five-roll';
import type { SceneDefinition } from '../core/types';
import { TimelinePlayer } from '../core/playback';
import { bindProcessControls } from '../ui/controls';
import { bindRefiningDiagram } from '../ui/five-roll-diagram';
import { createRefiningProcess } from './five-roll-process';
import { evaluateRefining, refiningMaterialLabel } from './five-roll-timeline';
import type { RefiningState } from './five-roll-timeline';

export const fiveRollScene: SceneDefinition = {
  id: data.id, parts: data.parts,
  description: '五辊精磨典型原理动画。可播放、暂停、逐步查看和旋转缩放，侧面原理图同步展示传料与刮取。运动、膜厚及粒度为教学示意，刮取不定位展品出口。',
  readyMessage: '五辊动画已就绪。主动播放 60 秒讲解，或点工序看静帧；侧面小图补充背面路径。完整外观隐藏教学叠加，不改变进度。',
  initialMode: 'working',
  view: { centre: [0, 2.3, 0], minHeight: 6.2, minWidth: 5.8, platformSize: [5.1, 0.15, 3], platformX: -0.15 },
  create() {
    const root = new Group(), machine = createFiveRoll(), process = createRefiningProcess();
    root.add(machine.root, process.root);
    const player = new TimelinePlayer(data.duration);
    let controls: ReturnType<typeof bindProcessControls<RefiningState>> | undefined;
    let diagram: ReturnType<typeof bindRefiningDiagram> | undefined;
    let working = true, disposed = false;
    const labels = [
      { id: 'materialIn', text: '预混料 ↓ 进入底部双辊', anchor: process.anchors.materialIn, show: true },
      { id: 'film', text: '料膜向上 · 背面路径见原理图', anchor: process.anchors.film, show: false },
      { id: 'result', text: '顶部料膜 · 刮取见原理图', anchor: process.anchors.result, show: false },
    ];
    const setView = machine.setView.bind(machine);
    machine.setView = mode => { setView(mode); working = mode === 'working'; process.root.visible = working; };
    return { root, machine, labels,
      animation: {
        player,
        bindControls(lab, onChange) {
          controls = bindProcessControls(lab, player, onChange, data, refiningMaterialLabel);
          diagram = bindRefiningDiagram(lab);
          return { dispose() { controls?.dispose(); diagram?.dispose(); } };
        },
        update() {
          if (disposed) return;
          const state = evaluateRefining(player.time);
          machine.setRollAngles(state.angles); process.applyState(state); controls?.update(state); diagram?.update(state);
          labels[0].show = working && state.phaseIndex < 2;
          labels[1].show = working && state.phaseId === 'transfer';
          labels[2].show = working && state.phaseIndex >= 3;
        },
      },
      dispose() {
        if (disposed) return;
        disposed = true; player.pause(); controls?.dispose(); diagram?.dispose();
        machine.dispose(); process.dispose(); root.clear();
      },
    };
  },
};
