import { BoxGeometry, BufferGeometry, DoubleSide, DynamicDrawUsage, Float32BufferAttribute, Group, IcosahedronGeometry, InstancedMesh, Mesh, MeshStandardMaterial, Object3D, Vector3 } from 'three';
import { machineResources } from '../core/machine-resources';
import { FIVE_ROLL_LAYOUT, ROLL_RADIUS } from '../machines/five-roll-layout';
import { evaluateRefining, ROLL_ARCS, rollSurfacePoint } from './five-roll-timeline';
import type { RefiningState } from './five-roll-timeline';

const SEGMENTS = 64, GRAINS_PER_ROLL = 12;
const fract = (n: number) => n - Math.floor(n);

/** 教学叠加层，不添加展品的真实料斗、刮刀、出口或传动机构。 */
export function createRefiningProcess() {
  const root = new Group(); root.name = 'refiningProcessRoot';
  const filmMaterial = new MeshStandardMaterial({ color: 0x653c27, roughness: 0.86, side: DoubleSide });
  const grainMaterial = new MeshStandardMaterial({ color: 0xbb9470, roughness: 1, flatShading: true });
  const markMaterial = new MeshStandardMaterial({ color: 0xcb9b45, roughness: 0.6, emissive: 0x4d300b, emissiveIntensity: 0.12 });
  const films = FIVE_ROLL_LAYOUT.map((_, i) => {
    const vertices: number[] = [], indices: number[] = [];
    for (let j = 0; j <= SEGMENTS; j++) {
      const [y, z] = rollSurfacePoint(i, j / SEGMENTS, ROLL_RADIUS + 0.008);
      vertices.push(-1.17, y, z, 1.17, y, z);
      if (j < SEGMENTS) { const k = j * 2; indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3)); geometry.setIndex(indices); geometry.computeVertexNormals();
    const film = new Mesh(geometry, filmMaterial); film.name = `roll-film-${i + 1}`;
    film.receiveShadow = true; root.add(film); return film;
  });
  const grains = new InstancedMesh(new IcosahedronGeometry(1, 0), grainMaterial, 5 * GRAINS_PER_ROLL);
  grains.name = 'refining-grains'; grains.instanceMatrix.setUsage(DynamicDrawUsage); grains.frustumCulled = false; root.add(grains);
  const marks = new InstancedMesh(new BoxGeometry(0.14, 0.017, 0.017), markMaterial, 10);
  marks.name = 'rotation-markers'; marks.instanceMatrix.setUsage(DynamicDrawUsage); marks.frustumCulled = false; root.add(marks);
  const bank = new InstancedMesh(new IcosahedronGeometry(1, 1), filmMaterial, 7);
  bank.name = 'premix-bank'; bank.instanceMatrix.setUsage(DynamicDrawUsage); bank.frustumCulled = false; bank.castShadow = true; root.add(bank);
  const transform = new Object3D();
  const resources = machineResources(root, {}, [filmMaterial, grainMaterial, markMaterial]);
  let disposed = false;
  function applyState(state: RefiningState) {
    if (disposed) return;
    films.forEach((film, i) => {
      const coverage = state.coverage[i]; film.visible = coverage > 0;
      film.geometry.setDrawRange(0, Math.ceil(coverage * SEGMENTS) * 6);
      for (let j = 0; j < GRAINS_PER_ROLL; j++) {
        const p = fract(j / GRAINS_PER_ROLL + Math.abs(state.angles[i]) / Math.abs(ROLL_ARCS[i][1] - ROLL_ARCS[i][0]));
        const [y, z] = rollSurfacePoint(i, p, ROLL_RADIUS + 0.017);
        transform.position.set(-1 + fract(j * 0.61803) * 2, y, z);
        transform.rotation.set(0, j * 1.7, 0);
        const size = p <= coverage && coverage > 0 ? 0.045 * (1 - i * 0.16) : 0;
        transform.scale.set(size, size, size); transform.updateMatrix(); grains.setMatrixAt(i * GRAINS_PER_ROLL + j, transform.matrix);
      }
      for (let j = 0; j < 2; j++) {
        const angle = -state.angles[i] + j * Math.PI;
        const [y, z] = FIVE_ROLL_LAYOUT[i];
        transform.position.set(1.29, y + (ROLL_RADIUS + 0.013) * Math.sin(angle), z + (ROLL_RADIUS + 0.013) * Math.cos(angle));
        transform.rotation.set(-angle, 0, 0); transform.scale.setScalar(1); transform.updateMatrix(); marks.setMatrixAt(i * 2 + j, transform.matrix);
      }
    });
    for (let i = 0; i < 7; i++) {
      transform.position.set(-0.9 + i * 0.3, 1.5 - state.feed * 0.39 + (i % 2) * 0.02, 0.93 - state.feed * 0.29);
      transform.rotation.set(i * 0.3, i, 0);
      transform.scale.set(0.23 * state.bank, 0.07 * state.bank, 0.10 * state.bank); transform.updateMatrix(); bank.setMatrixAt(i, transform.matrix);
    }
    bank.visible = state.bank > 0; grains.instanceMatrix.needsUpdate = true; marks.instanceMatrix.needsUpdate = true; bank.instanceMatrix.needsUpdate = true;
  }
  applyState(evaluateRefining(0));
  return { root, applyState,
    anchors: { materialIn: new Vector3(-0.5, 1.58, 0.85), film: new Vector3(-0.63, 2.45, 0.44), result: new Vector3(0.3, 3.85, 0.2) },
    dispose() { if (disposed) return; disposed = true; resources.dispose(); },
  };
}
