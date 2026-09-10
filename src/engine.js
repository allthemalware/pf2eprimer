/* ============================================================
   ENGINE — renders CHAPTERS from content.js, drives the demos,
   and searches the Foundry-derived rules text. No framework,
   no build step to use: the whole app is one file.
   ============================================================ */

const REF_META = (typeof GENERATED_REF_META !== "undefined") ? GENERATED_REF_META : {};
const CONDITIONS = (typeof GENERATED_CONDITIONS !== "undefined") ? GENERATED_CONDITIONS : [];
const ACTIONS = (typeof GENERATED_ACTIONS !== "undefined") ? GENERATED_ACTIONS : [];
const CONDITION_BY_SLUG = {}; CONDITIONS.forEach((c) => { CONDITION_BY_SLUG[c.slug] = c; });
const ACTION_BY_SLUG = {}; ACTIONS.forEach((a) => { ACTION_BY_SLUG[a.slug] = a; });
const PC_BY_ID = {}; PREGENS.forEach((p) => { PC_BY_ID[p.id] = p; });

/* ============================================================
   ICONS — one stroke path per name, inheriting the accent.
   ============================================================ */
const ICONS = {
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5 13 13l-4.5 2.5L11 11z"/>',
  compass2: '<path d="M12 3v2M12 19v2M3 12h2M19 12h2"/><circle cx="12" cy="12" r="7"/><path d="M9 15l2-4 4-2-2 4z"/>',
  sword: '<path d="M14.5 3.5 20 9l-8.5 8.5-2.5-.5-.5-2.5z"/><path d="M6 15l3 3"/><path d="M4.5 20.5 7 18"/><path d="M3.5 16.5 7.5 20.5"/>',
  speech: '<path d="M20 12.5c0 3.6-3.6 6.5-8 6.5a9.8 9.8 0 0 1-2.6-.34L5 20.5l1.2-3A6.6 6.6 0 0 1 4 12.5C4 8.9 7.6 6 12 6s8 2.9 8 6.5z"/>',
  anchor: '<circle cx="12" cy="5" r="2"/><path d="M12 7v13"/><path d="M8 11h8"/><path d="M5 14a7 7 0 0 0 14 0"/>',
  cards: '<rect x="3.5" y="6" width="12" height="14" rx="2"/><path d="M8 3.5h8.5a2 2 0 0 1 2 2V16"/>',
  menu: '<circle cx="12" cy="8" r="3.4"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/>',
  roll: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="8.5" cy="8.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="15.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/>',
  d20: '<path d="M12 2.8 20 7.4v9.2L12 21.2 4 16.6V7.4z"/><path d="M12 2.8 8 12l4 9.2L16 12z"/><path d="M4 7.4 8 12h8l4-4.6"/>',
  check: '<path d="M5 12.5 10 17.5 19 7"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  eye: '<path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.4"/>',
  secret: '<path d="M3 3l18 18"/><path d="M10.6 6.3A8.7 8.7 0 0 1 12 6c6 0 9.5 6 9.5 6a15 15 0 0 1-3.3 3.8M7 7.6A15 15 0 0 0 2.5 12S6 18 12 18a8.8 8.8 0 0 0 3.4-.68"/>',
  heart: '<path d="M12 20s-7-4.4-7-9.5A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.5C19 15.6 12 20 12 20z"/>',
  star: '<path d="M12 3.5l2.5 5.3 5.5.7-4 4 1 5.6L12 16.5 6.9 19l1-5.6-4-4 5.5-.7z"/>',
  shield: '<path d="M12 3 5 5.5v5.5c0 4 2.9 7 7 8.5 4.1-1.5 7-4.5 7-8.5V5.5z"/>',
  book: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 1 6.5 18H19v3H6.5A1.5 1.5 0 0 1 5 19.5z"/>',
  install: '<path d="M12 3v11M8 10l4 4 4-4"/><path d="M5 20h14"/>',
  reset: '<path d="M4 12a8 8 0 1 1 2.5 5.8"/><path d="M4 19v-5h5"/>',
  link: '<path d="M10 13a4 4 0 0 0 5.7 0l2.6-2.6a4 4 0 0 0-5.7-5.7L11.2 6"/><path d="M14 11a4 4 0 0 0-5.7 0l-2.6 2.6a4 4 0 0 0 5.7 5.7L12.8 18"/>',
};
function iconSvg(name, cls) {
  const p = ICONS[name] || "";
  return `<svg class="icn${cls ? " " + cls : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
}

/* ============================================================
   STATE — settings and reading progress, in this browser only.
   ============================================================ */
const LS_KEY = "pf2ePrimer.v1";
let state = loadState();

function defaultState() {
  return { settings: { themeMode: "auto", custom: null, gm: false }, done: {} };
}
function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY));
    if (!raw || typeof raw !== "object") return defaultState();
    const d = defaultState();
    return {
      settings: Object.assign(d.settings, raw.settings || {}),
      done: raw.done && typeof raw.done === "object" ? raw.done : {},
    };
  } catch (e) { return defaultState(); }
}
let _storageWarned = false;
function saveState() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); }
  catch (e) { if (!_storageWarned) { _storageWarned = true; toast("Couldn't save progress in this browser"); } }
}
function gmMode() { return !!state.settings.gm; }
function setGmMode(on) {
  state.settings.gm = !!on; saveState();
  document.body.classList.toggle("gmon", gmMode());
  renderHeader(); renderAll();
  toast(gmMode() ? "GM mode on — table notes shown" : "GM mode off");
}
function toggleGmMode() { setGmMode(!gmMode()); }

/* ============================================================
   SMALL HELPERS
   ============================================================ */
function sign(n) { n = Number(n) || 0; return (n >= 0 ? "+" : "") + n; }
function escapeHtml(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function textToHtml(s) { return escapeHtml(s).replace(/\n/g, "<br>"); }
function titleCase(s) { s = String(s || ""); return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""; }
/* Skill keys are lower-case ("sailing lore"); every word gets a capital. */
function skillLabel(s) { return String(s || "").replace(/(^|\s)([a-z])/g, (m, sp, c) => sp + c.toUpperCase()); }
function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
function byId(id) { return document.getElementById(id); }
function setHTML(id, html) { const el = byId(id); if (el) el.innerHTML = html; }

/* ============================================================
   DICE & DEGREES OF SUCCESS — the one mechanic, in code.
   ============================================================ */
function d20() { return 1 + Math.floor(Math.random() * 20); }
function dN(n) { return 1 + Math.floor(Math.random() * n); }

/* 0 critical failure · 1 failure · 2 success · 3 critical success */
const DEG_LABEL = ["Critical failure", "Failure", "Success", "Critical success"];
const DEG_CLASS = ["cfail", "fail", "succ", "csucc"];

/* The whole resolution rule: ten over or ten under moves a step,
   then a natural 20 or 1 moves one more. */
function degreeOf(total, dc, nat) {
  let step = total >= dc + 10 ? 3 : total >= dc ? 2 : total <= dc - 10 ? 0 : 1;
  if (nat === 20) step = Math.min(3, step + 1);
  else if (nat === 1) step = Math.max(0, step - 1);
  return step;
}
/* Why it came out that way, in words — the point of the whole demo. */
function degreeReason(total, dc, nat) {
  const base = total >= dc + 10 ? 3 : total >= dc ? 2 : total <= dc - 10 ? 0 : 1;
  const by = total - dc;
  let why;
  if (base === 3) why = `beat DC ${dc} by ${by} — ten or more over is a critical success`;
  else if (base === 2) why = `beat DC ${dc} by ${by}`;
  else if (base === 1) why = `missed DC ${dc} by ${Math.abs(by)}`;
  else why = `missed DC ${dc} by ${Math.abs(by)} — ten or more under is a critical failure`;
  if (nat === 20 && base < 3) why += `; natural 20 moves it one step better`;
  else if (nat === 20) why += `; already a critical success, the natural 20 adds nothing`;
  else if (nat === 1 && base > 0) why += `; natural 1 moves it one step worse`;
  else if (nat === 1) why += `; already a critical failure, the natural 1 adds nothing`;
  return why;
}
function rollCheck(mod, dc) {
  const nat = d20(), total = nat + mod;
  const deg = degreeOf(total, dc, nat);
  return { nat, mod, total, dc, deg, why: degreeReason(total, dc, nat) };
}
/* "1d8+4" / "2d6" -> {total, detail} */
function rollDamage(expr, bonusDmg) {
  const m = /^(\d+)d(\d+)\s*([+-]\s*\d+)?$/.exec(String(expr).trim());
  if (!m) return { total: 0, detail: expr };
  const n = Number(m[1]), faces = Number(m[2]);
  const flat = m[3] ? Number(m[3].replace(/\s+/g, "")) : 0;
  const extra = Number(bonusDmg) || 0;
  const dice = []; let sum = 0;
  for (let i = 0; i < n; i++) { const r = dN(faces); dice.push(r); sum += r; }
  const total = sum + flat + extra;
  const parts = [`${n}d${faces} (${dice.join("+")})`];
  if (flat) parts.push(sign(flat).replace("+", "+ ").replace("-", "− "));
  if (extra) parts.push(`+ ${extra} status`);
  return { total, detail: `${parts.join(" ")} = ${total}` };
}
function degChip(deg) { return `<span class="deg ${DEG_CLASS[deg]}">${DEG_LABEL[deg]}</span>`; }
function natSpan(nat) {
  const cls = nat === 20 ? "nat nat20" : nat === 1 ? "nat nat1" : "nat";
  return `<span class="${cls}">${nat}</span>`;
}

/* ============================================================
   NAVIGATION
   ============================================================ */
const VIEWS = CHAPTERS.map((c) => c.key);
let _view = VIEWS[0];

function go(key) {
  if (key === "menu") return openMenu();
  if (VIEWS.indexOf(key) === -1) key = VIEWS[0];
  _view = key;
  byId("view-menu").classList.add("hide");
  VIEWS.forEach((k) => {
    byId("view-" + k).classList.toggle("hide", k !== key);
    const b = byId("nav-" + k); if (b) b.classList.toggle("on", k === key);
  });
  render(key);
  window.scrollTo(0, 0);
}
function currentView() { return byId("view-menu").classList.contains("hide") ? _view : "menu"; }
function render(key) {
  const ch = CHAPTERS.find((c) => c.key === key);
  if (ch) setHTML("view-" + key, chapterHTML(ch));
  mountDemos(key);
}
function renderAll() { renderHeader(); const v = currentView(); if (v === "menu") renderMenu(); else render(v); }
function openMenu() {
  VIEWS.forEach((k) => byId("view-" + k).classList.add("hide"));
  byId("view-menu").classList.remove("hide");
  renderMenu(); window.scrollTo(0, 0);
}
function closeMenu() { go(_view); }
let _toastTimer = null;
function toast(msg) {
  const t = byId("toast"); if (!t) return;
  t.textContent = msg; t.classList.add("show");
  clearTimeout(_toastTimer); _toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
}
function renderHeader() {
  const done = CHAPTERS.filter((c) => state.done[c.key]).length;
  const pct = Math.round((done / CHAPTERS.length) * 100);
  setHTML("progressBar", `<span style="width:${pct}%"></span>`);
  const sub = byId("headSub");
  if (sub) sub.innerHTML = gmMode()
    ? `<b>GM mode</b> — table notes are showing · ${done}/${CHAPTERS.length} tabs read`
    : `Pathfinder 2e (Remaster), for people who've played something else · ${done}/${CHAPTERS.length} tabs read`;
  const gb = byId("gmBtn");
  if (gb) { gb.classList.toggle("on", gmMode()); gb.title = gmMode() ? "GM mode on" : "GM mode off"; }
}

