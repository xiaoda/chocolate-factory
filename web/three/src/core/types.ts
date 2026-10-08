import type { Group, Vector3 } from 'three';
import type { TimelinePlayer } from './playback';

export interface Port { position: Vector3; direction: Vector3 }
export interface MachineInstance {
  root: Group;
  parts: Record<string, Group>;
  ports: Record<string, Port>;
  anchors: Record<string, Vector3>;
  selectPart(id: string | null): void;
  setView(mode: 'exterior' | 'working'): void;
  dispose(): void;
}
export interface EnroberInstance extends MachineInstance { setBeltOffset(offset: number): void }
export interface StoneMillInstance extends MachineInstance { setGrindingAngle(angle: number): void }
export interface ViewerHandle { dispose(): void }

export interface PartInfo { id: string; number: string; name: string; evidence: string; description: string }
export interface SceneLabel { id: string; text: string; anchor: Vector3; show: boolean }
export interface SceneInstance {
  root: Group;
  machine: MachineInstance;
  labels: SceneLabel[];
  animation?: {
    player: TimelinePlayer;
    bindControls(lab: HTMLElement, onChange: () => void): ViewerHandle;
    update(): void;
  };
  dispose(): void;
}
export interface SceneDefinition {
  id: string;
  parts: PartInfo[];
  description: string;
  readyMessage: string;
  initialMode: 'working' | 'exterior';
  view: { centre: [number, number, number]; minHeight: number; minWidth: number; platformSize: [number, number, number]; platformX: number };
  create(): SceneInstance;
}

export interface PhaseState { time: number; phaseId: string; phaseIndex: number }
export interface ProcessData {
  duration: number;
  phases: { id: string; start: number; end: number; title: string; stepIds: string[]; caption: Record<'input' | 'action' | 'output' | 'note', string> }[];
  steps: { id: string; number: number; label: string }[];
}
