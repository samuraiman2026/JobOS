# Job Search OS — Developer & LLM Context File
**Version 3.1 · April 2026 · BD/Partnerships Edition**

This file is the authoritative reference for any LLM or developer working on the Job Search OS. Read this before touching any file in the system.

---

## What this system is

A personal job search operating system built on Claude for a senior BD/Partnerships professional (Pranjal Mahna). It is not a prompt library. It is not a chatbot. It is a persistent, connected workspace that:

1. Knows the user's full professional context at session start (via CLAUDE.md)
2. Runs structured interactive workflows on command (/brief, /score, /apply, etc.)
3. Parses email for new job postings and scores them automatically
4. Tracks outreach across 59 target companies with daily velocity metrics
5. Generates tailored .docx resumes via an integrated 5-step builder with Claude API rewrite
6. Syncs scored roles from the Chrome extension to the outreach tracker
7. Alerts on overdue follow-ups via a numeric badge with one-click nudge prompt generation
8. Compounds over time through a debrief → pattern log → drill cycle

**The target user** is Pranjal Mahna: 15+ years BD/Partnerships, Michigan-based (remote preferred), seeking Director or Senior Manager roles at AI-native companies. Currently consulting via PMSV while job searching. Key background: Huawei ISV ecosystem ($1M→$100M, 1,000+ ISVs, Kirin 9000 on-device AI), Qualia first BD hire ($9M at 120%), Pandora ($200M+ new channels, OEM: Sony/Samsung/Honda).

---

## File inventory

```
outputs/
├── job-search-os-v4.html               ← Main dashboard + integrated resume generator
├── jobos-chrome-extension-v2.zip       ← Chrome extension v2 (nudges, Gist, sync)
├── CLAUDE.md                           ← Master context file (load into Claude Project)
├── README.md                           ← User-facing documentation
├── DEV_CONTEXT.md                      ← This file
├── BD_Partnerships_Job_Search_OS.docx  ← All prompts as Word doc (offline reference)
└── bd-partnerships-os-v2.zip          ← Claude Code OS (slash commands + sub-agents)

home/claude/ (build environment)
├── build_resume.js                     ← Node.js .docx builder
├── jobos-extension-v2/                 ← Chrome extension v2 source
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── popup.html
│   └── popup.js
└── job-search-os-v4.html              ← Working copy of dashboard
```

---

## Architecture overview

### Four surfaces, one brain

**Surface 1 — Claude.ai Project (primary)**
CLAUDE.md is uploaded to Project knowledge and loads automatically on every conversation. Google Calendar, Gmail, web search, and Monday.com are live via MCP connectors.

**Surface 2 — HTML Dashboard (`job-search-os-v4.html`)**
Single-file web app, opens in any browser, no server required. As of v3.1, the resume generator is fully integrated as the `/resume` sidebar panel — no separate file. The `/score` panel has a one-click handoff to `/resume` that pre-fills company, role, and JD.

**Surface 3 — Chrome Extension v2**
Activates on job board pages. Auto-extracts JD, scores instantly, syncs scored roles to outreach tracker, shows numeric amber badge for overdue follow-ups.

**Surface 4 — Claude Code CLI**
For terminal users. CLAUDE.md auto-loads. Full slash command set in `.claude/commands/`. Sub-agents in `sub-agents/`. Pattern log in `context/pattern-log.md`.

---

## CLAUDE.md — the brain

`CLAUDE.md` is the single most important file. It contains:

- **Identity & positioning**: Pranjal's job search status, PMSV consulting entity, target roles
- **Key metrics**: Every career metric across all roles (real numbers — never modify)
- **Bullet library**: Every resume bullet across 8 resume versions, tagged by theme
- **Bullet relevance mapping**: Which bullets to select for which role types (6 types)
- **5 core interview stories (A–E)**: Full STAR format
- **Active target roles**: 4 current roles with gap bridges
- **Behavioral instructions**: Language to use, what to avoid

**Loading it**: Upload to Claude.ai Project knowledge, or place as `CLAUDE.md` in Claude Code project root.

