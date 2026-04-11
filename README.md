# Job Search OS — BD/Partnerships Edition
**Version 3.1 · April 2026**

A personal job search operating system built on Claude. Not a prompt library. Not a chatbot. A persistent, connected workspace that knows who you are, reads your calendar and email, tracks your outreach, generates tailored resumes, and runs structured interactive workflows on command.

---

## What's in the box

| File | What it is |
|---|---|
| `job-search-os-v4.html` | Full dashboard — all workflows + resume generator in one file |
| `jobos-chrome-extension-v2.zip` | Chrome extension v2 — nudge alerts, Gist sync, outreach tracker sync |
| `CLAUDE.md` | Master context file — your brain, loaded into every Claude session |
| `DEV_CONTEXT.md` | Developer reference — full system architecture for LLMs and engineers |
| `bd-partnerships-os-v2.zip` | Claude Code OS — slash commands + sub-agents for terminal use |
| `BD_Partnerships_Job_Search_OS.docx` | All prompts as a Word doc for offline reference |

---

## Setup in 10 minutes

### 1. Open the dashboard
Download `job-search-os-v4.html`. Double-click. Opens in Chrome or Safari — no server, no install, no internet required. All data saves automatically between sessions. The resume generator is built in — no separate file needed.

### 2. Install the Chrome extension v2
```
1. Unzip jobos-chrome-extension-v2.zip
2. Chrome → chrome://extensions
3. Enable Developer mode (top right)
4. Load unpacked → select the jobos-extension-v2 folder
5. Pin it to your toolbar
6. If upgrading from v1: remove the old extension first
```

### 3. Set up your Claude Project
1. Go to claude.ai → create a Project called **Job Search OS**
2. Project settings → upload `CLAUDE.md` to the knowledge base
3. Connect Google Calendar, Gmail, and web search in the Project
4. Open a new chat in the Project and type: *What do you know about me?*

If Claude responds with your Huawei/Qualia/Pandora background, target roles, and gap bridges without you pasting anything — it's working.

### 4. (Optional) Configure Gist profile sync in the extension
1. Create a public GitHub Gist with a file called `profile.json`
2. Copy the raw URL (click Raw in GitHub Gist)
3. Open the extension → Nudges tab → paste raw URL → Save
4. The extension will fetch the latest version every time it opens — no hardcoded strings to update

---

## The daily workflow (20 minutes)

| When | Action | Tool |
|---|---|---|
| Morning (2 min) | Run briefing — top 3 actions, follow-up alerts | Dashboard `/brief` → paste into Claude |
| Morning | Check nudge badge — amber number = overdue follow-ups | Chrome extension → Nudges tab |
| Before applying | Score any JD on LinkedIn | Chrome extension → auto-scores on open |
| After scoring | One-click → resume generator with role pre-filled | Extension `/score` → "Build resume" button |
| Before applying | Build warm intro before submitting | Dashboard `/referral` → paste into Claude |
| When applying | Full application package — resume, gap bridge, cover note | Dashboard `/apply` or `/resume` panel |
| Night before interview | Full prep with live company research | Dashboard `/prep` → paste into Claude |
| Morning of interview | Interactive mock — one Q at a time, live scoring | Dashboard `/mock` → paste into Claude |
| Within 2 hrs after | Debrief — score answers, draft thank-you | Dashboard `/debrief` → paste into Claude |
| When offer arrives | Negotiation strategy + exact call script | Dashboard `/negotiate` → paste into Claude |
| Weekly | Pipeline review — what's moving, what's stalling | Dashboard `/pipeline` → paste into Claude |
| After 3+ interviews | Pattern analysis — find weak spots | Dashboard `/pattern` → paste into Claude |

---

## Component 1 — Dashboard (`job-search-os-v4.html`)

### What changed in v4
The resume generator is now fully integrated — it lives as the `/resume` panel in the sidebar, not as a separate file. The `/score` panel now has a **→ /resume — build resume for this role** button that appears after scoring: one click pre-fills the resume generator with the company name and full JD already loaded. The dashboard quick-launch grid also has a `/resume → build` button.

### All panels

**Dashboard** — Live calendar, pipeline health snapshot, 26-week activity heatmap, 4 live metrics (active roles, commands run, interviews logged, day streak). Quick-launch buttons: `/brief`, `/score`, `/resume`, `/prep`, `/debrief`.

**Pipeline tracker** — Stage pills, health dots (green/amber/red), last action, next step. Add and remove roles.