/* ============================================================
   CHAPTER RENDERING
   ============================================================ */
function chapterHTML(ch) {
  const body = ch.sections.map((s) => sectionHTML(s, ch)).join("");
  const idx = VIEWS.indexOf(ch.key);
  const next = CHAPTERS[idx + 1];
  const isDone = !!state.done[ch.key];
  const foot = `
    <div class="chapfoot">
      <button class="btn ${isDone ? "secondary" : ""}" onclick="markRead('${ch.key}')">
        ${iconSvg(isDone ? "check" : "check")} ${isDone ? "Read" : "Got it"}${next ? " — on to " + escapeHtml(next.label) : ""}
      </button>
      ${next ? `<p class="meta center">Next: <b>${escapeHtml(next.title)}</b></p>` : `<p class="meta center">That's the lot. Go and play.</p>`}
    </div>`;
  return `
    <div class="chaphead">
      <h1>${iconSvg(ch.icon)} ${escapeHtml(ch.title)}</h1>
      <p class="lede">${escapeHtml(ch.lede)}</p>
    </div>
    ${body}${foot}`;
}
function markRead(key) {
  state.done[key] = true; saveState(); renderHeader();
  const idx = VIEWS.indexOf(key);
  const next = CHAPTERS[idx + 1];
  if (next) go(next.key); else { render(key); toast("Primer finished"); }
}

function sectionHTML(s, ch) {
  switch (s.type) {
    case "prose": return proseHTML(s);
    case "note": return noteHTML(s);
    case "bridge": return bridgeHTML(s);
    case "map": return mapHTML(s);
    case "cards": return cardsHTML(s);
    case "steps": return stepsHTML(s);
    case "demo": return demoShellHTML(s);
    case "ref": return refHTML(s);
    case "gm": return gmHTML(s);
    case "links": return linksHTML();
    case "quickcard": return quickCardHTML();
    case "glossary": return glossaryHTML(s);
    case "browser": return browserShellHTML();
    case "pregens": return pregensHTML(s);
    case "reactions": return annotatedRefHTML(s, REACTIONS);
    case "stops": return annotatedRefHTML(s, EXPLORATION_STOPS);
    default: return "";
  }
}
function h2(s) { return s.h ? `<h2>${escapeHtml(s.h)}</h2>` : ""; }
function proseHTML(s) {
  return `<section class="sec">${h2(s)}${(s.p || []).map((p) => `<p>${p}</p>`).join("")}</section>`;
}
function noteHTML(s) {
  return `<aside class="callout ${s.tone === "warn" ? "warn" : "tip"}">${(s.p || []).map((p) => `<p>${p}</p>`).join("")}</aside>`;
}
function bridgeHTML(s) {
  const rows = BRIDGE.map(([a, b]) => `
    <div class="brow">
      <div class="bfrom">${escapeHtml(a)}</div>
      <div class="barrow">${iconSvg("arrow")}</div>
      <div class="bto">${b}</div>
    </div>`).join("");
  return `<section class="sec">${h2(s)}<div class="bridge">${rows}</div></section>`;
}
function mapHTML(s) {
  const cols = [
    { pillar: "Fighting", mode: "Encounter mode", grain: "6-second rounds", note: "Initiative, three actions a turn, a grid if you like one.", tab: "fight" },
    { pillar: "Exploring", mode: "Exploration mode", grain: "minutes & hours", note: "Activities instead of actions. The GM rolls some of your dice.", tab: "explore" },
    { pillar: "Talking", mode: "any mode", grain: "however long it takes", note: "No gear of its own — a parley mid-fight is still encounter mode.", tab: "talk" },
  ];
  return `<section class="sec">${h2(s)}
    <div class="pmap">
      ${cols.map((c) => `
        <button class="pcol" onclick="go('${c.tab}')">
          <span class="ppillar">${escapeHtml(c.pillar)}</span>
          <span class="pmode">${escapeHtml(c.mode)}</span>
          <span class="pgrain">${escapeHtml(c.grain)}</span>
          <span class="pnote">${escapeHtml(c.note)}</span>
        </button>`).join("")}
    </div>
    <button class="pcol wide" onclick="go('ashore')">
      <span class="ppillar">Everything else</span>
      <span class="pmode">Downtime mode</span>
      <span class="pgrain">days &amp; weeks</span>
      <span class="pnote">The gear your last game probably didn't have: earning a living, crafting, and un-picking a build you regret.</span>
    </button>
  </section>`;
}
function cardsHTML(s) {
  return `<section class="sec">${h2(s)}
    <div class="cardgrid">
      ${(s.items || []).map((i) => `<div class="ccard"><h3>${i.h}</h3><p>${i.p}</p></div>`).join("")}
    </div></section>`;
}
function stepsHTML(s) {
  return `<section class="sec">${h2(s)}
    <ol class="steps">${(s.items || []).map((i) => `<li>${i}</li>`).join("")}</ol></section>`;
}
function gmHTML(s) {
  return `<section class="sec gmsec">
    <div class="gmhead">${iconSvg("eye")} ${escapeHtml(s.h || "At the table")}</div>
    ${(s.p || []).map((p) => `<p>${p}</p>`).join("")}
  </section>`;
}
function linksHTML() {
  /* Relative on purpose. On GitHub Pages this page is /pf2eprimer/, so "../pf2epartytracker/"
     lands on the sibling; self-hosted in the PF2e Toolbox the same path is redirected to
     /tracker/. Absolute GitHub URLs would send someone reading this offline, on a boat,
     out to the internet for a tool sitting on the same server. */
  const tools = [
    { name: "PF2e Party Tracker", url: "../pf2epartytracker/",
      note: "GM-side: everyone's passive DCs on one screen, secret checks rolled for the whole party at once, and the exploration activity board from this tab." },
    { name: "PF2e Spellbook", url: "../pf2espellcards/",
      note: "Player-side: prepare the day's spells, track castings and focus points, and see what a spell actually does at the rank you're casting it." },
  ];
  return `<section class="sec">
    <h2>The other two tools</h2>
    <p class="meta">Same idea as this page — one file, works offline, nothing leaves your device.</p>
    ${tools.map((t) => `
      <a class="toolcard" href="${t.url}" target="_blank" rel="noopener">
        <span class="tname">${iconSvg("link")} ${escapeHtml(t.name)}</span>
        <span class="tnote">${escapeHtml(t.note)}</span>
      </a>`).join("")}
  </section>`;
}

/* ---- The two pregens, with the arithmetic left in ---- */
function pregensHTML(s) {
  return `<section class="sec">${h2(s)}
    <div class="cardgrid">${PREGENS.map((pc) => {
      const topSkills = Object.keys(pc.skills).slice(0, 4)
        .map((k) => `${skillLabel(k)} ${sign(pc.skills[k])}`).join(" · ");
      return `<div class="ccard pcard">
        <h3>${escapeHtml(pc.name)}</h3>
        <p class="meta">Level ${pc.level} ${escapeHtml(pc.ancestry)} ${escapeHtml(pc.cls)} — ${escapeHtml(pc.tag)}</p>
        <p>${escapeHtml(pc.blurb)}</p>
        <div class="statrow">
          <span class="statbox"><b>${pc.hp}</b><span>HP</span></span>
          <span class="statbox"><b>${pc.ac}</b><span>AC</span></span>
          <span class="statbox"><b>${sign(pc.perception)}</b><span>Perception</span></span>
          <span class="statbox"><b>${sign(pc.saves.fortitude)}/${sign(pc.saves.reflex)}/${sign(pc.saves.will)}</b><span>Fort / Ref / Will</span></span>
        </div>
        <p class="meta">${escapeHtml(topSkills)}${pc.spellDC ? ` · spell DC ${pc.spellDC}` : ""}</p>
        <p class="meta"><b>AC ${pc.ac}</b> = ${escapeHtml(pc.acNote)}. <b>HP ${pc.hp}</b> = ${pc.hpParts.ancestry} ancestry + ${pc.hpParts.cls} class + ${pc.hpParts.con} Constitution.</p>
        <p class="meta">${escapeHtml(pc.build)}</p>
      </div>`;
    }).join("")}</div>
    <p class="meta">Made up for this page, and legal level-1 builds. Every modifier on them is ability + proficiency, and proficiency is your level plus the rank bonus.</p>
  </section>`;
}

/* ---- Rules text pulled straight from the Foundry-derived data ---- */
function refHTML(s) {
  const items = (s.slugs || []).map((slug) => {
    const isCond = s.kind === "condition";
    const rec = isCond ? CONDITION_BY_SLUG[slug] : ACTION_BY_SLUG[slug];
    if (!rec) return "";
    const kind = isCond ? (rec.valued ? "condition · has a value" : "condition") : actionCost(rec);
    return `<details class="ref">
      <summary><span class="refname">${escapeHtml(rec.name)}</span><span class="refkind">${escapeHtml(kind)}</span></summary>
      <div class="refbody">${textToHtml(rec.description)}</div>
    </details>`;
  }).join("");
  return `<section class="sec">${h2(s)}${s.p ? `<p class="meta">${s.p}</p>` : ""}${items}</section>`;
}
/* A ref list where each entry carries our own one-line note above the
   book's text — used for the reaction and "party has stopped" lists. */
function annotatedRefHTML(s, list) {
  const items = list.map((entry) => {
    const rec = ACTION_BY_SLUG[entry.slug];
    if (!rec) return "";
    return `<details class="ref">
      <summary>
        <span class="refname">${escapeHtml(entry.label)} <span class="refnote">${escapeHtml(entry.note)}</span></span>
        <span class="refkind">${escapeHtml(actionCost(rec))}</span>
      </summary>
      <div class="refbody">${textToHtml(rec.description)}</div>
    </details>`;
  }).join("");
  return `<section class="sec">${h2(s)}${s.p ? `<p class="meta">${s.p}</p>` : ""}${items}</section>`;
}
function actionCost(a) {
  const n = a.actions;
  if (a.actionType === "reaction") return "⤳ reaction";
  if (a.actionType === "free") return "◇ free";
  if (n === 1) return "◆ 1 action";
  if (n === 2) return "◆◆ 2 actions";
  if (n === 3) return "◆◆◆ 3 actions";
  if (a.traits && a.traits.indexOf("downtime") !== -1) return "downtime activity";
  if (a.exploration) return "exploration activity";
  return "activity";
}

/* ============================================================
   QUICK CARD & GLOSSARY
   ============================================================ */
function quickCardHTML() {
  return `<section class="sec">
    <h2>The quick card</h2>
    <div class="qcard">
      <div class="qbox">
        <h3>Every roll</h3>
        <p class="big">d20 + modifier vs DC</p>
        <ul>
          <li><b>Beat it by 10+</b> → critical success</li>
          <li><b>Meet or beat it</b> → success</li>
          <li><b>Miss by 1–9</b> → failure</li>
          <li><b>Miss by 10+</b> → critical failure</li>
          <li>Natural <b>20</b> moves one step better, natural <b>1</b> one step worse</li>
        </ul>
      </div>
      <div class="qbox">
        <h3>Your turn</h3>
        <p class="big">◆ ◆ ◆ &nbsp;+&nbsp; ⤳</p>
        <ul>
          <li>Three actions, any mix, any order</li>
          <li>One reaction, on someone else's turn</li>
          <li>2nd attack <b>−5</b>, 3rd <b>−10</b> (agile <b>−4 / −8</b>)</li>
          <li>The penalty resets at the start of your turn</li>
          <li>Trip, Grapple, Shove and spell attacks are attacks too</li>
        </ul>
      </div>
      <div class="qbox">
        <h3>Modifiers</h3>
        <p class="big">ability + level + rank</p>
        <ul>
          <li>Trained <b>+2</b> · expert <b>+4</b> · master <b>+6</b> · legendary <b>+8</b></li>
          <li>Untrained adds <b>nothing</b> — not even your level</li>
          <li>Any modifier becomes a DC by adding <b>10</b></li>
          <li>Circumstance / status / item: same type doesn't stack</li>
        </ul>
      </div>
      <div class="qbox">
        <h3>Going down</h3>
        <p class="big">dying 1 → 4 = dead</p>
        <ul>
          <li>0 HP: <b>dying 1</b> (dying 2 from a critical hit)</li>
          <li>Start of your turn: flat check vs <b>DC 10 + dying</b></li>
          <li>Success −1 dying, critical success −2, failure +1, critical failure +2</li>
          <li>Shaking it off gives you <b>wounded 1</b> — it adds to your next dying value</li>
          <li>Spend <b>all</b> your hero points to escape death</li>
        </ul>
      </div>
    </div>
  </section>`;
}
function glossaryHTML(s) {
  return `<section class="sec">${h2(s)}
    <dl class="gloss">${GLOSSARY.map(([t, d]) => `<dt>${escapeHtml(t)}</dt><dd>${escapeHtml(d)}</dd>`).join("")}</dl>
  </section>`;
}

/* ============================================================
   RULES BROWSER — every condition and action in the bundle.
   ============================================================ */
let _browseFilter = "all";
function browserShellHTML() {
  return `<section class="sec">
    <h2>Look something up</h2>
    <p class="meta">${CONDITIONS.length} conditions and ${ACTIONS.length} actions — basic, skill, exploration and downtime — in Paizo's own words.</p>
    <div class="searchbar">${iconSvg("search")}<input type="search" id="browseQ" placeholder="frightened, demoralize, treat wounds…" oninput="renderBrowseList()"></div>
    <div class="chips" id="browseChips"></div>
    <div id="browseList"></div>
  </section>`;
}
const BROWSE_FILTERS = [
  { key: "all", label: "Everything" },
  { key: "condition", label: "Conditions" },
  { key: "basic", label: "Basic actions" },
  { key: "skill", label: "Skill actions" },
  { key: "exploration", label: "Exploration" },
  { key: "downtime", label: "Downtime" },
];
function setBrowseFilter(k) { _browseFilter = k; renderBrowseChips(); renderBrowseList(); }
function renderBrowseChips() {
  setHTML("browseChips", BROWSE_FILTERS.map((f) =>
    `<button class="chip${_browseFilter === f.key ? " on" : ""}" onclick="setBrowseFilter('${f.key}')">${escapeHtml(f.label)}</button>`).join(""));
}
function browseMatches() {
  const q = ((byId("browseQ") || {}).value || "").trim().toLowerCase();
  const hit = (name, desc) => !q || name.toLowerCase().indexOf(q) !== -1 || desc.toLowerCase().indexOf(q) !== -1;
  const out = [];
  if (_browseFilter === "all" || _browseFilter === "condition") {
    CONDITIONS.forEach((c) => { if (hit(c.name, c.description)) out.push({ name: c.name, kind: c.valued ? "condition · has a value" : "condition", desc: c.description, sort: 0 }); });
  }
  ACTIONS.forEach((a) => {
    const t = a.traits || [];
    const isDown = t.indexOf("downtime") !== -1;
    const isExp = !!a.exploration;
    const cat = a.category || "";
    let bucket = "skill";
    if (isDown) bucket = "downtime";
    else if (isExp) bucket = "exploration";
    else if (cat === "basic" || cat === "interaction" || cat === "defensive" || cat === "offensive") bucket = "basic";
    if (_browseFilter !== "all" && _browseFilter !== bucket) return;
    if (_browseFilter === "condition") return;
    if (hit(a.name, a.description)) out.push({ name: a.name, kind: actionCost(a), desc: a.description, sort: 1 });
  });
  out.sort((x, y) => x.name.localeCompare(y.name));
  return out;
}
function renderBrowseList() {
  const items = browseMatches();
  if (!items.length) { setHTML("browseList", `<p class="empty">Nothing matches that.</p>`); return; }
  setHTML("browseList", items.slice(0, 200).map((i) => `
    <details class="ref">
      <summary><span class="refname">${escapeHtml(i.name)}</span><span class="refkind">${escapeHtml(i.kind)}</span></summary>
      <div class="refbody">${textToHtml(i.desc)}</div>
    </details>`).join("")
    + (items.length > 200 ? `<p class="meta center">…and ${items.length - 200} more. Narrow the search.</p>` : ""));
}

/* ============================================================
   DEMOS — shells are rendered with the chapter, then mounted.
   ============================================================ */
function demoShellHTML(s) {
  return `<section class="sec demo">
    <div class="demohead">${iconSvg("roll")}<h2>${escapeHtml(s.h || "Try it")}</h2></div>
    ${s.p ? `<p class="meta">${escapeHtml(s.p)}</p>` : ""}
    <div id="demo-${s.id}" class="demobody"></div>
  </section>`;
}
function mountDemos(key) {
  const ch = CHAPTERS.find((c) => c.key === key);
  if (!ch) return;
  ch.sections.forEach((s) => {
    if (s.type === "demo" && DEMOS[s.id]) DEMOS[s.id]();
    if (s.type === "browser") { renderBrowseChips(); renderBrowseList(); }
  });
}

/* ---------------------------------------------------------------
   1. THE CHECK — degrees of success, with the arithmetic shown.
   --------------------------------------------------------------- */
let checkState = { who: "mari", what: null, dc: 15 };
function checkOptions(pc) {
  const out = [];
  out.push({ key: "perception", label: `Perception ${sign(pc.perception)}`, mod: pc.perception, rank: pc.perceptionRank });
  Object.keys(pc.saves).forEach((k) => out.push({ key: "save-" + k, label: `${titleCase(k)} save ${sign(pc.saves[k])}`, mod: pc.saves[k], rank: pc.saveRanks[k] }));
  Object.keys(pc.skills).forEach((k) => out.push({ key: "sk-" + k, label: `${skillLabel(k)} ${sign(pc.skills[k])}`, mod: pc.skills[k], rank: "trained" }));
  if (pc.spellAttack) out.push({ key: "spellatk", label: `Spell attack ${sign(pc.spellAttack)}`, mod: pc.spellAttack, rank: "trained" });
  out.push({ key: "untrained", label: `An untrained skill ${sign(0)}`, mod: 0, rank: "untrained" });
  return out;
}
const DC_PRESETS = [
  { label: "Simple DC 15 (trained)", dc: 15 },
  { label: `${FOE.name}'s AC 16`, dc: 16 },
  { label: `${FOE.name}'s Will DC 13`, dc: 13 },
  { label: `${FOE.name}'s Fortitude DC 17`, dc: 17 },
  { label: "A hard one: DC 20", dc: 20 },
];
const DEMOS = {};
DEMOS.check = function () {
  const host = byId("demo-check"); if (!host) return;
  const pc = PC_BY_ID[checkState.who] || PREGENS[0];
  const opts = checkOptions(pc);
  if (!checkState.what || !opts.find((o) => o.key === checkState.what)) checkState.what = opts[0].key;
  host.innerHTML = `
    <div class="controls">
      <label class="field inline"><span class="name">Who's rolling</span>
        <select onchange="checkSet('who', this.value)">
          ${PREGENS.map((p) => `<option value="${p.id}"${p.id === checkState.who ? " selected" : ""}>${escapeHtml(p.short)} — ${escapeHtml(p.ancestry)} ${escapeHtml(p.cls)}</option>`).join("")}
        </select></label>
      <label class="field inline"><span class="name">Rolling what</span>
        <select onchange="checkSet('what', this.value)">
          ${opts.map((o) => `<option value="${o.key}"${o.key === checkState.what ? " selected" : ""}>${escapeHtml(o.label)}</option>`).join("")}
        </select></label>
      <label class="field inline narrow"><span class="name">Against DC</span>
        <input type="number" id="checkDC" value="${checkState.dc}" onchange="checkSet('dc', this.value)"></label>
    </div>
    <div class="chips">${DC_PRESETS.map((p) => `<button class="chip${p.dc === checkState.dc ? " on" : ""}" onclick="checkSet('dc', ${p.dc})">${escapeHtml(p.label)}</button>`).join("")}</div>
    <div class="row tight">
      <button class="btn sm" onclick="rollTheCheck(1)">${iconSvg("d20")} Roll once</button>
      <button class="btn sm secondary" onclick="rollTheCheck(20)">Roll twenty</button>
    </div>
    <div id="checkOut" class="out"></div>`;
};
function checkSet(k, v) {
  if (k === "dc") checkState.dc = clamp(Math.round(Number(v) || 0), 1, 60);
  else checkState[k] = v;
  if (k === "who") checkState.what = null;
  DEMOS.check();
}
function rollTheCheck(times) {
  const pc = PC_BY_ID[checkState.who];
  const opt = checkOptions(pc).find((o) => o.key === checkState.what);
  const dc = checkState.dc;
  if (times === 1) {
    const r = rollCheck(opt.mod, dc);
    setHTML("checkOut", `
      <div class="resultcard ${DEG_CLASS[r.deg]}">
        <div class="rline"><span class="rmath">d20 ${natSpan(r.nat)} ${sign(r.mod)} =</span> <span class="rtotal">${r.total}</span> <span class="rmath">vs DC ${dc}</span></div>
        <div class="rdeg">${degChip(r.deg)}</div>
        <p class="rwhy">${escapeHtml(titleCase(r.why))}.</p>
        <p class="meta">${escapeHtml(pc.short)}'s ${escapeHtml(opt.label.replace(/\s[+-]\d+$/, ""))} is ${sign(opt.mod)} — ${escapeHtml(opt.rank)}${opt.rank === "untrained" ? ", so nothing is added at all, not even her level" : `, so that's the rank bonus plus level ${pc.level}`}.</p>
      </div>`);
  } else {
    const counts = [0, 0, 0, 0];
    for (let i = 0; i < times; i++) counts[rollCheck(opt.mod, dc).deg]++;
    const bars = [3, 2, 1, 0].map((d) => `
      <div class="distrow">
        <span class="dlbl">${DEG_LABEL[d]}</span>
        <span class="dbar"><span class="dfill ${DEG_CLASS[d]}" style="width:${(counts[d] / times) * 100}%"></span></span>
        <span class="dnum">${counts[d]}</span>
      </div>`).join("");
    setHTML("checkOut", `<div class="resultcard">
      <p class="meta">Twenty rolls of ${sign(opt.mod)} against DC ${dc}:</p>
      <div class="dist">${bars}</div>
      <p class="rwhy">${counts[3] ? `${counts[3]} critical success${counts[3] === 1 ? "" : "es"} out of twenty — nobody rolled a 20 for most of those. Criticals come from beating the DC by ten.` : `No criticals that time. Drop the DC by five and roll again.`}</p>
    </div>`);
  }
}

/* ---------------------------------------------------------------
   2. THE TURN — three actions, the multiple attack penalty, and
   what debuffs do to a target's numbers.
   --------------------------------------------------------------- */
let turnState = { who: "mari", picks: [] };
function turnSpent() { return turnState.picks.reduce((n, a) => n + a.cost, 0); }
DEMOS.turn = function () {
  const host = byId("demo-turn"); if (!host) return;
  const pc = PC_BY_ID[turnState.who];
  const palette = TURN_ACTIONS[turnState.who] || [];
  const spent = turnSpent(), left = 3 - spent;
  const pips = [0, 1, 2].map((i) => {
    let label = "", used = false, k = 0;
    turnState.picks.forEach((a) => { if (i >= k && i < k + a.cost) { label = a.label; used = true; } k += a.cost; });
    return `<div class="pip${used ? " used" : ""}">${used ? `<span class="pipname">${escapeHtml(label)}</span>` : `<span class="pipname empty">◆ free</span>`}</div>`;
  }).join("");
  /* Live MAP preview, so the penalty is visible before it bites. */
  let attacks = 0;
  turnState.picks.forEach((a) => { if (a.attack) attacks++; });
  host.innerHTML = `
    <div class="controls">
      <label class="field inline"><span class="name">Whose turn</span>
        <select onchange="turnSet(this.value)">
          ${PREGENS.map((p) => `<option value="${p.id}"${p.id === turnState.who ? " selected" : ""}>${escapeHtml(p.short)} — ${escapeHtml(p.cls)}</option>`).join("")}
        </select></label>
      <div class="foecard">
        <b>${escapeHtml(FOE.name)}</b>
        <span class="meta">AC ${FOE.ac} · HP ${FOE.hp} · Fort DC ${10 + FOE.saves.fortitude} · Ref DC ${10 + FOE.saves.reflex} · Will DC ${10 + FOE.saves.will} · Perception DC ${10 + FOE.perception}</span>
      </div>
    </div>
    <div class="pips">${pips}<div class="pip react"><span class="pipname empty">⤳ reaction</span></div></div>
    <p class="meta">${left ? `${left} action${left === 1 ? "" : "s"} left.` : "Turn full."} ${attacks ? `Next attack takes <b>${mapPenaltyLabel(attacks)}</b>.` : "No attacks yet — the first one is at full value."}</p>
    <div class="palette">
      ${palette.map((a, i) => {
        const dis = a.cost > left;
        return `<button class="pbtn k-${a.kind}${dis ? " dis" : ""}" ${dis ? "disabled" : ""} onclick="turnPick(${i})">
          <span class="pcost">${"◆".repeat(a.cost)}</span>
          <span class="plabel">${escapeHtml(a.label)}</span>
          ${a.attack && !dis ? `<span class="pmap">${attacks ? mapPenaltyLabel(attacks, a.agile) : "full"}</span>` : ""}
        </button>`;
      }).join("")}
    </div>
    <div class="row tight">
      <button class="btn sm" onclick="runTurn()" ${turnState.picks.length ? "" : "disabled"}>${iconSvg("d20")} Run the turn</button>
      <button class="btn sm secondary" onclick="turnClear()">${iconSvg("reset")} Clear</button>
    </div>
    <div id="turnOut" class="out"></div>
    ${turnState.picks.length && turnState.picks[turnState.picks.length - 1].hint
      ? `<p class="hintline">${iconSvg("star")} ${escapeHtml(turnState.picks[turnState.picks.length - 1].hint)}</p>` : ""}`;
};
function mapPenalty(nAttacks, agile) {
  if (nAttacks <= 0) return 0;
  if (nAttacks === 1) return agile ? -4 : -5;
  return agile ? -8 : -10;
}
function mapPenaltyLabel(nAttacks, agile) { const p = mapPenalty(nAttacks, agile); return p ? `${p}` : "full"; }
function turnSet(who) { turnState.who = who; turnState.picks = []; setHTML("turnOut", ""); DEMOS.turn(); }
function turnPick(i) {
  const a = (TURN_ACTIONS[turnState.who] || [])[i];
  if (!a || a.cost > 3 - turnSpent()) return;
  turnState.picks.push(a); setHTML("turnOut", ""); DEMOS.turn();
}
function turnClear() { turnState.picks = []; setHTML("turnOut", ""); DEMOS.turn(); }

function runTurn() {
  const pc = PC_BY_ID[turnState.who];
  /* The foe's live state — this is the whole point of the demo: watch
     the numbers you're rolling against move as the turn goes on. */
  const foe = { frightened: 0, prone: false, grabbed: false, offGuardTo: false, hp: FOE.hp };
  let attacks = 0, anthem = 0, dmgTotal = 0;
  const log = [];
  const foeAC = () => FOE.ac - foe.frightened - (foe.prone || foe.offGuardTo ? 2 : 0);
  const foeDC = (save) => 10 + FOE.saves[save] - foe.frightened;
  const acNote = () => {
    const bits = [];
    if (foe.frightened) bits.push(`−${foe.frightened} frightened (status)`);
    if (foe.prone) bits.push("−2 prone/off-guard (circumstance)");
    else if (foe.offGuardTo) bits.push("−2 off-guard (circumstance)");
    return bits.length ? ` (AC ${FOE.ac} ${bits.join(" ")} = ${foeAC()})` : "";
  };

  turnState.picks.forEach((a) => {
    /* --- attack rolls: Strikes and spell attacks --- */
    if (a.attack && a.bonus != null) {
      const pen = mapPenalty(attacks, a.agile);
      const mod = a.bonus + pen + anthem;
      const dc = foeAC();
      const r = rollCheck(mod, dc);
      attacks++;
      const bits = [`${sign(a.bonus)} base`];
      if (pen) bits.push(`${pen} multiple attack penalty`);
      if (anthem) bits.push(`+${anthem} status (Courageous Anthem)`);
      if (r.deg >= 2) {
        const dmg = rollDamage(a.dmg, anthem);
        const dealt = r.deg === 3 ? dmg.total * 2 : dmg.total;
        dmgTotal += dealt;
        log.push({ deg: r.deg, head: a.label,
          math: `d20 ${natSpan(r.nat)} ${sign(mod)} = ${r.total} vs AC ${dc}${acNote()}`,
          detail: `${bits.join(", ")}. Damage ${dmg.detail}${r.deg === 3 ? ` — <b>doubled for the critical hit: ${dealt}</b>` : ""}. ${escapeHtml(a.dtype)}.`,
          why: r.why });
      } else {
        log.push({ deg: r.deg, head: a.label,
          math: `d20 ${natSpan(r.nat)} ${sign(mod)} = ${r.total} vs AC ${dc}${acNote()}`,
          detail: `${bits.join(", ")}. No damage.`, why: r.why });
      }
      return;
    }
    /* --- skill checks against one of the foe's DCs --- */
    if (a.check) {
      const pen = a.attack ? mapPenalty(attacks, false) : 0;
      const mod = a.check.bonus + pen;
      const dc = a.check.vs === "perception" ? 10 + FOE.perception - foe.frightened : foeDC(a.check.vs);
      const r = rollCheck(mod, dc);
      if (a.attack) attacks++;
      let outcome = "";
      if (a.effect === "demoralize") {
        if (r.deg === 3) { foe.frightened = Math.max(foe.frightened, 2); outcome = `${FOE.name} is <b>frightened 2</b> — every check and DC it has drops by 2, including its AC.`; }
        else if (r.deg === 2) { foe.frightened = Math.max(foe.frightened, 1); outcome = `${FOE.name} is <b>frightened 1</b> — that's −1 to its AC as well as its rolls.`; }
        else outcome = "No effect — and it's immune to your Demoralize for ten minutes either way.";
      } else if (a.effect === "trip") {
        if (r.deg === 3) { foe.prone = true; const d = rollDamage("1d6"); dmgTotal += d.total; outcome = `Knocked <b>prone</b> and takes ${d.detail} bludgeoning.`; }
        else if (r.deg === 2) { foe.prone = true; outcome = "Knocked <b>prone</b> — that's off-guard, so −2 to its AC until it stands, and standing costs it an action."; }
        else if (r.deg === 0) outcome = "You lose your footing and fall prone yourself.";
        else outcome = "It keeps its feet.";
      } else if (a.effect === "grapple") {
        if (r.deg === 3) { foe.grabbed = true; outcome = "<b>Restrained</b> until the end of your next turn."; }
        else if (r.deg === 2) { foe.grabbed = true; outcome = "<b>Grabbed</b> until the end of your next turn."; }
        else if (r.deg === 0) outcome = "It reverses the grip — you're the one who's grabbed.";
        else outcome = "It shrugs you off.";
      } else if (a.effect === "feint") {
        if (r.deg === 3) { foe.offGuardTo = true; outcome = "<b>Off-guard</b> to your melee attacks until the end of your next turn."; }
        else if (r.deg === 2) { foe.offGuardTo = true; outcome = "<b>Off-guard</b> against your next melee attack this turn."; }
        else if (r.deg === 0) outcome = "It reads you completely — you're off-guard to it instead.";
        else outcome = "It doesn't buy it.";
      }
      log.push({ deg: r.deg, head: a.label,
        math: `${a.check.skill} d20 ${natSpan(r.nat)} ${sign(mod)} = ${r.total} vs DC ${dc}${pen ? ` (includes ${pen} multiple attack penalty)` : ""}`,
        detail: outcome, why: r.why });
      return;
    }
    /* --- saves the target rolls against your spell DC --- */
    if (a.save) {
      const dc = a.save.dc;
      const mod = FOE.saves.will - foe.frightened;
      const nat = d20(), total = nat + mod;
      const deg = degreeOf(total, dc, nat);
      /* The target's degree is what happened to it, so a good save is bad news for you. */
      let outcome = "";
      if (a.effect === "fear") {
        if (deg === 3) outcome = "Unaffected — it critically succeeded on its save.";
        else if (deg === 2) { foe.frightened = Math.max(foe.frightened, 1); outcome = "It saved, but it's still <b>frightened 1</b>. Even a success usually leaves something behind."; }
        else if (deg === 1) { foe.frightened = Math.max(foe.frightened, 2); outcome = "<b>Frightened 2</b> — −2 to everything it rolls and every DC it has."; }
        else { foe.frightened = Math.max(foe.frightened, 3); outcome = "<b>Frightened 3 and fleeing</b> for a round. It runs."; }
      }
      log.push({ deg: 3 - deg, head: a.label,
        math: `${FOE.name} rolls Will: d20 ${natSpan(nat)} ${sign(mod)} = ${total} vs your spell DC ${dc}${foe.frightened ? " (its modifier already includes being frightened)" : ""}`,
        detail: outcome, why: degreeReason(total, dc, nat) + " — for the target", saveRoll: true, targetDeg: deg });
      return;
    }
    /* --- everything else: effects and flavour --- */
    if (a.effect === "anthem") {
      anthem = 1;
      log.push({ deg: 2, head: a.label, math: "No roll", detail: "You and every ally in earshot get <b>+1 status to attack rolls, damage rolls and saves against fear</b> for the round. One action, and it makes both of your attacks better.", why: "" });
    } else if (a.effect === "raise") {
      log.push({ deg: 2, head: a.label, math: "No roll", detail: `Your AC goes from ${pc.ac} to <b>${pc.ac + pc.shieldBonus}</b> until the start of your next turn — a +${pc.shieldBonus} circumstance bonus.`, why: "" });
    } else if (a.effect === "soothe") {
      const h = rollDamage("1d10+4");
      log.push({ deg: 2, head: a.label, math: "No roll to hit — healing just lands", detail: `Restores ${h.detail} Hit Points and gives +2 status to saves against mental effects for a minute.`, why: "" });
    } else if (a.effect === "seek") {
      log.push({ deg: 2, head: a.label, math: "The GM rolls this one in secret", detail: "Perception against the Stealth DC of anything hiding. You'll be told what you find, not what you rolled.", why: "" });
    } else {
      log.push({ deg: 2, head: a.label, math: "No roll", detail: a.hint || "Spent an action.", why: "" });
    }
  });

  const state2 = [];
  if (foe.frightened) state2.push(`frightened ${foe.frightened}`);
  if (foe.prone) state2.push("prone");
  if (foe.grabbed) state2.push("grabbed");
  if (foe.offGuardTo) state2.push("off-guard to you");
  setHTML("turnOut", `
    <ol class="turnlog">
      ${log.map((l) => `
        <li class="tstep ${DEG_CLASS[l.deg]}">
          <div class="tshead">${escapeHtml(l.head)} ${l.math !== "No roll" && !l.saveRoll ? degChip(l.deg) : l.saveRoll ? `<span class="deg ${DEG_CLASS[l.targetDeg]}">target: ${DEG_LABEL[l.targetDeg].toLowerCase()}</span>` : ""}</div>
          <div class="tsmath">${l.math}</div>
          ${l.why ? `<div class="tswhy">${escapeHtml(titleCase(l.why))}.</div>` : ""}
          ${l.detail ? `<div class="tsdetail">${l.detail}</div>` : ""}
        </li>`).join("")}
    </ol>
    <div class="turnsum">
      <b>${dmgTotal}</b> damage to a ${FOE.hp}-hit-point enemy${state2.length ? `, and it's now <b>${escapeHtml(state2.join(", "))}</b>` : ""}.
      ${dmgTotal >= FOE.hp ? " That's it down." : ""}
      <span class="meta">Your multiple attack penalty resets at the start of your next turn.</span>
    </div>`);
}

/* ---------------------------------------------------------------
   3. GOING DOWN — dying, recovery checks, wounded, hero points.
   --------------------------------------------------------------- */
let dyingState = null;
function freshDying() { const pc = PC_BY_ID.mari; return { hp: pc.hp, max: pc.hp, dying: 0, wounded: 0, hero: 1, log: [] }; }
DEMOS.dying = function () {
  const host = byId("demo-dying"); if (!host) return;
  if (!dyingState) dyingState = freshDying();
  const s = dyingState, pc = PC_BY_ID.mari;
  const dead = s.dying >= 4;
  const pct = (s.hp / s.max) * 100;
  host.innerHTML = `
    <div class="dywrap">
      <div class="dyhead">
        <b>${escapeHtml(pc.short)}</b>
        <span class="hpbar"><span class="hpfill ${pct > 50 ? "" : pct > 0 ? "mid" : "low"}" style="width:${pct}%"></span></span>
        <span class="hpnum">${s.hp} / ${s.max}</span>
      </div>
      <div class="dychips">
        <span class="statchip${s.dying ? " bad" : ""}">dying ${s.dying}</span>
        <span class="statchip${s.wounded ? " warn" : ""}">wounded ${s.wounded}</span>
        <span class="statchip${s.hero ? " good" : ""}">${s.hero} hero point${s.hero === 1 ? "" : "s"}</span>
        ${dead ? `<span class="statchip bad">dead</span>` : s.dying ? `<span class="statchip bad">unconscious</span>` : ""}
      </div>
      <div class="palette">
        <button class="pbtn k-attack" onclick="dyingHit(12)" ${dead ? "disabled" : ""}><span class="plabel">Take a 12-damage hit</span></button>
        <button class="pbtn k-attack" onclick="dyingHit(25, true)" ${dead ? "disabled" : ""}><span class="plabel">Take a critical hit (25)</span></button>
        <button class="pbtn k-skill" onclick="dyingRecover()" ${!s.dying || dead ? "disabled" : ""}><span class="plabel">Roll a recovery check</span></button>
        <button class="pbtn k-spell" onclick="dyingHero()" ${!s.dying || !s.hero || dead ? "disabled" : ""}><span class="plabel">Spend all hero points</span></button>
        <button class="pbtn k-defend" onclick="dyingHeal()" ${dead ? "disabled" : ""}><span class="plabel">Someone casts Soothe</span></button>
        <button class="pbtn k-other" onclick="dyingReset()"><span class="plabel">Reset</span></button>
      </div>
      <ol class="turnlog">${s.log.map((l) => `<li class="tstep ${l.cls}"><div class="tsmath">${l.text}</div></li>`).join("")}</ol>
    </div>`;
};
function dyLog(text, cls) { dyingState.log.unshift({ text, cls: cls || "succ" }); DEMOS.dying(); }
function dyingHit(amount, crit) {
  const s = dyingState;
  if (s.dying) {
    s.dying += crit ? 2 : 1;
    dyLog(`Hit while already down. Dying goes up by ${crit ? "2 (it was a critical hit)" : "1"} — <b>dying ${s.dying}</b>.${s.dying >= 4 ? " That's four. She's dead." : ""}`, s.dying >= 4 ? "cfail" : "fail");
    return;
  }
  s.hp = Math.max(0, s.hp - amount);
  if (s.hp > 0) { dyLog(`Takes ${amount}. Down to <b>${s.hp}</b> hit points.`, "fail"); return; }
  const start = (crit ? 2 : 1) + s.wounded;
  s.dying = start;
  dyLog(`Dropped to 0 by ${crit ? "a critical hit" : "the hit"}. She's <b>dying ${start}</b> and unconscious`
    + (crit ? " — a critical hit starts you at dying 2" : "")
    + (s.wounded ? `, plus ${s.wounded} for already being wounded ${s.wounded}` : "") + ".", "cfail");
}
function dyingRecover() {
  const s = dyingState;
  const dc = 10 + s.dying;
  const nat = d20();
  const deg = degreeOf(nat, dc, nat); /* a flat check: no modifiers at all */
  let msg = `Recovery check — a <b>flat check</b>, no modifiers: d20 ${natSpan(nat)} vs DC ${dc} (10 + dying ${s.dying}). ${DEG_LABEL[deg]}. `;
  if (deg === 3) s.dying -= 2;
  else if (deg === 2) s.dying -= 1;
  else if (deg === 1) s.dying += 1;
  else s.dying += 2;
  if (s.dying <= 0) {
    s.dying = 0; s.wounded += 1;
    msg += `Dying is gone — but losing it always leaves you <b>wounded ${s.wounded}</b>, which gets added to the dying value next time she drops. Still at 0 hit points and unconscious until someone heals her.`;
    dyLog(msg, "succ");
  } else if (s.dying >= 4) {
    s.dying = 4;
    msg += `That's <b>dying 4</b>. She's dead.`;
    dyLog(msg, "cfail");
  } else {
    msg += `Now <b>dying ${s.dying}</b>.`;
    dyLog(msg, deg >= 2 ? "succ" : "fail");
  }
}
function dyingHero() {
  const s = dyingState;
  if (!s.hero) return;
  s.hero = 0; s.dying = 0; s.wounded += 1;
  dyLog(`Spent every hero point to cheat death: the dying condition goes away and she's stable at 0 hit points. Losing dying still leaves her <b>wounded ${s.wounded}</b>. This is why you start each session with one and why you should spend it.`, "csucc");
}
function dyingHeal() {
  const s = dyingState;
  const h = rollDamage("1d10+4");
  s.hp = Math.min(s.max, s.hp + h.total);
  const wasDying = s.dying;
  if (s.dying) s.dying = 0;
  dyLog(`Soothe restores ${h.detail} hit points — she's on <b>${s.hp}</b>.`
    + (wasDying ? ` Any hit points at all end dying and unconsciousness: she's awake, and can act normally next turn. She keeps wounded ${s.wounded}.` : ""), "csucc");
}
function dyingReset() { dyingState = freshDying(); DEMOS.dying(); }