---

## The 10 workflows

Each workflow exists in three forms: a panel in `job-search-os-v4.html`, a command file in `.claude/commands/`, and a tab/shortcut in the Chrome extension popup.

| Command | Purpose | Key inputs | Key outputs |
|---|---|---|---|
| `/brief` | Morning game plan | Pipeline status, follow-ups | Top 3 actions, cold role flags, referral suggestions |
| `/score` | JD fit analysis | Job description | 5-dimension bars, weighted total, verdict + → /resume button |
| `/apply` | Full application package | JD, role type, contact | Resume restructure, gap bridge, referral strategy, cover note |
| `/referral` | Warm intro strategy | Target company, context | Network angles, LinkedIn DM, timing |
| `/prep` | Interview prep | Role, interviewer, round | Company research, question bank, gap bridges, tailored pitch |
| `/mock` | Interactive mock interview | Role, mode | One Q at a time, live scoring |
| `/debrief` | Post-interview analysis | Questions asked, notes, gut read | Answer scoring, value left on table, thank-you email |
| `/negotiate` | Offer strategy | Comp details, competing offers | Market benchmarks, counter offer, call script |
| `/pipeline` | Weekly review | Current pipeline | Health flags, priority actions |
| `/pattern` | Cross-interview analysis | Debrief log history | Weak question types, over-used stories, drill targets |
| `/resume` | Resume generator (v3.1) | Role, template, role type | 5-step interactive builder → downloadable .js → .docx |

---

## Resume generator — integrated in v3.1

### Architecture

The resume generator lives as `panel-resume` in `job-search-os-v4.html`. All variables are prefixed `RV_` or `rv` to avoid collisions with the main OS namespace.

**Key variables:**
```javascript
RV_LIB   // bullet library (same structure as standalone generator)
RV_SEL   // selection rules mapping role types to bullet IDs
RV       // state object: {company, role, jd, tmpl, rt, active, rewritten, timer}
RV_STEP  // current step (1-5)
```

**Key functions:**
```javascript
rvGoStep(n)           // navigate to step n, runs buildBullets/buildManualPrompt/buildStep5
rvJump(n)             // jump back to step n (only if n <= RV_STEP)
rvLoadFromScore(co, role, jd)  // called from /score panel to pre-fill and open
rvQL(co, ro, tm, rt)  // quick-load from sidebar buttons
rvLiveScore()         // debounced scoring as user types (500ms)
rvBuildBullets()      // renders bullet preview, populates RV.active
rvTogB(rk, j)         // toggle bullet on/off in preview
rvGetActive()         // returns [{role, text}] for active bullets
rvRunClaude()         // streams Claude API rewrite, populates RV.rewritten
rvAcceptRewrites()    // accepts rewritten bullets, advances to step 5
rvBuildStep5()        // generates preview + CLI command + summary
rvBuildPreview()      // renders HTML preview of resume
rvDownloadScript()    // generates and downloads Node.js .js file
rvCopyDocxPrompt()    // copies Claude Code prompt for build_resume.js
```

### Score → resume handoff

The `/score` panel's `runScore()` function calls `saveScoreToHistory()` and then shows a hidden button:
```javascript
const rBtn = document.getElementById('score-to-resume-btn');
if (rBtn) rBtn.style.display = 'inline-flex';
```

The button calls:
```javascript
function scoreToResume() {
  const company = document.getElementById('score-company').value.trim();
  const jd = document.getElementById('score-jd').value.trim();
  rvLoadFromScore(company, company.split('—')[1]?.trim() || '', jd);
}
```

`rvLoadFromScore` sets `RV.company/role/jd`, populates the form fields, runs `rvLiveScore()`, then calls `nav('resume')`.

### Resume generator CSS namespace

