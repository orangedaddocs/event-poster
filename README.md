# Event Poster

A free, single-file, self-hosted post generator for Luma events.
Paste a Luma event, get ready-to-copy X + Nostr campaigns.

> **What it does:** You give it one event. It gives you back a full campaign: short X posts, longer link-light X posts, Nostr posts, and a YouTube recap follow-up. ~15 minutes per event, no scheduler required, no API keys.

---

## ✨ Features

- **Luma-first workflow**: paste a Luma URL, or paste Luma page text/source if browser import is blocked
- **6-stage campaign** per event: Announcement → 7-day reminder → 24-hr reminder → Live update → Follow-up recap → YouTube recap
- **Short X, long link-light X, and Nostr variants** for every stage, with character counts and automatic short-X trimming to stay under 280
- **4 tone presets**: Punchy, Educational, Cypherpunk, Welcoming
- **Editable post drafts** with one-click copy + "Open in X" using your edited text
- **15-minute checklist** to keep posting consistent
- **Seeded events** load from `events.json` so common examples are ready to test
- **Zero build, zero backend** — a single HTML file. Works on GitHub Pages or just `open index.html`.

---

## 🚀 Quick start

### Option 1 — Host on GitHub Pages (recommended, free, ~3 min)

1. Create a new GitHub repo (e.g. `event-poster`).
2. Drop these three files in the repo root:
   - `index.html`
   - `events.json`
   - `README.md`
3. In repo settings → **Pages** → Source: `main` branch / `/ (root)` → Save.
4. Wait ~30 seconds. Your tool is live at `https://<your-username>.github.io/event-poster/`.

### Option 2 — Use locally

Just open `index.html` in any browser. Done.

---

## 📝 Usage (the 15-minute workflow)

1. Paste a **Luma event URL** and click **Import from Luma**.
2. If browser import is blocked, click **Paste Luma text/HTML**, paste the Luma page source or copied event text, then parse it.
3. Edit the generated fields if needed and pick a **tone**.
4. Click **Generate posts** if you changed anything.
5. Walk down the 6 stages. For each:
   - Click **Copy** on the short X variant → paste into X
   - Use the **long / link-light X** variant when you want the main post to carry more context and put the RSVP or YouTube link in a reply
   - Click **Copy** on the Nostr variant → paste into [Primal](https://primal.net) / [Damus](https://damus.io) / [Amethyst](https://github.com/vitorpamplona/amethyst)
   - Use the **calendar app of your choice** to schedule the 7-day, 24-hr, Live, Follow-up, and YouTube recap variants on time
6. Use the **15-min checklist** at the bottom to confirm nothing was missed.

That's it. ~15 min per event, ~3-4 events per month = ~1 hour/month of posting work.

---

## 🛠 Customize for your venue

### 1. Update venue info

Edit `events.json`:

```json
{
  "venue": {
    "name": "Your Meetup",
    "city": "Your City",
    "website": "https://example.com",
    "x_handle": "@yourmeetup",
    "nostr_npub": "npub1...",
    "default_hashtags": ["#Bitcoin", "#YourCity"]
  },
  "events": [ ... ]
}
```

### 2. Seed your own events

Add objects to the `events` array. Each event:

```json
{
  "id": "unique-slug",
  "title": "Event title",
  "date_iso": "2026-06-01T18:00:00-06:00",
  "date_display": "Mon, Jun 1 · 6:00 PM MDT",
  "host": "Your Meetup",
  "speaker": "Speaker Name",
  "speaker_org": "Their company",
  "speaker_x": "@speaker",
  "speaker_nostr": "npub1...",
  "description": "One-line hook that explains why this event matters.",
  "hashtags": ["#Bitcoin", "#YourTopic"],
  "luma_url": "https://luma.com/xxxx",
  "tone": "educational"
}
```

### 3. Rebrand the colors

In `index.html`, change the `:root` CSS variables:

```css
--accent: #f7931a;    /* Bitcoin orange — change to your brand color */
--bg: #0b0d10;        /* Dark background */
```

### 4. Edit the tone presets

Open `index.html`, find `const TONES = {...}` near the top of the `<script>` block, and edit the intro / cta / reminder phrases for each tone.

---

## 🤝 Why this exists

Great event education can disappear fast if nobody has time to turn the event page into posts, reminders, and recaps. Writing the same campaign from scratch gets old quickly.

This tool fixes that for the next one. **15 minutes per event, every event gets a campaign.**

---

## 📄 License

MIT. Use it. Fork it. Ship it.
