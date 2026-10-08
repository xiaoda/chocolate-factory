import { Group } from 'three';
import data from '../../generated/enrobed.json';
import { createEnrober } from '../machines/enrober';
import { createProcessScene } from './enrobed';
import { TimelinePlayer } from '../core/playback';
import { evaluateScene } from '../core/timeline';
import { bindProcessControls } from '../ui/controls';
import { flowLabels, productLabel } from '../ui/labels';
import type { SceneDefinition } from '../core/types';

export const enrobedScene: SceneDefinition = {
  id: data.id, parts: data.parts,
  description: '巧克力涂层工序互动模型。拖动或方向键旋转，加减键缩放。使用画布下方按钮播放、暂停或逐步查看；工序文字在讲解栏同步显示。',
  readyMessage: '模型已就绪。点击“播放工序”，或点任一步查看关键帧；可随时暂停旋转。',
  initialMode: 'working',
  view: { centre: [0.85, 1.3, 0.12], minHeight: 4.25, minWidth: 7.5, platformSize: [7.45, 0.15, 2.42], platformX: 1 },
  create() {
    const root = new Group(), machine = createEnrober(), process = createProcessScene();
    root.add(machine.root, process.root);
    const player = new TimelinePlayer(data.duration);
    let controls: ReturnType<typeof bindProcessControls<ReturnType<typeof evaluateScene>>> | undefined;
    const order = ['product', 'cooling', 'chocolateInput', 'coreInput', 'coating', 'recovery'];
    const labels = order.map(id => {
      const label = flowLabels(evaluateScene(0)).find(l => l.id === id)!;
      return { ...label, anchor: process.anchors[id as keyof typeof process.anchors] };
    });
    let disposed = false;
    return {
      root, machine, labels,
      animation: {
        player,
        bindControls(lab, onChange) { controls = bindProcessControls(lab, player, onChange, data, productLabel); return controls; },
        update() {
          const state = evaluateScene(player.time);
          process.applyState(state); machine.setBeltOffset(state.beltOffset); controls?.update(state);
          for (const next of flowLabels(state)) { const label = labels.find(l => l.id === next.id)!; label.text = next.text; label.show = next.show; }
        },
      },
      dispose() { if (disposed) return; disposed = true; player.pause(); machine.dispose(); process.dispose(); root.clear(); },
    };
  },
};
