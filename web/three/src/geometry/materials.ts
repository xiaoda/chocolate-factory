import { MeshStandardMaterial } from 'three';

export function createMaterials() {
  return {
    shell: new MeshStandardMaterial({ color: 0xaab7ac, metalness: 0.38, roughness: 0.47 }),
    panel: new MeshStandardMaterial({ color: 0xcdd4c8, metalness: 0.35, roughness: 0.42 }),
    steel: new MeshStandardMaterial({ color: 0xdce1dc, metalness: 0.68, roughness: 0.3 }),
    darkSteel: new MeshStandardMaterial({ color: 0x52635c, metalness: 0.45, roughness: 0.43 }),
    dark: new MeshStandardMaterial({ color: 0x273c34, roughness: 0.72 }),
    blue: new MeshStandardMaterial({ color: 0x3e737d, roughness: 0.63 }),
    brass: new MeshStandardMaterial({ color: 0xb98042, metalness: 0.5, roughness: 0.38 }),
    red: new MeshStandardMaterial({ color: 0xb94732, roughness: 0.43 }),
    green: new MeshStandardMaterial({ color: 0x42664e, roughness: 0.45 }),
    biscuit: new MeshStandardMaterial({ color: 0xc99b58, roughness: 0.87 }),
    chocolate: new MeshStandardMaterial({ color: 0x512d20, roughness: 0.34 }),
  };
}
