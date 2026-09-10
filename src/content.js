/* ============================================================
   CONTENT — the primer itself. Everything you might want to
   reword for your table lives in this file; engine.js only
   renders it. Rules text quoted at the table is NOT here: it
   comes verbatim from data/reference.generated.js (Foundry
   pf2e, Paizo ORC/OGL) so the primer can't drift from the book.
   ============================================================ */

/* Swap these five strings to re-flavour every example in the app. */
const FLAVOR = {
  ship: "Salt Mercy",
  port: "Bracklewater",
  npc: "Quartermaster Bel",
  npcRole: "runs the dockside stores",
  foe: "Deck Thug",
};

/* ============================================================
   PREGENS — two level-1 characters the demos roll with.
   Every number is hand-computed from the level-1 build shown in
   `build`, so a player can check the arithmetic against the book:
   proficiency bonus = level + rank (T2 / E4 / M6 / L8), and
   untrained adds nothing at all.
   ============================================================ */
const PREGENS = [
  {
    id: "mari",
    name: 'Marisol "Mari" Vane',
    short: "Mari",
    cls: "Fighter",
    ancestry: "Human",
    level: 1,
    blurb: `Deckhand off the ${FLAVOR.ship} who got tired of being the one holding the rope. Boarding sword, steel shield, short fuse.`,
    build: "Str 18 · Dex 14 · Con 14 · Int 10 · Wis 12 · Cha 10 — scale mail, steel shield, boarding sword (longsword) & dagger",
    abilities: { str: 4, dex: 2, con: 2, int: 0, wis: 1, cha: 0 },
    hpParts: { ancestry: 8, cls: 10, con: 2 },
    armor: { item: 3, dexCap: 2, rank: "trained", name: "scale mail" },
    hp: 20,
    ac: 18,
    acNote: "10 + 2 Dex (capped by scale mail) + 3 armour + 3 proficiency (trained, +2, plus your level)",
    shieldBonus: 2,
    perception: 6,
    perceptionRank: "expert",
    saves: { fortitude: 7, reflex: 7, will: 4 },
    saveRanks: { fortitude: "expert", reflex: "expert", will: "trained" },
    skills: {
      athletics: 7, acrobatics: 5, intimidation: 3,
      medicine: 4, survival: 4, "sailing lore": 3,
    },
    classDC: 17,
    hero: 1,
    tag: "the one who hits things",
  },
  {
    id: "sable",
    name: "Sable Quist",
    short: "Sable",
    cls: "Bard",
    ancestry: "Gnome",
    level: 1,
    blurb: `Shanty-singer, rumour-broker, and the reason half of ${FLAVOR.port} still speaks to the crew.`,
    build: "Str 10 · Dex 14 · Con 14 · Int 12 · Wis 10 · Cha 18 — leather armour, rapier, a very loud voice",
    abilities: { str: 0, dex: 2, con: 2, int: 1, wis: 0, cha: 4 },
    hpParts: { ancestry: 8, cls: 8, con: 2 },
    armor: { item: 1, dexCap: 4, rank: "trained", name: "leather armour" },
    hp: 18,
    ac: 16,
    acNote: "10 + 2 Dex + 1 armour + 3 proficiency (trained, +2, plus your level)",
    shieldBonus: 0,
    perception: 3,
    perceptionRank: "trained",
    saves: { fortitude: 5, reflex: 5, will: 5 },
    saveRanks: { fortitude: "trained", reflex: "trained", will: "expert" },
    skills: {
      diplomacy: 7, performance: 7, deception: 7, occultism: 4,
      society: 4, stealth: 5, acrobatics: 5, "sailing lore": 4,
    },
    spellAttack: 7,
    spellDC: 17,
    hero: 1,
    tag: "the one who talks and sings",
  },
];

/* Rank bonuses, and which ability each skill runs off. The demos and the
   test suite both use these to re-derive every number on both sheets:
   modifier = ability + rank + level (untrained adds nothing at all). */
const RANK_BONUS = { untrained: 0, trained: 2, expert: 4, master: 6, legendary: 8 };
const SKILL_ABILITY = {
  acrobatics: "dex", arcana: "int", athletics: "str", crafting: "int",
  deception: "cha", diplomacy: "cha", intimidation: "cha", medicine: "wis",
  nature: "wis", occultism: "int", performance: "cha", religion: "wis",
  society: "int", stealth: "dex", survival: "wis", thievery: "dex",
  "sailing lore": "int",
};

/* ============================================================
   THE TEACHING DUMMY — not an official statblock. A plausible
   level-1 brawler with round numbers, so the demos have
   something to roll against. Its DCs are 10 + its modifier,
   which is exactly how the GM turns any modifier into a DC.
   ============================================================ */
const FOE = {
  name: FLAVOR.foe,
  blurb: "A bruiser off a rival crew. Made up for this page — your GM's monsters come from the Monster Core.",
  ac: 16,
  hp: 20,
  saves: { fortitude: 7, reflex: 5, will: 3 },
  perception: 5,
  strike: { label: "cutlass", bonus: 8, dmg: "1d6+3", dtype: "slashing" },
};

