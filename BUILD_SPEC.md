# BUILD_SPEC.md — Event Poster

Hand this file to **Claude Code**, **Codex**, **Cursor**, or any AI coding agent to rebuild, extend, or fork this project.

---

## 0. Mission

Build a **single-file, self-contained HTML tool** that turns Luma events into full X + Nostr post campaigns in ~15 minutes per event. **No backend. No build step. No API keys required for the core flow.**

The tool must run by:
1. Opening `index.html` in a browser, OR
2. Hosting the folder on GitHub Pages / any static host.

---

## 1. Hard constraints

| Constraint | Rule |
|---|---|
| Files | `index.html`, `events.json`, `README.md`, `BUILD_SPEC.md` — that's it. Optional `LICENSE`. |
| Backend | None. Everything client-side. |
| Build step | None. No npm, no bundler, no transpiler. |
| Dependencies | None. No CDN scripts. No Tailwind. No React. Vanilla HTML/CSS/JS only. |
| Browser support | Modern evergreen (Chrome, Safari, Firefox, Edge — last 2 years). |
| Offline | Must work offline once loaded for seeded/manual events. `fetch('events.json')` and optional Luma URL imports should fail gracefully. |
| File size | `index.html` < 50 KB uncompressed. |
| Accessibility | Keyboard-navigable form, semantic HTML, contrast AA on dark theme. |

---

## 2. Architecture

```
┌──────────────────────────────────────────────────────┐
│  index.html  (single file, inline CSS + inline JS)   │
│                                                      │
│   ┌──────────┐    ┌──────────────────────────┐       │
│   │  Form    │ →  │  Post Engine (TONES x   │       │
│   │  inputs  │    │  STAGES → 18 strings)    │       │
│   └──────────┘    └──────────────────────────┘       │
│        ↑                       ↓                     │
│        │              ┌──────────────────┐           │
│   ┌──────────┐        │  Render          │           │
│   │ events   │ ──→    │  (6 stages ×     │           │
│   │ .json    │        │   3 copy cards)  │           │
│   └──────────┘        └──────────────────┘           │
└──────────────────────────────────────────────────────┘
```

### Data flow
1. On load, `fetch('events.json')` populates `VENUE` and `EVENTS` globals.
2. User either:
   - Pastes a Luma event URL → browser attempts import → if CORS blocks it, user can paste Luma page source/text → parsed into the form.
   - Clicks a seeded event button → `applyEvent(ev)` fills the form + immediately renders posts.
   - Manually fills the form → clicks **Generate posts** → `readForm()` → `renderOutput(ev)`.
3. `buildPosts(ev)` produces a `Post[]` of length 5. Each `Post = { stage, when, x, nostr }`.
4. `renderOutput(ev)` paints 5 stage cards. Each card has two side-by-side post panels (X / Nostr) with copy buttons and char counts.

---

## 3. Data schema

### `events.json`

```ts
type EventsFile = {
  venue: {
    name: string;
    city: string;
    website: string;
    x_handle?: string;        // include @
    nostr_npub?: string;      // npub1...
    default_hashtags: string[];
  };
  events: Event[];
};

type Event = {
  id: string;                 // unique slug
  title: string;
  date_iso?: string;          // ISO 8601 with TZ offset
  date_display: string;       // human label e.g. "Thu, May 28 · 6:30 PM MDT"
  host?: string;
  speaker?: string;
  speaker_org?: string;
  speaker_x?: string;         // include @ (the engine will normalize)
  speaker_nostr?: string;     // npub1...
  description: string;        // 1-2 sentence hook
  topic_tags?: string[];      // internal-only categorization
  hashtags: string[];         // user-visible #tags
  luma_url?: string;
  tone: 'punchy' | 'educational' | 'cypherpunk' | 'welcoming';
};
```

### Tone preset shape

```ts
type Tone = {
  intro:    string[];   // for Announcement openers
  cta:      string[];   // for "RSVP" lines
  reminder: string[];   // 7-day reminders, may contain {days} and {title_short}
  day:      string[];   // 24-hour reminders
  live:     string[];   // day-of "live now" lines
  followup: string[];   // post-event recap openers
};
```

