import { readFileSync, writeFileSync } from "node:fs";

type Theme = { name: "dark" | "light"; bg: string; panel: string; line: string; fg: string; dim: string; a: string; m: string; s: string; w: string; p: string };

const THEMES: readonly Theme[] = [
  { name: "dark", bg: "#070b10", panel: "#0c131a", line: "rgba(230,238,243,0.10)", fg: "#e6eef3", dim: "#93a3ae", a: "#1eb4e0", m: "#1ab8a4", s: "#9b6af5", w: "#f2bd79", p: "#ff3d7f" },
  { name: "light", bg: "#f5fafc", panel: "#ffffff", line: "rgba(16,34,43,0.10)", fg: "#10222b", dim: "#4f6470", a: "#00708f", m: "#00705f", s: "#5b2fd6", w: "#986312", p: "#c40046" },
];

const FONT = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const mote = (frame: string): string => "data:image/png;base64," + readFileSync(new URL(`../art/mote/${frame}.png`, import.meta.url)).toString("base64");

const LOOK = ["d_4", "d_5", "d_2", "d_1", "d_0", "d_3", "d_6", "d_7", "d_8", "d_4", "r_0", "r_1"] as const;

function flipbook(id: string, frames: readonly string[], x: number, y: number, size: number, seconds: number): string {
  const step = 100 / frames.length;
  const keyframes = `@keyframes ${id}{0%{opacity:1}${step.toFixed(3)}%{opacity:0}100%{opacity:0}}`;
  const images = frames
    .map((frame, i) => `<image href="${mote(frame)}" x="${x}" y="${y}" width="${size}" height="${size}" style="opacity:0;animation:${id} ${seconds}s steps(1,end) infinite;animation-delay:${(-seconds + (i * seconds) / frames.length).toFixed(3)}s"/>`)
    .join("");
  return `<style>${keyframes}</style>${images}`;
}

function floater(frame: string, x: number, y: number, size: number, delay: number, tilt: number): string {
  return `<g style="animation:bob 5s ease-in-out ${delay}s infinite"><image href="${mote(frame)}" x="${x}" y="${y}" width="${size}" height="${size}" transform="rotate(${tilt} ${x + size / 2} ${y + size / 2})"/></g>`;
}

