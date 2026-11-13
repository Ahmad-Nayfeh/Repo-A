import { pow, exp, exp2 } from './math/dmath';

/**
 * Oil-immersed transformer thermal model — IEC 60076-7:2005 Annex C difference equations (C.6–C.11)
 * [TH-02, via IS 2026-7:2009]. Ageing: eq. (2) Kraft paper V = 2^((θh−98)/6); eq. (3) thermally upgraded paper
 * V = exp(15000/110+273 − 15000/(θh+273)). The 2018 edition was not read (S-F9-01).
 * Validated against Annex C (41 steps) and Annex E (30-min overload) — tests/golden/thermal.test.ts.
 */
export interface ThermalParams {
  dThetaOr: number;   // rated top-oil rise Δθor (K)
  dThetaHr: number;   // rated hot-spot-to-top-oil gradient Δθhr = H·gr (K)
  R: number;          // load loss / no-load loss at rated current
  x: number; y: number;
  k11: number; k21: number; k22: number;
  tauO: number; tauW: number; // minutes
  paper: 'kraft' | 'upgraded';
}

export interface ThermalState { thetaO: number; dH1: number; dH2: number; lossOfLifeMin: number }

/** IEC 60076-7:2005 Table 5 / Table E.1, distribution ONAN. */
export const IEC_DISTRIBUTION_ONAN: ThermalParams = { dThetaOr: 55, dThetaHr: 23, R: 5, x: 0.8, y: 1.6, k11: 1, k21: 1, k22: 2, tauO: 180, tauW: 4, paper: 'kraft' };

export function ageingRate(thetaH: number, paper: ThermalParams['paper']): number {
  return paper === 'kraft' ? exp2((thetaH - 98) / 6) : exp(15000 / 383 - 15000 / (thetaH + 273));
}

const oilTarget = (p: ThermalParams, K: number) => pow((1 + K * K * p.R) / (1 + p.R), p.x) * p.dThetaOr;

/** Steady state at load factor K and ambient θa (derivatives zero). */
export function steadyState(p: ThermalParams, K: number, thetaA: number): ThermalState {
  const ky = pow(K, p.y);
  return { thetaO: thetaA + oilTarget(p, K), dH1: p.k21 * p.dThetaHr * ky, dH2: (p.k21 - 1) * p.dThetaHr * ky, lossOfLifeMin: 0 };
}

export const hotSpot = (s: ThermalState) => s.thetaO + s.dH1 - s.dH2;

/**
 * One difference-equation step of Dt minutes with load K and ambient θa (IEC C.6–C.11). Dt must be ≤ half the
 * smallest time constant; `stepMinutes` sub-steps automatically. Loss of life accumulates V·Dt (minutes).
 */
export function step(p: ThermalParams, s: ThermalState, K: number, thetaA: number, Dt: number): ThermalState {
  const ky = pow(K, p.y);
  const dO = (Dt / (p.k11 * p.tauO)) * (oilTarget(p, K) - (s.thetaO - thetaA));
  const d1 = (Dt / (p.k22 * p.tauW)) * (p.k21 * p.dThetaHr * ky - s.dH1);
  const d2 = (Dt / (p.tauO / p.k22)) * ((p.k21 - 1) * p.dThetaHr * ky - s.dH2);
  const n: ThermalState = { thetaO: s.thetaO + dO, dH1: s.dH1 + d1, dH2: s.dH2 + d2, lossOfLifeMin: s.lossOfLifeMin };
  n.lossOfLifeMin += ageingRate(hotSpot(n), p.paper) * Dt;
  return n;
}

export function stepMinutes(p: ThermalParams, s: ThermalState, K: number, thetaA: number, minutes: number): ThermalState {
  const maxDt = Math.min(p.tauW * p.k22, p.tauO / p.k22, p.k11 * p.tauO) / 2;
  const n = Math.max(1, Math.ceil(minutes / maxDt));
  let st = s;
  for (let i = 0; i < n; i++) st = step(p, st, K, thetaA, minutes / n);
  return st;
}

/**
 * Exact exponential update for an interval with constant K and θa (IEC 60076-7:2005 eqs. 5–9 solved per
 * state variable; the form used by the open-source Alliander implementation [TH-04/05]). Unconditionally
 * stable — used by the game at coarse ticks. Loss of life is integrated with 1-minute sub-steps.
 */
export function stepExact(p: ThermalParams, s: ThermalState, K: number, thetaA: number, minutes: number): ThermalState {
  const ky = pow(K, p.y);
  const subs = Math.max(1, Math.ceil(minutes));
  const dt = minutes / subs;
  const oInf = thetaA + oilTarget(p, K), h1Inf = p.k21 * p.dThetaHr * ky, h2Inf = (p.k21 - 1) * p.dThetaHr * ky;
  const eO = exp(-dt / (p.k11 * p.tauO)), e1 = exp(-dt / (p.k22 * p.tauW)), e2 = exp(-dt / (p.tauO / p.k22));
  let st = { ...s };
  for (let i = 0; i < subs; i++) {
    st = { thetaO: oInf + (st.thetaO - oInf) * eO, dH1: h1Inf + (st.dH1 - h1Inf) * e1, dH2: h2Inf + (st.dH2 - h2Inf) * e2, lossOfLifeMin: st.lossOfLifeMin };
    st.lossOfLifeMin += ageingRate(hotSpot(st), p.paper) * dt;
  }
  return st;
}
