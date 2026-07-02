# Redesigning the AI Workflow Platform

### A first-principles redesign for people who don't code

Prepared as a product design + brand strategy document. It covers UX reasoning, information architecture, a simplified workflow model, node design, a new brand identity, a complete design system, component guidelines, accessibility, and a roadmap.

Where your brief and modern UX best practice disagreed, I chose the best experience for a non-technical user and explained why. Those moments are marked **↳ Why I changed this.**

---

## 0. The core problem (and the one idea that fixes it)

Tools like n8n and Langflow are **node graphs built for engineers**. They expose the machine's mental model: nodes, edges, payloads, expressions, retries. That model is *powerful* and *honest* — but it asks the user to think like the runtime.

Notion AI, Canva, Cursor, and Claude win with non-technical users because they invert this. They expose the **user's** mental model — "I want to write a post," "I want a poster," "fix this function" — and hide the machine underneath. The interface is a conversation about *intent*, and the structure appears as a *result*, not a prerequisite.

**The single organizing principle for this redesign:**

> **Describe the outcome, not the machine. The product builds the machine.**

Everything below is downstream of that sentence. The canvas still exists, but it becomes a place you *review and refine* an automation the AI drafted for you — not a blank grid you assemble by hand from 40 technical blocks.

---

## 1. UX improvements (with reasoning)

Each improvement names the cognitive-load problem it solves. Reducing cognitive load is the acceptance test for every decision in this doc.

**1.1 Start from a sentence, not a canvas.**
The primary "new workflow" entry point is a text box: *"What do you want to automate?"* The user types "Summarize PDFs people email me and save the summary to Drive." The AI drafts a complete, visible workflow they can then edit.
*Reasoning:* A blank canvas is the highest-cognitive-load screen in any builder — it demands the user already know the solution's shape. A sentence demands only that they know their problem, which they always do.

**1.2 Progressive disclosure everywhere.**
Nodes show a friendly summary by default. One field, maybe two. "Advanced settings" (retries, timeouts, raw output, custom code) live behind a clearly-labeled expander, off by default.
*Reasoning:* 90% of users touch 10% of settings. Showing all settings to all users taxes everyone to serve a few. Hide depth; keep it one click away.

**1.3 Plain language over technical terms — always.**
"Trigger" → **"When this happens."** "HTTP Request" → **"Get info from the web."** "Conditional / IF" → **"Make a choice."** "Iterator/Loop" → **"Do this for each."** "Webhook" → **"Start from another app."**
*Reasoning:* Jargon is a gate. Every unfamiliar word is a moment the user suspects this tool isn't for them. Name things after what they *do for the user*, not what they are to the engine.

**1.4 The AI recommends the next step; the user doesn't hunt.**
After any node, the canvas shows 3–4 contextual suggestion chips: *✨ Add AI review · 📧 Email the result · 💾 Save a copy · 👤 Ask for approval.* One click inserts and pre-configures.
*Reasoning:* Search-to-add forces recall (hard). Suggestions enable recognition (easy). Recognition-over-recall is the oldest usability law there is.

**1.5 Explain-back in plain English.**
Every workflow has a permanent one-paragraph plain-English summary at the top: *"Every Friday at 9am, this creates an invoice for each active client, asks you to approve it, then emails it."*
*Reasoning:* Non-technical users can't fully "read" a node graph. A sentence they *can* read is how they build trust that the automation does what they meant. It's also the natural undo-anxiety cure.

**1.6 Test with one safe click — "Try it."**
A prominent **Try it** button runs the workflow once, on sample or real data, in a "nothing is sent for real" dry-run mode by default, and shows results inline step by step.
*Reasoning:* Fear of "what will this actually do?" is the top adoption blocker for automation. A reversible, visible test run converts fear into confidence.

**1.7 Templates as the on-ramp, not the afterthought.**
The home screen leads with outcome-named, editable templates ("Weekly report from a spreadsheet," "Auto-reply to new leads"), not an empty list.
*Reasoning:* Recognition again — people pick a nearby example and tweak it far more successfully than they build from zero.