/* ============================================================
   TURN BUILDER — the palette each pregen can spend actions on.
   cost      how many of the three actions it eats
   attack    counts toward the multiple attack penalty
   agile     agile weapons take the smaller MAP (-4/-8)
   check     a skill check against one of the foe's DCs
   ============================================================ */
const TURN_ACTIONS = {
  mari: [
    { key: "sword", label: "Strike — boarding sword", cost: 1, slug: "strike", attack: true,
      bonus: 9, dmg: "1d8+4", dtype: "slashing", kind: "attack" },
    { key: "dagger", label: "Strike — dagger (agile)", cost: 1, slug: "strike", attack: true, agile: true,
      bonus: 9, dmg: "1d4+4", dtype: "piercing", kind: "attack",
      hint: "Agile weapons take a smaller multiple attack penalty: −4 then −8." },
    { key: "trip", label: "Trip", cost: 1, slug: "trip", attack: true, kind: "attack",
      check: { skill: "Athletics", bonus: 7, vs: "reflex" }, effect: "trip",
      hint: "Trip is an attack too — it takes the multiple attack penalty and it adds to it." },
    { key: "grapple", label: "Grapple", cost: 1, slug: "grapple", attack: true, kind: "attack",
      check: { skill: "Athletics", bonus: 7, vs: "fortitude" }, effect: "grapple" },
    { key: "demoralize", label: "Demoralize", cost: 1, slug: "demoralize", kind: "skill",
      check: { skill: "Intimidation", bonus: 3, vs: "will" }, effect: "demoralize",
      hint: "Not an attack — no multiple attack penalty, ever." },
    { key: "raise", label: "Raise a Shield", cost: 1, slug: "raise-a-shield", kind: "defend", effect: "raise",
      hint: "+2 circumstance to your AC until the start of your next turn." },
    { key: "stride", label: "Stride", cost: 1, slug: "stride", kind: "move" },
    { key: "step", label: "Step", cost: 1, slug: "step", kind: "move",
      hint: "5 feet, and it doesn't trigger reactions." },
    { key: "seek", label: "Seek", cost: 1, slug: "seek", kind: "skill", effect: "seek" },
    { key: "interact", label: "Interact — draw a weapon", cost: 1, slug: "interact", kind: "other" },
  ],
  sable: [
    { key: "anthem", label: "Courageous Anthem", cost: 1, kind: "spell", effect: "anthem",
      spell: { name: "Courageous Anthem", rank: "cantrip (focus)", text: "You and all allies in the area gain a +1 status bonus to attack rolls, damage rolls, and saves against fear effects." },
      hint: "A focus cantrip. One action, and it improves every attack you make afterwards this round." },
    { key: "tk", label: "Telekinetic Projectile", cost: 2, kind: "spell", attack: true, spellAttack: true,
      bonus: 7, dmg: "2d6", dtype: "bludgeoning",
      spell: { name: "Telekinetic Projectile", rank: "cantrip", text: "Make a spell attack roll. If you hit, you deal 2d6 bludgeoning, piercing, or slashing damage — as appropriate for the object you hurled." },
      hint: "Spell attack rolls take the multiple attack penalty just like a Strike." },
    { key: "fear", label: "Cast Fear (rank 1)", cost: 2, kind: "spell", effect: "fear",
      save: { name: "Will", dc: 17 },
      spell: { name: "Fear", rank: "rank 1", text: "The target attempts a Will save. Critical Success: unaffected. Success: frightened 1. Failure: frightened 2. Critical Failure: frightened 3 and fleeing for 1 round." },
      hint: "You don't roll to hit — the target rolls to resist. Your spell DC is the number it has to beat." },
    { key: "soothe", label: "Cast Soothe (rank 1)", cost: 2, kind: "spell", effect: "soothe",
      spell: { name: "Soothe", rank: "rank 1", text: "The target regains 1d10+4 Hit Points and gains a +2 status bonus to saves against mental effects for 1 minute." },
      hint: "Healing is a spell slot well spent when someone is dying." },
    { key: "feint", label: "Feint", cost: 1, slug: "feint", kind: "skill",
      check: { skill: "Deception", bonus: 7, vs: "perception" }, effect: "feint" },
    { key: "stride", label: "Stride", cost: 1, slug: "stride", kind: "move" },
    { key: "step", label: "Step", cost: 1, slug: "step", kind: "move" },
    { key: "hide", label: "Hide", cost: 1, slug: "hide", kind: "skill" },
    { key: "seek", label: "Seek", cost: 1, slug: "seek", kind: "skill", effect: "seek" },
    { key: "interact", label: "Interact — pull a rope loose", cost: 1, slug: "interact", kind: "other" },
  ],
};

/* Reactions are listed apart: you get one, and it happens on someone else's turn. */
const REACTIONS = [
  { slug: "aid", label: "Aid", note: "Prepare on your turn, then help an ally's check. Success: +1 circumstance bonus." },
  { slug: "grab-an-edge", label: "Grab an Edge", note: "When you fall off something — the sea is full of edges." },
  { slug: "arrest-a-fall", label: "Arrest a Fall", note: "If you can fly or Cast a Spell to catch yourself." },
];

