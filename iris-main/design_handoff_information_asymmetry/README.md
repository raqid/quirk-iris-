# Handoff: Information Asymmetry — manifesto page with interactive game-theory scenario

## Overview
A single long-form, manifesto-style web page that argues for "infrastructure to dissolve information asymmetry." It reads top-to-bottom as a typed manuscript (numbered movements I–VI) and contains one **interactive centerpiece**: a playable pharma scenario that demonstrates, through choices and animated consequences, why a mutually beneficial trade never forms when humans must move first — and how autonomous agents reach the deal anyway.

Aesthetic: a light, raw, "illuminated manifesto" feel — aged parchment ground, ink-brown type, a single oxidized-vermilion accent for emphasis/alarm and a muted green for gain. Inspired by odyssey.ml's spare classical typography, inverted to a light ground.

## About the Design Files
The files in this bundle are **design references created in HTML** — a working prototype showing the intended look and behavior, **not production code to copy directly**. The task is to **recreate this design in your target codebase** (React, Vue, Svelte, plain HTML, etc.) using its established patterns, component primitives, and animation approach. If no front-end environment exists yet, pick the most appropriate framework and implement it there.

Note on format: `Information Asymmetry.dc.html` is authored in a lightweight in-house "Design Component" runtime (it loads `support.js`, which is included so the file opens and runs in a browser for reference). You do **not** need to reproduce that runtime — read it as a spec for markup, copy, and the imperative animation logic, then rebuild with your stack's idioms (e.g. React state + refs, or a small vanilla controller).

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, copy, and interaction timing are all specified below and present in the prototype. Recreate the UI pixel-faithfully using your codebase's libraries, then wire the interaction exactly as described.

## Screens / Views

There is **one screen**: a single scrolling page. It has a static editorial body and one interactive figure embedded in movement II.

