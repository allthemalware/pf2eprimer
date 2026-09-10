# PF2e Primer

An interactive introduction to **Pathfinder 2e (Remaster)** for players who have
already played tabletop RPGs and just need to know what *this* one does
differently. Six tabs, a dozen live demos, and every rule it teaches is
demonstrated with real dice against real numbers rather than described.

Single self-contained `dist/index.html` — no framework, no build step to *use* it,
nothing sent anywhere. Text the file to a player, host it, or install it as an app.

## What it covers

The three pillars you already know, mapped onto the three **modes of play**
Pathfinder actually uses:

| Tab | Pillar | Mode | The demo |
|-----|--------|------|----------|
| **Start** | — | — | **Degrees of success.** Roll any of the pregens' checks against any DC and watch the four outcomes resolve, with the arithmetic and the natural-20 nudge spelled out. Roll twenty at once to see how often criticals actually happen. |
| **Fight** | Combat | Encounter | **Turn builder.** Spend three actions from a real palette, then run them: multiple attack penalty stacking up, a critical hit doubling damage, and the target's AC visibly dropping as it becomes frightened and prone. |
| | | | **Going down.** Take a character to 0 hit points and try to get her back — dying, recovery flat checks, wounded, and spending hero points to cheat death. |
| **Explore** | Exploration | Exploration | **Activity board.** Assign exploration activities and marching order, see which checks the GM rolls in secret, and what it costs you when nobody declares Search. |
| **Talk** | Social | *all of them* | **Attitude ladder.** Work an NPC from indifferent to helpful with Make an Impression, then find out what Coerce costs you even when it works. |
| **Ashore** | — | Downtime | **A week in port.** Earn Income, Craft, Retrain, Long-Term Rest — and what the GM still has to decide for each. |
| **Cards** | — | — | The quick card, a jargon glossary, and a search box over every bundled condition and action. |

## Two ways to use it

- **Player mode** (default) — self-paced. Send the link to your players before
  session one; it explains itself with no GM present, and remembers which tabs
  they've read.
- **GM mode** — the **GM** button in the header adds an *At the table* block to
  the bottom of every tab: what to run, in what order, what to say, and which
  moments to let land. Same file, same link.

## Run it

```sh
python3 tools/build.py        # assemble dist/index.html
# then either:
open dist/index.html          # straight from the file, fully offline
npx pf2e-primer               # serve at http://localhost:8726 and open the browser
```

## Where the rules text comes from

Every quoted condition and action description — 43 conditions and 101 actions —
is Paizo's own text, generated from the open-source Foundry VTT pf2e system data,
so the primer can't drift from the book as it gets edited:

```sh
git clone --depth 1 --filter=blob:none --sparse https://github.com/foundryvtt/pf2e.git pf2e-data
cd pf2e-data && git sparse-checkout set packs/pf2e/conditions packs/pf2e/actions && cd ..
python3 tools/build_reference.py --src pf2e-data/packs/pf2e --out data/reference.generated.js
```

The explanations *around* that text are ours. Two things are deliberately not
included, because getting them subtly wrong would be worse than not having them:
the **Earn Income table** (it depends on a task level the GM assigns, and the app
says so) and the **DC-by-level table** (the app teaches simple DCs and the
+10 rule instead).

One rule is applied by inference rather than quotation: spending all your hero
points to escape death removes the dying condition, and the app then applies
wounded 1, following the dying condition's own "any time you lose the dying
condition" clause. If your table reads that differently, it's one line in
`dyingHero()`.

## Re-flavouring it

The examples are nautical because that's the campaign they were written for.
Everything flavour-related is five strings at the top of `src/content.js`:

```js
const FLAVOR = { ship: "Salt Mercy", port: "Bracklewater", npc: "Quartermaster Bel", … };
```

Change those and rebuild, and every example in the app follows. The two pregens
(`PREGENS`), the teaching NPC (`FOE`) and the whole chapter structure (`CHAPTERS`)
are in the same file — `src/engine.js` only renders what's there.

## Tests

```sh
npm install                   # jsdom
node tools/test.mjs
```

137 assertions over the built file. They cover the resolution rules the app
teaches (degrees of success including both natural-20 and natural-1 nudges, the
multiple attack penalty, dying and recovery, attitude shifts), re-derive **every
hand-authored number on both pregens** from `ability + rank + level`, and check
that every action and condition the content cites actually exists in the bundled
data.

## The other two tools

- [PF2e Party Tracker](https://thewhytewolf.github.io/pf2epartytracker/) — GM-side passive stats, secret checks and the exploration board.
- [PF2e Spellbook](https://thewhytewolf.github.io/pf2espellcards/) — player-side spell preparation and casting tracker.

## Licensing

Application code is MIT (see [`LICENSE`](./LICENSE)). Bundled Pathfinder
condition and action text is Paizo content under the ORC and OGL licenses — see
[`notice.md`](./notice.md). The pregenerated characters, the teaching NPC and the
explanatory prose are original. This is an unofficial fan tool, not affiliated
with Paizo.