All CSS classes specific to the resume generator use `rv-` prefix:
- `.rv-stab` — step tabs
- `.rv-tmpl-card` — template selection cards
- `.rv-pill` — role type pills
- `.rv-bsec`, `.rv-bitem`, `.rv-btog` — bullet preview
- `.rv-cursor`, `.rv-spinner` — Claude streaming indicators
- `.rv-name`, `.rv-title`, `.rv-b`, etc. — preview HTML styles

---

## Chrome Extension v2 — full architecture

### Files

| File | What it does |
|---|---|
| `manifest.json` | MV3 manifest — permissions include `alarms` (new in v2) |
| `background.js` | Service worker — hourly alarm, nudge badge, message handler, outreach sync |
| `content.js` | Page scraper — improved multi-selector extraction with retry |
| `popup.html` | 6-tab popup UI |
| `popup.js` | All popup logic — scoring, Gist sync, nudge rendering, outreach sync |

### Storage keys

| Key | Storage | Contents |
|---|---|---|
| `jobos_ext_v1` | `chrome.storage.local` | `{ history[], scores[], stats: {total, streak, lastDate} }` |
| `jobos_outreach_sync` | `chrome.storage.local` | `{ contacts[], lastUpdated }` — roles synced from scoring |
| `jobos_gist_url` | `chrome.storage.local` | Raw GitHub Gist URL string |

### Background service worker

**Alarms**: `chrome.alarms.create('nudge-check', { periodInMinutes: 60 })` on install. Fires `checkNudges()` every hour.

**Nudge logic**:
```javascript
// Date parsing — handles "Apr 1", "Feb 23", "Mar 2" format
function parseDate(str) { ... }  // returns timestamp or null

// Overdue = lastOutreach set + status is Reached Out or Follow-up Sent + days >= 10
const overdue = contacts.filter(c => {
  const last = parseDate(c.lastOutreach);
  return last && Math.floor((Date.now() - last) / 86400000) >= NUDGE_DAYS;
});
```

**Badge behavior**:
- Amber number: nudge count > 0 (takes priority)
- Green `▶`: on job page, no nudges
- Empty: neither

**Message handler** — responds to three messages from popup:
1. `getNudgeCount` → `{ count }`
2. `syncOutreach` → adds company to `jobos_outreach_sync`, returns `{ added, reason? }`
3. `getOverdueContacts` → returns contacts with `daysSince` calculated

### Content script v2 improvements

**LinkedIn-specific extraction** (`extractLinkedIn()`):
- 6 title selector strategies including `h1.t-24`, `[class*="job-title"]`
- 3 company selector strategies
- Description retries if text < 300 chars (handles lazy loading)
- Falls back to full `article` or `main` text if specific selectors fail

**Retry on short text**:
```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractJob') {
    const data = extractJobData();
    if (data.jobText.length > 300) {
      sendResponse(data);
    } else {
      setTimeout(() => sendResponse(extractJobData()), 800);
    }
    return true; // keep channel open for async
  }
});
```

### Gist profile sync

On popup init, `loadProfile()` runs:
1. Reads `jobos_gist_url` from `chrome.storage.local`
2. If present, fetches the URL with `cache: 'no-store'`
3. On success: merges with `FALLBACK_PROFILE` (`{ ...FALLBACK_PROFILE, ...json }`)
4. On failure or no URL: uses `FALLBACK_PROFILE` unchanged

`profile.json` structure at the Gist:
```json
{
  "background": "string — used in all prompts",
  "bulletMap": {
    "hardware": "string", "enterprise": "string",
    "startup": "string",  "supply": "string",
    "alliances": "string","privacy": "string"
  }
}
```

Any key present overrides the fallback. Missing keys use fallback values. This means a minimal Gist with only `background` is valid.

### Outreach sync flow

```
User scores role on LinkedIn
  → runScoreEngine() completes
  → document.getElementById('sync-row').style.display = 'block'
  → User clicks "+ Add to outreach tracker"
  → syncToTracker() called in popup.js
  → chrome.runtime.sendMessage({ action: 'syncOutreach', data: { company, role, score, pov } })
  → background.js handles: reads jobos_outreach_sync, checks for duplicates, pushes new entry
  → sendResponse({ added: true }) or { added: false, reason: 'already exists' }
  → Popup updates button text + calls loadExportCount()
```