/* ============================================================
   EXPLORATION — the activity board. `governing` is the statistic
   the GM most often rolls or references for you; `secret` marks
   the ones the GM usually rolls behind the screen.
   ============================================================ */
const EXPLORATION_ACTIVITIES = [
  { slug: "search", label: "Search", governing: "Perception", secret: true,
    blurb: "You sweep for hidden doors, traps and lurkers as you go. Half speed." },
  { slug: "avoid-notice", label: "Avoid Notice", governing: "Stealth", secret: true,
    blurb: "You move so as not to be seen. Sets you up to start a fight hidden." },
  { slug: "scout", label: "Scout", governing: "—", secret: false,
    blurb: "You range ahead and back. Everyone gets +1 to initiative." },
  { slug: "defend", label: "Defend", governing: "—", secret: false,
    blurb: "Shield up, half speed. You're ready when it goes wrong." },
  { slug: "investigate", label: "Investigate", governing: "a knowledge skill", secret: true,
    blurb: "You Recall Knowledge as you travel, about whatever's around you." },
  { slug: "follow-the-expert", label: "Follow the Expert", governing: "an ally's skill", secret: false,
    blurb: "Copy someone better than you and borrow their proficiency. The untrained character's best friend." },
  { slug: "hustle", label: "Hustle", governing: "Constitution", secret: false,
    blurb: "Double travel speed, for as long as your Constitution holds out." },
  { slug: "detect-magic", label: "Detect Magic", governing: "—", secret: false,
    blurb: "Cast detect magic over and over as you walk." },
  { slug: "track", label: "Track", governing: "Survival", secret: true,
    blurb: "Follow a trail. Half speed." },
  { slug: "cover-tracks", label: "Cover Tracks", governing: "Survival", secret: false,
    blurb: "Hide the trail you're leaving. Half speed." },
  { slug: "repeat-a-spell", label: "Repeat a Spell", governing: "—", secret: false,
    blurb: "Keep a one-minute spell running as you travel." },
  { slug: "refocus", label: "Refocus", governing: "—", secret: false,
    blurb: "Ten minutes of quiet gets a focus point back." },
];

/* Things the party does when they stop, rather than while moving. */
const EXPLORATION_STOPS = [
  { slug: "treat-wounds", label: "Treat Wounds", note: "Ten minutes and a healer's toolkit. This is your between-fights healing — DC 15 for a trained medic." },
  { slug: "recall-knowledge", label: "Recall Knowledge", note: "One action or a moment's thought: what do I know about this thing?" },
  { slug: "seek", label: "Seek", note: "The single-action version, once you're standing in the room that worries you." },
  { slug: "sense-motive", label: "Sense Motive", note: "Is this person lying to me? The GM rolls it in secret." },
  { slug: "gather-information", label: "Gather Information", note: "A couple of hours in the taverns of " + FLAVOR.port + "." },
];

/* ============================================================
   SOCIAL — the attitude ladder and the moves that shift it.
   Outcome rules mirror the action text in the reference data.
   ============================================================ */
const ATTITUDES = ["hostile", "unfriendly", "indifferent", "friendly", "helpful"];

const SOCIAL_MOVES = [
  { key: "impression", slug: "make-an-impression", label: "Make an Impression", skill: "Diplomacy",
    vs: "Will DC", time: "1 minute of conversation",
    outcomes: { cs: "+2 steps", s: "+1 step", f: "no change", cf: "−1 step" } },
  { key: "request", slug: "request", label: "Request", skill: "Diplomacy",
    vs: "a DC the GM sets", time: "1 action",
    needs: "friendly", outcomes: { cs: "they agree, no strings", s: "they agree, with conditions", f: "refused, maybe a counter-offer", cf: "refused, −1 step" } },
  { key: "coerce", slug: "coerce", label: "Coerce", skill: "Intimidation",
    vs: "Will DC", time: "1 minute of threats",
    outcomes: { cs: "they comply — then turn unfriendly", s: "they comply — then turn unfriendly and may act against you", f: "refused, and now unfriendly", cf: "refused, now hostile, immune for a week" } },
  { key: "lie", slug: "lie", label: "Lie", skill: "Deception",
    vs: "Perception DC", time: "1 round or more",
    outcomes: { cs: "believed", s: "believed", f: "not believed, +4 against your next lies", cf: "not believed, +4 against your next lies" } },
  { key: "demoralize", slug: "demoralize", label: "Demoralize", skill: "Intimidation",
    vs: "Will DC", time: "1 action — this one works in a fight",
    outcomes: { cs: "frightened 2", s: "frightened 1", f: "nothing", cf: "nothing" } },
];

/* ============================================================
   DOWNTIME — what you do with days you're not adventuring.
   Deliberately no income table: the numbers depend on a task
   level your GM assigns, and Earn Income's own text (in Cards)
   explains the process.
   ============================================================ */
