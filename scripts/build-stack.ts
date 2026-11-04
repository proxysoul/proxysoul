import { readFileSync, writeFileSync } from "node:fs";

type Tech = { name: string; hex: string; path: string };
type Theme = { name: "dark" | "light"; panel: string; tile: string; line: string; fg: string; dim: string; a: string; shadow: string };

const THEMES: readonly Theme[] = [
  { name: "dark", panel: "#0c131a", tile: "#111b24", line: "rgba(230,238,243,0.10)", fg: "#e6eef3", dim: "#93a3ae", a: "#1eb4e0", shadow: "rgba(0,0,0,0.45)" },
  { name: "light", panel: "#ffffff", tile: "#f3f7fa", line: "rgba(16,34,43,0.10)", fg: "#10222b", dim: "#4f6470", a: "#00708f", shadow: "rgba(16,34,43,0.18)" },
];
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const STACK: readonly Tech[] = JSON.parse(readFileSync(new URL("../art/stack.json", import.meta.url), "utf8"));

const TILE = 60;
const GAP = 16;
const LEFT = (1280 - (STACK.length * TILE + (STACK.length - 1) * GAP)) / 2;
const GROUND = 166;
const MOTE = 66;
const HOP = 0.55;
const HOPS = (STACK.length - 1) * 2;
const LOOP = HOP * HOPS;

const mote = "data:image/png;base64," + readFileSync(new URL("../art/mote/d_5.png", import.meta.url)).toString("base64");
const tileX = (i: number): number => LEFT + i * (TILE + GAP);
const stop = (k: number): number => (k <= HOPS / 2 ? k : HOPS - k);
const pct = (k: number): string => ((k / HOPS) * 100).toFixed(4);

function luminance(hex: string): number {
  const n = Number.parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function ink(tech: Tech, t: Theme): string {
  const l = luminance(tech.hex);
  if (t.name === "dark" && l < 0.22) return t.fg;
  if (t.name === "light" && l > 0.85) return t.fg;
  return tech.hex;
}

function squash(i: number): string {
  const landings = Array.from({ length: HOPS + 1 }, (_, k) => k).filter((k) => stop(k) === i);
  const frames = new Map<number, string>();
  for (const k of landings) {
    const at = (k / HOPS) * 100;
    const spread = (0.45 / LOOP) * 100;
    frames.set(Math.max(0, at - spread * 0.25), "scale(1,1)");
    frames.set(at, "scale(1.1,0.7)");
    frames.set(Math.min(100, at + spread * 0.5), "scale(0.96,1.06)");
    frames.set(Math.min(100, at + spread), "scale(1,1)");
  }
  if (!frames.has(0)) frames.set(0, frames.get(100) ?? "scale(1,1)");
  if (!frames.has(100)) frames.set(100, frames.get(0) ?? "scale(1,1)");
  const body = [...frames.entries()].sort((a, b) => a[0] - b[0]).map(([p, v]) => `${p.toFixed(4)}%{transform:${v}}`).join("");
  return `@keyframes sq${i}{${body}}`;
}

function stack(t: Theme): string {
  const xs = Array.from({ length: HOPS + 1 }, (_, k) => `${pct(k)}%{transform:translateX(${(tileX(stop(k)) + TILE / 2 - MOTE / 2).toFixed(2)}px)}`).join("");
  const tiles = STACK.map((tech, i) => {
    const color = ink(tech, t);
    return `<g transform="translate(${tileX(i)} ${GROUND})"><g class="t" style="animation:sq${i} ${LOOP}s linear infinite"><rect width="${TILE}" height="${TILE}" rx="16" fill="${t.tile}" stroke="${t.line}"/><rect x="0" y="${TILE - 4}" width="${TILE}" height="4" rx="2" fill="${color}" fill-opacity="0.55"/><g transform="translate(${(TILE - 30) / 2} ${(TILE - 30) / 2}) scale(1.25)"><path d="${tech.path}" fill="${color}"/></g><title>${tech.name}</title></g><text x="${TILE / 2}" y="${TILE + 24}" text-anchor="middle" font-family="${MONO}" font-size="11.5" fill="${t.dim}">${tech.name}</text></g>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="276" viewBox="0 0 1280 276" role="img" aria-label="My stack: ${STACK.map((s) => s.name).join(", ")}. Mote hops across the tiles and squashes each one.">
<style>
@keyframes x{${xs}}
@keyframes face{0%{transform:scaleX(1)}50%{transform:scaleX(-1)}100%{transform:scaleX(1)}}
@keyframes y{0%{transform:translateY(0);animation-timing-function:cubic-bezier(.2,.7,.4,1)}50%{transform:translateY(-58px);animation-timing-function:cubic-bezier(.6,0,.8,.3)}100%{transform:translateY(0)}}
@keyframes land{0%{transform:translateY(16px) scale(1.14,0.84)}14%{transform:translateY(5px) scale(0.94,1.08)}28%,100%{transform:translateY(0) scale(1,1)}}
@keyframes shadow{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(.55);opacity:.35}}
.t,.m,.f,.s{transform-box:fill-box;transform-origin:50% 100%}
.f{transform-origin:50% 50%}
.s{transform-origin:50% 50%}
${STACK.map((_, i) => squash(i)).join("")}
</style>
<rect x="0.5" y="0.5" width="1279" height="275" rx="24" fill="${t.panel}" stroke="${t.line}"/>
<text x="${LEFT}" y="40" font-family="${MONO}" font-size="14" letter-spacing="3" fill="${t.a}">THE STACK</text>
${tiles}
<g style="animation:x ${LOOP}s linear infinite">
<ellipse class="s" cx="${MOTE / 2}" cy="${GROUND + 1}" rx="22" ry="5" fill="${t.shadow}" style="animation:shadow ${HOP}s linear infinite"/>
<g class="f" style="animation:face ${LOOP}s steps(1,end) infinite">
<g style="animation:y ${HOP}s infinite">
<g class="m" style="animation:land ${HOP}s ease-out infinite"><image href="${mote}" x="0" y="${GROUND - MOTE + 13}" width="${MOTE}" height="${MOTE}"/></g>
</g>
</g>
</g>
</svg>`;
}

for (const theme of THEMES) writeFileSync(new URL(`../assets/stack-${theme.name}.svg`, import.meta.url), stack(theme));