**Synced contact structure**:
```javascript
{
  id: Date.now(),
  company,
  role,
  tier: score >= 75 ? '1' : '2',  // auto-tier based on score
  contact: '',
  pov: `Scored ${score}% via Chrome extension on ${date}`,
  followups: 0,
  lastOutreach: '',
  status: 'Not Started',
  selected: false,
  scoreFromExt: score  // extension-specific field
}
```

### Nudge prompts

The "Copy nudge →" button generates a prompt instructing Claude to write a warm follow-up that:
- Does NOT say "just checking in" or "following up on my previous message"
- Adds value — recent insight, relevant metric, or specific question
- Is under 60 words
- Ends with a clear low-pressure ask
- References the company name and last known angle/POV

---

## Bullet library system

The bullet library exists in three places (keep in sync):
1. `job-search-os-v4.html` — `RV_LIB` / `RV_SEL` objects in the resume generator section
2. `resume-generator.html` (standalone, now superseded but kept as reference) — `LIB` / `SEL`
3. `build_resume.js` — `LIB` / `SELECTIONS`

**Structure**:
```javascript
RV_LIB = {
  pmsv:    { label, te, ta, ts, dates, bullets: [{id, t}] },
  qualia:  { label, title, dates, intro, bullets: [...] },
  huawei:  { label, te, ta, dates, intro, bullets: [...] },
  pandora: { label, title, dates, intro, bullets: [...] },
  mobclix: { label, title, dates, bullets: [...] },
  sony:    { label, title, dates, bullets: [...] }
}
```

Note: in the v4 dashboard the bullet text field is `t` (not `text`) to reduce file size.

**Selection rules**:
```javascript
RV_SEL = {
  enterprise: { pmsv:['p1','p2','p4','p3'], qualia:['q1','q2','q3','q4','q8'], huawei:['h1','h2','h3','h4','h5','h6'], ... },
  edgeai:     { pmsv:['p2','p5','p3','p4'], qualia:['q5','q6','q7','q1'],       huawei:['h7','h8','h9','h10','h4'], ... },
  hardware:   { ... }, startup: { ... }, alliances: { ... }, supply: { ... }
}
```

**Cardinal rule**: Never include two bullets that cover the same Huawei story from different angles (e.g. `h3` = $1M→$100M revenue story, `h7` = ISV 1,000+ ecosystem story — pick one per resume). 4–5 bullets per role section max.

**Role type decision guide**:
- `enterprise`: Microsoft, Salesforce, Apple — lead with `h1`/`h3`/`h5` (scale, C-suite, revenue)
- `edgeai`: Tenstorrent, Qualcomm — lead with `h7`/`h8` (ISV ecosystem, Kirin 9000 on-device)
- `hardware`: Nothing.tech, OEM — lead with `pa3` (Pandora OEM Sony/Samsung/Honda) + `h8` (Kirin)
- `startup`: Emissary, MAVI — lead with `q1`/`p3` (Qualia first hire, Wove 90-day)
- `alliances`: Typeface, GSI roles — lead with `h9` (licensing/co-dev Meta/Adobe/Airbnb)
- `supply`: SSP/publisher — lead with `m1` (Mobclix $16M 185% YoY) + `pa4` (Pandora remnant)

---

## Scoring system

Used in three places: `/score` panel in dashboard, Chrome extension popup, and live JD preview in resume generator. All three use identical logic with the same keyword arrays.

```javascript
s1 = kw(jd, ['ecosystem','partner','isv','marketplace','developer','sdk','platform','alliance','channel','co-sell','distribution','gtm'])  // 25%
s2 = kw(jd, ['build','create','launch','from scratch','establish','first','greenfield','founding','0 to 1','zero to one','incubate'])       // 25%
s3 = kw(jd, ['technical','engineering','api','integration','sdk','architecture','soc','npu','on-device','edge','silicon','risc-v'])         // 20%
s4 = kw(jd, ['ai','machine learning','llm','edge ai','on-device','genai','model','intelligent','neural','inference'])                       // 20%
s5 = kw(jd, ['director','senior manager','vp','head of','strategic','executive','global','principal','lead'])                              // 10%

function kw(text, words) {
  return Math.round(50 + Math.min(hits / Math.max(words.length * 0.35, 1), 1) * 50);
}
total = s1*.25 + s2*.25 + s3*.20 + s4*.20 + s5*.10
```