/* ---------------------------------------------------------------
   4. EXPLORATION — everyone declares an activity.
   --------------------------------------------------------------- */
let exploreState = { mari: "search", sable: "avoid-notice", order: ["mari", "sable"] };
DEMOS.explore = function () {
  const host = byId("demo-explore"); if (!host) return;
  const rows = exploreState.order.map((id, i) => {
    const pc = PC_BY_ID[id];
    const act = EXPLORATION_ACTIVITIES.find((a) => a.slug === exploreState[id]) || EXPLORATION_ACTIVITIES[0];
    const mod = explorationMod(pc, act);
    return `<div class="exprow">
      <div class="expord">
        <button class="ordbtn" onclick="expMove(${i},-1)" ${i === 0 ? "disabled" : ""}>${iconSvg("up")}</button>
        <span class="ordnum">${i + 1}</span>
        <button class="ordbtn" onclick="expMove(${i},1)" ${i === exploreState.order.length - 1 ? "disabled" : ""}>${iconSvg("down")}</button>
      </div>
      <div class="expwho"><b>${escapeHtml(pc.short)}</b><span class="meta">${escapeHtml(pc.cls)}</span></div>
      <div class="expsel">
        <select onchange="expSet('${id}', this.value)">
          ${EXPLORATION_ACTIVITIES.map((a) => `<option value="${a.slug}"${a.slug === act.slug ? " selected" : ""}>${escapeHtml(a.label)}</option>`).join("")}
        </select>
      </div>
      <div class="expgov">${mod == null ? `<span class="meta">${escapeHtml(act.governing)}</span>` : `<b class="govmod">${sign(mod)}</b><span class="meta"> ${escapeHtml(act.governing)}</span>`}</div>
      <div class="expnote">${escapeHtml(act.blurb)}${act.secret ? ` <span class="secretchip">${iconSvg("secret")} the GM rolls this</span>` : ""}</div>
    </div>`;
  }).join("");
  const stealthy = exploreState.order.every((id) => exploreState[id] === "avoid-notice");
  const searching = exploreState.order.some((id) => exploreState[id] === "search");
  const scouting = exploreState.order.some((id) => exploreState[id] === "scout");
  const notes = [];
  notes.push(stealthy
    ? "Everyone is Avoiding Notice, so everyone rolls <b>Stealth</b> for initiative when the fight starts — and starts it hidden."
    : "Whoever is Avoiding Notice rolls <b>Stealth</b> for initiative; everyone else rolls Perception.");
  notes.push(searching
    ? "Someone is Searching, so the GM gets a secret Perception check against anything hidden in your path. That tripwire has a chance of being spotted."
    : "<b>Nobody is Searching.</b> The GM makes no check for hidden doors or traps in your path — you walk into them.");
  if (scouting) notes.push("Scouting gives the whole party <b>+1 to initiative</b>.");
  notes.push("Marching order matters: the front of the line meets whatever is in the corridor first.");
  host.innerHTML = `
    <div class="exphead">
      <div>Order</div><div>Who</div><div>Activity</div><div>Rolls</div><div>What it buys</div>
    </div>
    <div class="expboard">${rows}</div>
    <ul class="notelist">${notes.map((n) => `<li>${n}</li>`).join("")}</ul>`;
};
function explorationMod(pc, act) {
  const g = (act.governing || "").toLowerCase();
  if (g === "perception") return pc.perception;
  if (pc.skills && pc.skills[g] != null) return pc.skills[g];
  if (g === "constitution") return null;
  return null;
}
function expSet(id, slug) { exploreState[id] = slug; DEMOS.explore(); }
function expMove(i, d) {
  const o = exploreState.order, j = i + d;
  if (j < 0 || j >= o.length) return;
  const t = o[i]; o[i] = o[j]; o[j] = t;
  DEMOS.explore();
}