const DOWNTIME_ACTIVITIES = [
  { slug: "earn-income", label: "Earn Income", skill: "Crafting, Performance or a Lore",
    blurb: "Take a job. Your GM sets a task level; your proficiency and your roll set the daily rate." },
  { slug: "craft", label: "Craft", skill: "Crafting",
    blurb: "Make the thing instead of buying it. Days of work, and you need the formula." },
  { slug: "learn-a-spell", label: "Learn a Spell", skill: "your magic skill",
    blurb: "Spellcasters: add something new to the book or the repertoire." },
  { slug: "retraining", label: "Retraining", skill: "—",
    blurb: "Change a feat or a skill you regret. Weeks, not minutes — and the whole point is that regret is fixable." },
  { slug: "long-term-rest", label: "Long-Term Rest", skill: "—",
    blurb: "Full days of doing nothing but healing. The slow, free option." },
  { slug: "research", label: "Research", skill: "a knowledge skill",
    blurb: "Dig through a library or an archive for a specific answer." },
  { slug: "treat-disease", label: "Treat Disease", skill: "Medicine",
    blurb: "Days of nursing someone through something nasty." },
  { slug: "subsist", label: "Subsist", skill: "Survival or Society",
    blurb: "Feed and shelter yourself when there's no coin for an inn." },
];

/* ============================================================
   THE BRIDGE — what you already know, and what PF2e does with it.
   ============================================================ */
const BRIDGE = [
  ["Move, action, maybe a bonus action", "Three actions. Spend them on anything, in any order — three Strikes if you like."],
  ["Roll high, hit or miss", "Four outcomes. Beat the DC by 10 and it's a critical success; miss it by 10 and it's a critical failure."],
  ["Natural 20 is a crit", "A natural 20 moves your result one step better. A 20 on what would have been a failure is just a success."],
  ["Advantage / disadvantage", "Named bonuses: circumstance, status, item. Two of the same type don't stack — only the biggest applies."],
  ["Proficiency bonus by level", "Your level plus a rank bonus (trained +2, expert +4, master +6, legendary +8). Untrained adds nothing at all — not even your level."],
  ["Race and class", "Ancestry, heritage, background and class — each one hands you feats to pick at level 1."],
  ["Death saving throws", "A dying value that climbs, recovery checks to shake it off, and a wounded condition that remembers."],
  ["Concentration on a spell", "Sustain a Spell: an action, on your turn, every round you want it to keep going."],
  ["\"I roll Persuasion\"", "Named skill actions with four written outcomes: Make an Impression, Coerce, Demoralize, Trip, Feint."],
  ["Short rest, hit dice", "Treat Wounds: ten minutes, a Medicine check, and most of the party's hit points back."],
];

/* ============================================================
   GLOSSARY — the jargon that trips up players coming from
   another system.
   ============================================================ */
const GLOSSARY = [
  ["Action", "One of the three things you do on your turn. The ◆ symbol. Three of them, plus one reaction."],
  ["Activity", "Something that eats more than one action, or minutes and hours of exploration time. Casting most spells is a two-action activity."],
  ["MAP", "Multiple Attack Penalty. Your second attack in a turn is at −5, the third at −10 (−4 and −8 with an agile weapon). It resets every turn."],
  ["DC", "Difficulty Class — the number to beat. Any modifier can become a DC: add 10 to it. Your AC is just your DC to be hit."],
  ["Degrees of success", "Critical success, success, failure, critical failure. Ten over or ten under moves you a step; a natural 20 or 1 moves you a step."],
  ["Secret check", "A roll the GM makes for you, so you don't know how well you did. Perception, Stealth and knowledge checks are often secret."],
  ["Flat check", "A d20 with no modifiers at all, against a fixed DC — for concealment, persistent damage, and recovery from dying."],
  ["Proficiency rank", "Untrained, trained, expert, master, legendary. Worth +0, +2, +4, +6, +8 — plus your level, unless you're untrained."],
  ["Status / circumstance / item", "The three bonus types. Same type doesn't stack; different types do. This is why a shield (+2 circumstance) and a spell (+1 status) both help."],
  ["Off-guard", "−2 circumstance to AC. What used to be called flat-footed. Being flanked or prone does it to you."],
  ["Hero point", "You start each session with one. Spend it to reroll anything; spend all of them to cheat death."],
  ["Focus point", "Fuel for a class's signature spells. Ten minutes of Refocus gets one back."],
  ["Encounter / exploration / downtime", "The three gears the game shifts between: rounds, minutes, days."],
];

/* ============================================================
   CHAPTERS — the primer proper. Section types are rendered by
   engine.js: prose, note, bridge, map, cards, steps, demo, ref,
   gm (GM mode only), links.
   ============================================================ */
