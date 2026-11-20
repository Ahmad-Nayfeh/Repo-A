# 14 — Graphics: premium, readable, phone-friendly visuals on free tools

Research date: 2026-11-20. Scope: how to move Grid Shift / مناوبة الشبكة from a flat SVG + emoji schematic
(`src/ui/NetworkView.tsx`) to high-quality graphics while staying static (GitHub Pages), free, mobile-capable,
deterministic and readable. Everything below is either cited or explicitly marked **[measured]** (run by me in a
scratch project) or **[recommendation]** / **[estimate]** (my judgement, not a sourced fact).

---

## 0. TL;DR

- **Renderer:** Three.js (MIT) + `camera-controls` (MIT) + `postprocessing` (Zlib) + `troika-three-text` (MIT) for
  optional in-world labels; HTML/Preact overlay for all real UI text. Lazy-loaded as a separate chunk so the
  current game shell stays light. Measured ≈ **130 KB gz** for a minimal Three.js scene and ≈ **268 KB gz** for
  the full stack (renderer + GLTFLoader + troika + bloom/outline + camera controls).
- **Art direction:** "Night diorama" — a tilted, isometric-ish 3D model of a Riyadh-like district at dusk/night,
  stylised low-poly city (Kenney/Quaternius CC0) with *hand-built, slightly more detailed* electrical hero
  objects (RMU cabinets, package substations, grid stations, utility trucks). Cables are drawn as an
  **always-on-top schematic overlay** (glowing tubes / ribbons) with the same redundant encodings the SVG view
  already uses (solid/dashed/hatched/earth glyph/NOP tag). A one-tap "Network lens" desaturates the city
  (Cities: Skylines info-view pattern) so engineering state is never hidden by the art.
- **Assets:** Kenney City Kit (Commercial/Suburban/Roads/Industrial) + Car Kit (all CC0), Quaternius Downtown
  City MegaKit / Modular Streets / Cars (CC0), Poly Haven + ambientCG (CC0) for HDRI/textures. Electrical
  equipment: no good CC0 models found → model RMUs/kiosks procedurally in code (they are boxes) or use a few
  CC-BY Sketchfab items with a credits screen.
- **Keep the SVG schematic** as an accessibility/low-end fallback and as the canonical, testable view.

---

## 1. Rendering options

### 1.1 Measured bundle sizes

**[measured]** esbuild 0.28.2 `--bundle --minify --format=esm`, then `gzip -9`, on the versions npm resolved on
2026-11-20. Entry files import only what a minimal scene needs. Script: scratch project, not committed.

| Library (version, licence) | Test entry | min | gzip |
|---|---|---|---|
| three 0.187.0 (MIT) | WebGLRenderer, Scene, PerspectiveCamera, Mesh, BoxGeometry, MeshStandardMaterial, DirectionalLight, InstancedMesh | 527 KB | **130 KB** |
| three + GLTFLoader + troika-three-text 0.53.1 + postprocessing 6.39.6 (SelectiveBloom + Outline) + camera-controls 3.1.2 | "full stack" for this game | 1017 KB | **268 KB** |
| troika-three-text alone (pulls part of three) | `new Text()` | 418 KB | 110 KB |
| pixi.js 8.23.0 (MIT) | Application + Sprite + Graphics + Text; *sum of all split chunks incl. WebGL, WebGPU and Canvas renderers*, so an upper bound | 570 KB | 166 KB |
| playcanvas 2.24.2 (MIT) | `import * as pc` + Application | 2054 KB | 527 KB |
| @babylonjs/core 9.37.1 (Apache-2.0) | deep imports: Engine, Scene, ArcRotateCamera, HemisphericLight, CreateBox, PBRMaterial | 1902 KB | 442 KB |
| maplibre-gl 6.19.0 (BSD-3-Clause) | `new Map()` (+72 KB CSS) | 1055 KB | 291 KB |

