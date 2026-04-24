# Job Search OS
**Version 4.9 · April 2026**

A personal job search operating system built on Claude. Not a prompt library. Not a chatbot. A persistent, connected workspace that knows who you are, reads your calendar and email, tracks your outreach, generates tailored resumes, maps your referral network, and runs structured interactive workflows on command.

---

## What's in the box

| File | What it is |
|---|---|
| `index.html` | Full dashboard v4.9 - all workflows + resume generator + 5 Tools panels + Inbox triage. |
| `ONBOARDING.md` | **Read this first.** Detailed step-by-step setup and technical deep-dive. |
| `jobos-extension-v2/` | Chrome extension v2 source - MV3 compliant, nudge alerts, state backup, inbox queuing, resume fill. |
| `CLAUDE.md` | Master context file (The Brain) - your identity and metrics. |
| `BULLET_LIBRARY.md` | Complete bullet library - raw text for all resume bullets (token-optimized). |
| `DEV_CONTEXT.md` | Developer reference - full system architecture. |
| `SOURCES.md` | Gmail sources - list of senders for Claude to monitor during `/brief`. |

---

## Setup in 10 minutes

### 1. Deploy the dashboard to GitHub
The dashboard must be hosted on HTTPS for the extension to communicate with it.
1. **Create Repo**: Create a new repository on GitHub (e.g., `my-job-search`).
2. **Upload**: Upload `index.html` to the root of the repository.
3. **Enable Pages**: Go to **Settings** → **Pages** → **Build and deployment**. Set Source to "Deploy from a branch" and select `main` / `root`.
4. **Auth**: In `index.html`, find `const KEY = 'ChangeThisPassword';` and set your own password.
5. **URL**: Your dashboard will be at `https://[username].github.io/[repo-name]/`.

### 2. Configure & Install the Extension
1. **Update Manifest**: Open `jobos-extension-v2/manifest.json`. Replace `YOUR_GITHUB_USERNAME.github.io` (found in 3 places) with your actual GitHub domain.
2. **Install**: Chrome → `chrome://extensions` → Developer mode ON → **Load unpacked** → Select the `jobos-extension-v2` folder.
3. **Connect**: Click the extension icon → **Nudges tab** → Paste your dashboard URL → **Save dashboard URL**.

### 3. Set up your Claude Project
1. Go to [claude.ai/projects](https://claude.ai/projects) → create a Project called **Job Search OS**.
2. **Project settings** → upload `CLAUDE.md`, `BULLET_LIBRARY.md`, `WORKFLOW_GUIDE.md`, and `SOURCES.md`.
3. Connect **Google Calendar**, **Gmail**, and **web search** in the Project settings.

---

## Token Optimization (Updated v4.3)

The system is engineered for **extreme token efficiency** through architectural partitioning and XML-tagged structural prompting.

- **`CLAUDE.md` (The Brain)**: Loaded every turn. Contains only essential identity, metrics, and behavioral instructions.
- **`BULLET_LIBRARY.md` (The Data)**: Contains all resume bullets. Only accessed when building or refining resumes.
- **`WORKFLOW_GUIDE.md` (The Logic)**: All slash command instructions. Prompts reference this file instead of repeating logic inline.

**After each update to these files, re-upload them to your Claude Project knowledge base.**

---

## How to use this system

### Your morning routine (15 minutes)

1. **Check Nudges**: Open the Chrome extension. If the badge is amber, copy the nudge prompt for overdue follow-ups.
2. **Run Briefing**: Dashboard sidebar → `/brief`. Copy the XML-tagged prompt and paste into Claude. Claude reads your calendar and email live.
3. **Score Alerts**: Open new job postings in Chrome. The extension auto-scores them. If 75%+, click **Queue for review**. Items sync to the dashboard automatically.

### Before you apply

1. **Score the JD**: Use the extension or `/score` in the dashboard.
2. **Network Map**: Dashboard → `/network`. Check for warm referral paths before submitting cold.
3. **Build Application**: Dashboard → `/apply`. Get a tailored resume restructure, gap bridge, and cover note.
4. **Generate Resume**: Dashboard → `/resume`. Walk through the 5-step builder. Use the **Company research** tool in Step 1 to deepen your tailored bullets. Download the Node.js script to get a perfectly formatted `.docx`.

---

## Version history

| Version | Date | What changed |
|---|---|---|
| v4.9 | April 23, 2026 | **Live sync fix**: Extension items appear in dashboard immediately without refresh via MAIN-world helpers. **ID stability**: Migrated to timestamp-based unique IDs to prevent sync collisions. **JD preprocessing**: Auto-trimming of boilerplate from JDs to save tokens. **Outreach inline editing**: Live contact editing directly in the outreach table. |
| v4.8 | April 21, 2026 | **Company research in resume builder**: collapsible card in Step 1 generates a structured Claude research prompt. **Apply feedback loop**: "Mark as sent" stamps `appliedAt` on the pipeline role. **Brief memory**: `STATE.lastBrief` persists top actions for next-day recaps. |
| v4.7 | April 20, 2026 | **Outreach backup**: clearing browser cookies no longer wipes the outreach tracker. Mirrors to `chrome.storage.local`. |
| v4.6 | April 20, 2026 | **Role inbox**: new triage stage "To Review" and dedicated Inbox panel. **Daily affirmation**: rotating quote at the top of the dashboard. |
| v4.5 | April 16, 2026 | **Persistence fix**: pipeline state backed up to `chrome.storage.local`. |
| v4.4 | April 13, 2026 | **Auto-sync**: extension items appear in the dashboard automatically on every page load. |

---

*Built with Claude. Powered by your own context. Gets smarter every week.*