/* ---------------------------------------------------------------
   5. ATTITUDE — the social ladder, and what each move costs.
   --------------------------------------------------------------- */
let socialState = { who: "sable", attitude: 2, log: [], immune: false, lieBonus: 0 };
DEMOS.attitude = function () {
  const host = byId("demo-attitude"); if (!host) return;
  const s = socialState, pc = PC_BY_ID[s.who];
  const ladder = ATTITUDES.map((a, i) => `
    <div class="rung${i === s.attitude ? " on" : ""}${i < s.attitude ? " below" : ""}">
      <span class="rname">${titleCase(a)}</span>
      ${i === s.attitude ? `<span class="rhere">${escapeHtml(FLAVOR.npc)} is here</span>` : ""}
    </div>`).reverse().join("");
  host.innerHTML = `
    <div class="controls">
      <label class="field inline"><span class="name">Who's talking</span>
        <select onchange="socialSet(this.value)">
          ${PREGENS.map((p) => `<option value="${p.id}"${p.id === s.who ? " selected" : ""}>${escapeHtml(p.short)} — ${escapeHtml(p.cls)}</option>`).join("")}
        </select></label>
      <div class="foecard">
        <b>${escapeHtml(FLAVOR.npc)}</b>
        <span class="meta">${escapeHtml(FLAVOR.npcRole)} in ${escapeHtml(FLAVOR.port)} · Will DC 15 · Perception DC 15</span>
      </div>
    </div>
    <div class="ladder">${ladder}</div>
    <div class="palette">
      ${SOCIAL_MOVES.filter((m) => m.key !== "demoralize").map((m) => {
        const mod = socialMod(pc, m);
        const blocked = m.needs && s.attitude < ATTITUDES.indexOf(m.needs);
        const immune = m.key === "coerce" && s.immune;
        return `<button class="pbtn k-skill${blocked || immune ? " dis" : ""}" ${blocked || immune ? "disabled" : ""} onclick="socialDo('${m.key}')">
          <span class="plabel">${escapeHtml(m.label)}</span>
          <span class="pmap">${escapeHtml(m.skill)} ${sign(mod)}${mod === 0 ? " untrained" : ""}</span>
          ${blocked ? `<span class="pblock">needs friendly</span>` : immune ? `<span class="pblock">immune for a week</span>` : ""}
        </button>`;
      }).join("")}
      <button class="pbtn k-other" onclick="socialReset()"><span class="plabel">Reset the scene</span></button>
    </div>
    <ol class="turnlog">${s.log.map((l) => `<li class="tstep ${l.cls}"><div class="tsmath">${l.text}</div></li>`).join("")}</ol>`;
};
function socialMod(pc, move) {
  const key = move.skill.toLowerCase();
  return (pc.skills && pc.skills[key] != null) ? pc.skills[key] : 0;
}
function socialSet(who) { socialState.who = who; DEMOS.attitude(); }
function socialReset() { socialState = { who: socialState.who, attitude: 2, log: [], immune: false, lieBonus: 0 }; DEMOS.attitude(); }
function socLog(text, cls) { socialState.log.unshift({ text, cls: cls || "succ" }); DEMOS.attitude(); }
function socialDo(key) {
  const s = socialState, pc = PC_BY_ID[s.who];
  const move = SOCIAL_MOVES.find((m) => m.key === key);
  const mod = socialMod(pc, move);
  const dc = (key === "lie" ? 15 + s.lieBonus : 15);
  const r = rollCheck(mod, dc);
  const before = s.attitude;
  const untrained = mod === 0 ? ` <span class="meta">(${escapeHtml(pc.short)} is untrained in ${escapeHtml(move.skill)} — untrained adds nothing, not even her level)</span>` : "";
  let outcome = "";
  if (key === "impression") {
    if (r.deg === 3) s.attitude = clamp(s.attitude + 2, 0, 4);
    else if (r.deg === 2) s.attitude = clamp(s.attitude + 1, 0, 4);
    else if (r.deg === 0) s.attitude = clamp(s.attitude - 1, 0, 4);
    outcome = r.deg === 3 ? "Two steps better." : r.deg === 2 ? "One step better." : r.deg === 1 ? "No change — a plain failure just doesn't move them." : "One step worse. You've made it awkward.";
  } else if (key === "request") {
    if (r.deg === 3) outcome = "Agreed, no conditions.";
    else if (r.deg === 2) outcome = "Agreed — but they want something in return.";
    else if (r.deg === 1) outcome = "Refused. They might suggest something smaller.";
    else { s.attitude = clamp(s.attitude - 1, 0, 4); outcome = "Refused, and one step worse for the cheek of asking."; }
  } else if (key === "coerce") {
    if (r.deg >= 2) {
      s.attitude = Math.min(s.attitude, 1);
      outcome = r.deg === 3
        ? "They talk — and then they're <b>unfriendly</b>, permanently. Even the critical success costs you the relationship."
        : "They talk — and then they're <b>unfriendly</b>, and may well report you.";
    } else if (r.deg === 1) { s.attitude = Math.min(s.attitude, 1); outcome = "Nothing, and now they're <b>unfriendly</b>."; }
    else { s.attitude = 0; s.immune = true; outcome = "<b>Hostile</b>, and immune to your threats for a week. This is the worst outcome in the social rules."; }
  } else if (key === "lie") {
    if (r.deg >= 2) outcome = "Believed — for now. If they find evidence later they get a Perception check to catch it.";
    else { s.lieBonus = 4; outcome = "Not believed, and they get <b>+4 against everything else you say</b> this conversation."; }
  }
  const moved = s.attitude !== before ? ` ${titleCase(ATTITUDES[before])} → <b>${titleCase(ATTITUDES[s.attitude])}</b>.` : "";
  socLog(`<b>${escapeHtml(move.label)}</b> — ${escapeHtml(move.skill)}: d20 ${natSpan(r.nat)} ${sign(mod)} = ${r.total} vs DC ${dc}. ${degChip(r.deg)} ${escapeHtml(titleCase(r.why))}. ${outcome}${moved}${untrained}`,
    DEG_CLASS[r.deg]);
}