**1.8 Undo, versions, and a visible run history.**
Every change is undoable; every run is logged in human language with a clear pass/fail and a "what happened" trace.
*Reasoning:* Reversibility is what makes exploration safe. Safe exploration is how non-technical users learn a tool at all.

**↳ Why I changed the framing:** Your brief said "simplify the workflow builder." The deeper win isn't a simpler builder — it's making the builder the *second* thing users see. The AI drafts; the canvas refines. That reframes the whole product around intent.

---

## 2. Information architecture

Flatten to five primary destinations. More than that and the top nav itself becomes a cognitive tax.

**Home** — Outcome-named templates, "Describe what you want to automate" box, your recent and pinned automations.

**My Automations** — The library of what you've built. Card view with status (Live / Paused / Draft), last run, and a plain-English one-liner each. Filter by "Needs my attention" first.

**Builder** — The canvas. Reached by opening an automation or creating one. Not a top-level tab you stare at empty.

**Runs** — Human-readable history across all automations. "Show me everything that failed" and "everything waiting on me" are one tap.

**Connections** — The apps and accounts you've linked (email, Drive, Slack…), plus keys. The one place technical setup lives, quarantined from daily use.

Global, everywhere: the **AI Helper** (persistent, like Cursor's chat / Notion AI) and **Search** (find any automation, run, or connection).

```
Home ── Templates · "Describe it" · Recent/Pinned
My Automations ── Live / Paused / Draft · "Needs attention"
Builder ── Canvas (opened from an automation)
Runs ── Plain-English history · filter failed / waiting-on-me
Connections ── Apps, accounts, keys
                       └── [ AI Helper ] + [ Search ] float over all screens
```

**Two global modes, not many:**
- **Simple (default):** consolidated categories, plain language, advanced settings hidden.
- **Advanced:** unlocks developer nodes (code, raw HTTP, custom expressions), technical labels, and full settings. A single toggle in settings + a per-node "show advanced." *Favorites and "Advanced" are not categories — they're a view and a mode. Treating them as node categories (as the brief's list did) mixes navigation with content and confuses users about where to look.*

---

## 3. Simplified workflow structure

Non-technical users don't think in "nodes and edges." They think in **a story**: *when* something happens, *do* some things, *decide* along the way, *then* let me know. The structure should mirror that story.

**Every automation has the same three-part skeleton, always visible:**

1. **When** — the start. (A schedule, a new email, a button, another app.) Exactly one, chosen first.
2. **Do** — the ordered steps. Read top-to-bottom like a recipe.
3. **Then** — the outcome/notification (optional but encouraged): tell me, save it, post it.

Branches ("Make a choice") and repeats ("Do this for each") nest *inside* Do as indented, clearly-labeled groups — not as free-floating boxes with crossing wires.

**↳ Why I changed this:** A free-form node graph lets users build tangled, unreadable spaghetti — the exact thing that scares non-technical people away. A **guided linear flow with nested groups** (think a vertical checklist that can branch, like a smart to-do list) covers the overwhelming majority of real automations, stays readable at a glance, and still supports branching and loops. Power users who genuinely need arbitrary graphs get free-form canvas in Advanced mode. Default simplicity; escape hatch for the few.

---

## 4. New node categories

Your list had 14 groups. That's above the ~7±2 a person holds comfortably, and several overlapped (Message/Email/Notifications are all "send something out"; Logic/Repeat are both "control flow"; Automation is really "the start"). Favorites and Advanced aren't content categories at all.

**Consolidated to 6 categories** (plus two views). Each maps to a plain-language question:

| Icon | Category | The question it answers | Absorbs from your list |
|---|---|---|---|
| ⚡ | **Start** | *When should this run?* | Automation, (triggers) |
| ✍️ | **Create** | *What should it make?* | Create |
| 🤖 | **AI** | *Where should AI think?* | AI, Knowledge |
| 📥 | **Get** | *What info does it need?* | Web, Files, Data |
| 📤 | **Send** | *Who should hear about it?* | Message, Email, Notifications |
| 🔀 | **Decide** | *What choices or repeats?* | Logic, Repeat, Human Approval |