### A. The manifesto body (static)
- **Purpose**: Read as a manifesto. Pure type, no chrome.
- **Layout**: One centered column, `max-width: 660px`, horizontally centered (`margin: 0 auto`). Page padding `clamp(64px,11vh,128px)` top, `clamp(26px,6vw,40px)` sides, `clamp(96px,14vh,150px)` bottom. Body text is **left-aligned**.
- **Structure** (in order):
  1. **Title** `h1` "Information Asymmetry" — `font-weight:500`, `font-size:clamp(28px,4.4vw,38px)`, `line-height:1.18`, `letter-spacing:-0.01em`, bottom margin `clamp(40px,6vh,60px)`.
  2. **Movement I** — opening paragraph + an italic standalone line ("It is the largest economy nobody can see: the things that were never made.", color `#5C5040`).
  3. **Movement II** — lead paragraph ("…Do not take my word for it. Play it.") **followed by the interactive figure (section B)**.
  4. **Movement III** — lead paragraph + two sub-headed blocks ("Searching is itself dangerous." / "Revealing is the same act as giving away.") + a closing paragraph. Sub-heads are `h2`, `font-weight:500`, `font-size:clamp(21px,2.6vw,25px)`.
  5. **Movement IV** — three paragraphs (the approach).
  6. **Movement V** — two paragraphs (the boundary / what it's not for).
  7. **Movement VI** — closing statement, large: `font-size:clamp(23px,3.2vw,30px)`, `font-weight:500`, `text-wrap:pretty`; followed by an italic vermilion line "We are building the thing that finds it." (`font-size:clamp(20px,2.6vw,26px)`).
- **Movement numerals**: each movement begins with a run-in Roman numeral as an inline `<span>`: color `#9E3413`, `font-size:.82em`, `letter-spacing:.08em`, `font-weight:500`, `margin-right:.55em` (the VI numeral is `.6em` with `vertical-align:.22em`).
- **Emphasis inside prose**: key clauses are wrapped in a `<span style="color:#9E3413">` (vermilion); `<em>` is used for italic term emphasis.
- **No horizontal rules, no eyebrow labels, no cards** in the body — this rawness is intentional.

### B. The interactive scenario (the centerpiece, inside movement II)
A `<figure>` directly under the movement-II lead paragraph. Top margin `clamp(30px,5vh,52px)`.

Sub-parts, top to bottom:

1. **Scenario card** — an intro paragraph in a tinted box.
   - `padding:18px 20px; background:#E3DAC4; border-left:2px solid #9E3413;` text `font-size:17px; line-height:1.6; color:#3A3024`.
   - Copy (exact):
     > You are **Helix Bio**. Two years ago your lead compound, *HX-04*, failed its trial and went on the shelf. You suspect it could work for a different disease, but you are missing the one dataset that would prove it. Somewhere, a lab is sitting on exactly that data and has no idea it is worth anything to anyone. A deal would rescue you both. But to go looking, you would have to reveal that HX-04 failed and what you are now chasing. <span vermilion>Do you?</span>
   - "Helix Bio" is `font-weight:600`; "Do you?" is vermilion `#9E3413`.

2. **Meters row** — a 3-column grid showing live state.
   - Grid: `grid-template-columns:1.4fr .85fr 1.5fr; gap:1px; background:#C8BB9D; border:1px solid #C8BB9D;` (the 1px gap on a hairline-colored background draws the gridlines). Each cell `background:#EAE2CD; padding:13px 14px;`. Cell labels are IBM Plex Mono, `font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:#8A7E66`.
   - **Meter 1 — "Public sentiment"**: a big serif number (`font-size:25px; font-weight:500`) + a `%` glyph, plus a thin progress bar below: track `height:3px; background:#D8CDB2`, fill `background:#2A2118` (turns `#9E3413` when below 90), `transition:width .6s ease, background .6s ease`. Starts at 100.
   - **Meter 2 — "Rivals racing you"**: big serif number, starts 0. Turns `#9E3413` when > 0.
   - **Meter 3 — "Value captured"**: two stacked label→value rows (`display:flex; justify-content:space-between`), one for **Helix**, one for **The lab**. Labels mono 10px uppercase `#8A7E66`; values serif `font-size:19px; font-weight:500`. Both start `$0` in `#8A7E66`.

3. **Cascade log** — an initially empty `<div>` (`display:flex; flex-direction:column; gap:13px; min-height:24px; margin-top:22px`). Consequence "beats" are appended here during play (see Interactions).

4. **Choice controls** (`display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin-top:24px`): a mono "Your move" label + two buttons **"Make the call"** and **"Keep it quiet"**.

5. **Deploy block** (hidden until a human choice is made): a short paragraph ("Whichever you chose, the deal that would have helped you both never formed. There is no safe first move. So stop moving first.") + a green-outlined button **"Deploy agents instead →"**. Separated from above by `border-top:1px solid #C8BB9D; padding-top:20px`.

6. **Deal card** (hidden until the agent search completes): the offer an agent surfaces.
   - Container `border:1px solid #3F7350; background:#E7E8DD;`.
   - Header bar: mono `#3F7350` uppercase "An agent surfaced a deal", `border-bottom:1px solid #CBD0BD`, padding `12px 18px`.
   - Body `padding:18px 18px 20px`:
     - Paragraph: "A lab three time zones away holds a dataset that revives HX-04 for a rare fibrotic disease. It is dead weight on their books. They will license it to you for **$500k**."
     - Math ledger (IBM Plex Mono `13.5px`), three rows with `display:flex; justify-content:space-between`, hairline `#CBD0BD` dividers:
       - "License cost" → `- $0.5M` (color `#9E3413`)
       - "Revived HX-04 program, expected" → `+ $9.5M`
       - "Net to Helix" → `+ $9.0M` (color `#3F7350`, `font-weight:500`)
     - Small note `#5C5040 14px`: "For them, a dead dataset becomes $0.5M up front, plus milestones. Both sides come out ahead."
     - Buttons: **"Buy the license"** (filled green: `background:#3F7350; color:#EFE8D7; border:1.5px solid #3F7350`, hover `#34603F`) and **"Pass"** (subtle: `border:1.5px solid #B7AE94; color:#8A7E66; transparent`).

7. **Reset button** (hidden until an outcome resolves): subtle bordered mono button "← Run it again".

8. **Figcaption** (always visible, italic `#5C5040 17px`): "Played straight, there is no safe first move. The agents never need one. They search over what can be inferred, and the secret moves only at the very end, inside a deal both sides have already agreed to."

## Interactions & Behavior

The figure is a small state machine driven by imperative DOM updates (animated beats appended to the cascade log; meters animated via requestAnimationFrame counters and CSS width transitions). Recreate with your framework's equivalent (React refs + a reducer, or a vanilla controller). All copy strings are in the prototype's logic class.

### Beat animation primitive
Each "beat" is a row appended to the cascade log:
- `border-left:2px solid <color>` (`#C8BB9D` for neutral beats, `#9E3413` for a "bad" outcome beat, `#3F7350` for a "good" outcome beat), `padding-left:14px`, `font-size:16.5px`, `line-height:1.5`, color `#3A3024` (neutral) or `#2A2118` (outcome).
- Enter animation: start `opacity:0; transform:translateY(6px)`, then on next frame transition to `opacity:1; transform:none` over `0.45s ease`.
- Beats fire **sequentially**, default gap **1150ms** between them (the agent "negotiate" beat uses 1800ms because its counter spins for ~1.6s).

### Flow / state transitions
- **Initial**: choice controls visible; deploy / deal card / reset hidden; meters at baseline (sentiment 100, rivals 0, both values $0).
- **"Make the call" (reveal path)**: reset meters, clear log, then play 5 beats:
  1. "You post a partnering call: *Helix is seeking data to repurpose HX-04.*"
  2. "The press reads it as failure. "Helix's lead program is dead."" → **sentiment animates 100 → 78** (bar turns vermilion).
  3. "Rivals infer which disease you are betting on and start racing you to it. Your head start evaporates." → **rivals animates 0 → 2** (turns vermilion).
  4. "The lab sitting on the data you need now sees how badly you need it. Your leverage is gone."
  5. *(outcome, vermilion)* "**You revealed your position and captured none of the value.** The market punished you, rivals are racing, and the quiet $500k deal you might have struck is gone."
  - On completion → **show deploy block**.
- **"Keep it quiet" (hold path)**: reset meters, clear log, play 4 beats:
  1. "You say nothing. HX-04 stays in the cabinet, carried at $0."
  2. "The lab that needs it keeps searching blind. Year one."
  3. "Year two. Neither of you ever learns the other exists."
  4. *(outcome, vermilion)* "**Safe, and worthless.** The treatment that could have existed does not. The value dies in silence."
  - On completion → **show deploy block**. (Meters stay at baseline — the point is nothing moves.)
- **"Deploy agents instead →"**: hide choice + deploy, reset meters, clear log, play 4 search beats:
  1. "Agents model both firms from public exhaust: patents, trial registries, job posts, papers. No one is asked to reveal anything."
  2. "Inferred: Helix needs one dataset to revive a shelved asset. A distant lab is sitting on exactly that data, unused."
  3. "They negotiate privately over the models. **<count>** versions of the deal explored. No public call. No leak. No tip-off." → an inline number **counts 0 → `agentMatches` (default 4217)** over ~1.6s (gap for this beat is 1800ms).
  4. "One match clears the bar. The agent brings you terms."
  - On completion → **show deal card**.
- **"Buy the license"**: hide deal card; set **Helix value → +$9.0M** and **The lab value → +$0.5M** (both `#3F7350`); append a green outcome beat: "**Done. HX-04 is alive again.** You captured $9.0M that was sitting in two cabinets on opposite sides of the world, and they turned a dead asset into revenue. Neither of you ever had to reveal a thing to find it." → **show reset**.
- **"Pass"**: hide deal card; append a vermilion outcome beat: "**You passed on $9.0M of free value,** and HX-04 dies in both cabinets anyway. Which is the whole point: when a deal only helps you, the only thing that ever stood in the way was finding it." (values stay $0) → **show reset**.
- **"← Run it again"**: clear all timers, clear log, reset meters, hide deal/deploy/reset, show choice.

### Counter animation
`countTo(el, target, durationMs)`: ease-out (`1 - (1-t)^2`), updates `textContent` each frame via rAF. Used for sentiment, rivals, and the agent match count. Default durations: meters ~700ms, match count ~1600ms.

### Number tweak
`agentMatches` (default **4217**) is the value the "versions explored" counter spins to — exposed as a configurable parameter in the prototype.

## State Management
Minimal. Conceptually:
- `phase`: `idle | revealing | holding | searching | offer | resolved`
- meter values: `sentiment` (0–100), `rivals` (int), `valueHelix` (string/$), `valueLab` (string/$)
- visibility flags: `deployVisible`, `dealVisible`, `resetVisible`, `choiceVisible`
- a running beat queue / active timer handle (so it can be cancelled on reset or re-choice)

The prototype implements this imperatively with element refs and a chained `setTimeout` beat runner; a React port would use `useReducer` + refs for the cascade container, or render beats from an array in state.

## Design Tokens

### Colors
| Token | Hex | Use |
|---|---|---|
| Parchment ground | `#E9E1CE` | page background |
| Panel / cell fill | `#EAE2CD` | meter cells |
| Tint panel | `#E3DAC4` | scenario card bg |
| Deal card bg | `#E7E8DD` | the green offer card |
| Ink | `#2A2118` | primary text |
| Ink (display) | `#241E15` | closing statement |
| Soft ink | `#3A3024` | secondary body |
| Muted ink | `#5C5040` | captions, italic asides |
| Faint mono | `#8A7E66` | mono labels, baseline values |
| Hairline | `#C8BB9D` | gridlines, dividers, rules |
| Hairline (light) | `#D8CDB2` | meter bar track |
| Hairline (green) | `#CBD0BD` | deal card dividers |
| **Vermilion (accent / alarm)** | `#9E3413` | numerals, emphasis, loss, "Do you?" |
| **Green (gain)** | `#3F7350` | deal card, value gained, success beats |
| Green hover | `#34603F` | Buy button hover |
| Light-on-dark text | `#E9E1CE` / `#EFE8D7` | text on filled buttons; selection fg |
| Pass border | `#B7AE94` | secondary button border |

### Typography
- **Serif**: "EB Garamond" (Google Fonts), weights 400/500/600, with italics. Used for all prose, the title, movement numerals, meter numbers, the closing.
- **Mono**: "IBM Plex Mono" (Google Fonts), weights 400/500. Used for all labels, the math ledger, buttons, the match counter.
- Body: 20px / line-height 1.62.
- Scale: title `clamp(28px,4.4vw,38px)`; movement lead paragraphs 20px; `h2` sub-heads `clamp(21px,2.6vw,25px)`; closing `clamp(23px,3.2vw,30px)` then `clamp(20px,2.6vw,26px)` italic; beats 16.5px; meter numbers 19–25px; mono labels 10–12px with `letter-spacing` .08–.14em, uppercase.

### Spacing / layout
- Column `max-width:660px`, centered. Section rhythm uses `clamp(40–76px)` top margins between movements.
- Meter cells padding `13px 14px`; scenario card `18px 20px`; deal card body `18–20px`.
- Button padding `10–11px 20–22px` (primary), `8px 16px` (subtle reset).

### Texture
- A full-viewport fixed grain overlay: `position:fixed; inset:0; pointer-events:none; mix-blend-mode:multiply; opacity:.05;` with a `background-image` of an inline SVG `feTurbulence` fractal noise (160×160, `baseFrequency:0.85`, 2 octaves). This is the only "image" and it is procedural — no asset file. (Toggleable in the prototype.)
- `::selection { background:#9E3413; color:#EFE8D7; }`

## Assets
**None.** No images, icons, or fonts are bundled. Imagery is limited to the procedural SVG-noise grain overlay (inline). Fonts load from Google Fonts (EB Garamond, IBM Plex Mono). There are no SVG illustrations — all UI is HTML/CSS + text.

## Files
- `Information Asymmetry.dc.html` — the full prototype: markup, all copy, and the interaction logic class. Read this as the source of truth for exact copy and behavior.
- `support.js` — the in-house Design Component runtime, included only so the prototype opens/runs in a browser. **Not** something to port; ignore for implementation.
