import type { Network } from './model';

/**
 * Topology processing: closed switches merge buses into electrical nodes (union-find, deterministic:
 * the representative is the lexicographically smallest bus id). Cables and transformers then connect
 * nodes. Islands = connected components of the node graph; an island is energised if it contains a source.
 */
export interface Topology {
  nodeOf: Map<string, string>;     // bus id → node id (representative bus id)
  nodes: string[];                 // sorted node ids
  islandOf: Map<string, number>;   // node id → island index
  islands: { nodes: string[]; sources: string[]; energised: boolean }[];
}

export function buildTopology(net: Network, opts: { excludeEarthed?: boolean } = {}): Topology {
  const parent = new Map<string, string>();
  for (const b of [...net.buses].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))) parent.set(b.id, b.id);
  const find = (x: string): string => {
    let r = x;
    while (parent.get(r)! !== r) r = parent.get(r)!;
    let y = x;
    while (parent.get(y)! !== r) { const nx = parent.get(y)!; parent.set(y, r); y = nx; }
    return r;
  };
  const union = (a: string, b: string) => {
    const ra = find(a), rb = find(b);
    if (ra === rb) return;
    if (ra < rb) parent.set(rb, ra); else parent.set(ra, rb);
  };
  for (const sw of net.switches) if (sw.closed && !sw.fuseBlown) union(sw.from, sw.to);

  const nodeOf = new Map<string, string>();
  for (const b of net.buses) nodeOf.set(b.id, find(b.id));
  const nodes = [...new Set(nodeOf.values())].sort();

  // adjacency over cables + transformers
  const adj = new Map<string, string[]>();
  for (const n of nodes) adj.set(n, []);
  const link = (a: string, b: string) => {
    const na = nodeOf.get(a)!, nb = nodeOf.get(b)!;
    if (na === nb) return;
    adj.get(na)!.push(nb); adj.get(nb)!.push(na);
  };
  for (const c of net.cables) link(c.from, c.to);
  for (const t of net.transformers) link(t.hv, t.lv);
  for (const list of adj.values()) list.sort();

  const islandOf = new Map<string, number>();
  const islands: Topology['islands'] = [];
  const sourceNodes = new Map<string, string[]>();
  for (const s of net.sources) {
    const n = nodeOf.get(s.bus)!;
    if (!sourceNodes.has(n)) sourceNodes.set(n, []);
    sourceNodes.get(n)!.push(s.id);
  }
  for (const start of nodes) {
    if (islandOf.has(start)) continue;
    const idx = islands.length;
    const members: string[] = [];
    const stack = [start];
    islandOf.set(start, idx);
    while (stack.length) {
      const n = stack.pop()!;
      members.push(n);
      for (const m of adj.get(n)!) if (!islandOf.has(m)) { islandOf.set(m, idx); stack.push(m); }
    }
    members.sort();
    const srcs = members.flatMap((m) => sourceNodes.get(m) ?? []).sort();
    islands.push({ nodes: members, sources: srcs, energised: srcs.length > 0 });
  }
  void opts;
  return { nodeOf, nodes, islandOf, islands };
}

export function isBusEnergised(topo: Topology, busId: string): boolean {
  const n = topo.nodeOf.get(busId);
  if (n === undefined) return false;
  return topo.islands[topo.islandOf.get(n)!]!.energised;
}
