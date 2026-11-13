/**
 * Network model shared by every mode. SI units throughout: kV (line-to-line nominal), Ω, A, MVA, MW.
 * Balanced positive-sequence for power flow; sequence data (Z0, C0, earthing) for short circuit.
 * Parameter provenance lives in src/data/*.ts (source IDs from research/sources).
 */

export type BusKind = 'source' | 'rmu' | 'lv' | 'node';

export interface Bus {
  id: string;
  kind: BusKind;
  vnKV: number;          // nominal line-to-line voltage
  x?: number; y?: number; // layout coordinates (UI only, not physics)
  label?: string;
}

/** External grid equivalent at a grid-station 13.8 kV busbar (IEC 60909 network feeder). */
export interface Source {
  id: string;
  bus: string;
  vSetPu: number;        // operating voltage set-point for power flow
  skMVA: number;         // initial symmetrical short-circuit power at the busbar (max case)
  rx: number;            // R/X of the source impedance
  /** zero-sequence: earthing of the grid-transformer star point feeding this busbar */
  earthing: Earthing;
  /** zero-sequence impedance of the grid transformer(s) as a multiple of Z1 (before 3·Zn) */
  z0OverZ1: number;
  /** lumped phase-earth capacitance of other feeders on this busbar (nF), zero sequence only [A] */
  restC0nF?: number;
}

export type Earthing =
  | { kind: 'solid' }
  | { kind: 'resistance'; rOhm: number }
  | { kind: 'isolated' };

export interface CableType {
  id: string;
  r20: number;           // Ω/km conductor resistance at 20 °C (AC-corrected) — max short circuit
  rOp: number;           // Ω/km at operating temperature — losses, voltage drop, min short circuit
  x: number;             // Ω/km positive-sequence reactance at 60 Hz
  r0: number;            // Ω/km zero-sequence resistance (screen-return model)
  x0: number;            // Ω/km zero-sequence reactance
  c0nF: number;          // nF/km phase-to-earth capacitance (zero sequence)
  ampacityA: number;     // continuous rating under the stated basis
  conductorK: number;    // adiabatic constant k (A·s^½/mm²) for 90→250 °C
  areaMm2: number;
  screenIk1s_kA: number; // metallic screen 1-s short-circuit rating
  src: string;           // source IDs
}

export interface Cable {
  id: string;
  from: string;
  to: string;
  type: string;          // CableType id
  lengthKm: number;
}

export type SwitchKind = 'CB' | 'LBS' | 'FUSE_SWITCH';

export interface Switch {
  id: string;
  from: string;
  to: string;
  kind: SwitchKind;
  closed: boolean;
  /** remotely operable (motorised + RTU) */
  remote: boolean;
  /** the RMU or station this switch belongs to (for crew location) */
  site: string;
  /** remaining fault-make operations before the device needs inspection */
  faultMakeLeft: number;
  /** earth switch on the cable side of this switch is applied */
  earthed: boolean;
  /** fuse rating (A) for FUSE_SWITCH */
  fuseA?: number;
  /** fuses blown (FUSE_SWITCH) — must be replaced before closing */
  fuseBlown?: boolean;
}

export interface TransformerType {
  id: string;
  sMVA: number;
  zPct: number;          // short-circuit impedance %
  xr: number;            // X/R ratio
  p0kW: number;          // no-load loss
  pkkW: number;          // load loss at rated current
  src: string;
}

export interface Transformer {
  id: string;
  hv: string;            // MV bus
  lv: string;            // LV bus
  type: string;
  vector: 'Dyn11';
}

export interface Load {
  id: string;
  bus: string;           // LV bus
  customers: number;
  /** peak demand at the scenario's design condition (MW, Mvar) */
  pPeakMW: number;
  qPeakMvar: number;
  /** load-shape class */
  cls: 'residential' | 'commercial' | 'mixed';
}

export type FpiType = 'earth-only' | 'three-phase';

export interface Fpi {
  id: string;
  /** the cable whose current the sensor measures */
  cable: string;
  /** the end of the cable where the sensor sits (bus id) */
  atBus: string;
  type: FpiType;
  phasePickupA: number;
  earthPickupA: number;
  remote: boolean;
  site: string;
}

export interface Relay {
  id: string;
  switch: string;        // the CB it trips
  /** phase element */
  phase: { curve: CurveId; pickupA: number; tms: number; instA?: number; instDelayS?: number };
  /** earth element (residual 3I0) */
  earth: { curve: CurveId; pickupA: number; tms: number; instA?: number; instDelayS?: number };
  breakerOpenS: number;
}

export type CurveId = 'IEC_SI' | 'IEC_VI' | 'IEC_EI' | 'IEC_LTI' | 'IEEE_MI' | 'IEEE_VI' | 'IEEE_EI' | 'DT';

export interface Network {
  buses: Bus[];
  sources: Source[];
  cableTypes: CableType[];
  cables: Cable[];
  switches: Switch[];
  transformerTypes: TransformerType[];
  transformers: Transformer[];
  loads: Load[];
  fpis: Fpi[];
  relays: Relay[];
  fMainsHz: number;
}

export function indexById<T extends { id: string }>(items: readonly T[]): Map<string, T> {
  const m = new Map<string, T>();
  for (const it of items) m.set(it.id, it);
  return m;
}
