/* tools/test.mjs — loads the built dist/index.html in jsdom and checks the
   things that can silently rot: the hand-authored character numbers, the
   resolution rules the demos teach, and every rules slug the content cites.

   Run:  node tools/test.mjs   (after python3 tools/build.py) */
import { JSDOM, VirtualConsole } from "jsdom";
import fs from "node:fs";

const html = fs.readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");

let pass = 0, fail = 0;
function ok(cond, msg) { (cond ? pass++ : fail++); console.log((cond ? "  ✓ " : "  ✗ FAIL ") + msg); }
function eq(a, b, msg) { ok(a === b, `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
function has(hay, needle, msg) { ok(String(hay).indexOf(needle) !== -1, `${msg} — expected to find ${JSON.stringify(needle)}`); }
function group(name) { console.log("\n" + name); }

const errors = [];
const vc = new VirtualConsole();
vc.on("jsdomError", (e) => errors.push(e.message));

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  virtualConsole: vc,
  url: "https://example.org/",
  beforeParse(window) { window.scrollTo = () => {}; window.alert = () => {}; },
});
const w = dom.window;
const d = w.document;
const ev = (expr) => w.eval(expr);

/* Force the dice: d20() is 1 + floor(random*20), so (n-0.5)/20 yields n. */
function seed(values) {
  let i = 0;
  w.Math.random = () => { const v = values[Math.min(i++, values.length - 1)]; return (v - 0.5) / 20; };
}
function unseed() { w.Math.random = Math.random; }

/* ============================================================ */
group("Boot");
ok(errors.length === 0, "no script errors while loading" + (errors.length ? ": " + errors[0] : ""));
ok(d.querySelectorAll("nav.tabs button").length === ev("CHAPTERS.length"), "one tab per chapter");
ok(!/<script[^>]+src=/.test(html), "no external scripts — the file is self-contained");
ok(!/<link[^>]+stylesheet/.test(html), "no external stylesheets");

/* ============================================================ */
group("Degrees of success — the one mechanic");
eq(ev("degreeOf(25, 15, 10)"), 3, "beat the DC by 10 is a critical success");
eq(ev("degreeOf(24, 15, 10)"), 2, "beat it by 9 is a plain success");
eq(ev("degreeOf(15, 15, 10)"), 2, "meeting the DC succeeds");
eq(ev("degreeOf(14, 15, 10)"), 1, "one under is a failure");
eq(ev("degreeOf(5, 15, 10)"), 0, "ten under is a critical failure");
eq(ev("degreeOf(14, 15, 20)"), 2, "a natural 20 lifts a failure to a success, not a critical");
eq(ev("degreeOf(25, 15, 20)"), 3, "a natural 20 on a critical success stays a critical success");
eq(ev("degreeOf(16, 15, 1)"), 1, "a natural 1 drops a success to a failure");
eq(ev("degreeOf(5, 15, 1)"), 0, "a natural 1 on a critical failure stays there");
has(ev("degreeReason(25, 15, 10)"), "ten or more over", "the explanation names the ten-over rule");
has(ev("degreeReason(14, 15, 20)"), "natural 20 moves it one step better", "the explanation names the natural-20 nudge");

group("Multiple attack penalty");
eq(ev("mapPenalty(0)"), 0, "first attack is at full value");
eq(ev("mapPenalty(1)"), -5, "second attack is −5");
eq(ev("mapPenalty(2)"), -10, "third attack is −10");
eq(ev("mapPenalty(3)"), -10, "a fourth attack is still −10");
eq(ev("mapPenalty(1, true)"), -4, "agile second attack is −4");
eq(ev("mapPenalty(2, true)"), -8, "agile third attack is −8");

/* ============================================================
   Every number on the pregens, re-derived from the build.
   modifier = ability + rank bonus + level, and untrained adds nothing.
   ============================================================ */
group("The pregens' arithmetic");
const pregens = ev("PREGENS");
const RANK = ev("RANK_BONUS");
const SKAB = ev("SKILL_ABILITY");
for (const pc of pregens) {
  eq(pc.hp, pc.hpParts.ancestry + pc.hpParts.cls + pc.hpParts.con * pc.level,
    `${pc.short}: hit points are ancestry + class + Constitution`);
  const dexToAC = Math.min(pc.abilities.dex, pc.armor.dexCap);
  eq(pc.ac, 10 + dexToAC + pc.armor.item + RANK[pc.armor.rank] + pc.level,
    `${pc.short}: AC is 10 + Dex (capped) + armour + proficiency`);
  eq(pc.perception, pc.abilities.wis + RANK[pc.perceptionRank] + pc.level,
    `${pc.short}: Perception is Wis + rank + level`);
  for (const [save, mod] of Object.entries(pc.saves)) {
    const ability = save === "fortitude" ? "con" : save === "reflex" ? "dex" : "wis";
    eq(mod, pc.abilities[ability] + RANK[pc.saveRanks[save]] + pc.level,
      `${pc.short}: ${save} save is ${ability.toUpperCase()} + rank + level`);
  }
  for (const [skill, mod] of Object.entries(pc.skills)) {
    ok(SKAB[skill], `${pc.short}: ${skill} has a key ability on record`);
    eq(mod, pc.abilities[SKAB[skill]] + RANK.trained + pc.level,
      `${pc.short}: ${skill} is ${SKAB[skill].toUpperCase()} + trained + level`);
  }
  if (pc.spellDC) {
    eq(pc.spellDC, 10 + pc.abilities.cha + RANK.trained + pc.level, `${pc.short}: spell DC is 10 + the modifier`);
    eq(pc.spellAttack, pc.abilities.cha + RANK.trained + pc.level, `${pc.short}: spell attack is Cha + rank + level`);
    eq(pc.spellDC, pc.spellAttack + 10, `${pc.short}: any modifier becomes a DC by adding 10`);
  }
}
eq(ev("socialMod(PC_BY_ID.mari, SOCIAL_MOVES[0])"), 0,
  "an untrained skill is +0 — not even the character's level");

/* ============================================================
   Every rules slug the content cites must exist in the bundle.
   ============================================================ */
group("Rules citations resolve");
const missing = ev(`(function(){
  const bad = [];
  const act = (s) => { if (!ACTION_BY_SLUG[s]) bad.push("action:" + s); };
  const con = (s) => { if (!CONDITION_BY_SLUG[s]) bad.push("condition:" + s); };
  CHAPTERS.forEach((c) => c.sections.forEach((s) => {
    if (s.type === "ref") (s.slugs || []).forEach(s.kind === "condition" ? con : act);
  }));
  Object.values(TURN_ACTIONS).forEach((list) => list.forEach((a) => { if (a.slug) act(a.slug); }));
  EXPLORATION_ACTIVITIES.forEach((a) => act(a.slug));
  EXPLORATION_STOPS.forEach((a) => act(a.slug));
  DOWNTIME_ACTIVITIES.forEach((a) => act(a.slug));
  SOCIAL_MOVES.forEach((m) => act(m.slug));
  REACTIONS.forEach((r) => act(r.slug));
  ATTITUDES.forEach(con);
  return bad;
})()`);
ok(missing.length === 0, `every cited action and condition is in the data${missing.length ? ": missing " + missing.join(", ") : ""}`);
ok(ev("CONDITIONS.length") >= 40, `the bundle carries the conditions (${ev("CONDITIONS.length")})`);
ok(ev("ACTIONS.length") >= 90, `the bundle carries the actions (${ev("ACTIONS.length")})`);

/* ============================================================ */
group("Every chapter renders, every demo mounts");
for (const ch of ev("CHAPTERS")) {
  ev(`go(${JSON.stringify(ch.key)})`);
  const view = d.getElementById("view-" + ch.key);
  ok(view && !view.classList.contains("hide"), `${ch.key}: the tab shows`);
  has(view.innerHTML, ch.title, `${ch.key}: the chapter title is on the page`);
  ok(view.textContent.length > 900, `${ch.key}: has real content (${view.textContent.length} chars)`);
  for (const s of ch.sections) {
    if (s.type === "demo") {
      const host = d.getElementById("demo-" + s.id);
      ok(host && host.innerHTML.length > 120, `${ch.key}: the ${s.id} demo mounted`);
    }
  }
}
ok(d.querySelectorAll(".gmsec").length > 0, "GM notes are in the DOM");
ev("setGmMode(true)");
ok(d.body.classList.contains("gmon"), "GM mode marks the body so the notes show");
ev("setGmMode(false)");
ok(!d.body.classList.contains("gmon"), "player mode hides them again");

/* ============================================================ */
group("The check demo");
ev("go('start'); checkSet('who','mari'); checkSet('what','sk-athletics'); checkSet('dc',15)");
seed([20]);
ev("rollTheCheck(1)");
let out = d.getElementById("checkOut").textContent;
has(out, "Critical success", "Athletics +7 with a natural 20 against DC 15 is a critical success");
has(out, "27", "the total is shown");
seed([1]);
ev("rollTheCheck(1)");
out = d.getElementById("checkOut").textContent;
has(out, "Critical failure", "a natural 1 on 8 against DC 15 drops a failure to a critical failure");
unseed();
ev("rollTheCheck(20)");
has(d.getElementById("checkOut").textContent, "Twenty rolls", "the twenty-roll distribution renders");

/* ============================================================ */
group("The turn demo — penalties and debuffs move the numbers");
ev("go('fight'); turnSet('mari'); turnClear()");
ev("turnPick(4); turnPick(0); turnPick(0)");      /* Demoralize, Strike, Strike */
eq(ev("turnState.picks.length"), 3, "three single actions fill the turn");
eq(ev("turnSpent()"), 3, "and the turn is full");
seed([20]);
ev("runTurn()");
let turn = d.getElementById("turnOut").textContent;
has(turn, "frightened 2", "a critical Demoralize leaves it frightened 2");
has(turn, "vs AC 14", "frightened 2 drops the AC the next Strike rolls against from 16 to 14");
has(turn, "-5 multiple attack penalty", "the second attack shows its penalty");
has(turn, "doubled for the critical hit", "beating AC by 10 doubles the damage");
ev("turnClear()");
ok(ev("turnState.picks.length") === 0, "clearing empties the turn");
/* A two-action spell can't be followed by two more actions. */
ev("turnSet('sable'); turnPick(1); turnPick(1)");
eq(ev("turnSpent()"), 2, "a second two-action spell won't fit in the last action");
ev("turnClear(); turnPick(2)");                    /* Cast Fear */
seed([1]);
ev("runTurn()");
turn = d.getElementById("turnOut").textContent;
has(turn, "Frightened 3", "a critically failed Will save against Fear is frightened 3 and fleeing");
has(turn, "spell DC 17", "the save is against the caster's spell DC, not an attack roll");
unseed();

/* ============================================================ */
group("The dying demo");
ev("go('fight'); dyingReset(); dyingHit(12)");
eq(ev("dyingState.hp"), 8, "12 damage off 20 hit points leaves 8");
eq(ev("dyingState.dying"), 0, "still up");
ev("dyingHit(25, true)");
eq(ev("dyingState.hp"), 0, "the critical hit drops her");
eq(ev("dyingState.dying"), 2, "dropping to 0 from a critical hit starts you at dying 2");
seed([20]);
ev("dyingRecover()");
eq(ev("dyingState.dying"), 0, "a critically successful recovery check clears dying");
eq(ev("dyingState.wounded"), 1, "and losing dying always leaves you wounded 1");
ev("dyingHit(25, true)");
eq(ev("dyingState.dying"), 3, "dropping again adds the wounded value: 2 + 1 = dying 3");
seed([1]);
ev("dyingRecover()");
eq(ev("dyingState.dying"), 4, "a critically failed recovery check adds 2 — that's dead");
ev("dyingReset(); dyingHit(25, true); dyingHero()");
eq(ev("dyingState.dying"), 0, "spending every hero point clears dying");
eq(ev("dyingState.hero"), 0, "and costs all of them");
unseed();

/* ============================================================ */
group("The attitude demo");
ev("go('talk'); socialSet('sable'); socialReset()");
eq(ev("socialState.attitude"), 2, "the NPC starts indifferent");
seed([20]);
ev("socialDo('impression')");
eq(ev("socialState.attitude"), 4, "a critical Make an Impression moves two steps: indifferent → helpful");
seed([1]);
ev("socialDo('coerce')");
eq(ev("socialState.attitude"), 0, "a critically failed Coerce makes them hostile");
eq(ev("socialState.immune"), true, "and immune to further threats");
ev("socialReset()");
seed([11]);
ev("socialDo('impression')");                      /* 11 + 7 = 18 vs DC 15 */
eq(ev("socialState.attitude"), 3, "a plain success moves one step: indifferent → friendly");
seed([2]);
ev("socialDo('impression')");                      /* 2 + 7 = 9 vs DC 15: fail, not crit */
eq(ev("socialState.attitude"), 3, "a plain failure moves nobody");
unseed();

/* ============================================================ */
group("The exploration and downtime boards");
ev("go('explore'); expSet('mari','search'); expSet('sable','avoid-notice')");
let exp = d.getElementById("demo-explore").textContent;
has(exp, "the GM rolls this", "secret checks are flagged as the GM's to roll");
has(exp, "+6", "Search shows Mari's Perception modifier");
ev("expSet('mari','scout'); expSet('sable','scout')");
has(d.getElementById("demo-explore").textContent, "Nobody is Searching",
  "with nobody Searching, the board says so plainly");
ev("expMove(0, 1)");
eq(ev("exploreState.order[0]"), "sable", "marching order can be reordered");
ev("go('ashore'); downSet('mari','earn-income'); downSet('days', 7)");
has(d.getElementById("demo-downtime").textContent, "task level",
  "Earn Income tells you what the GM still has to decide");

/* ============================================================ */
group("The rules browser");
ev("go('cards')");
d.getElementById("browseQ").value = "frightened";
ev("renderBrowseList()");
has(d.getElementById("browseList").textContent, "Frightened", "search finds a condition");
has(d.getElementById("browseList").textContent, "status penalty", "and shows Paizo's own text");
ev("setBrowseFilter('downtime')");
d.getElementById("browseQ").value = "";
ev("renderBrowseList()");
has(d.getElementById("browseList").textContent, "Earn Income", "the downtime filter finds downtime activities");
ev("setBrowseFilter('all')");

/* ============================================================ */
group("Damage rolls");
for (let i = 0; i < 200; i++) {
  const t = ev('rollDamage("1d8+4").total');
  if (t < 5 || t > 12) { ok(false, "1d8+4 stays in range (got " + t + ")"); break; }
  if (i === 199) ok(true, "1d8+4 always lands between 5 and 12");
}
eq(ev('rollDamage("2d6").total >= 2 && rollDamage("2d6").total <= 12'), true, "2d6 stays in range");

/* ============================================================ */
group("Progress and settings survive a reload");
ev("markRead('start'); markRead('fight')");
const saved = JSON.parse(w.localStorage.getItem("pf2ePrimer.v1"));
ok(saved.done.start && saved.done.fight, "read tabs are remembered");
ev("resetProgress()");
eq(Object.keys(JSON.parse(w.localStorage.getItem("pf2ePrimer.v1")).done).length, 0, "and can be cleared");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