/* ---------------------------------------------------------------
   6. DOWNTIME — a week ashore.
   --------------------------------------------------------------- */
let downState = { days: 5, mari: "earn-income", sable: "learn-a-spell" };
DEMOS.downtime = function () {
  const host = byId("demo-downtime"); if (!host) return;
  const rows = PREGENS.map((pc) => {
    const act = DOWNTIME_ACTIVITIES.find((a) => a.slug === downState[pc.id]) || DOWNTIME_ACTIVITIES[0];
    return `<div class="exprow down">
      <div class="expwho"><b>${escapeHtml(pc.short)}</b><span class="meta">${escapeHtml(pc.cls)}</span></div>
      <div class="expsel">
        <select onchange="downSet('${pc.id}', this.value)">
          ${DOWNTIME_ACTIVITIES.map((a) => `<option value="${a.slug}"${a.slug === act.slug ? " selected" : ""}>${escapeHtml(a.label)}</option>`).join("")}
        </select>
      </div>
      <div class="expgov"><span class="meta">${escapeHtml(act.skill)}</span></div>
      <div class="expnote">${escapeHtml(act.blurb)}</div>
    </div>`;
  }).join("");
  const asks = [];
  PREGENS.forEach((pc) => {
    const slug = downState[pc.id];
    if (slug === "earn-income") asks.push(`<b>${escapeHtml(pc.short)}</b> needs a <b>task level</b> from the GM — that plus her proficiency rank sets the daily rate.`);
    if (slug === "craft") asks.push(`<b>${escapeHtml(pc.short)}</b> needs the formula and half the item's price up front, then days of work.`);
    if (slug === "learn-a-spell") asks.push(`<b>${escapeHtml(pc.short)}</b> needs access to the spell — a teacher, a scroll, or someone's spellbook — and the materials.`);
    if (slug === "retraining") asks.push(`<b>${escapeHtml(pc.short)}</b> needs the GM to agree what she's retraining into, and usually a teacher.`);
    if (slug === "long-term-rest") asks.push(`<b>${escapeHtml(pc.short)}</b> just needs somewhere safe and boring.`);
    if (slug === "research") asks.push(`<b>${escapeHtml(pc.short)}</b> needs a library worth the name, and a question worth asking.`);
  });
  host.innerHTML = `
    <div class="controls">
      <label class="field inline narrow"><span class="name">Days ashore</span>
        <input type="number" min="1" max="60" value="${downState.days}" onchange="downSet('days', this.value)"></label>
      <div class="foecard"><b>${escapeHtml(FLAVOR.port)}</b><span class="meta">${downState.days} day${downState.days === 1 ? "" : "s"} before the ${escapeHtml(FLAVOR.ship)} sails</span></div>
    </div>
    <div class="expboard">${rows}</div>
    <ul class="notelist">
      ${asks.map((a) => `<li>${a}</li>`).join("")}
      <li>Everyone also heals: ${downState.days} full day${downState.days === 1 ? "" : "s"} of rest is a lot of hit points, and it clears <b>wounded</b> once you're back to full.</li>
    </ul>`;
};
function downSet(k, v) {
  if (k === "days") downState.days = clamp(Math.round(Number(v) || 1), 1, 60);
  else downState[k] = v;
  DEMOS.downtime();
}