Licences read from each package's `package.json`. Published figures broadly agree: a Three.js forum post puts the
un-shaken `three` entry at ~600 KB / ~150 KB gz
([discourse.threejs.org](https://discourse.threejs.org/t/tree-shaking-three-js/1349?page=3)); Babylon users report
that tree-shaking needs deep `@babylonjs/core/...` imports and builds of 0.5–1 MB gz are common
([forum.babylonjs.com](https://forum.babylonjs.com/t/babylon-bundle-size/48068),
[forum](https://forum.babylonjs.com/t/introducing-babylon-lite/63648)); PlayCanvas community reports ~233–338 KB gz
for older engine versions ([forum.playcanvas.com](https://forum.playcanvas.com/t/safe-cutting-of-modules/26730));
deck.gl docs quote 504.9 KB (146.8 KB compressed) for Deck + one layer
([deck.gl building apps](https://deck.gl/docs/developer-guide/building-apps)).

### 1.2 Trade-offs for this game

| Option | Fit | Pros | Cons |
|---|---|---|---|
| **Three.js** (MIT) | **Best** | Smallest 3D core measured; huge ecosystem (GLTFLoader, KTX2Loader, CSS2DRenderer, InstancedMesh/BatchedMesh); easy to keep a pure "render adapter" next to Preact; polished examples exist (Slow Roads — procedural, instanced chunks, three.js: [web.dev case study](https://web.dev/case-studies/slow-roads)). | It's a library, not an engine — you write camera, picking, scene management (camera-controls covers most). |
| Babylon.js (Apache-2.0) | Good, heavier | Batteries-included (GUI, highlight layer, glow layer, inspector), strong TypeScript. Its community page lists Temple Run 2 (Imangi) among demos ([babylonjs.com/community](https://babylonjs.com/community)). | ~3.4× three's gz size in my test; tree-shaking requires care ([forum](https://forum.babylonjs.com/t/tree-shaking-es6/35049)). |
| PlayCanvas engine (MIT) | OK | Mobile-first heritage; MIT engine with tree-shakable ESM per [playcanvas.com/products/engine](https://playcanvas.com/products/engine); showcase e.g. Swooop ([blog](https://blog.playcanvas.com/swooop)); good optimisation guide. | Biggest measured bundle when imported as a namespace; the comfortable workflow is the (hosted) editor, which we'd skip. |
| PixiJS v8 (MIT) | Good for a **2.5D/2D** route | Fast 2D sprites; showcase titles (Happy Wheels, Suroi, Cartoon Network GameBox — [pixijs.com/showcase](https://pixijs.com/showcase)); MIT open games repo ([github.com/pixijs/open-games](https://github.com/pixijs/open-games)). | "Realistic" look would need pre-rendered isometric sprites (render Kenney models in Blender to sprite sheets) — art pipeline cost; no free camera rotation. |
| MapLibre GL (BSD-3) / deck.gl (MIT) | Niche | Real streets/buildings from OSM; static PMTiles can be hosted on GitHub Pages ([Protomaps docs](https://docs.protomaps.com/pmtiles/), [Simon Willison](https://til.simonwillison.net/gis/pmtiles)). | OSM data is ODbL (attribution + share-alike on derived DBs; [protomaps.com/faq](https://protomaps.com/faq)); free *satellite* imagery is not generally available for redistribution; real maps of a real Saudi grid could look like a real SEC system (avoid); ~291 KB gz + tiles; poor "game feel". |

**[recommendation]** Three.js. Pixi only if the owner prefers fixed-angle pre-rendered isometric art.

### 1.3 Mobile performance budgets

No authoritative standard exists; sources:
- PlayCanvas: "100-200 draw calls is a rough target for low end mobile devices"; beware "Use Device Pixel Ratio"
  as it can cause "a significant drop in frame rate" ([PlayCanvas optimisation guidelines](https://developer.playcanvas.com/user-manual/optimization/guidelines/)).
- Blippar WebAR guide: <50 draw calls and <100k scene triangles for mobile WebGL
  ([blippar.com](https://blippar.com/webar-performance-optimisation-the-complete-developer-guide/)).
- Abratabia: mid-range mobile can afford ~200–500 draw calls before CPU-bound
  ([abratabia.com](https://abratabia.com/mobile-browser-performance/webgl-mobile-performance.php)).
- Pixel ratio: community convention `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`; one report of ~40 fps
  on iOS with uncapped DPR ([discourse.threejs.org](https://discourse.threejs.org/t/low-fps-on-ios-mobile-with-pixel-ration-set-as-window-devicepixelratio/4963)).
- Textures: a 4096² PNG/JPEG with mipmaps costs ~90 MB of GPU memory regardless of file size; KTX2/Basis stays
  compressed on GPU (4–8× less); ETC1S for colour, UASTC for normal maps
  ([Don McCurdy, 2024](https://www.donmccurdy.com/2024/02/11/web-texture-formats/);
  [Khronos KTX2](https://www.khronos.org/news/permalink/khronos-ktx-2.0-textures-enable-compact-visually-rich-gltf-3d-assets)).

**[recommendation] Budget for Grid Shift on a mid-range phone, 60 fps target / 30 fps floor:**

| Item | Budget |
|---|---|
| Draw calls | ≤ 100 (city ≤ 50 via instancing, network/equipment ≤ 30, effects/UI ≤ 20) |
| Triangles on screen | ≤ 150k (city blocks 300–2k tris per building model, trucks ≤ 3k, hero RMU ≤ 2k) |
| Textures (GPU) | ≤ 64 MB; one shared palette/atlas texture for the city; KTX2 for anything > 512² |
| Real-time lights | 1 directional (moon) + hemisphere/env; street lamps & windows = emissive, no point lights |
| Shadows | one 1024² shadow map, static (render once, `autoUpdate=false`), or baked AO only on low tier |
| Post FX | bloom at half resolution + outline only on selection; disabled on "Low" tier |
| DPR | min(dpr, 2); dynamic drop to 1.25 when frame time > 20 ms |
| Download | JS ≤ 300 KB gz (3D chunk, lazy); assets ≤ 4 MB total (glTF + meshopt + KTX2) |

---

## 2. Visual style: premium but readable

Evidence on readability:
- Civilization VI art director: the camera is mostly pulled out, so "things are readable from that distance" by
  emphasising shape/form — "a little more readable if you have different silhouettes"
  ([Game Developer](https://www.gamedeveloper.com/art/making-i-civilization-vi-i-both-playable-and-beautiful)).
- Mini Motorways: the debate was about the *level of abstraction*, minimalism decided early
  ([Miketendo64 interview](https://miketendo64.com/2022/08/14/interview-mini-motorways/)); "graphic design is game
  design" (Peter Curry, quoted on [Giant Bomb](https://www.giantbomb.com/dinosaur-polo-club/3010-10760/forums/interview-peter-curry-co-creator-of-mini-metro-1871069/?page=1)).
- Valve (TF2) used silhouettes and warm/cool palettes for readability
  ([Game Developer](https://gamedeveloper.com/art/in-depth-how-valve-makes-art-to-enhance-gameplay)); "if everything
  is drawing attention, nothing will" ([Game Developer](https://gamedeveloper.com/design/how-to-reduce-visual-confusion-in-your-game));
  push backgrounds back in value/saturation ([bugnet.io](https://bugnet.io/blog/readable-game-art-why-clarity-beats-detail)).
- Cities: Skylines II's Electricity info view overlays flow along cables, shades consumers by use and colours
  plants/transformers distinctly; hover shows transmitted power and capacity
  ([Paradox](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/electricity-water)). CS1's info
  view shows connected buildings in blue ([dev diary](https://admin-forum.paradoxplaza.com/forum/developer-diary/cities-skylines-dev-diary-9-info-views.833752/post-18849702)).
- Townscaper: low-poly graphics and minimalist UI ([Wikipedia](https://en.wikipedia.org/wiki/Townscaper)); reviewers praise its "gentle lighting" ([metaphorsandmoonlight.com](https://metaphorsandmoonlight.com/game-review-townscaper-by-oskar-stalberg/));
  "lighting is THE most important part" of good low-poly ([Game Developer](https://gamedeveloper.com/design/how-to-make-low-poly-look-good)).

**[recommendation] Style choice:** stylised low-poly + good lighting beats PBR realism here. PBR realism costs
textures/memory, needs many unique assets we cannot get free for Saudi MV equipment, and adds visual noise. A
"tilt-shift diorama at blue hour" reads as premium (Townscaper/Islanders/Mini Motorways territory) while letting
the network pop.

Concretely:
1. **Two layers.** City layer (desaturated, low contrast, warm window lights) vs. network layer (high
   contrast, cool/emissive, drawn on top with `depthTest:false` or a slight lift so buildings never occlude cables).
2. **Network lens toggle** (default on during decisions): city fades to ~30 % saturation; cables become thick
   tubes; feeder/ring identity coloured; energised = solid + bloom glow + animated flow dashes; dead = dashed dark
   grey; permit = hatched band; earthed = earth glyph billboard; open point = gap + hollow square + "NOP".
   Exactly the encodings in `NetworkView.tsx`, so information is never colour-only.
3. **Hero objects** larger than true scale (≈1.5–2×), distinct silhouettes: RMU = low wide cabinet with
   3–4 doors; package substation = taller kiosk with louvres; grid station = fenced yard with transformers.
4. **Night lighting:** dusk HDRI (a guide notes night-only HDRI lighting is too dark to read; dusk keeps shape — [cinevva](https://app.cinevva.com/game-assets/free-night-hdris)), moon
   directional light, emissive windows. **Payoff:** when customers lose supply their windows go dark; restoration
   relights blocks — a realistic yet readable consequence.
5. **Bloom only on energised conductors/selected item**, not the whole city.

---

## 3. Free, permissive assets

All licences verified on the publisher's own page unless noted. CC0 = no attribution needed; CC-BY = credit
required (add a Credits page).

### 3.1 City / vehicles / environment (CC0)

| Pack | URL | Licence (source) | Use |
|---|---|---|---|
| Kenney City Kit (Commercial) | https://kenney.nl/assets/city-kit-commercial | CC0, 50 files (kenney.nl) | towers, shops |
| Kenney City Kit (Suburban) | https://www.kenney.nl/assets/city-kit-suburban | CC0; OBJ/FBX/DAE/STL/glTF ([itch.io](https://kenney-assets.itch.io/city-kit-suburban)) | villas (re-tint sand/beige for Riyadh) |
| Kenney City Kit (Roads) | https://www.kenney.nl/assets/city-kit-roads | CC0 ([itch.io](https://kenney-assets.itch.io/city-kit-roads)); v2.1 adds signs + traffic lights ([gamedev.net](https://gamedev.net/news/5156-city-kit-roads/)) | street tiles, junctions, lights |
| Kenney City Kit (Industrial) | https://kenney.nl/assets/city-kit-industrial | CC0 (kenney.nl); v2.0 adds solar/wind ([gamedev.net](https://gamedev.net/news/5434-city-kit-industrial/)) | around grid stations; DER later |
| Kenney Car Kit | https://www.kenney.nl/assets/car-kit | CC0, 45 assets, v2.0 (2024); OBJ/FBX/glTF; includes trucks/vans ([itch.io](https://kenney-assets.itch.io/car-kit)) | crew trucks (re-tint white + utility livery), traffic |
| Kenney general licence | https://kenney.nl/support | "public domain licensed (CC0)… even in commercial projects… Attribution is not required" | — |
| Quaternius Downtown City MegaKit / Modular Streets / Cars / Buildings packs | https://quaternius.com/ (e.g. https://quaternius.com/packs/cars.html, https://quaternius.itch.io/lowpoly-modular-street) | "All models are under the CC0 License… attribution is not necessary" ([quaternius.com/faq](https://quaternius.com/faq.html)) | alternative/extra buildings and cars |
| Poly Haven (HDRIs, textures, models) | https://polyhaven.com (e.g. night HDRI https://polyhaven.com/a/shanghai_bund) | all assets CC0 ([polyhaven.com/license](https://polyhaven.com/license)) | dusk/night env lighting, asphalt/concrete/sand |
| ambientCG (PBR textures) | https://ambientcg.com | "All ambientCG assets are provided under the Creative Commons CC0 1.0 Universal License… You don't need to give credit" ([docs.ambientcg.com/license](https://docs.ambientcg.com/license/)) | ground/metal detail textures |
| OpenGameArt "Electrical Substation 3D" (GGBotNet) | https://opengameart.org/content/electrical-substation-3d | CC0, 114 tris, low-poly (Soviet style) | placeholder only |

### 3.2 Electrical equipment — the gap

Sketchfab API search (`license=cc0&downloadable=true`) on 2026-11-20 found **no CC0** transformer, RMU,
switchgear, utility truck or cable drum (only unrelated scans). CC-BY (attribution required) low-poly options
found via the same API (`license=by`), face counts from the API:

| Item | Author | Faces | URL | Licence |
|---|---|---|---|---|
| Electrical Transformer Substation (FREE) | Andrey.Chegodaev | 327 | https://sketchfab.com/3d-models/2f176ef6ead04fff8459406e1d1ee91c | CC-BY |
| Electrical Transformer | nazzarenogiannelli | 66 | https://sketchfab.com/3d-models/b55aa6ccdfd1454899e081d9b4fce48d | CC-BY |
| Lo-Fi Electrical Transformer (PSX) | vaportrash | 5,292 | https://sketchfab.com/3d-models/189435d6feff417899a6c8dfc1bc559f | CC-BY |
| Electrical cabinet | pinokio21 | 124 | https://sketchfab.com/3d-models/e25417f2da1e4308ba4fcd3eda740b33 | CC-BY |
| Industrial Switchgear | MADMOVIESINC | 9,996 | https://sketchfab.com/3d-models/9ad62dc3bd694bf880be78e43530008e | CC-BY |
| 10kV ring main unit (high detail, 116k) | mrdt.club | 116,219 | https://sketchfab.com/3d-models/630e2c585c2142a095b9ddd51de8ef88 | CC-BY (reference only; too heavy) |
| Wooden Cable Drum | apariciosilva3D | 11,570 | https://sketchfab.com/3d-models/90120b2f0348407b8071577e85766827 | CC-BY |
| Cable Drum | YodhaGameStudio | 10,632 | https://sketchfab.com/3d-models/366b9959f9d54cfb9ceb8a9d06a53b28 | CC-BY |
| Pickup Truck | 00amza | 5,047 | https://sketchfab.com/3d-models/047615f53e2d45b9a1a2a4dd203d459c | CC-BY |
| Rural Area Old Concrete Electric Utility Pole | kuuttisiitonen | 3,404 | https://sketchfab.com/3d-models/f8b3249e56484746b193389914df9331 | CC-BY |
| Street Light | alalys / kloworks | 358 / 608 | https://sketchfab.com/3d-models/b7dfecfd2dd34a5d8a67bf3e48666105 , https://sketchfab.com/3d-models/2d44b333f56c4faaab1bd2007868cc37 | CC-BY |

Bucket/utility trucks on CGTrader/Fab/Superhive are "Royalty Free" commercial licences, not CC — avoid.
Re-check each Sketchfab page's licence badge at download time (authors can change it).

**[recommendation]** Build RMUs, package substations, link boxes, cable trench markers and the grid-station
yard **procedurally in code** (beveled boxes + door/louvre normal detail in a small shared atlas). They are
geometrically simple, we control exact Saudi appearance (grey/green RMU, beige kiosk, SEC-neutral — no logos),
zero licence risk, and they instance trivially. Use Kenney Car Kit van/truck re-tinted for crews.

### 3.3 Licence hygiene
- Keep `public/assets/LICENSES.md` listing every file, source URL, licence, date fetched.
- Do not use real SEC logos/branding or real Riyadh map data that could pass as a real network.

---

## 4. Procedural city, instancing, LOD

**[recommendation] Generation from the existing layout** (`Site.x/y` in `src/engine/model.ts`, "UI only"):
1. Snap sites to a street grid (e.g. 1 schematic unit = 8 m). Each ring cable becomes a polyline along streets
   (Manhattan routing between consecutive RMUs; in reality MV cables run in road reserves).
2. Streets = grid lines carrying cables + a few filler streets; blocks = the cells between them.
3. Fill each block with a seeded choice of Kenney/Quaternius building (use the engine's existing seeded RNG,
   `src/engine/rng.ts`) keyed by scenario id → identical city on every device and run.
4. Each package substation sits on a block edge near its RMU; tag the buildings it feeds
   (nearest-N or Voronoi) so their window emissive tracks `sim.isEnergised(...)`.
5. Grid stations get a fenced industrial plot at the ring ends (x=0 and x=100).

Rendering:
- One `InstancedMesh` per building model ("reduce the number of draw calls" —
  [three.js InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html)); per-instance colour via
  `setColorAt` for re-tints and window on/off. `BatchedMesh` combines *different* geometries sharing one material
  into one draw call ([three.js BatchedMesh](https://threejs.org/docs/pages/BatchedMesh.html)); forum caution that
  fewer draw calls is not always faster ([discourse](https://discourse.threejs.org/t/how-to-choose-between-instancedmesh-and-batchedmesh/81221)).
- LOD: with a fixed tilted camera and a district-sized map, distance LOD matters little; instead use a
  **zoom-tier swap**: zoomed-out → simplified block boxes + network only; zoomed-in → full buildings + equipment
  doors/labels. Slow Roads uses instanced chunks streamed around the camera ([web.dev](https://web.dev/case-studies/slow-roads)).
- Assets: glTF-Transform (`meshopt`, `etc1s`/`uastc` KTX2) at build time; KTX2Loader with `detectSupport(renderer)`
  ([three basis README](https://cdn.jsdelivr.net/npm/three@0.185.1/examples/jsm/libs/basis/README.md)).
- Quality tiers (Low/Med/High) chosen by a 2-second frame-time probe; persisted in localStorage.

---

## 5. Determinism, testability, accessibility

**Architecture [recommendation]:**
```
engine (pure, deterministic) ──state snapshot──▶ viewModel(state) (pure TS, unit-tested)
                                                     │
                     ┌───────────────────────────────┼─────────────────────┐
                     ▼                               ▼                     ▼
              SVG schematic (today)        Three.js adapter (new)     HTML overlay (Preact)
```
- `viewModel` maps sim state → plain data (`{cables:[{id, path, state:'live'|'dead'|'permit', earthed}], sites:…}`).
  Golden-test it with Vitest like the engine. The 3D adapter only diff-applies the view model; it never reads or
  writes engine state. Selection events go back through the same `onSelect(Selection)` callback the SVG uses.
- Animation driven by sim time, not wall clock, for replays; camera tours derived from the event log.
- Playwright: headless Chromium renders WebGL via SwiftShader; screenshot tests with fixed seed, fixed DPR,
  animations paused; tolerate small pixel diffs.

**Accessibility:**
- Colour: Okabe-Ito palette (#E69F00 #56B4E9 #009E73 #F0E442 #0072B2 #D55E00 #CC79A7 #000000) for ring/feeder
  identity ([R thematic docs](https://rdrr.io/github/rstudio/thematic/man/okabe_ito.html),
  [Datawrapper](https://www.datawrapper.de/blog/colorblindness-part2)); never colour-only — keep dash/hatch/glyph
  encodings in 3D.
- Text: keep *all* actionable text (names, readings, buttons) in the HTML overlay — browser shaping of Arabic is
  complete, accessible to screen readers and zoomable. Project 3D → screen positions each frame
  (three's [CSS2DRenderer](https://threejs.org/docs/pages/CSS2DRenderer.html) does this; translation only). Keep
  the diagram `dir="ltr"` as today; labels inside get their own `dir`.
- Keep the SVG schematic as an alternative view (toggle) and as the default when WebGL is unavailable or
  `prefers-reduced-motion`/"Low" tier is chosen. Keyboard: the existing focusable list of cables/sites stays.

**Arabic in WebGL — troika-three-text [verified in source v0.53.1]:**
- Docs: handles right-to-left/bidirectional layout, `direction:'auto'` follows the bidi spec, supports "joined
  scripts like Arabic" and ligature substitution; fonts .ttf/.otf/.woff, **".woff2 is not supported"**
  ([troika docs](https://protectwise.github.io/troika/troika-three-text/)).
- Source (`node_modules/troika-three-text/src/FontParser.js`): depends on `bidi-js`; implements Arabic joining
  forms (`isol/init/fina/medi`) from the font's GSUB, plus `rlig/liga/ccmp`, and GPOS kerning, mark-to-base and
  mark-to-mark positioning. It is **not** HarfBuzz; the maintainer described it as basic rather than full shaping
  ([issue #113](https://www.github.com/protectwise/troika/issues/113)). Fine for short labels ("ح.ر 12", RMU names);
  test with Noto Sans Arabic.
- The repo's `@fontsource/noto-sans-arabic` ships `.woff` as well as `.woff2` (45 `.woff` files) → usable by troika.
- **[recommendation]** Use troika only for decorative/in-world signs; real UI text in HTML.

---

## 6. Touch camera & interaction

- `camera-controls` (MIT): one-finger rotate, two-finger pinch dolly + truck (pan); `setLookAt(..., true)`,
  `fitToBox`, `fitToSphere`, `smoothTime` (default 0.25 s); transitions return Promises → chainable for tours
  ([github.com/yomotsu/camera-controls](https://github.com/yomotsu/camera-controls)).
- **[recommendation]** For a sim: map one-finger drag → pan (truck), two-finger → pinch zoom + twist rotate,
  clamp polar angle 35–65° and azimuth ±45° so the map never becomes confusing; double-tap → focus.
- Tap to select: Raycaster against a *simplified invisible hit-proxy* per object (fat capsules along cables,
  boxes for sites) — generous touch targets (≥ 44 px on screen) regardless of zoom.
- Focus animation: `fitToBox(selectedSite, true, {paddingTop…})` and bottom-sheet details in Preact.
- Highlight: pmndrs `postprocessing` `OutlineEffect` for the selection; `SelectiveBloomEffect` or (cheaper)
  plain `BloomEffect` with a luminance threshold so only emissive energised cables bloom — docs say plain Bloom
  performs better if you don't need restriction ([react-postprocessing docs](https://react-postprocessing.docs.pmnd.rs/effects/selective-bloom)).
  Low tier: no post FX; selection = pulsing ground ring + raised colour.

---

## 7. Recommended stack, art direction, effort, replay tour

### 7.1 Stack
| Layer | Choice | Licence |
|---|---|---|
| UI shell | Preact + signals (existing) | MIT |
| 3D | three (r187) via dynamic `import()` | MIT |
| Camera | camera-controls | MIT |
| Post FX | postprocessing (Bloom, Outline, SMAA/FXAA) | Zlib |
| In-world text (optional) | troika-three-text + Noto Sans Arabic `.woff` | MIT / OFL |
| Asset pipeline | glTF-Transform CLI (meshopt + KTX2) at build time | MIT |
| Assets | Kenney + Quaternius + Poly Haven + ambientCG (CC0); procedural equipment | CC0 |

**Size [measured+estimate]:** ~268 KB gz JS for the 3D chunk (lazy) + ~2–4 MB assets (estimate) cached by the
browser/service worker. Initial game page unaffected because the SVG view stays the first render.

### 7.2 Art direction ("Riyadh blue hour")
- Palette: deep navy sky → dusk gradient; ground sand-beige asphalt; buildings beige/stone with warm (#FFD08A-ish)
  windows; network on Okabe-Ito colours; energised glow cool white-blue; fault = orange #D55E00 pulse + icon.
- Camera: perspective with narrow FOV (≈30°) at ~50° pitch → diorama/tilt-shift feel; optional subtle depth-of-field
  on High tier only.
- Equipment: chunky, slightly exaggerated, clean silhouettes; doors open during switching; small status lamp on
  each RMU (also mirrored as overlay icon).
- Crews: white utility trucks with amber beacons driving along streets (path = street graph; position from sim).
- Motion: everything eases; respects `prefers-reduced-motion` (cuts instead of flights).

### 7.3 Effort [estimate, one developer]
| Step | Time |
|---|---|
| View-model extraction + tests | 2–3 days |
| Three.js adapter: city gen, instancing, network tubes, picking, camera | 1.5–2 weeks |
| Procedural RMU/kiosk/grid-station models + truck re-tint | 3–5 days |
| Lighting, bloom/outline, quality tiers, DPR scaling | 3–4 days |
| HTML labels/overlay, Arabic checks, a11y fallback toggle | 2–3 days |
| Replay tour + Playwright screenshots + perf tuning on real phones | 1 week |
| **Total** | **≈ 4–6 weeks** |

### 7.4 "Solution replay" camera tour (sketch)
Driven by the sim event log at, e.g., 30× speed, each beat a `camera-controls` promise:
1. **Establish** (3 s): high wide shot of both grid stations and the ring; city lit; caption "21:40 — feeder trips".
2. **Fault** (3 s): fly to the faulted cable; orange pulse on the section; downstream blocks' windows go dark in a
   wave; customers-off counter in overlay.
3. **Evidence** (4 s): hop RMU-to-RMU along the ring; FPI flags light (as read by the player); the suspect section
   brackets narrow.
4. **Crew** (4 s): follow the truck along streets (fast-forward), arrive, doors open.
5. **Switching** (2 s per step): close-up on each operation in player order — isolator opens, earth applied
   (glyph appears), NOP closes; side-panel shows the step text in Arabic/English.
6. **Restore** (3 s): pull back; blocks relight block-by-block as sections re-energise; energised glow travels
   from the grid station.
7. **Score** (2 s): top-down "network lens" summary with CI/CML numbers and an "optimal vs yours" ghost path.
Skippable, scrubbable (it's a pure function of the event log + time), and rendered identically in tests.

---

## Sources
- Three.js docs: InstancedMesh https://threejs.org/docs/pages/InstancedMesh.html ; BatchedMesh https://threejs.org/docs/pages/BatchedMesh.html ; CSS2DRenderer https://threejs.org/docs/pages/CSS2DRenderer.html
- Three.js bundle discussion https://discourse.threejs.org/t/tree-shaking-three-js/1349?page=3
- Babylon bundle size https://forum.babylonjs.com/t/babylon-bundle-size/48068 ; https://forum.babylonjs.com/t/tree-shaking-es6/35049 ; https://babylonjs.com/community
- PlayCanvas engine https://playcanvas.com/products/engine ; guidelines https://developer.playcanvas.com/user-manual/optimization/guidelines/ ; Swooop https://blog.playcanvas.com/swooop ; size thread https://forum.playcanvas.com/t/safe-cutting-of-modules/26730
- PixiJS showcase https://pixijs.com/showcase ; open games https://github.com/pixijs/open-games
- deck.gl building apps https://deck.gl/docs/developer-guide/building-apps
- Protomaps/PMTiles https://docs.protomaps.com/pmtiles/ ; https://protomaps.com/faq ; https://til.simonwillison.net/gis/pmtiles
- Slow Roads case study https://web.dev/case-studies/slow-roads
- Mobile budgets: https://blippar.com/webar-performance-optimisation-the-complete-developer-guide/ ; https://abratabia.com/mobile-browser-performance/webgl-mobile-performance.php ; DPR https://discourse.threejs.org/t/low-fps-on-ios-mobile-with-pixel-ration-set-as-window-devicepixelratio/4963
- Textures: https://www.donmccurdy.com/2024/02/11/web-texture-formats/ ; https://www.khronos.org/news/permalink/khronos-ktx-2.0-textures-enable-compact-visually-rich-gltf-3d-assets
- Readability: https://www.gamedeveloper.com/art/making-i-civilization-vi-i-both-playable-and-beautiful ; https://miketendo64.com/2022/08/14/interview-mini-motorways/ ; https://gamedeveloper.com/art/in-depth-how-valve-makes-art-to-enhance-gameplay ; https://gamedeveloper.com/design/how-to-reduce-visual-confusion-in-your-game ; https://bugnet.io/blog/readable-game-art-why-clarity-beats-detail ; https://www.paradoxinteractive.com/games/cities-skylines-ii/features/electricity-water ; https://gamedeveloper.com/design/how-to-make-low-poly-look-good ; https://en.wikipedia.org/wiki/Townscaper
- Assets/licences: https://kenney.nl/support ; https://kenney.nl/assets/city-kit-commercial ; https://www.kenney.nl/assets/city-kit-suburban ; https://www.kenney.nl/assets/city-kit-roads ; https://kenney.nl/assets/city-kit-industrial ; https://www.kenney.nl/assets/car-kit ; https://quaternius.com/faq.html ; https://polyhaven.com/license ; https://docs.ambientcg.com/license/ ; https://opengameart.org/content/electrical-substation-3d ; Sketchfab items in §3.2
- Text: https://protectwise.github.io/troika/troika-three-text/ ; https://www.github.com/protectwise/troika/issues/113
- Camera: https://github.com/yomotsu/camera-controls ; post FX https://github.com/pmndrs/postprocessing ; https://react-postprocessing.docs.pmnd.rs/effects/selective-bloom
- Colour: https://rdrr.io/github/rstudio/thematic/man/okabe_ito.html ; https://www.datawrapper.de/blog/colorblindness-part2