function hero(t: Theme): string {
  const chips = ["desktop", "terminal", "headless CI", "iPhone"];
  let cx = 470;
  const chipSvg = chips
    .map((label) => {
      const w = label.length * 9.4 + 30;
      const g = `<rect x="${cx}" y="292" width="${w}" height="34" rx="17" fill="${t.a}" fill-opacity="0.09" stroke="${t.a}" stroke-opacity="0.4"/><text x="${cx + w / 2}" y="314" text-anchor="middle" font-family="${MONO}" font-size="15" fill="${t.fg}">${label}</text>`;
      cx += w + 10;
      return g;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="400" viewBox="0 0 1280 400" role="img" aria-label="Mote looks around. Ouail Bni, ProxySoul. I build Empryo.">
<defs>
<radialGradient id="ga" cx="0.17" cy="0.5" r="0.5"><stop offset="0" stop-color="${t.a}" stop-opacity="0.32"/><stop offset="1" stop-color="${t.a}" stop-opacity="0"/></radialGradient>
<radialGradient id="gs" cx="0.95" cy="0" r="0.6"><stop offset="0" stop-color="${t.s}" stop-opacity="0.28"/><stop offset="1" stop-color="${t.s}" stop-opacity="0"/></radialGradient>
<radialGradient id="gm" cx="0.65" cy="1.1" r="0.5"><stop offset="0" stop-color="${t.m}" stop-opacity="0.2"/><stop offset="1" stop-color="${t.m}" stop-opacity="0"/></radialGradient>
<pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="${t.fg}" fill-opacity="0.08"/></pattern>
<clipPath id="clip"><rect width="1280" height="400" rx="28"/></clipPath>
</defs>
<style>
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes caret{0%,49%{opacity:1}50%,100%{opacity:0}}
@keyframes type{from{width:0}to{width:300px}}
.ring{transform-origin:178px 200px;animation:spin 40s linear infinite}
.caret{animation:caret 1s steps(1,end) infinite}
</style>
<g clip-path="url(#clip)">
<rect width="1280" height="400" fill="${t.bg}"/><rect width="1280" height="400" fill="url(#dots)"/>
<rect width="1280" height="400" fill="url(#ga)"/><rect width="1280" height="400" fill="url(#gs)"/><rect width="1280" height="400" fill="url(#gm)"/>
<circle class="ring" cx="178" cy="200" r="150" fill="none" stroke="${t.a}" stroke-opacity="0.22" stroke-dasharray="2 10"/>
<circle cx="178" cy="200" r="122" fill="none" stroke="${t.a}" stroke-opacity="0.14"/>
${flipbook("look", LOOK, 48, 70, 260, 7.2)}
${floater("r_1", 1130, 34, 96, 0, 12)}
${floater("r_4", 1170, 270, 78, 1.2, -8)}
${floater("pixel_4", 1010, 312, 90, 2.4, -12)}
</g>
<rect x="0.5" y="0.5" width="1279" height="399" rx="27.5" fill="none" stroke="${t.line}"/>
<text x="472" y="110" font-family="${MONO}" font-size="16" letter-spacing="4" fill="${t.a}">PROXYSOUL · SWEDEN</text>
<text x="468" y="186" font-family="${FONT}" font-size="70" font-weight="800" letter-spacing="-2" fill="${t.fg}">Ouail Bni</text>
<text x="472" y="236" font-family="${FONT}" font-size="26" fill="${t.dim}">I build Empryo, the AI coding harness I wanted to use.</text>
<text x="472" y="270" font-family="${MONO}" font-size="17" fill="${t.m}">~/ empryo --cook<tspan class="caret" fill="${t.fg}">▍</tspan></text>
${chipSvg}
</svg>`;
}

type Node = { id: string; x: number; y: number; r: number; tone: keyof Pick<Theme, "a" | "m" | "s" | "w" | "p"> };

const NODES: readonly Node[] = [
  { id: "engine.ts", x: 640, y: 210, r: 0, tone: "a" },
  { id: "genome.ts", x: 380, y: 110, r: 9, tone: "m" },
  { id: "ast-edit.ts", x: 330, y: 300, r: 8, tone: "s" },
  { id: "lsp.ts", x: 520, y: 360, r: 7, tone: "a" },
  { id: "memory.ts", x: 900, y: 100, r: 8, tone: "w" },
  { id: "compaction.ts", x: 960, y: 290, r: 9, tone: "p" },
  { id: "router.ts", x: 790, y: 370, r: 7, tone: "m" },
  { id: "tools.ts", x: 150, y: 190, r: 7, tone: "a" },
  { id: "desktop", x: 1130, y: 180, r: 7, tone: "s" },
  { id: "tui", x: 1150, y: 330, r: 6, tone: "s" },
  { id: "iphone", x: 1100, y: 60, r: 6, tone: "s" },
  { id: "pagerank", x: 210, y: 60, r: 6, tone: "m" },
  { id: "co-change", x: 150, y: 360, r: 6, tone: "m" },
];

const EDGES: readonly [string, string][] = [
  ["engine.ts", "genome.ts"], ["engine.ts", "ast-edit.ts"], ["engine.ts", "lsp.ts"], ["engine.ts", "memory.ts"], ["engine.ts", "compaction.ts"], ["engine.ts", "router.ts"],
  ["genome.ts", "pagerank"], ["genome.ts", "co-change"], ["genome.ts", "tools.ts"], ["ast-edit.ts", "lsp.ts"], ["ast-edit.ts", "tools.ts"], ["compaction.ts", "memory.ts"],
  ["engine.ts", "desktop"], ["engine.ts", "tui"], ["engine.ts", "iphone"], ["router.ts", "compaction.ts"], ["co-change", "ast-edit.ts"],
];

function genome(t: Theme): string {
  const at = (id: string): Node => {
    const node = NODES.find((n) => n.id === id);
    if (!node) throw new Error(`unknown genome node ${id}`);
    return node;
  };
  const edges = EDGES.map(([from, to], i) => {
    const a = at(from);
    const b = at(to);
    const d = `M${a.x} ${a.y} L${b.x} ${b.y}`;
    const dur = (2.4 + (i % 5) * 0.5).toFixed(1);
    return `<path d="${d}" stroke="${t.fg}" stroke-opacity="0.13" stroke-width="1.5"/><circle r="3.2" fill="${t[b.tone]}"><animateMotion dur="${dur}s" repeatCount="indefinite" begin="-${(i * 0.37).toFixed(2)}s" path="${d}"/></circle>`;
  }).join("");
  const nodes = NODES.filter((n) => n.r > 0)
    .map((n, i) => `<g><circle cx="${n.x}" cy="${n.y}" r="${n.r + 10}" fill="${t[n.tone]}" fill-opacity="0.12"><animate attributeName="r" values="${n.r + 6};${n.r + 14};${n.r + 6}" dur="${3 + (i % 4) * 0.6}s" repeatCount="indefinite"/></circle><circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="${t[n.tone]}"/><text x="${n.x}" y="${n.y + n.r + 22}" text-anchor="middle" font-family="${MONO}" font-size="14" fill="${t.dim}">${n.id}</text></g>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="470" viewBox="0 0 1280 470" role="img" aria-label="The Genome: Empryo maps your repo into a graph of files, symbols and git co-change before you type.">
<style>@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}</style>
<rect x="0.5" y="0.5" width="1279" height="469" rx="26" fill="${t.panel}" stroke="${t.line}"/>
<text x="36" y="44" font-family="${MONO}" font-size="15" letter-spacing="3" fill="${t.m}">THE GENOME</text>
<text x="36" y="76" font-family="${FONT}" font-size="24" font-weight="700" fill="${t.fg}">Your repo as a graph, before you type.</text>
<g transform="translate(0 50)">${edges}${nodes}
<g style="animation:bob 4s ease-in-out infinite">${flipbook("gl", ["d_4", "d_3", "d_0", "d_1", "d_2", "d_5", "d_8", "d_7", "d_6", "d_4", "r_2"], 575, 140, 130, 6.6)}</g>
</g>
</svg>`;
}

for (const theme of THEMES) {
  writeFileSync(new URL(`../assets/hero-${theme.name}.svg`, import.meta.url), hero(theme));
  writeFileSync(new URL(`../assets/genome-${theme.name}.svg`, import.meta.url), genome(theme));
}