**Two views layered on top (not categories):**
- ⭐ **Favorites** — a personal, pinned shortcut row across all categories.
- 🧩 **Advanced** — reveals developer nodes (Code, Raw HTTP, Custom expression, Sub-workflow, Queue) inside the relevant category, only when Advanced mode is on.

Six buckets. Each is a verb. A user reasons "I need to *get* the spreadsheet, let *AI* summarize it, then *send* it to my boss" — and the categories are already the sentence.

**↳ Why I merged Knowledge into AI:** "Search your documents before answering" is a *property of how the AI answers*, not a separate user goal. In the node it appears as a toggle — *"🧠 Use my documents"* — inside the AI node. One fewer category, zero lost capability.

---

## 5. Improved node design

**5.1 Anatomy (every node, one consistent card).**

```
┌─────────────────────────────────────────┐
│  🤖  AI Assistant            [AI] ⋯     │  ← emoji + title + category badge + menu
│  Ask AI to write or improve content.     │  ← one-line plain description
│  ─────────────────────────────────────   │
│  “Summarize this in 3 bullet points”     │  ← the ONE field that matters, inline
│  🧠 Use my documents        ▢ off        │  ← common toggle, plain language
│                                           │
│  ⌄ Advanced settings                      │  ← collapsed by default
└─────────────────────────────────────────┘
        ✨ Add AI review   📧 Email it   💾 Save   (suggestion chips on select/hover)
```

Rounded 16px card, soft shadow, soft category-tinted background, generous padding. Icon in a filled rounded-square chip using the category color.

**5.2 Interaction model — click, expand, edit inline.**
- **Collapsed:** icon, title, and a live plain-English value ("Summarize in 3 bullets"). Scannable.
- **Selected/hover:** suggestion chips appear beneath; a soft ring highlights the card.
- **Expanded (click):** the primary field(s) edit *in place* — no modal, no giant side-form. Text fields, dropdowns written in plain language, and simple pickers.
- **Advanced:** one expander reveals technical settings for those who want them.

*Reasoning:* Large forms and modal editors break the user's spatial sense of "where am I in my automation." Inline editing keeps the automation and its edits in one continuous view — the Notion/Canva feel your brief is chasing.

**5.3 Node content examples (plain-language library).**

- ⚡ **When it's time** — "Run every Friday at 9:00am." *(Start)*
- ⚡ **When I get an email** — "Watches an inbox and starts when a new email arrives." *(Start)*
- 🤖 **AI Assistant** — "Ask AI to write or improve content." *(AI)*
- 🤖 **Ask about my documents** — "AI answers using files you've added." *(AI — Knowledge folded in)*
- 📥 **Get a file** — "Grab a file from Drive, Dropbox, or an email." *(Get)*
- 📥 **Read a web page** — "Pull text or data from a link." *(Get)*
- ✍️ **Make a document** — "Create a doc, post, or message from a template." *(Create)*
- 📤 **Send an email** — "Send an email automatically." *(Send)*
- 📤 **Post a message** — "Post to Slack, Teams, or Discord." *(Send)*
- 🔀 **Make a choice** — "Go one way or another based on a condition." *(Decide)*
- 🔀 **Do this for each** — "Repeat the steps for every item in a list." *(Decide)*
- 👤 **Ask for approval** — "Pause and ask a person to review before continuing." *(Decide)*

Every node: friendly icon + consistent emoji, rounded card, clear title, short description, soft category color, category badge. Exactly as your brief asked — with the *language* de-jargoned.

---

## 6. Brand identity

### 6.1 Name candidates (12) + recommendation

Criteria: short, easy to say, professional, modern, brandable, and *not* generic ("Flow…/Auto…/…AI" were deliberately avoided). Availability notes are directional — a full trademark and domain check is required before adoption.