**Outreach tracker** — 59 companies pre-loaded from your Google Sheet. Track daily reach-outs, follow-up counts per company, 14-day velocity chart. Daily goal bar (default 5/day, adjustable). Bulk outreach prompt generator — select companies, generate personalized Claude prompts for each.

**Usage history** — Every command logged automatically. Four views: all activity, workflow usage bars, interviews, scored roles. Export JSON. Streak counter.

**10 workflow panels** — Each generates a complete, pre-filled Claude prompt using your actual background and metrics. See workflow table above.

**`/resume` panel (new in v4)** — 5-step resume generator integrated directly:
1. Enter role or quick-load (Tenstorrent, Placer.ai, Typeface, Nothing.tech, Microsoft, Emissary, G42, Apple). Live JD scoring as you type.
2. Choose template (Enterprise / Edge AI / Startup) and role type — auto-detected from JD.
3. Review and toggle bullets — auto-selected from your full library based on role type.
4. Claude rewrites bullets via Anthropic API streaming, preserving every metric.
5. Download a Node.js script — run it to produce the formatted .docx.

**5 sub-agent panels** — @hiring-manager, @recruiter, @bd-peer, @skeptic, @coach. One-click copy.

### Score → Resume handoff
Score a role in the `/score` panel. When the result appears, click **→ /resume — build resume for this role**. The resume generator opens with company, role title, and full JD pre-populated, template auto-selected, and cursor on step 2. This is the intended flow for any role scoring ≥75%.

### Role-type bullet selection

| Role type | Leads with | Avoids |
|---|---|---|
| Enterprise alliances | Huawei ISV 1,000+ at scale, GTM infrastructure | Consumer/entertainment framing |
| Edge AI / hardware | Kirin 9000 on-device AI, 300% SDK adoption | SSP/publisher bullets |
| Hardware / OEM | Pandora OEM (Sony/Samsung/Honda), Kirin 9000 | AdTech language |
| Startup / 0-to-1 | Qualia first BD hire $9M 120%, Wove 90-day first 3 partners | Large-scale enterprise depth |
| Strategic alliances | Huawei portfolio management (Adobe/Meta/Airbnb), Qualia governance | Heavy consumer framing |
| Supply / publisher | Mobclix $16M 185% YoY, Pandora remnant $35M | SaaS/fintech framing |

### Data persistence
All data saves to `localStorage` automatically. To reset: browser developer tools → Application → Local Storage → delete `jobos_v3` and `jobos_outreach_v1`.

---

## Component 2 — Chrome Extension v2 (`jobos-chrome-extension-v2.zip`)

### What's new in v2

**Follow-up nudge badge** — The badge now shows a number in amber when contacts in your outreach tracker are overdue for a follow-up (default threshold: 10 days after last outreach with status Reached Out or Follow-up Sent). A yellow banner also appears inside the popup across all tabs when nudges are pending. The badge count takes priority over the green `▶` job-page indicator.

**Nudges tab (new)** — A dedicated tab showing every overdue contact with days-since, contact name, role, and two actions: *Copy nudge →* generates a specific "add value, don't just check in" follow-up prompt for Claude tailored to that company; *Mark sent* updates the last outreach date and refreshes the badge immediately.

**Outreach tracker sync** — After scoring any role, a **+ Add to outreach tracker** button appears. One click saves the company, role, score, and POV to `chrome.storage.local` under key `jobos_outreach_sync`. The Nudges tab shows a count and an **Export scored roles as JSON** button — download and import into the OS dashboard outreach tracker.

**GitHub Gist profile sync** — Your background context (used in all scoring and prompt generation) can now be hosted as a live `profile.json` on a public GitHub Gist. Paste the raw URL in the Nudges tab → Gist config section. The extension fetches the latest version every time it opens. If the URL is blank or fetch fails, falls back to hardcoded strings automatically. No extension reload required to update your profile.