Verdicts: ≥75% = Apply now (green), 50–74% = Consider (amber), <50% = Skip (red).

**Template auto-detection**: `s3>68 || s4>70 || jd includes 'soc/npu/edge ai/silicon'` → edgeai; `s2>72 || jd includes 'founding/first hire/0 to 1'` → startup; else enterprise.

**If you update keyword lists**: Search for `kw(` in `job-search-os-v4.html` (two instances — score panel and resume generator), `popup.js` in the extension, and `resume-generator.html` (standalone). All four must stay in sync.

---

## Outreach tracker

### Dashboard tracker (`job-search-os-v4.html`)

Storage key: `jobos_outreach_v1` in `localStorage`

Data structure:
```javascript
{
  id, company, tier, role, contact, pov,
  followups: 0,
  lastOutreach,   // "Apr 1", "Feb 23" format — matched by parseDate() in background.js
  status,         // Not Started | Reached Out | Follow-up Sent | Replied | Interviewing | Researching | Not Interested
  selected        // for bulk outreach prompt generation
}
```

Daily log: `OT_STATE.dailyLog['YYYY-MM-DD'] = count` — drives the 14-day velocity chart.

59 companies pre-seeded in `OUTREACH_SEED` array. Any additions via modal persist to `localStorage` and survive page reloads.

### Extension tracker (`jobos_outreach_sync`)

Separate key in `chrome.storage.local`. Populated when user clicks "+ Add to outreach tracker" after scoring. Same field structure as dashboard, with extra `scoreFromExt` field.

### Sync between extension and dashboard

There is no automatic live sync — `chrome.storage.local` and `file://` localStorage are different origins. The workflow is:
1. Score roles in extension → "+ Add to outreach tracker" 
2. Nudges tab → "Export scored roles as JSON" → downloads file
3. Dashboard → Outreach tracker → "+ Add company" modal (manual) or future import feature

The `lastOutreach` date format (`"Apr 1"`) is shared between both systems. The background.js `parseDate()` function handles this format for nudge calculation.

---

## Usage tracking

Dashboard logs every command to `STATE.history` in `localStorage` (key: `jobos_v3`). Entry shape: `{ cmd, detail, date, time, ts, id }`. Max 500 entries, trimmed on overflow.

Chrome extension logs to `chrome.storage.local` key `jobos_ext_v1`. Entry shape: `{ cmd, detail, date, time, ts }`. Max 100 entries.

Streak logic (shared between both): compare `lastDate` to today. If yesterday === lastDate, increment streak. If gap > 1 day, reset to 1.

---

## Gmail integration

Daily parsing prompt (run as part of `/brief`):
```
Scan my Gmail for:
1. New LinkedIn job alert emails today — parse all roles, score each against my profile, surface any ≥75%
2. Any replies from companies on my outreach list in the last 7 days
3. Any roles going cold that need follow-up
```

Direct recruiter reply search:
```
to:pranjal.mahna@gmail.com (partnerships OR "business development" OR recruiter OR hiring)
-from:linkedin.com -from:noreply newer_than:60d
```

---

## Key data — active pipeline (April 2026)

| Company | Role | Stage | Health |
|---|---|---|---|
| Nothing.tech | Director BD | Recruiter screen done | Amber |
| Microsoft | Sr. Manager Global Partnerships | Applied, seeking referral | Amber |
| Emissary | Founding GTM Lead | Applied | Green |
| Turing.com | Client Partner AI Startups | Monitoring | Green |