---

## 4. Post generation rules

The engine produces exactly **6 stages**, each with an `x`, `xlong`, and `nostr` string.

| # | Stage | Send when | Short X goal | Long X goal | Nostr goal |
|---|---|---|---|---|---|
| 1 | Announcement | When event is first posted | ≤ 280 chars | link-light, ≤ 2,000 chars | unlimited; aim ≤ 500 |
| 2 | 7-day reminder | 1 week before | ≤ 280 | link-light, ≤ 2,000 | ≤ 500 |
| 3 | 24-hr reminder | 1 day before | ≤ 280 | link-light, ≤ 2,000 | ≤ 500 |
| 4 | Live update | At event start | ≤ 280 | link-light, ≤ 2,000 | ≤ 500 |
| 5 | Follow-up | Day after | ≤ 280 | link-light recap | ≤ 800 |
| 6 | YouTube recap | After recording is live | ≤ 280 | link-light recap with YouTube link in reply | ≤ 800 |

### Building blocks each post must include
- **Announcement**: tone intro + title + date_display + venue + speaker (with @handle if available) + hook + CTA + Luma URL + hashtags
- **7-day**: tone reminder line (with day count substituted) + title + date + RSVP URL + hashtags
- **24-hr**: tone day line + title + date + speaker_x or speaker name + RSVP URL + hashtags
- **Live**: tone live line + speaker tag + 1-line hook + venue + hashtags
- **Follow-up**: tone followup line + title + speaker tag + numbered takeaways placeholder (1./2./3.) + "Recording soon" + hashtags
- **YouTube recap**: recording is live + takeaway placeholders + YouTube URL for Nostr + "YouTube link in reply" for X

### Variation
- Use `pick(array)` to randomly select intro/cta/etc lines so successive generations don't look identical.
- Substitute `{days}` and `{title_short}` tokens in reminder strings before rendering.

