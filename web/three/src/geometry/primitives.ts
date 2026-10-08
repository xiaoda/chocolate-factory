import { BoxGeometry, CatmullRomCurve3, CylinderGeometry, Group, Mesh, TubeGeometry, Vector3 } from 'three';
import type { Material } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export type Point = [number, number, number];

export function box(parent: Group, size: Point, position: Point, material: Material, radius = 0.025) {
  const geometry = radius > 0
    ? new RoundedBoxGeometry(...size, 2, Math.min(radius, ...size.map(v => v / 3)))
    : new BoxGeometry(...size);
  const mesh = new Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export function cylinder(parent: Group, radius: number, length: number, position: Point, material: Material, axis: 'x' | 'y' | 'z' = 'y') {
  const mesh = new Mesh(new CylinderGeometry(radius, radius, length, 20), material);
  mesh.position.set(...position);
  if (axis === 'x') mesh.rotation.z = Math.PI / 2;
  if (axis === 'z') mesh.rotation.x = Math.PI / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export function pipe(parent: Group, points: Point[], radius: number, material: Material) {
  const curve = new CatmullRomCurve3(points.map(p => new Vector3(...p)));
  const mesh = new Mesh(new TubeGeometry(curve, 40, radius, 10, false), material);
  mesh.castShadow = true;
  parent.add(mesh);
  return curve;
}