/* ============================================================
   MENU
   ============================================================ */
function renderMenu() {
  const done = CHAPTERS.filter((c) => state.done[c.key]).length;
  setHTML("menuBody", `
    <h2>How you're using this</h2>
    <div class="seg">
      <button class="${!gmMode() ? "on" : ""}" onclick="setGmMode(false)">Player</button>
      <button class="${gmMode() ? "on" : ""}" onclick="setGmMode(true)">GM</button>
    </div>
    <p class="meta">GM mode adds an <b>At the table</b> block to the bottom of every tab: what to run, in what order, and what to say. Player mode hides them, so you can hand the same link to your players.</p>

    <h2 style="margin-top:26px">Progress</h2>
    <p class="meta">${done} of ${CHAPTERS.length} tabs marked read. Kept in this browser only.</p>
    <button class="btn secondary" onclick="resetProgress()">${iconSvg("reset")} Clear progress</button>

    <h2 style="margin-top:26px">Appearance</h2>
    <div class="seg">
      ${["auto", "light", "dark"].map((m) => `<button class="${state.settings.themeMode === m ? "on" : ""}" onclick="setThemeMode('${m}')">${titleCase(m)}</button>`).join("")}
    </div>
    <div class="swatchrow"><label for="accentPick">Accent colour</label>
      <input type="color" id="accentPick" value="${(state.settings.custom && state.settings.custom.accent) || DEFAULT_ACCENT}" oninput="setCustomColor('accent', this.value)"></div>
    <button class="btn secondary" onclick="resetTheme()">Reset colours</button>

    <h2 style="margin-top:26px">Take it with you</h2>
    <p class="meta">This page is one self-contained file. Save it and it works on a plane, in a basement, or on a boat.</p>
    <div class="row tight">
      <button class="btn secondary" onclick="downloadOffline()">${iconSvg("install")} Save offline copy</button>
      <button class="btn secondary" id="installBtn" style="display:none" onclick="installApp()">Install app</button>
    </div>

    <h2 style="margin-top:26px">Where the rules text comes from</h2>
    <p class="meta">The quoted condition and action text in this app is Paizo content under the ORC and OGL licences, taken from the open-source Foundry VTT <b>pf2e</b> project — ${REF_META.conditions || 0} conditions and ${REF_META.actions || 0} actions, generated ${escapeHtml(REF_META.generated || "")}${REF_META.sourceCommit ? ` from commit ${escapeHtml(REF_META.sourceCommit)}` : ""}. The explanations around it are ours, and the two pregenerated characters are made up. Unofficial fan tool, not affiliated with Paizo.</p>
    <p class="meta">${(REF_META.sources || []).map((s) => `${escapeHtml(s.title)} (${escapeHtml(s.license)})`).join(" · ")}</p>

    <button class="btn secondary" style="margin-top:22px" onclick="closeMenu()">← Back to the primer</button>`);
}
function resetProgress() {
  state.done = {}; saveState(); renderHeader(); renderMenu(); toast("Progress cleared");
}