### Character counting
- For short X posts, display `length / 280` and flash `.warn` if over.
- For long X posts, display `length chars`, keep the main post link-light, and use "link in reply" language for RSVP or YouTube URLs.
- For Nostr posts, display `length chars` and a soft hint if > 500 (suggest [Highlighter.com](https://highlighter.com) for long-form).
- All generated post bodies are editable in the app. Copy buttons and X compose buttons must use the edited text, not the original generated string.

### Differences between X and Nostr variants
- **Nostr variants** should:
  - Be more verbose / less compressed (no character pressure).
  - Use `nostr:` URI prefix for npubs (e.g. `nostr:npub1abc...`).
  - Be more verbose / less compressed (no character pressure).
  - Skip @-handles that don't map to Nostr; use full name instead.
- **X variants** should:
  - Use `@handle` for the speaker if `speaker_x` exists.
  - Tighter, fewer line breaks.
  - Prefer 1 emoji per line as visual anchor.
  - Keep the long X variant free of external URLs in the main post; put links in replies.

---

## 5. UI requirements

### Layout
- Two-column grid on desktop, stacked on mobile (`@media (max-width:900px)`).
- Left column: input form panel + seeded events panel.
- Right column: generated posts + 15-minute checklist panel.
- Sticky header with logo/short description + "View on GitHub" + "Clear form" buttons.

### Visual style — defaults
- **Dark theme** (do not provide light mode by default).
- **Accent color**: Bitcoin orange `#f7931a`. Override-friendly via CSS variables.
- **Type**: system UI sans-serif. Post bodies in monospace.
- **Corners**: 10–14px border radius.
- **Spacing**: 14–20px panel padding, 8–16px gaps.

### Components
- `panel` — container with header bar (`h2` uppercase muted) and `panel-body`.
- `btn` (+ `.btn.primary`, `.btn.ghost`, `.btn.small`) — uniform button style.
- `stage` — generated post card with `.stage-head` (title + badge + when) and `.posts` (X | Nostr split).
- `post-body` — pre-wrap monospace block showing the generated text.
- `toast` — bottom-center "Copied" confirmation.

### Interactions
- Clicking a seeded event button fills the form AND immediately renders posts (skip the Generate click).
- Tone selector is a custom radio group; selected option gets `.on` class with accent border.
- Copy buttons use `navigator.clipboard.writeText` and show a toast.
- "Open in X" button uses `https://x.com/intent/tweet?text=...` deep link.

---

## 6. Tone preset content

Use the following phrases as the starting library. Add more, but keep the categories.

### Punchy
- intro: "Mark your calendar.", "Lock it in.", "This one's huge.", "Don't sleep on this."
- cta: "RSVP now →", "Grab a spot →", "Get on the list →", "We'll see you there →"
- reminder: "{days} days.", "{days} days out.", "We're close.", "Almost time."
- day: "Tomorrow.", "24 hours.", "1 sleep.", "It's happening tomorrow."
- live: "LIVE NOW.", "Doors open. Pull up.", "It's go time.", "Started. Come through."
- followup: "What a night.", "That was 🔥.", "Recap drop.", "If you missed it —"

### Educational
- intro: "New event:", "Up next:", "Join us for:", "Coming up:"
- cta: "Free RSVP →", "Save your seat →", "More details + RSVP →", "Sign up to attend →"
- reminder: "{days} days until {title_short}.", "Reminder: {title_short} in {days} days.", "Coming up in {days} days:"
- day: "Tomorrow:", "24 hours out:", "We're 1 day away:"
- live: "Happening now:", "Live now:", "We're live with"
- followup: "Thanks to everyone who came out for", "Recap:", "Here's what we covered:"

### Cypherpunk
- intro: "Signal:", "Sovereignty drop:", "From the underground:", "For the orange-pilled:"
- cta: "RSVP. No KYC.", "Show up. Stay sovereign.", "Lock in →", "Reserve your seat. Cash welcome."
- reminder: "{days} blocks-ish until we meet.", "T-minus {days} days.", "{days} days. Be there."
- day: "Tomorrow. Be there.", "24h. No excuses.", "1 sleep until signal."
- live: "We're live. No retreat.", "LIVE now.", "On-chain in spirit. Live in person."
- followup: "That's a wrap.", "If you weren't there — fix that next time.", "Notes from the front lines:"

### Welcoming
- intro: "You're invited:", "Come hang with us:", "All welcome:", "New to Bitcoin? Start here:"
- cta: "Free + open to everyone →", "First time? Just show up →", "RSVP and say hi →", "Bring a friend →"
- reminder: "Just {days} days until we hang out again.", "{days} days out. Hope to see you.", "Counting down — {days} days."
- day: "See you tomorrow.", "We're 1 day out — looking forward to it.", "Tomorrow we hang."
- live: "We're live. Door's open — come on in.", "Started, but pull up anytime.", "Hanging out now."
- followup: "Thanks for hanging with us.", "What a fun crowd.", "Loved having everyone."

---

## 7. Acceptance tests (manual QA the AI should run)

When rebuilding, the agent must verify all of these by running through them in a headless browser or by tracing logic:

1. **Cold load**: Open `index.html` directly with no server. The form renders; tone defaults to "Educational"; seeded event buttons appear (3 of them) if `events.json` is fetchable. If `events.json` 404s, the form still works; only the seeded panel is empty.
2. **Seeded click**: Click the "Bitcoin in Healthcare" seeded button. Form fills with title, date, speaker, hook, Luma URL. 6 stages render on the right. The Announcement short X post is ≤ 280 chars and includes the date and Luma URL.
3. **Tone switch**: Re-click the same seeded button after switching tone to "Cypherpunk". Generated posts now begin with "Signal:", "Sovereignty drop:", etc.
4. **Manual form**: Clear form. Type "Test Event" as title, "Sat, Jul 4 · 7pm MDT" as date, "Alice" as speaker. Click Generate. 6 stages render. No errors in console.
5. **Copy**: Click Copy on any X post. Clipboard contains the exact post text including emojis and newlines. Toast appears.
6. **Edit drafts**: Edit a generated post body. Character counts update live, Copy uses the edited text, and Open in X uses the edited text.
7. **Char count warn**: Enter a 500-char hook. The Announcement X post char counter shows red `> 280`.
8. **Mobile**: Resize to 375px width. Form stacks above output. Buttons remain tappable (≥ 32px hit target).
9. **Network**: Cold load has no analytics, fonts, or CDN assets. Luma import may request no-key reader/proxy endpoints only after the user clicks **Import from Luma**.

---

## 8. Future enhancements (out of scope for v1, plan in this order)

### v1.1 — Image flyer generator
- Add an "Export flyer" button per stage.
- Use HTML5 `<canvas>` to render a 1080×1350 image with title, date, speaker, venue.
- User downloads as PNG to attach when posting.
- Still no backend.

### v1.2 — Luma calendar import
- Pull the upcoming events list from a Luma calendar, not just single-event pages.
- Let the user select an event from the calendar and generate posts immediately.
- If CORS blocks, support pasted calendar page source as a fallback.

### v1.3 — Optional Postiz integration
- Settings panel where user pastes their self-hosted [Postiz](https://postiz.com) API URL + token.
- Adds a "Schedule via Postiz" button per post.
- Token stored in `localStorage` only. Never bundled in the repo.

### v1.4 — Highlighter.com long-form export
- For the Follow-up stage, add an "Export to Highlighter" button that opens a draft on [Highlighter.com](https://highlighter.com) with a NIP-23 markdown payload.

### v1.5 — Multi-venue support
- Allow `events.json` to ship multiple venues; show a venue switcher.
- Each venue has its own default hashtags and brand color.

### v1.6 — Recurring event templates
- Save form state as a "template" in `localStorage` so weekly recurring events (e.g. "Open Hack Night") can be re-loaded instantly.

---

## 9. Coding conventions

- **Style**: 2-space indent. Semicolons. Double quotes for HTML attrs, single quotes in JS strings.
- **No frameworks**. No transpilers. No Babel.
- **No `var`** — use `const`/`let`.
- **No `eval` / `innerHTML` with user content** — use `textContent` or the provided `escapeHtml()` for any user-supplied string going into the DOM.
- **CSS**: Single `:root` variable block. Avoid `!important`.
- **Comments**: Block headers between major sections (`/* ---------- Section ---------- */`).
- **Functions**: Small, named, hoisted at top of `<script>` block.

---

## 10. Definition of done

- ✅ All files render correctly when served from GitHub Pages.
- ✅ All 8 acceptance tests in §7 pass.
- ✅ The 3 seeded events from `events.json` (Bitcoin in Healthcare, Denver BitDevs, Bitcoin Beer & Art Auction) appear as clickable buttons and produce sensible posts in all 4 tones.
- ✅ Lighthouse Accessibility score ≥ 90, Performance ≥ 95 on desktop.
- ✅ Repo `README.md` includes 3-step GitHub Pages deploy instructions.

---

## Appendix A — Prompt for Claude Code / Codex

> Build a single-file HTML tool per the attached `BUILD_SPEC.md`. The current `index.html` is the v1 baseline — extend, don't replace, unless a section in §8 explicitly calls for a rewrite. Match the existing visual style (dark theme, Bitcoin-orange accent, monospace post bodies). Run the §7 acceptance tests after every change. No new dependencies. No build step. No backend.

## Appendix B — Brand & voice references

- Default venue profile lives in `events.json` and can be customized without changing the post engine.
- Brand color: Bitcoin orange `#f7931a` on near-black `#0b0d10`
- Cross-post targets:
  - X: `https://x.com/intent/tweet?text=...`
  - Nostr: Primal, Damus, Amethyst clients (manual paste — no client supports a universal compose URL yet)
  - Long-form Nostr: [highlighter.com](https://highlighter.com)