| # | Name | Idea | Read |
|---|---|---|---|
| 1 | **Relay** ⭐ | Handing work along a chain, effortlessly | Warm, human, motion |
| 2 | **Cadence** | A steady rhythm of things getting done | Calm, reliable |
| 3 | **Weave** | Threading steps into one fabric | Crafty, gentle |
| 4 | **Tempo** | Your work, at the right pace | Energetic, musical |
| 5 | **Knack** | You've got a knack for this now | Friendly, confident |
| 6 | **Otto** | "Auto," humanized into a helpful character | Cute, mascot-ready |
| 7 | **Beckon** | Call it and it comes | Distinctive, a little magic |
| 8 | **Hum** | Things quietly running in the background | Minimal, calm |
| 9 | **Stride** | Momentum, moving forward | Confident |
| 10 | **Nimbo** | Coined; light, cloud-adjacent, airy | Modern, ownable |
| 11 | **Loop** | Automations that run and repeat | Simple (but common) |
| 12 | **Piper** | Someone who leads things along | Characterful |

**Recommendation: Relay.**
It's one syllable-and-a-half, universally pronounceable, and its literal meaning *is* the product: passing a task from step to step, and from you to the machine, without dropping it. It's warm and human (a relay is people running together), works as a verb ("Relay it to my team"), and gives a natural mascot/verb system. Runners-up: **Cadence** (best for the "recurring/scheduled" angle) and **Otto** (best if you want a friendly AI-character front-and-center). The rest of this document uses **Relay**.

### 6.2 Brand story

Most automation tools were built by engineers, for engineers, then handed to everyone else with a shrug. The wiring shows. The words are foreign. People who could benefit most — the operator, the marketer, the founder, the teacher — take one look at the tangle of nodes and quietly close the tab.

Relay starts from the opposite end. You describe what you want in your own words, and Relay does the wiring. It hands the work from step to step so you don't have to think about the machinery — only the outcome. It's the teammate who's great with tools so you don't have to be.

### 6.3 Mission

**Give everyone the leverage of automation — without asking them to become an engineer.**

### 6.4 Tagline

Primary: **"Just say what you want done."**
Alternates: "Automation, in your words." · "You describe it. Relay runs it." · "Work that runs itself."

### 6.5 Logo concept

**Concept — "The Baton Arc."** A single continuous rounded stroke that curves like a baton being passed — starting as a dot (the idea), sweeping into an arc (the handoff), and ending in an arrowhead or second dot (the result). It reads simultaneously as a *relay handoff*, a *flow arrow*, and a lowercase gestural "r." One line, one motion — echoing "one continuous flow."

**Logo icon (app icon / favicon):** Just the arc-with-two-dots inside a rounded-square (squircle) tile with a soft top-left-to-bottom-right gradient of the brand indigo→violet. At favicon size it collapses to the two dots joined by the arc — still legible at 16px because it's one bold stroke, no fine detail.