/* ============================================================
   THEME
   ============================================================ */
const DEFAULT_ACCENT = "#3f7d8c";
function hexToRgb(h) { h = (h || "").replace("#", "").trim(); if (h.length === 3) h = h.split("").map((c) => c + c).join(""); const n = parseInt(h || "000000", 16); return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }; }
function relLuminance(hex) { const { r, g, b } = hexToRgb(hex); const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); }
function inkFor(hex) { return relLuminance(hex) < 0.48 ? "#ffffff" : "#15171c"; }
function resolveThemeMode() {
  const m = state.settings.themeMode;
  if (m === "light" || m === "dark") return m;
  return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
}
function applyTheme() {
  const root = document.documentElement;
  root.dataset.theme = resolveThemeMode();
  const c = state.settings.custom || {};
  const accent = c.accent || DEFAULT_ACCENT;
  root.style.setProperty("--accent", accent);
  root.style.setProperty("--accent-ink", inkFor(accent));
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", resolveThemeMode() === "dark" ? "#14161b" : "#f4f5f8");
}
function setThemeMode(m) { state.settings.themeMode = m; saveState(); applyTheme(); renderMenu(); }
function setCustomColor(key, val) { state.settings.custom = state.settings.custom || {}; state.settings.custom[key] = val; saveState(); applyTheme(); }
function resetTheme() { state.settings.custom = null; saveState(); applyTheme(); renderMenu(); }

