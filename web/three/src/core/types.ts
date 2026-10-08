import type { Group, Vector3 } from 'three';

export interface Port { position: Vector3; direction: Vector3 }
export interface MachineInstance {
  root: Group;
  parts: Record<string, Group>;
  ports: Record<string, Port>;
  anchors: Record<string, Vector3>;
  selectPart(id: string | null): void;
  setView(mode: 'exterior' | 'working'): void;
  setBeltOffset(offset: number): void;
  dispose(): void;
}
export interface ViewerHandle { dispose(): void }
