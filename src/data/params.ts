/**
 * Parameter tables for the Riyadh-style 13.8 kV network.
 * Attestation (D-004/D-004a): public sources only; no employer, supplier-internal or customer-internal data.
 * Every value carries `src` (research/sources IDs) and `label`: V verified, Vsec verified secondary,
 * D derived by us, A game assumption (shown as such in Model notes).
 */
import type { CableType, TransformerType } from '../engine/model';

export type Label = 'V' | 'Vsec' | 'D' | 'A' | 'S';
export interface P<T> { value: T; label: Label; src: string; noteKey?: string }
const p = <T>(value: T, label: Label, src: string, noteKey?: string): P<T> => ({ value, label, src, noteKey });

export const SYSTEM = {
  fHz: p(60, 'V', 'KSA-03,KSA-04,K2-01'),
  mvKV: p(13.8, 'V', 'KSA-01,KSA-02'),
  serviceBandKV: p([13.1, 14.5] as const, 'V', 'KSA-02,KSA-04'),
  mvPlanningVdPct: p(1.5, 'V', 'KSA-02 (DPS Table 1.3, via review R1-12)'),
  ringMaxKm: p(7.5, 'V', 'KSA-02 (indicative)'),
  ringPlanningLoading: p(0.5, 'V', 'KSA-02'),
  equipmentIk: p({ kA: 21, s: 1 }, 'V', 'KSA-07,KSA-08'),
};

/** Grid-station source at the 13.8 kV busbar. */
export const SOURCE = {
  // 132/13.8 kV, 67 MVA units with 29.5 % impedance (snippet) ⇒ ≈ 227 MVA each; two in parallel ≈ 454 MVA,
  // consistent with the 20 kA planning cap. Upstream impedance neglected.
  skMVA: p(450, 'D', 'KSA-31 (snippet), KSA-02', 'source-sk'),
  rx: p(0.07, 'A', '', 'source-rx'),
  z0OverZ1: p(1.0, 'A', '', 'source-z0'),
  nerCurrentA: p(1000, 'A', 'E-03 range 100–2000 A', 'ner'),
  vSetPu: p(1.0, 'A', ''),
};

/** 3×300 mm² Al XLPE, individually screened cores [A], 13.8 kV. */
export const CABLE_3x300AL: CableType & { ampacity40C: number } = {
  id: '3x300Al',
  r20: 0.100,   // DPS 2004 Table 1.9 R_DC 20 °C (review R1-04) [V table, D use]
  rOp: 0.130,   // DPS column matching AC at operating temperature [V table, D interpretation]
  x: 0.108,     // 60 Hz [V] KSA-02
  // Zero sequence, screen-return model R0 ≈ R + 3·R_screen; screen resistance borrowed from NKT 3×240/50
  // (R0 1.93 = 0.125 + 3·0.60) [V SP2] applied to 300 Al ⇒ 0.10 + 1.80 [D/A]; X0 borrowed 0.08 [A].
  r0: 1.9,
  x0: 0.08,
  // Charging current at 13.8 kV, 3-conductor 250–500 kcmil: 0.75 A/1000 ft = 2.46 A/km (Post Glover table,
  // read as total 3·I_C0) [V SP2-02] ⇒ C0 = 2.46 / (3·ω·7967 V) = 273 nF/km [D].
  c0nF: 273,
  ampacityA: 300,       // 35 °C ground, 2.0 K·m/W, 1.0 m [V] KSA-02
  ampacity40C: 278,     // SCC derating cross-check at 40 °C ground [D] (review R1-19)
  conductorK: 94,       // Al XLPE 90→250 °C, IEC 60949 constants [V] TH-11
  areaMm2: 300,
  screenIk1s_kA: 7.0,   // borrowed from NKT 3×240/50 datasheet [A] (D3-19)
  src: 'KSA-02, SP2-02, SP2 (NKT), TH-11, AS2-13',
};

/** SEC 51-SDMS-04 Rev.02 (2019) [V T12-01]: Z 5 % (500 kVA), 6 % (>500 kVA); max losses; Dyn11. X/R derived from Pk. */
function trafo(kva: number, zPct: number, p0kW: number, pkkW: number): TransformerType {
  const rPct = (pkkW / kva) * 100;
  const xPct = Math.sqrt(zPct * zPct - rPct * rPct);
  return { id: `T${kva}`, sMVA: kva / 1000, zPct, xr: xPct / rPct, p0kW, pkkW, src: 'T12-01 (Z, losses), X/R derived [D]' };
}
export const TRAFOS: TransformerType[] = [trafo(500, 5, 0.75, 4.7), trafo(1000, 6, 1.1, 9.0), trafo(1500, 6, 1.7, 14.0)];