/* ============================================================
   PWA / OFFLINE
   ============================================================ */
let deferredInstall = null;
function isHeadless() { try { return /jsdom/i.test(navigator.userAgent) || !("onbeforeinstallprompt" in window || "serviceWorker" in navigator); } catch (e) { return true; } }
function setupInstall() {
  if (isHeadless()) return;
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferredInstall = e; showInstallButton(true); });
  window.addEventListener("appinstalled", () => { deferredInstall = null; showInstallButton(false); toast("App installed"); });
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}
function showInstallButton(show) { const b = byId("installBtn"); if (b) b.style.display = show ? "" : "none"; }
function installApp() { if (!deferredInstall) return; deferredInstall.prompt(); deferredInstall.userChoice.finally(() => { deferredInstall = null; showInstallButton(false); }); }
function downloadOffline() {
  const doIt = (html) => {
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "pf2e-primer.html"; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  };
  fetch(location.href).then((r) => r.text()).then(doIt).catch(() => doIt("<!doctype html>" + document.documentElement.outerHTML));
}

/* ============================================================
   BOOT
   ============================================================ */
function buildNav() {
  setHTML("tabs", CHAPTERS.map((c) =>
    `<button id="nav-${c.key}" onclick="go('${c.key}')">${iconSvg(c.icon)}<span>${escapeHtml(c.label)}</span></button>`).join(""));
  setHTML("views", CHAPTERS.map((c) => `<section id="view-${c.key}" class="hide"></section>`).join("")
    + `<section id="view-menu" class="hide"><div id="menuBody"></div></section>`);
}
function boot() {
  applyTheme();
  document.body.classList.toggle("gmon", gmMode());
  buildNav();
  renderHeader();
  go(VIEWS[0]);
  setupInstall();
}
/* Injected at the end of <body>, so the DOM is already there — boot
   synchronously and the first paint is the rendered app. */
if (typeof document !== "undefined") boot();