**High-priority roles from April 10 inbox scoring**: Tenstorrent (93%, apply immediately), Typeface (82%), Placer.ai (79%, $210-240K).

---

## Technical stack

| Component | Stack |
|---|---|
| Dashboard + resume generator | Vanilla HTML/CSS/JS, single file (`job-search-os-v4.html`), localStorage |
| Resume builder (CLI) | Node.js, `docx@9.6.1` |
| Chrome extension | MV3, `chrome.storage.local`, `chrome.alarms`, content + background + popup |
| Claude API | `claude-sonnet-4-20250514`, streaming via `/v1/messages` with SSE |
| CricVantage (separate project) | React + Vite + TypeScript + Tailwind (Vercel), FastAPI + Python (Railway) |

---

## Common operations for LLMs

### Adding a workflow panel to the dashboard
1. Add sidebar nav item: `<button class="nav-item" onclick="nav('newcmd')" id="nav-newcmd">...`
2. Add panel: `<div class="panel" id="panel-newcmd">...`
3. Add to `nav()` function: `if (id === 'newcmd') { ... }`
4. Add `runNewcmd()` function: reads inputs, builds prompt string, injects into `.prompt-block`, adds copy button, calls `logUsage('/newcmd', detail)`

### Adding a company to the outreach tracker
Edit `OUTREACH_SEED` array in the OS JavaScript section, or use the "+ Add company" modal at runtime (persists to localStorage). New seed entries only affect new installs or after clearing storage.

### Updating the bullet library
Edit `RV_LIB` / `RV_SEL` in `job-search-os-v4.html` AND `LIB` / `SELECTIONS` in `build_resume.js`. Never change existing bullet IDs — only add new ones with new IDs.

### Changing the Claude API model
Search for `claude-sonnet-4-20250514` in `job-search-os-v4.html` (resume generator section) and `resume-generator.html`. Update both.

### Updating nudge threshold
Change `NUDGE_THRESHOLD_DAYS` in `background.js` (currently `10`). Repack and reinstall extension.

### Updating Gist profile without reinstalling extension
Edit `profile.json` on GitHub Gist. Extension fetches fresh on every popup open (`cache: 'no-store'`). No action needed on the extension side.

### Adding a new scoring dimension
All scoring uses the same `kw(text, keywords)` function. To add a 6th dimension: add keyword array, update weight calculations to sum to 1.0, add bar element to HTML in all three score panels (dashboard, resume generator, extension popup).

---

## Design principles (don't violate these)

**1. Context file first.** CLAUDE.md quality > command quality.

**2. Interactive before generative.** Every workflow asks questions before producing output.

**3. One best bullet, not all versions.** Pick one best version per bullet per role. 4–5 bullets per role section max.

**4. Metrics are non-negotiable.** Never remove or modify a metric in rewrites. $20M, 120%, 1,000+ ISVs, $1M→$100M are the proof.

**5. The pattern log compounds.** After 10 debriefs it knows the user's habits better than they do.

**6. Sub-agents as adversarial pressure.** Never water down @skeptic or @hiring-manager.

**7. Namespace isolation in combined files.** Resume generator in v4 uses `RV_` / `rv` prefixes. Outreach tracker uses `OT_` / `ot` prefixes. Never mix with base OS variable names.

**8. Extension and dashboard are separate origins.** `chrome.storage.local` and `file://` localStorage cannot share data directly. The sync path is export → import, not live. Do not attempt to bridge them with `externally_connectable` unless serving the HTML from a web server.

---

## FAQ for LLMs

**Q: A user wants to add a new target company to both the dashboard outreach tracker and extension sync.**
A: Add to `OUTREACH_SEED` in `job-search-os-v4.html` for the dashboard (affects new installs). For the extension, the user clicks "+ Add to outreach tracker" after scoring the company on LinkedIn.

