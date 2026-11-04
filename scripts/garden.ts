import { readFileSync, writeFileSync } from "node:fs";

type Day = { contributionCount: number; date: string };
type Calendar = { totalContributions: number; weeks: { contributionDays: Day[] }[] };
type Theme = { name: "dark" | "light"; panel: string; line: string; fg: string; dim: string; empty: string; scale: readonly string[]; a: string };

const LOGIN = "proxysoul";
const THEMES: readonly Theme[] = [
  { name: "dark", panel: "#0c131a", line: "rgba(230,238,243,0.10)", fg: "#e6eef3", dim: "#93a3ae", empty: "#16212b", scale: ["#0e4a5c", "#127e95", "#1eb4e0", "#7fdcf5"], a: "#1eb4e0" },
  { name: "light", panel: "#ffffff", line: "rgba(16,34,43,0.10)", fg: "#10222b", dim: "#4f6470", empty: "#e8eef2", scale: ["#a9dcea", "#5bb8d2", "#1d8fb0", "#00607a"], a: "#00708f" },
];
const FONT = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

async function calendar(): Promise<Calendar> {
  const token = process.env.GITHUB_TOKEN ?? Bun.spawnSync(["gh", "auth", "token"]).stdout.toString().trim();
  if (!token) throw new Error("set GITHUB_TOKEN or sign in with gh to read the contribution calendar");
  const query = `{user(login:"${LOGIN}"){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{contributionCount date}}}}}}`;
  const response = await fetch("https://api.github.com/graphql", { method: "POST", headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ query }), signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error(`GitHub GraphQL answered ${response.status}`);
  const body = (await response.json()) as { data?: { user?: { contributionsCollection: { contributionCalendar: Calendar } } }; errors?: unknown };
  const result = body.data?.user?.contributionsCollection.contributionCalendar;
  if (!result) throw new Error(`GitHub GraphQL returned no calendar: ${JSON.stringify(body.errors)}`);
  return result;
}

const mote = (frame: string): string => "data:image/png;base64," + readFileSync(new URL(`../art/mote/${frame}.png`, import.meta.url)).toString("base64");

function level(count: number, peak: number): number {
  if (count === 0) return -1;
  return Math.min(3, Math.floor((count / Math.max(peak, 1)) * 4));
}

function garden(t: Theme, cal: Calendar): string {
  const cell = 18;
  const gap = 4;
  const left = 36;
  const top = 96;
  const days = cal.weeks.flatMap((w) => w.contributionDays);
  const sorted = days.map((d) => d.contributionCount).filter((c) => c > 0).sort((a, b) => a - b);
  const peak = sorted[Math.floor(sorted.length * 0.95)] ?? 1;
  const cells = cal.weeks
    .map((week, wi) =>
      week.contributionDays
        .map((day) => {
          const row = new Date(`${day.date}T00:00:00Z`).getUTCDay();
          const l = level(day.contributionCount, peak);
          const fill = l < 0 ? t.empty : t.scale[l];
          return `<rect x="${left + wi * (cell + gap)}" y="${top + row * (cell + gap)}" width="${cell}" height="${cell}" rx="5" fill="${fill}" style="animation:grow .6s ease-out ${(wi * 0.035).toFixed(3)}s both"><title>${day.contributionCount} on ${day.date}</title></rect>`;
        })
        .join(""),
    )
    .join("");
  const width = left * 2 + cal.weeks.length * (cell + gap) - gap;
  const ground = top + 7 * (cell + gap) + 4;
  const height = ground + 84;
  const walk = width - left * 2 - 70;
  const frames = ["d_5", "d_5", "d_5", "r_0", "d_5", "d_2"];
  const step = 100 / frames.length;
  const flip = frames.map((f, i) => `<image href="${mote(f)}" width="70" height="70" style="opacity:0;animation:flip 2.4s steps(1,end) infinite;animation-delay:${(-2.4 + i * (2.4 / frames.length)).toFixed(2)}s"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${cal.totalContributions} GitHub contributions in the last year, with Mote walking across them.">
<style>
@keyframes grow{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:scale(1)}}
@keyframes flip{0%{opacity:1}${step.toFixed(3)}%{opacity:0}100%{opacity:0}}
@keyframes walk{from{transform:translate(${left}px,${ground}px)}to{transform:translate(${left + walk}px,${ground}px)}}
rect{transform-box:fill-box;transform-origin:center}
</style>
<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="22" fill="${t.panel}" stroke="${t.line}" style="animation:none"/>
<text x="${left}" y="48" font-family="${MONO}" font-size="14" letter-spacing="3" fill="${t.a}">MOTE'S GARDEN</text>
<text x="${left}" y="74" font-family="${FONT}" font-size="20" font-weight="700" fill="${t.fg}">${cal.totalContributions.toLocaleString("en-US")} contributions in the last year</text>
<g style="animation:walk 36s linear infinite">${flip}</g>
${cells}
<text x="${width - left}" y="48" text-anchor="end" font-family="${MONO}" font-size="12" fill="${t.dim}">updated ${new Date().toISOString().slice(0, 10)}</text>
</svg>`;
}

const cal = await calendar();
for (const theme of THEMES) writeFileSync(new URL(`../assets/garden-${theme.name}.svg`, import.meta.url), garden(theme, cal));
