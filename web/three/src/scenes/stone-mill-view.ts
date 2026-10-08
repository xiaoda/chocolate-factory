import { Vector3 } from 'three';
import data from '../../generated/stone-mill.json';
import { createStoneMill } from '../machines/stone-mill';
import type { SceneDefinition } from '../core/types';

export const stoneMillScene: SceneDefinition = {
  id: data.id, parts: data.parts,
  description: '石磨机静态结构样板。双石辊与开口圆盘参照照片。拖动或方向键旋转，加减键缩放；本轮没有研磨动画，出料方式待核实。',
  readyMessage: '石磨机静态样板已就绪。可旋转、缩放、查看部件和实拍对照；研磨动画尚未接入。',
  initialMode: 'exterior',
  view: { centre: [0, 1.35, 0.15], minHeight: 4.9, minWidth: 5.6, platformSize: [3.9, 0.15, 3.6], platformX: 0 },
  create() {
    const machine = createStoneMill();
    return { root: machine.root, machine,
      labels: [{ id: 'materialIn', text: '上方投料区 · 示意', anchor: new Vector3(0.15, 1.98, 1.05), show: true }],
      dispose: machine.dispose,
    };
  },
};