**Q: The extension badge is showing the wrong number after a user marks a nudge as done.**
A: `markNudgeDone()` in `popup.js` updates `chrome.storage.local` then calls `loadNudges()` which calls `updateNudgeBadge()`. If the badge is stale, the issue is likely that `chrome.runtime.sendMessage({ action: 'getOverdueContacts' })` is returning cached data. The background worker recalculates on every call — check that `parseDate()` is correctly parsing the `lastOutreach` string format (`"Apr 1"`, `"Feb 23"` etc).

**Q: The Gist profile fetch is failing in the extension.**
A: Check that `https://raw.githubusercontent.com/*` is in `host_permissions` in `manifest.json`. The URL must be a raw Gist URL (`https://gist.githubusercontent.com/user/id/raw/...`), not the Gist page URL. The fetch uses `cache: 'no-store'` to bypass caching.

**Q: How do I update the scoring keyword lists across all three scoring locations?**
A: Search for `kw(` or `scoreKw(` in `job-search-os-v4.html` (two instances), `popup.js` in the extension, and `resume-generator.html`. The dashboard OS and resume generator use `rvKw()` and `scoreKeywords()` respectively — both call the same pattern. All arrays must stay in sync.

**Q: The user wants to raise or lower the nudge threshold from 10 days.**
A: Change `NUDGE_THRESHOLD_DAYS` in `background.js` and `NUDGE_DAYS` in `popup.js`. Repack the extension zip and reinstall.

**Q: Why does `rvLoadFromScore()` split the company name on `—`?**
A: The `/score` panel's company input accepts "Company — Role Title" format (e.g. "Tenstorrent — Head of ISV Partnerships"). When handing off to the resume generator, `company.split('—')[1]?.trim()` extracts the role title portion if it was entered that way. If the company field contains only a company name, `split('—')[1]` returns `undefined` and the role falls back to empty string, which is correct.

---

## Pranjal's background — quick reference for LLMs

**Current**: PMSV Tech and Strategy (advisor, December 2022–present). Adyogi (+16% via Meta/Shopify), Wove (first 3 enterprise partners, 90 days), MobiOffice (+7% conversion), Zingerman's (AI GTM system).

**Qualia** (Aug 2021–Oct 2022): Director BD. First BD hire. $20M pipeline. $9M at 120%. 60% win rate. Tiered ISV/SI program from scratch. 20% activation lift.

**Huawei** (Feb 2018–Jul 2021): Director BD / Director Strategic Partnerships. 1,000+ ISVs. SDK 300%. Revenue $1M→$100M. Users 2M→30M. Team 8. Kirin 9000: Pinterest, Porsche, Shazam, Vivino. Partners: Meta, Adobe, Match Group, Airbnb. Deal cycle −30%. 2× President's Award.

**Pandora** (Oct 2012–Mar 2015): BD New Initiatives. Sponsored Listening ($155M), Retargeting ($40M), TV Ads ($10M). OEM: Sony, Microsoft, Honda. Remnant +$35M. Total $200M+.

**Mobclix** (Jul 2011–Aug 2012): Sr. BD Manager. $16M revenue. 185% YoY revenue growth. 214% YoY volume. 30B impressions/year.

**Sony Mobile** (Feb 2008–Jun 2011): BD Manager. First Android monetization strategy. First $10M ad revenue. PlayStation integration. 16 global markets.

**Education**: MBA Marketing USC · BTech Computer Engineering Kurukshetra · AWS Generative AI with LLMs · Google Cloud Digital Leader · Pavilion GTM Leadership Accelerator.

**Early career**: Lead Software Engineer Bell Labs/Lucent · Program Manager Yahoo · Sr. Account Manager Singlepoint · Account Manager Motricity.

**AI projects**: FutureProof AI (AI Collective hackathon winner) · CricVantage (cricket analytics, 9.6M ball-by-ball, React+FastAPI) · FORMA (AI fitness trainer, React Native + Claude API) · EnhancePDF (Google Vision AI) · Hatched (founding member).

**Contact**: pranjal.mahna@gmail.com · 424.298.7516 · linkedin.com/in/pranjalmahna · Michigan (remote preferred)

---

*Last updated: April 11, 2026 · Job Search OS v3.1*