**Wordmark:** "Relay" set in the brand sans (see §6.7), medium weight, slightly tightened tracking, lowercase or title case. The arc mark sits to the left of the word, its ending dot optionally forming the dot of… nothing (there's no i) — so instead the arc's terminal dot aligns to the x-height as a subtle period-like beat.

**SVG-buildable description (for later recreation):**
- Canvas 100×100, centered.
- Start dot: filled circle, center ~(28, 66), r≈7.
- Arc: an open path from the start dot sweeping up-and-right — a single cubic Bézier, e.g. `M28,66 C40,30 62,30 74,50`, stroke width ~10, `stroke-linecap="round"`.
- End element: filled circle at the arc's end ~(74, 50), r≈7 (or replace with a small rounded arrowhead pointing up-right).
- Color: stroke uses the indigo→violet gradient; on the app-icon tile the tile is the gradient and the arc is white.

**System behavior across contexts:**
- *App icon:* squircle tile, gradient fill, white arc, subtle inner highlight.
- *Website / sidebar:* arc mark + wordmark, single indigo on light; white on dark.
- *Favicon (16–32px):* arc + two dots only, solid indigo, no gradient (gradients muddy at tiny sizes).
- *Loading screen:* the arc draws itself on with a stroke-dash animation (the baton "passing"), then the end dot pops — a 700ms brand moment.
- *Dark mode:* arc in violet-200 / white; dots inherit. Never pure-black tile — use the near-black surface color for depth.
- *Light mode:* indigo-600 arc on white or off-white.

### 6.6 Color palette

Built for warmth + trust, with WCAG-checked text pairings. Indigo/violet as the brand spine (intelligent, calm, a little magic), a warm coral accent for AI moments, and semantic colors that never rely on hue alone.

| Role | Name | Hex | Use |
|---|---|---|---|
| Brand primary | Indigo 600 | `#4F46E5` | Primary buttons, links, brand |
| Brand deep | Indigo 800 | `#3730A3` | Hover, gradients, headers |
| Brand light | Indigo 100 | `#E0E7FF` | Tints, selected states |
| Accent (AI) | Violet 500 | `#8B5CF6` | AI moments, gradients |
| Accent warm | Coral 400 | `#FB7185` | Highlights, delight, empty-state art |
| Success | Green 600 | `#059669` | "It worked" (always + ✓ icon) |
| Warning | Amber 500 | `#D97706` | "Needs attention" (always + ⚠ icon) |
| Error | Red 600 | `#DC2626` | "Failed" (always + ✕ icon) |
| Info | Sky 600 | `#0284C7` | Tips, neutral notices |
| Ink | Slate 900 | `#0F172A` | Primary text |
| Muted | Slate 500 | `#64748B` | Secondary text |
| Line | Slate 200 | `#E2E8F0` | Borders, dividers |
| Surface | White | `#FFFFFF` | Cards |
| Canvas | Slate 50 | `#F8FAFC` | App background |
| Dark surface | Slate 900 | `#0F172A` | Dark-mode cards |
| Dark canvas | Slate 950 | `#020617` | Dark-mode background |

**Category tints** (soft node backgrounds, ~8–12% of a hue on white; each also gets a distinct icon shape so color is never the only signal):
Start ⚡ amber-50 · Create ✍️ rose-50 · AI 🤖 violet-50 · Get 📥 sky-50 · Send 📤 emerald-50 · Decide 🔀 indigo-50.

### 6.7 Typography

- **UI + body:** *Inter* — neutral, highly legible, excellent at small sizes, huge weight range. (Alt: Geist, or the system stack for performance.)
- **Display / marketing headings:** *Instrument Serif* or *Fraunces* for a touch of warmth and premium editorial feel — used sparingly for hero moments only.
- **Monospace (Advanced mode, code, logs):** *JetBrains Mono*.
- Type is set in a modular scale (see §7.2). Line-height generous (1.5 body, 1.2 headings). We never go below 14px for interactive text.

### 6.8 Icon style

Rounded, 2px stroke, consistent 24px grid, softly geometric — *Lucide* or *Phosphor (rounded)* as the base set. Category icons live inside filled rounded-square chips. Consistent corner radius and stroke weight across the whole set; no mixing filled and outline styles in the same context.

### 6.9 Illustration style

Soft, rounded, semi-abstract shapes with the brand gradient; friendly but not childish. Think Notion's calm spot illustrations crossed with Stripe's precision. Used mainly in **empty states**, onboarding, and success moments. People depicted abstractly or not at all (keeps it inclusive and cheap to scale). Light grain/noise optional for a premium, non-flat feel.

### 6.10 Brand personality

**Calm, capable, encouraging, quietly clever.** Relay is the friend who's great with computers and never makes you feel dumb for asking. Confident but never flashy; helpful but never condescending. Five traits: *Approachable · Trustworthy · Clever (not clever-clever) · Warm · Effortless.*

### 6.11 Voice and tone

- **Plain, warm, second person.** "Let's set up when this runs," not "Configure trigger parameters."
- **Verbs over nouns.** "Send an email," not "Email dispatch action."
- **Encouraging on errors, never blaming.** "That email address looks off — mind checking it?" not "Invalid input."
- **Short.** One idea per sentence. Buttons say the verb: *Try it · Turn on · Add step.*
- **Celebrate quietly.** "Nice — your first automation is live." No confetti overload.
- **Never expose internals in the default voice.** Stack traces and payloads live in Advanced/Runs detail, not in the friendly layer.

---

## 7. Design system

One consistent visual language, expressed as tokens. Values are given so this can be implemented directly in CSS variables / Tailwind / Figma.

### 7.1 Color tokens
See §6.6 for the palette. Token naming: `--color-brand`, `--color-brand-deep`, `--color-accent-ai`, `--color-success/warning/error/info`, `--color-ink`, `--color-muted`, `--color-line`, `--color-surface`, `--color-canvas`. Dark mode swaps `surface`/`canvas` for the Slate 900/950 pair and lightens brand tints. **Rule:** status is *always* color + icon + text, never color alone.

### 7.2 Typography scale (modular, 1.25 ratio, 16px base)

| Token | Size / line-height | Weight | Use |
|---|---|---|---|
| Display | 48 / 52 | 600 | Marketing hero |
| H1 | 32 / 40 | 600 | Page title |
| H2 | 24 / 32 | 600 | Section |
| H3 | 20 / 28 | 600 | Card / node group title |
| Body-lg | 18 / 28 | 400 | Lead paragraphs |
| Body | 16 / 24 | 400 | Default |
| Small | 14 / 20 | 400/500 | Secondary, labels |
| Caption | 12 / 16 | 500 | Badges, timestamps |

### 7.3 Spacing scale (4px base)
`4, 8, 12, 16, 24, 32, 48, 64, 96`. Tokens `space-1…space-9`. **Default to generous** — cards use 24px padding, sections 48–64px. Whitespace is the primary tool for the "premium, uncluttered" feel.

### 7.4 Border radius
`sm 8px` (chips, badges) · `md 12px` (buttons, inputs) · `lg 16px` (cards, nodes) · `xl 24px` (modals, panels) · `full 9999px` (pills, avatars). Rounded everywhere; nothing sharp.

### 7.5 Elevation & shadow (soft, layered, low-opacity)

| Level | Shadow | Use |
|---|---|---|
| 0 | none (1px `--color-line` border) | Flat cards on canvas |
| 1 | `0 1px 2px rgba(15,23,42,.06)` | Resting cards, inputs |
| 2 | `0 4px 12px rgba(15,23,42,.08)` | Hover, dropdowns, nodes |
| 3 | `0 12px 32px rgba(15,23,42,.12)` | Modals, popovers |
| 4 | `0 24px 64px rgba(15,23,42,.16)` | AI Helper panel, spotlight |

Shadows are soft and diffuse (never hard/black). Glassmorphism used *sparingly* — only on floating layers over content (AI Helper, command palette): `background: rgba(255,255,255,.72); backdrop-filter: blur(20px);` with a 1px hairline border. Never on primary content cards (hurts contrast/legibility).

### 7.6 Motion guidelines
- **Durations:** micro 120ms, standard 200ms, entrance 300ms, brand moment 700ms.
- **Easing:** `cubic-bezier(.2,.8,.2,1)` (soft ease-out) for entrances; ease-in-out for moves.
- **Principles:** animate to explain (a new node slides in from where it was added), never to decorate. Everything reversible feels reversible. Respect `prefers-reduced-motion` — drop to instant/opacity-only.

### 7.7 Grid & layout
12-column fluid grid, 1200px max content width, 24px gutters. App shell: left sidebar (72px collapsed / 240px expanded) + main + optional right AI panel (360px). Builder canvas is full-bleed with a floating toolbar. Mobile: single column, bottom tab bar, AI Helper as a sheet.

### 7.8 Icon sizing
`14px` inline-with-text · `16px` dense UI · `20px` default buttons/menus · `24px` node/category chips · `32px+` empty-state/feature. Stroke scales with size to keep weight visually constant.

---

## 8. UI component guidelines

Each component lists its variants and states. All interactive components have visible focus, hover, active, disabled, and (where relevant) loading states.

**Buttons** — Variants: *Primary* (indigo fill, white text), *Secondary* (surface + line border), *Ghost* (text only), *Danger* (red, for destructive), *AI* (gradient indigo→violet, for AI actions). Sizes sm/md/lg, radius 12px. Always a verb. Min 44×44px hit target. Focus ring: 2px brand at 2px offset.

**Inputs** — Rounded 12px, 1px line border, generous 12–16px padding, floating or top-aligned plain-language labels, helper text below, inline validation with icon + message (never color-only). Types: text, textarea (auto-grow), select (plain-language options), toggle, date/time (native pickers), file drop, and the signature **prompt field** (large, friendly, with example placeholder).

**Cards** — Surface, radius 16px, elevation 1, 24px padding. Hover lifts to elevation 2. Used for automations, templates, agents.

**Dialogs / Modals** — Radius 24px, elevation 3, max 560px, dimmed scrim, close on Esc/scrim, focus-trapped. Reserve for focused decisions; prefer inline editing and side panels otherwise.

**Tables** (Runs, Data) — Zebra-free, 1px row lines, 44px+ rows, sticky header, right-aligned numbers, sortable headers with arrow + aria-sort. Plain-English status cells (icon + label). Empty and loading states built in.

**Badges** — Small caps-off pills, radius-full, 12px. Category badges use category tint + icon. Never a bare color dot.

**Tags / Chips** — Removable (× with aria-label), used for connections, filters. Suggestion chips (✨) are a distinct style: dashed/tinted, one-click insert.

**Tooltips** — Dark surface, 8px radius, 12px text, 300ms delay, arrow, keyboard-reachable (show on focus). Never the *only* place critical info lives.

**Empty states** — First-class, not afterthoughts. Each has: a soft brand illustration, a warm one-liner, and a single obvious action. E.g. My Automations empty: *"Nothing here yet — let's automate something."* → **[Describe what you want]** + template row.

**Loading states** — Skeletons (not spinners) for content; inline spinner only for button-scoped actions; AI thinking uses a gentle animated gradient shimmer on the AI node/panel. Always a plain-language label ("Reading your file…").

**Error states** — Human, specific, recoverable. Pattern: what happened (plain) + why (if useful) + the fix as a button. Never a raw code in the friendly layer. Field errors inline; page/run errors in a card with a **Try again** action.

**Toasts** — Bottom-center or bottom-right, radius 12px, elevation 3, icon + short text + optional action, auto-dismiss 4–6s (errors persist until dismissed), stack max 3, screen-reader announced via `aria-live`.

### 8.1 AI-specific components
- **AI Helper panel** — persistent right-side chat (glass surface). Understands context ("add a step that emails my boss"), can build/edit the current automation, and streams responses. Has quick-action chips.
- **Prompt field** — the hero input; large, rounded, example placeholder, ⏎ to run, supports "/" for quick commands and attaching files/connections.
- **AI suggestion chips** — ✨-prefixed, contextual, one-click insert-and-configure (§1.4).
- **AI draft banner** — when the AI builds a workflow, a dismissible banner: *"I drafted this for you. Review each step and hit Try it."*
- **Confidence / source note** — when AI uses your documents, a small "Based on 3 of your files" link opens sources (trust + accuracy).
- **Streaming/thinking state** — gradient shimmer + "Thinking…"; cancellable.

### 8.2 Workflow node component
Full spec in §5. Tokens: radius-lg, category tint background, category-color icon chip, elevation 1 (2 on hover/selected), 24px padding, plain-English collapsed value, inline-edit expanded, suggestion chips on select, single Advanced expander. Selected = 2px brand ring. Connector between nodes is a soft vertical line with a "+ add step" hover target — adding a step is always one obvious click, never a drag-to-connect puzzle.

### 8.3 Agent cards
For saved/reusable AI agents ("My Invoice Assistant"): card with avatar (generated brand-gradient glyph), name, one-line purpose, the connections it uses (chips), status (Live/Paused + icon), last-run, and quick actions (Run, Edit, Pause). Consistent with automation cards but marked with an AI accent.

### 8.4 Timeline
Vertical timeline for a run: each step a row with icon, plain title, status (icon + label + color), duration, and expandable detail. Branches shown as indented sub-rows. Reads top-to-bottom like the automation itself — same mental model in build and in review.

### 8.5 Execution logs
Two layers. **Plain view (default):** human sentences — "Read invoice.pdf ✓ · Asked AI to summarize ✓ · Waiting for your approval ⏳." **Technical view (Advanced):** raw inputs/outputs, timestamps, durations, payloads, error stacks, retry counts — monospace, copyable. One toggle switches between them; the friendly layer is never polluted with the technical one.

---

## 9. Accessibility (WCAG 2.1 AA)

Accessibility is a baseline, not a feature. Concrete commitments:

- **Contrast:** all text meets AA (≥4.5:1 body, ≥3:1 large/UI). The palette in §6.6 was chosen with this in mind (measured: Indigo 600 on white ≈ 6.3:1, white on Indigo 600 ≈ 6.3:1, Slate 500 on white ≈ 4.8:1, Slate 900 on white ≈ 17.9:1 — all pass AA). Brand-on-color pairings are verified, not assumed.
- **Never color alone:** every status carries an icon + text label (✓ worked, ⚠ needs attention, ✕ failed). Category identity carries an emoji/icon + label, not just a tint. This also helps colorblind users and grayscale printing.
- **Keyboard:** every action reachable and operable by keyboard. Logical tab order, visible 2px focus rings, Esc closes overlays, arrow-key navigation in the canvas and menus, a full command palette (Cmd/Ctrl-K) so nothing *requires* a mouse or drag.
- **Screen readers:** semantic HTML/ARIA; nodes announce "AI Assistant, step 2 of 4, summarize in 3 bullets"; live regions announce run progress, toasts, and AI streaming; images/illustrations have alt text or are marked decorative.
- **Targets & motion:** ≥44×44px hit targets; honors `prefers-reduced-motion`; no motion-only meaning; no content flashes >3×/sec.
- **Zoom & reflow:** usable at 200% zoom and 320px width without loss of content or function.
- **Language:** plain language *is* an accessibility feature (cognitive load), benefiting everyone including users with cognitive disabilities and non-native speakers.

*(A dedicated accessibility audit skill can validate any built screen against this checklist before handoff.)*

---

## 10. Future improvements (roadmap)

**Near term**
- **Natural-language editing of live automations** — "change the schedule to Mondays" edits the built flow.
- **Explain-and-diff** — before saving AI edits, show a plain-English "here's what will change."
- **Template marketplace** — community + team templates, outcome-named.
- **Mobile approvals** — the "👤 Ask for approval" step becomes a push notification you approve on your phone.

**Mid term**
- **Agents that watch & act** — standing agents ("watch this inbox, triage leads") beyond one-shot flows.
- **Collaboration** — comments on steps, shared team workspaces, roles/permissions, audit trail.
- **Smart error recovery** — AI proposes a fix when a run fails and offers one-click retry-with-fix.
- **Cost/usage meter** in plain language ("this ran 40 times this week").

**Longer term**
- **Multimodal triggers & steps** — voice ("Hey Relay, every morning…"), screenshots, and screen recordings as inputs.
- **Learning from edits** — Relay learns each user's preferences (tone, recipients, formats) and pre-fills better over time.
- **Simulation mode** — safely test a change against last month's real runs before going live.
- **Trust center** — per-automation permission scopes, data-residency, and clear "what can this touch" summaries for non-technical peace of mind.

---

## Summary of what I changed from the brief (and why)

1. **Made the AI drafter the front door**, not just a helper — because a blank canvas is the biggest barrier for non-technical users.
2. **Consolidated 14 categories → 6 verbs** (+ Favorites/Advanced as views) — because 14 exceeds working memory and several overlapped.
3. **Folded Knowledge into AI** as a toggle — it's a property of answering, not a separate goal.
4. **Replaced free-form node graphs with a guided When/Do/Then flow** (graphs live in Advanced) — spaghetti canvases are exactly what scare this audience.
5. **De-jargoned every label** and added a permanent plain-English explain-back — trust comes from reading, not wiring.
6. **Added a safe "Try it" dry-run and plain-language run logs** — reversibility is how beginners learn safely.

Everything else honors your brief directly: friendly nodes, soft premium visuals, glass where appropriate, a full design system, a new brand (**Relay**), a recreatable logo, and WCAG AA throughout.