const CHAPTERS = [
  /* ---------------------------------------------------------- */
  {
    key: "start", label: "Start", icon: "compass",
    title: "Weighing anchor",
    lede: "You already know how to play a roleplaying game. This page is only about what Pathfinder does differently — and it's concentrated in three places.",
    sections: [
      { type: "prose", h: "The short version", p: [
        "Pathfinder 2e is fussy in exactly one direction: it wants your <b>specific</b> intention. Not \"I attack\" but \"I Strike with my sword, then Trip him, then Raise my Shield.\" In return it gives you a game where those choices genuinely matter, and where the rules for them are written down instead of adjudicated fresh every time.",
        "Three things to take away today: <b>how a roll resolves</b> (four outcomes, not two), <b>how a turn is spent</b> (three actions, no categories), and <b>which gear the game is in</b> (encounter, exploration, downtime). Everything else you can look up at the table.",
      ] },
      { type: "bridge", h: "What you know → what PF2e does" },
      { type: "prose", h: "The one mechanic", p: [
        "Roll a d20, add a modifier, compare to a Difficulty Class. That's the whole game. Attacks compare to Armour Class, spells compare to your spell DC, jumping a gap compares to a DC the GM picked. AC is not a special case — it's just the DC to hit you.",
        "Where PF2e differs is what happens next. You don't just hit or miss.",
      ] },
      { type: "cards", h: "Four outcomes, every time", items: [
        { h: "Critical success", p: "You beat the DC by 10 or more. Double damage on an attack; the best version of whatever you were attempting." },
        { h: "Success", p: "You met or beat the DC." },
        { h: "Failure", p: "You missed it by 1 to 9." },
        { h: "Critical failure", p: "You missed the DC by 10 or more. Usually something actively goes wrong." },
      ] },
      { type: "note", tone: "tip", p: [
        "<b>Natural 20 and natural 1 are not results — they're nudges.</b> A 20 on the die moves your outcome one step better, a 1 moves it one step worse. A natural 20 that still doesn't beat the DC is a success, not a critical. A natural 1 on a roll that beat the DC by 12 is still a success.",
      ] },
      { type: "pregens", h: "The two characters the demos roll with" },
      { type: "demo", id: "check", h: "Try it",
        p: "Pick who's rolling and what they're rolling against. The maths is shown every time, including the two nudges." },
      { type: "prose", h: "Where your modifier comes from", p: [
        "Almost every modifier in the game is <b>ability modifier + proficiency</b>, and proficiency is <b>your level + a rank bonus</b>: trained +2, expert +4, master +6, legendary +8. Untrained adds <i>nothing</i> — not the rank, not your level.",
        "That last part is the design in a nutshell. The gap between a trained character and an untrained one is small at level 1 and enormous at level 10, and it means a character who is trained in the right skill is always the right person for the job.",
        "So Mari's Athletics of +7 is Str +4, trained +2, and level 1. Sable's Will save of +5 is Wis +0, expert +4, and level 1. You can rebuild every number on both sheets from that sentence.",
      ] },
      { type: "cards", h: "Three kinds of bonus, and they don't all stack", items: [
        { h: "Circumstance", p: "From the situation: cover, a raised shield, good footing. Only the largest circumstance bonus applies." },
        { h: "Status", p: "From spells and conditions: a bard's anthem, being frightened. Only the largest status bonus applies — and status penalties work the same way." },
        { h: "Item", p: "From gear: armour, a magic weapon. Only the largest item bonus applies." },
        { h: "Different types stack", p: "Shield (+2 circumstance) plus Courageous Anthem (+1 status) is +3. Two spells both giving +1 status is still +1." },
      ] },
      { type: "prose", h: "Hero points", p: [
        "You start each session with one, and the GM hands more out for good play. Spend one to <b>reroll any check you just made</b> — you take the new result, so it's a gamble, not a safety net. Spend <i>all</i> of them to avoid dying outright.",
        "Take the reroll. New players sit on hero points until the session ends and they evaporate.",
      ] },
      { type: "map", h: "Three pillars, three gears" },
      { type: "prose", p: [
        "You know the three pillars — fighting, exploring, talking. PF2e agrees, but it slices the game a different way: into three <b>modes</b>, which are really three time scales. Combat has its own mode. Exploration has its own mode. Talking doesn't — it happens in whichever mode you're already in. And there's a third mode, downtime, that covers the days and weeks nobody else's rules bother with.",
        "The rest of this page is one tab per pillar, plus one for downtime. Poke at every demo; they all roll real dice against real numbers.",
      ] },
      { type: "gm", h: "At the table", p: [
        "This is the session-zero tab. Fifteen minutes, tops.",
        "Do the degrees-of-success demo <b>live, on the shared screen</b>: set DC 15 and roll ten times, and let them watch how often a critical happens on its own. That single fact — criticals are common, and they come from beating the DC, not from the die face — reframes the whole game for a 5e player.",
        "Don't teach the bonus types yet. Point at the card, say \"the app will tell you when it matters\", and move on. It only clicks once someone has a shield and a bard at the same time.",
        "Ask each of them now: <i>what does your character want, and who do they already know in " + FLAVOR.port + "?</i> You'll use both answers in the Talk tab.",
      ] },
    ],
  },

  /* ---------------------------------------------------------- */
  {
    key: "fight", label: "Fight", icon: "sword",
    title: "Encounter mode",
    lede: "Rounds of six seconds. Initiative order. Three actions each. This is the mode with the most rules, and it's the one PF2e is proudest of.",
    sections: [
      { type: "prose", h: "Starting a fight", p: [
        "Everyone rolls initiative — usually Perception, but if you were Avoiding Notice you roll Stealth instead, and if you were talking your way in the GM might call for Deception. What you were doing in exploration mode decides what you roll. That's the join between the two gears.",
        "Then you go round the table. On your turn: <b>three actions</b>, in any combination. There is no move-versus-action distinction. Moving is an action. Drawing a weapon is an action. Standing up is an action.",
      ] },
      { type: "cards", h: "The three-action turn", items: [
        { h: "◆ Single action", p: "Strike. Stride. Raise a Shield. Demoralize. Trip. Most things." },
        { h: "◆◆ Two actions", p: "Most spells. Some weapon feats. An activity that spans two of your three." },
        { h: "◆◆◆ Three actions", p: "Your whole turn: a big spell, a Sudden Charge, a full sprint." },
        { h: "⤳ One reaction", p: "Off your turn, when its trigger fires. Aid an ally, Attack of Opportunity if you have it. You get one per round and most level-1 characters have very few options — that's normal." },
      ] },
      { type: "reactions", h: "Your one reaction",
        p: "You get one per round and it happens on someone else's turn. A level-1 character has very few — these three are the ones anybody can use." },
      { type: "note", tone: "warn", p: [
        "<b>The multiple attack penalty is the price of three Strikes.</b> Your first attack each turn is at full value; your second is at −5 and your third at −10. Agile weapons soften it to −4 and −8. It resets at the start of your turn, and it counts <i>attack</i> actions — Trip, Grapple, Shove and spell attacks all pay into it and suffer from it.",
        "This is why the third Strike is usually the wrong choice. Trip, Demoralize, raise a shield, or move somewhere better instead.",
      ] },
      { type: "demo", id: "turn", h: "Build a turn",
        p: "Spend three actions and run them against the " + FLAVOR.foe + ". Every roll shows its arithmetic — including the penalty stacking up, and what happens to the target's AC once it's frightened or prone." },
      { type: "prose", h: "Attacks, and what a critical does", p: [
        "An attack roll is d20 + ability + proficiency + item bonus against the target's AC. Beat the AC by 10 and it's a critical hit: <b>double the damage</b> (roll the dice, add the modifiers, then double the total — that's the whole rule).",
        "Damage is not a separate to-hit; there's no second roll to confirm. And because criticals come from beating the DC by 10, anything that lowers a target's AC — flanking, being prone, being frightened — pushes real criticals into your range. Debuffs are damage in this system.",
      ] },
      { type: "prose", h: "Spells work the other way round", p: [
        "Attack spells roll against AC like anything else. But most spells make the <b>target</b> roll, against your spell DC, and the four degrees decide how much of the spell lands. A successful save usually still means something happened — half damage, or a weaker version of the condition.",
        "That's the second half of the caster's job: you are rarely wasting a turn, you're just choosing between a big effect that might be resisted and a small effect that definitely lands.",
      ] },
      { type: "ref", h: "Conditions you'll meet in your first fight", kind: "condition",
        slugs: ["off-guard", "frightened", "prone", "persistent-damage", "grabbed", "slowed", "stunned", "clumsy", "enfeebled"],
        p: "Real text from the rules. Frightened is worth reading twice: it's a status penalty to <i>everything</i>, checks and DCs alike, which is why Demoralize is a genuinely good use of an action." },
      { type: "prose", h: "When you drop", p: [
        "Nobody dies at 0 hit points in PF2e. You go <b>dying 1</b>, unconscious, and at the start of each of your turns you roll a flat d20 against DC 10 + your dying value to see whether you claw back. Get to dying 4 and you're gone.",
        "Every time you shake off dying you gain <b>wounded 1</b>, and the next time you drop, your wounded value is added to your dying value. The system remembers. Getting picked up twice in a fight is survivable; three times is how characters actually die.",
      ] },
      { type: "demo", id: "dying", h: "Walk it through",
        p: "Take Mari down and try to get her back. Everything here is a real roll against a real DC." },
      { type: "steps", h: "Your first turn, in order", items: [
        "Look at what your three actions could do — say it out loud, badly, and let the table help.",
        "Ask the GM the target's AC only if you're allowed to know it. Otherwise just roll and say the total.",
        "Roll the d20, add your modifier, say the <b>total</b>. Don't say \"I rolled a 14\" — the total is what matters.",
        "If your total beats their AC by 10, say so — that's a critical hit and it doubles your damage.",
        "Roll damage, add the modifier, done. Then decide whether that second Strike at −5 is really better than a Trip.",
        "At the end of your turn, say what you're doing with your reaction, if you have one.",
      ] },
      { type: "ref", h: "The basic actions, in the book's own words", kind: "action",
        slugs: ["strike", "stride", "step", "raise-a-shield", "trip", "grapple", "demoralize", "seek", "aid", "delay", "ready", "escape", "stand"] },
      { type: "gm", h: "At the table", p: [
        "Run the turn builder as a competition: give them both three actions against the " + FLAVOR.foe + " and let them find the Demoralize-then-Strike line themselves. It lands harder discovered than explained.",
        "First real fight: <b>two weak enemies, not one boss</b>. Two bodies teaches flanking, off-guard, and why the third Strike is a trap. One boss teaches that PF2e monsters have a lot of hit points.",
        "Say \"that's a critical\" out loud the first three times it happens on either side, and name why — <i>beat the AC by ten</i>. They'll be doing the arithmetic themselves by the second fight.",
        "Have someone drop on purpose if the dice don't do it for you. Better they meet the dying rules while it's recoverable and you've got a Soothe in the party.",
        "Hand out a hero point the first time either of them does something in character during a fight. That's the whole lesson about hero points.",
      ] },
    ],
  },

  /* ---------------------------------------------------------- */
  {
    key: "explore", label: "Explore", icon: "compass2",
    title: "Exploration mode",
    lede: "Minutes and hours. No initiative, no grid, no counting actions — but you're still choosing something, and what you choose decides how the next fight starts.",
    sections: [
      { type: "prose", h: "The middle gear", p: [
        "Between fights, the game doesn't stop having rules — it changes their grain. You're not spending actions any more; you're declaring what you're <b>doing continuously</b> as the party moves. That declaration is called an exploration activity, and you should always have one.",
        "This matters more than it sounds. If you're Searching, you get a check to spot the tripwire. If you're Avoiding Notice, you roll Stealth for initiative and start the fight hidden. If you declared nothing, you get nothing.",
      ] },
      { type: "demo", id: "explore", h: "Give everyone a job",
        p: "Set each character's activity and see what it buys them — and which of those checks your GM will be rolling in secret." },
      { type: "prose", h: "Some of your dice aren't yours", p: [
        "Searching, sneaking, and remembering things are <b>secret checks</b>: the GM rolls them for you, behind the screen, because knowing you rolled a 3 on Perception tells you something your character doesn't know. If your GM asks for your Perception modifier at the start of a session and never mentions it again, this is why.",
        "It feels strange for one session and then it feels obviously correct. You'll notice you stop metagaming without having to try.",
      ] },
      { type: "ref", h: "What you're actually doing out there", kind: "action",
        slugs: ["search", "avoid-notice", "scout", "investigate", "follow-the-expert", "hustle", "defend", "track"],
        p: "Follow the Expert deserves special mention: it lets a character with no training in a skill borrow a trained ally's proficiency. It's the answer to \"but I'm terrible at Stealth\"." },
      { type: "prose", h: "Recall Knowledge", p: [
        "One action in a fight, or a moment's thought outside one: you ask the GM a question about something in front of you, using the skill that would know. Arcana for the summoned thing, Nature for the beast, Society for the guild insignia, a Lore skill for anything you took Lore in.",
        "Critical failure means the GM lies to you with a straight face. That's not the GM being unfair — it's written in the action. It's also the single best argument for having two characters with different knowledge skills.",
      ] },
      { type: "prose", h: "Healing between fights", p: [
        "Ten minutes and a healer's toolkit gets a Medicine check to <b>Treat Wounds</b> — a chunk of hit points back, repeatable once an hour per patient. This is the system's short rest, and it's the reason someone in the party should be trained in Medicine even if nobody wants to be a healer.",
        "A full night's rest heals you for your Constitution modifier times your level, and clears fatigue. Ten quiet minutes also gets a focus point back with Refocus.",
      ] },
      { type: "stops", h: "When the party stops moving" },
      { type: "links" },
      { type: "gm", h: "At the table", p: [
        "Ask for exploration activities <b>every time the scenery changes</b>, in the same words each session, until they say it without being asked. \"You come up the beach road. What's everyone doing?\"",
        "Collect their Perception, Stealth and knowledge modifiers on a card at session zero, so you can roll secret checks without breaking the scene to ask. The party tracker linked above is exactly this, with the passive DCs already worked out.",
        "The first time someone declares Search and finds the trap, say so plainly: <i>you found it because you said you were looking.</i> That single moment does more teaching than this whole tab.",
        "Let a critical failure on Recall Knowledge actually give them a confident wrong answer. Then let it bite. They'll never forget the four degrees again.",
      ] },
    ],
  },

  /* ---------------------------------------------------------- */
  {
    key: "talk", label: "Talk", icon: "speech",
    title: "The pillar without a mode",
    lede: "Social play doesn't get its own gear. It happens inside whichever mode you're in — a tense parley in encounter mode, a night of drinking in exploration, a season of favours in downtime.",
    sections: [
      { type: "prose", h: "Roleplay first, dice second", p: [
        "PF2e's social rules are not there to replace the conversation. You say what your character says. <i>Then</i>, if it's genuinely uncertain and something's at stake, the GM names an action and you roll to find out how well it landed. A good pitch might get a circumstance bonus; a tactless one might get a penalty.",
        "What the rules add is <b>consequence with teeth</b>. Every social action has four written outcomes, and the bad ones cost you something specific — a door that closes, a friend who turns wary.",
      ] },
      { type: "prose", h: "Attitude is a real number", p: [
        "Every NPC has an attitude toward you: <b>hostile, unfriendly, indifferent, friendly, helpful</b>. Most people start indifferent. Social actions move NPCs up and down that ladder, and where they sit decides what they'll agree to.",
        "You can only <b>Request</b> something of someone who's already friendly or helpful. So the actual skill of social play in this system is: make an impression first, ask second. Walking up to a stranger and asking for the harbour manifest is a failed roll waiting to happen.",
      ] },
      { type: "demo", id: "attitude", h: "Work on " + FLAVOR.npc,
        p: "Indifferent to start, Will DC 15. Try to get to friendly, then ask for something — and watch what Coerce costs you even when it works." },
      { type: "cards", h: "The moves", items: [
        { h: "Make an Impression — Diplomacy", p: "A minute of charm against their Will DC. Critical success moves them two steps. The opener." },
        { h: "Request — Diplomacy", p: "One action, and they must already be friendly. Critical failure knocks them back a step for having the cheek to ask." },
        { h: "Coerce — Intimidation", p: "Threats. It works, and then they're unfriendly afterwards <i>even on a critical success</i>. A tool with a bill attached." },
        { h: "Lie — Deception", p: "Against their Perception DC. Failure gives them +4 against everything you say for the rest of the conversation." },
        { h: "Demoralize — Intimidation", p: "The one that works mid-fight. One action, 30 feet, and they're frightened." },
        { h: "Sense Motive — Perception", p: "Is this person straight with me? Secret check, so ask and then trust what you're told — or don't." },
      ] },
      { type: "note", tone: "tip", p: [
        "<b>Aid is the most under-used action in the game.</b> Say how you're helping, prepare it on your turn, and when your ally rolls, you roll too — a success hands them +1, a critical success +2. Two characters working one NPC is mechanically better than the charming one going alone, and it's how you get the quiet player into a social scene.",
      ] },
      { type: "ref", h: "The social actions, in the book's own words", kind: "action",
        slugs: ["make-an-impression", "request", "coerce", "lie", "demoralize", "sense-motive", "feint", "gather-information", "impersonate", "aid"] },
      { type: "ref", h: "The attitudes", kind: "condition",
        slugs: ["hostile", "unfriendly", "indifferent", "friendly", "helpful"] },
      { type: "gm", h: "At the table", p: [
        "Give every named NPC an attitude before the scene and say it out loud when it changes. \"Bel goes from indifferent to friendly\" teaches the ladder in one sentence.",
        "Never make them roll for the conversation itself — make them roll when the conversation has a decision point. If there's no way to fail interestingly, just let them have it.",
        "Reward the pitch with the dice: a genuinely good argument is a +1 or +2 circumstance bonus, and saying so out loud tells them that talking well is mechanically worth doing.",
        "Watch for the Coerce trap. Let it work the first time, then let the unfriendly consequence land two scenes later. That's the lesson the text is trying to teach.",
        "If one player is doing all the talking, call for Aid explicitly: \"" + FLAVOR.npc + " glances at your friend — are you backing this up?\"",
      ] },
    ],
  },

  /* ---------------------------------------------------------- */
  {
    key: "ashore", label: "Ashore", icon: "anchor",
    title: "Downtime mode",
    lede: "Days and weeks between adventures. The gear most games don't have rules for — which is exactly why it's worth knowing this one does.",
    sections: [
      { type: "prose", h: "The slowest gear", p: [
        "When the party is in port with nothing chasing them, time moves in days. You each say what you're spending those days on, roll once or twice, and the GM tells you what a week of it bought.",
        "It's optional in the sense that some campaigns never stop moving. But it's where a character gets a trade, a reputation, a workshop, and the chance to un-pick a level-1 decision they've come to regret.",
      ] },
      { type: "demo", id: "downtime", h: "Plan a week ashore",
        p: "Give each character something to do with the days and see what it needs from you and the GM." },
      { type: "prose", h: "Retraining deserves a paragraph of its own", p: [
        "You can spend downtime <b>swapping out a feat or a skill</b> you don't enjoy. Not a house rule, not GM mercy — a written activity with a time cost.",
        "Say this to a new player at character creation and watch their shoulders drop. Nobody has to get the build right on day one. Pick the thing that sounds fun; if it isn't, a week ashore fixes it.",
      ] },
      { type: "ref", h: "What a week can buy", kind: "action",
        slugs: ["earn-income", "craft", "learn-a-spell", "retraining", "long-term-rest", "research", "treat-disease", "subsist", "repair"],
        p: "Earn Income's rate depends on a task level your GM assigns and on your proficiency rank — the table lives in Player Core, and it's the one number this app deliberately doesn't try to remember for you." },
      { type: "gm", h: "At the table", p: [
        "One downtime turn per port, even if it's only \"you have four days, one activity each\". It costs five minutes and it makes the world feel like it continues without them.",
        "Ask for a sentence of colour with each declaration — <i>where</i> are they earning that income, and who did they annoy doing it? That's where your next hook comes from, free.",
        "Tell them about Retraining out loud at session one, before either of them has committed to a build they're unsure about.",
        "Downtime is the natural place to hand out the campaign's ship-and-crew business if you're running one. Repairs, wages, and cargo all fit here without needing a subsystem.",
      ] },
    ],
  },

  /* ---------------------------------------------------------- */
  {
    key: "cards", label: "Cards", icon: "cards",
    title: "Table cards",
    lede: "The bits worth having open during play. Search the whole rules set below, or keep the quick card on screen.",
    sections: [
      { type: "quickcard" },
      { type: "glossary", h: "The jargon" },
      { type: "browser" },
      { type: "links" },
      { type: "gm", h: "At the table", p: [
        "Leave this tab open on a phone or a second screen during the first two sessions. The search box covers every basic, skill, exploration and downtime action plus all 43 conditions — it will answer most rules questions faster than the index will.",
        "The quick card is the only thing here worth printing.",
      ] },
    ],
  },
];
