import type { Network, CableType } from '../../src/engine/model';

export function emptyNet(fHz = 60): Network {
  return { buses: [], sources: [], cableTypes: [], cables: [], switches: [], transformerTypes: [], transformers: [], loads: [], fpis: [], relays: [], fMainsHz: fHz };
}
export function cableType(id: string, p: Partial<CableType>): CableType {
  return { id, r20: 0, rOp: 0, x: 0, r0: 0, x0: 0, c0nF: 0, ampacityA: 1000, conductorK: 94, areaMm2: 1, screenIk1s_kA: 10, src: 'test', ...p };
}
export const relErr = (a: number, b: number) => Math.abs(a - b) / Math.abs(b);