/** Customers and loading per package substation — no public Riyadh data: all [A]. */
export const SUBSTATION_LOAD = {
  customersPerKVA: p(0.08, 'A', '', 'customers'), // ≈ 40/80/120 customers for 500/1000/1500 kVA
  peakLoadingOfRating: p([0.55, 0.8] as const, 'A', 'KSA-02 (reinforce at 80 %)', 'trafo-loading'),
  powerFactor: p(0.85, 'V', 'KSA-02 (DPS voltage-drop basis pf 0.85)'),
};

/**
 * Normalised summer daily load shape (1.0 at the 15:00 peak). Peak timing 13:00–17:00 [V/S KSA-22/37];
 * the night trough level (≈ 0.62) and shape between are [A]. Winter scales by 0.55 [A].
 */
export const LOAD_SHAPE_SUMMER: P<number[]> = p(
  [0.66, 0.64, 0.62, 0.61, 0.6, 0.6, 0.62, 0.66, 0.72, 0.79, 0.86, 0.92, 0.96, 0.99, 1.0, 1.0, 0.99, 0.96, 0.93, 0.9, 0.86, 0.81, 0.76, 0.7],
  'A', 'KSA-22, KSA-37 (peak timing only)', 'load-shape');
export const WINTER_FACTOR = p(0.55, 'A', '', 'load-shape');

export const COLD_LOAD = {
  multiplier: p(1.5, 'A', 'NOT FOUND (03 §7)', 'clpu'),
  decayMin: p(30, 'A', '', 'clpu'),
  afterOutageMin: p(20, 'A', '', 'clpu'),
};

export const PROTECTION = {
  phasePickupA: p(400, 'A', 'practice: above full-ring backfeed (300 A rating) [A]', 'relay'),
  phaseCurve: p('IEC_SI' as const, 'V', 'PR-01,PR-07'),
  phaseTms: p(0.1, 'A', '', 'relay'),
  earthPickupA: p(150, 'A', 'SP2 (10–20 % of NER limit practice)', 'relay'),
  earthCurve: p('IEC_SI' as const, 'V', 'PR-01,PR-07'),
  earthTms: p(0.1, 'A', '', 'relay'),
  breakerOpenS: p(0.06, 'A', '', 'relay'),
};

export const FPI = {
  phasePickupA: p(400, 'A', 'P-05, SP2 vendor ranges', 'fpi'),
  earthPickupA: p(60, 'A', 'P-05, SP2 vendor ranges', 'fpi'),
  minDurationS: p(0.04, 'A', 'P-05 (inrush blocking feature exists)', 'fpi'),
  timerResetH: p(4, 'A', 'P-05 (timer reset feature exists)', 'fpi'),
};

export const OPERATIONS = {
  // UK DNO example rule-set [V OP-06 Table 10.1]; parameterised; not Saudi practice (R1-17)
  reenergiseDelayNightMin: p(5, 'V', 'OP-06 Table 10.1 (UK)', 'delays'),
  reenergiseDelayDayMin: p(20, 'V', 'OP-06 Table 10.1 (UK)', 'delays'),
  nightWindow: p([22, 6] as const, 'V', 'OP-06 Table 10.1 (UK)', 'delays'),
  remoteOpMin: p(1, 'Vsec', 'OP-04 (automated FLISR < 1 min)'),
  crewDispatchMin: p(10, 'A', 'NOT FOUND (07 §4)', 'crews'),
  crewSpeedNightKmh: p(40, 'A', 'NOT FOUND (07 §4)', 'crews'),
  crewSpeedDayKmh: p(25, 'A', 'NOT FOUND (07 §4)', 'crews'),
  roadFactor: p(1.4, 'A', '', 'crews'),
  manualOpMin: p(5, 'A', '', 'crews'),
  fpiReadMin: p(2, 'A', '', 'crews'),
  earthAndPermitMin: p(15, 'A', '', 'crews'),
  attendDamageMin: p(20, 'A', '', 'crews'),
  repairHours: p([4, 8] as const, 'A', '', 'repair'),
  cbFaultOps: p(10, 'A', 'D3-13 (counts not sourced)', 'duty'),
  lbsFaultMakes: p(2, 'A', 'D3-13 (IEC 62271-103 classes not sourced)', 'duty'),
  ofgemThresholdMin: p(3, 'V', 'OP-02,OP-03'),
  ieeeThresholdMin: p(5, 'V', 'OP-01'),
};

export const FAULT_WEIGHTS = {
  // EPRI medians per 100 conductor-mi·yr: cable 1.3, joints 0.4, terminations 0.2 [V SP2/AS2]
  component: p({ cable: 1.3, joint: 0.4, termination: 0.2 }, 'V', 'SP2, AS2 (EPRI)'),
  // ≈ 50 % of MV cable failures are third-party damage [V SC-12 §3.1]
  thirdPartyShare: p(0.5, 'V', 'SC-12'),
  damageReportProb: p(0.7, 'A', '', 'damage'),
};