**Improved extraction reliability** — The content script now uses multiple selector strategies per job board, retries after 800ms if extracted text is under 300 characters (handles LinkedIn's lazy-loaded descriptions), and has better fallback logic for generic job pages. The `at Company` title parser handles `@`, `—`, and `|` delimiters.

**Hourly nudge check** — Background service worker runs via `chrome.alarms` every hour, parses `lastOutreach` dates from your synced contacts, and updates the badge count across all tabs.

### Installation
```
1. Remove v1 if installed: chrome://extensions → Job Search OS → Remove
2. Unzip jobos-chrome-extension-v2.zip
3. Chrome → chrome://extensions → Developer mode on
4. Load unpacked → select jobos-extension-v2 folder
5. Pin to toolbar
```

### All tabs

| Tab | What it does |
|---|---|
| `/score` | Auto-extracts JD, scores on open. Manual paste fallback. "Open in Claude ↗" + "Copy prompt". After scoring: "+ Add to outreach tracker" button. |
| `/apply` | Role type + contact situation → full application package prompt |
| `/brief` | Morning briefing prompt generator |
| `Nudges` | Overdue follow-up alerts with copy-nudge prompts. Also: outreach tracker export + Gist profile config. |
| `Log` | Total commands, today's count, roles scored, streak, recent activity |
| `⚡` | One-click copy: /referral, /prep, /mock, /debrief, /negotiate, /pattern, @hiring-manager, @skeptic |

### Badge states

| Badge | Meaning |
|---|---|
| Amber number (e.g. `6`) | Follow-ups overdue — click to see who needs a nudge |
| Green `▶` | On a recognized job page, no overdue nudges |
| No badge | Not on a job page, no overdue nudges |

### Gist profile.json format
```json
{
  "name": "Pranjal Mahna",
  "background": "Huawei (0-to-1 ISV ecosystem...), Qualia (...), Pandora (...)",
  "bulletMap": {
    "hardware":   "Lead with: Pandora OEM (Sony/Samsung/Honda), Kirin 9000...",
    "enterprise": "Lead with: Huawei ISV 1,000+ at scale...",
    "startup":    "Lead with: Qualia first BD hire $9M 120%...",
    "supply":     "Lead with: Mobclix 185% YoY $16M...",
    "alliances":  "Lead with: Huawei portfolio management...",
    "privacy":    "Lead with: Huawei on-device AI local inference..."
  }
}
```
Any keys present in the Gist override the hardcoded fallback. Keys not present fall back to defaults. This means you can update just `background` without touching `bulletMap`.

### Storage keys (Chrome extension)

| Key | Lives in | What it stores |
|---|---|---|
| `jobos_ext_v1` | `chrome.storage.local` | Usage history, scored roles, streak stats |
| `jobos_outreach_sync` | `chrome.storage.local` | Companies synced from scoring (exportable to OS) |
| `jobos_gist_url` | `chrome.storage.local` | GitHub Gist raw URL for profile sync |

---

## Component 3 — CLAUDE.md (Master context file)

The most important file in the system. Everything else is scaffolding.

**What's inside**: Identity and positioning, every career metric across all roles, complete bullet library from 8 resume versions, 5 interview stories in STAR format, 4 active target roles with gap bridges, behavioral instructions.

**How to use**:
- **Claude.ai Projects**: Upload to Project knowledge base — auto-loads every session
- **Claude Code**: Place as `CLAUDE.md` in project root — auto-loaded on session start

**How to update** (run monthly or when job search evolves):
```
My job search has evolved. Here is my current CLAUDE.md: [paste]

Update it to reflect:
- New target roles: [list]
- Dropped roles: [list]
- New proof points: [describe]
- Changed gap bridges: [describe]
- What I've learned resonates: [describe]

Keep the same structure. Flag anything outdated.
```

---

## Component 4 — Claude Code OS (`bd-partnerships-os-v2.zip`)

For terminal users. Full slash commands + sub-agents + local file automation.

### Installation
```bash
unzip bd-partnerships-os-v2.zip -d ~/job-search-os
cd ~/job-search-os
claude  # starts Claude Code — CLAUDE.md auto-loads
```

### File structure
```
job-search-os/
├── CLAUDE.md
├── .claude/commands/
│   ├── brief.md  score.md  apply.md  referral.md  prep.md
│   ├── mock.md   debrief.md  negotiate.md  pipeline.md  pattern.md
├── sub-agents/
│   ├── hiring-manager.md  recruiter.md  bd-peer.md  skeptic.md  coach.md
├── context/
│   └── pattern-log.md       ← Append after every /debrief
└── templates/
    ├── resume-bullets.md  story-builder.md
```

### Using the pattern log
After every `/debrief`, paste the session summary into `pattern-log.md`:
```
SESSION: [company] — [role] — [round] — [date]
Questions asked: [list]
Scores per answer: [relevance/specificity/impact 1-5]
Weak answers: [below 3.5 avg]
Strong answers: [above 4.0]
Key learning: [one sentence]
Outcome: [moved forward / rejected / offer]
```

After 3 sessions, `/pattern` finds trends. After 10, it knows your habits better than you do.

---

## Platform migration

| Feature | Claude.ai Projects | Claude Code | ChatGPT Projects | Gemini Gems |
|---|---|---|---|---|
| Context auto-load | ✅ Project knowledge | ✅ CLAUDE.md | ✅ Custom instructions | ✅ Gem instructions |
| Slash commands | ✅ (copy from panels) | ✅ Native | Saved responses | Saved responses |
| Sub-agents | ✅ (copy from panels) | ✅ @name syntax | Separate GPTs | Inline personas |
| Live calendar | ✅ (Google Cal MCP) | Manual input | Zapier required | — |
| Live Gmail | ✅ (Gmail MCP) | Manual input | Zapier required | — |
| Pattern log | In Project knowledge | Local file | Upload to Project | External doc |

The HTML dashboard and Chrome extension work on all platforms — they're standalone tools.

---

## Adapting for a different function

**Rebuild CLAUDE.md for your background:**
```
I'm setting up a Job Search OS built on Claude. Rewrite the CLAUDE.md master
context file for my specific background.

My resume: [paste or attach]
Current CLAUDE.md as structure template: [paste CLAUDE.md]

Rewrite completely for me. Preserve exact structure and section headings.
Fill in identity, proof points with real metrics, core stories in STAR format,
active target roles, and gap bridges. Where I don't have a metric, flag with
[ADD METRIC]. Do not invent numbers.
```

**Adapt commands to a different role type:**
```
I have a Job Search OS built for BD/Partnerships. Adapt it for [ROLE TYPE].

Command files: [paste .claude/commands/ contents]
Sub-agent files: [paste sub-agents/ contents]

Rewrite all commands so workflows, questions, scoring dimensions, and outputs
suit [ROLE TYPE]. Replace @bd-peer with an appropriate peer reviewer.
Update scoring dimensions in /score. Update question bank in /prep.
Keep all interactive behavior. Only change content.
```

---

## FAQ

**Do I need Claude Code or will Claude.ai work?**
Claude.ai Projects is the recommended home for daily use — live Google Calendar, Gmail, web search, and Monday.com all active simultaneously. Claude Code adds native slash commands. For most use cases, Claude.ai Projects is sufficient.

**The extension badge shows a number — what does that mean?**
An amber number means you have that many contacts in your outreach tracker who haven't heard from you in 10+ days. Click the extension → Nudges tab to see who and generate a follow-up prompt for each.

**How do I get scored roles from the extension into the OS dashboard outreach tracker?**
Score a role → click "+ Add to outreach tracker" in the `/score` tab. Then in the Nudges tab, click "Export scored roles as JSON". Open the OS dashboard → Outreach tracker → use the import function, or manually add the companies using the "+ Add company" modal.

**What's the Gist profile sync for?**
It means when you update your background (new roles, new proof points, new metrics), you update one JSON file on GitHub Gist and every extension prompt instantly uses the new version — without reinstalling or editing extension files. If you don't set it up, the extension uses hardcoded fallbacks that are always current as of the last install.

**How long does setup take?**
About 20 minutes: 5 to open the dashboard and install the extension, 10 to verify CLAUDE.md loads in your Project, 5 to score your first role and run the resume generator end-to-end.

**What's the most important file to get right?**
CLAUDE.md. Everything else inherits from it.

**The resume generator downloads a .js file — why not generate the .docx directly?**
The browser cannot run Node.js. Run `npm install -g docx && node generate_Company_resume.js` to produce the .docx. A future version could use a serverless function, but the current approach is intentionally offline-first.

---

## Version history

| Version | Date | What changed |
|---|---|---|
| v1 | March 2026 | Initial OS — 4 workflows, basic CLAUDE.md |
| v2 | Early April 2026 | Morning briefing, role scorer, referral-first, negotiation, pattern tracker |
| v3 | April 10, 2026 | Full HTML dashboard, outreach tracker (59 companies), Chrome extension v1, interactive resume generator (separate file), complete bullet library from 8 resumes, usage tracking + heatmap, weighted visual scoring |
| v3.1 | April 11, 2026 | Resume generator integrated into dashboard (`job-search-os-v4.html`), score→resume one-click handoff, Chrome extension v2 (nudge badge, Gist profile sync, outreach tracker sync, improved extraction, Nudges tab) |

---

*Built with Claude. Powered by your own context. Gets smarter every week.*
*pranjal.mahna@gmail.com · linkedin.com/in/pranjalmahna*
