# Job Search OS

An AI-powered job search operating system built on Claude. One dashboard to score roles, track your pipeline, manage outreach, build tailored resumes, prep for interviews, and analyze patterns — all connected to a Chrome extension that scores any job posting in one click.

---

## What it does

- **Score any job** against your profile in seconds (weighted 5-dimension fit analysis)
- **Track your pipeline** with status, nudge alerts for follow-ups going cold, and daily velocity
- **Manage outreach** across all your target companies with personalized Claude-generated messages
- **Build tailored resumes** with a 5-step builder that pulls from your bullet library
- **Prep for interviews** with role-specific question banks mapped to your best stories
- **Run mock interviews** with live scoring and feedback
- **Generate LinkedIn posts** from your work experience
- **Morning briefing** that scans your email and calendar for today's priorities
- **Chrome extension** that extracts job data from LinkedIn, Greenhouse, Lever, Ashby, and more - syncs scored roles directly to your dashboard

---

## How it works

This tool does not call the Anthropic API directly. Instead, every panel in the dashboard builds a structured, context-rich prompt and copies it to your clipboard. You paste that prompt into your **Claude Project** — which already has your professional background loaded — and Claude responds with the output.

This design means:
- No API key setup or management
- Claude always has your full context (identity, metrics, bullet library, slash command logic) without you having to re-explain it
- Every prompt is portable — you can inspect it, edit it, or paste it anywhere

The Chrome extension works the same way: it extracts job data from the page and builds prompts. The extension also syncs scored jobs to your dashboard automatically.

---

## Prerequisites

- **GitHub account** - to host the dashboard (free via GitHub Pages)
- **Claude Pro subscription** - for the Claude Projects feature (required)
- **Chrome browser** - for the job scoring extension
- **Google account** (optional) - for the automated email digest

---

## Step 1: Fork and deploy the dashboard

1. Fork this repository to your GitHub account
2. In your fork, go to **Settings > Pages**
3. Under "Source", select **Deploy from a branch**
4. Select branch: `main`, folder: `/ (root)`
5. Click **Save**
6. After a minute or two, your dashboard will be live at `https://YOUR_GITHUB_USERNAME.github.io/REPO_NAME/`

---

## Step 2: Set your password

The dashboard has a built-in password gate.

1. Open `index.html` in a text editor
2. Search for `ChangeThisPassword`
3. Replace it with your own password
4. Commit and push the change — GitHub Pages redeploys automatically

---

## Step 3: Fill in your three brain files

These three files are loaded into your Claude Project and give Claude everything it needs to know about you. Replace every `[REPLACE]` placeholder with your own information.

### `CLAUDE.md` — Your professional identity

Fill in:
- **Identity & Positioning** - your title, function, and what makes you distinctive
- **Core Metrics** - your 3-5 strongest quantified achievements (set these once, never change them)
- **Interview Stories (A-E)** - your 5 best career stories, each labeled A through E for easy reference in prep and mock sessions
- **Technical Depth** - education and credentials
- **Contact** - email, phone, LinkedIn URL

### `BULLET_LIBRARY.md` — Your resume bullets

Fill in each company section with your actual bullets. Rules at the bottom of the file explain the format, but the key ones are:
- Lead with impact, not activity ("Grew X by 40%" not "Responsible for growing X")
- Every bullet needs a metric
- Under 40 words per bullet
- No em-dashes (some ATS systems reject them)

Also fill in the **Resume Relevance Mapping** at the top. This tells the resume builder which bullet IDs to surface for each role type you target (enterprise, startup, technical, etc.).

### `WORKFLOW_GUIDE.md` — Your slash commands

Already written. Upload it to your Claude Project as-is. It defines the logic for all slash commands — no edits needed unless you want to change how a command behaves.

---

## Step 4: Create your Claude Project

1. Go to [claude.ai](https://claude.ai) and click **Projects** in the sidebar
2. Create a new project — name it "Job Search OS" or similar
3. Click the **+** icon and upload all three files: `CLAUDE.md`, `BULLET_LIBRARY.md`, `WORKFLOW_GUIDE.md`
4. Optionally connect Google Calendar, Gmail, and web search in the project settings
5. Open a new chat in the project and type: *What do you know about me?*

Claude should respond with your background and metrics from `CLAUDE.md`. If it doesn't, check that the files uploaded correctly.

---

## Step 5: Install the Chrome extension

The extension scores any job posting in one click and syncs it to your dashboard.

### Before installing — configure your GitHub Pages URL

Edit two files in `jobos-extension-v2/`:

**`manifest.json`** — Replace `YOUR_GITHUB_USERNAME` in two places:
```json
"host_permissions": [
  "https://YOUR_GITHUB_USERNAME.github.io/*"
],
"externally_connectable": {
  "matches": ["https://YOUR_GITHUB_USERNAME.github.io/*"]
}
```

**`popup.js`** — Search for `YOUR_GITHUB_USERNAME` and replace with your actual GitHub username.

### Install in Chrome

1. Go to `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `jobos-extension-v2/` folder
5. Pin the Job Search OS icon to your toolbar

### Connect the extension to your dashboard

1. Open your deployed dashboard and log in
2. Go to the **Sync** tab
3. Enter your GitHub Pages URL and click **Save**

After this, scored jobs sync to your dashboard automatically — no copy-paste needed.

---

## Step 6: Set up the in-app resume preview (optional)

The resume builder has a live preview panel that renders your bullets as a formatted resume. To make it show your actual content instead of placeholder text, update the `RV_LIB` object inside `index.html`.

Search for `const RV_LIB` in `index.html`. You will find a structure like:

```javascript
const RV_LIB = {
  company_a: { name: '[Your Most Recent Company]', title: '[Your Title]', dates: '[Start – End]', bullets: {
    a1: '[REPLACE] Your top impact bullet...',
    a2: '[REPLACE] ...',
  }},
  company_b: { ... },
  company_c: { ... }
};
```

Replace the company names, titles, dates, and bullet text with your actual content. Use the same bullet IDs you defined in `BULLET_LIBRARY.md` — the Resume Relevance Mapping in that file references these IDs.

This step only affects the in-app visual preview. The Claude-generated rewrite prompt (step 4 of the builder) reads from `BULLET_LIBRARY.md` via your Claude Project.

---

## Step 7: Set up the email digest (optional)

The morning digest scans Gmail for new job alerts and recruiter replies, then generates a prioritized briefing prompt.

1. Open Google Sheets and create a new spreadsheet
2. Go to **Extensions > Apps Script**
3. In your dashboard, go to **Digest > Configure** and scroll to the **Apps Script** section
4. Copy the generated script
5. Paste it into the Apps Script editor and click **Save**
6. Click **Run** once to authorize Gmail access
7. Set a daily trigger: **Triggers** (clock icon) > **Add Trigger** > `sendDigest`, time-driven, day timer, 7-8am

---

## How to use the slash commands

Open your Claude Project and use these commands:

| Command | What it does |
|---|---|
| `/brief` | Morning briefing — top 3 priorities, pipeline going cold, new job alerts |
| `/score` | Score a job for fit — paste the full JD after the command |
| `/apply` | Full application package — tailored bullets, gap bridges, referral strategy, cover note |
| `/referral` | Referral-first outreach strategy for a specific role |
| `/prep` | Interview prep — 10 role-specific questions with your best story mapped to each |
| `/mock` | Interactive mock interview with live scoring and answer rewrites |
| `/debrief` | Post-interview analysis and personalized thank-you email |
| `/negotiate` | Market benchmarking and word-for-word negotiation script |
| `/pattern` | Cross-interview weakness analysis and drill plan |
| `/post` | LinkedIn thought leadership post from your own experience |

**Tips:**
- Use the **Copy prompt** buttons in the dashboard panels — they build XML-tagged prompts with your current pipeline, JD, and context pre-filled
- For `/score` and `/apply`: paste the full job description — do not truncate it
- For `/prep`: include the company name, role title, and interviewer name if you have it

---

## Using the resume builder

The resume builder is a 5-step flow inside the dashboard:

1. **Select template** — choose a base template (enterprise, startup, technical, general) and enter the target role and company name
2. **Select bullets** — auto-selected based on role type from your Resume Relevance Mapping; toggle any off
3. **Review bullets** — click any bullet to deselect it; it shows crossed-out until re-enabled
4. **Copy rewrite prompt** — copies a structured prompt to your clipboard; paste it into your Claude Project to get bullets rewritten for this specific role's language. The rewritten bullets preserve every metric exactly.
5. **Download** — generates the Node.js script to build a formatted `.docx` file

---

## Adding target companies to your outreach tracker

The outreach tracker starts empty. Add companies three ways:

1. **From the dashboard** — click **+ Add company** in the Outreach panel
2. **From the extension** — score a job, click "Sync to Outreach" — it appears automatically
3. **Pre-seed the list** — edit the `OUTREACH_SEED` array in `index.html` to pre-populate companies on first load

For each company, fill in:
- **Tier** — 1 = top priority, 2 = strong interest, 3 = exploratory
- **Role** — the specific role title you are targeting
- **Contact** — your warm connection at the company, if any
- **POV** — your angle: why this company, why now, which part of your background is most relevant

---

## Troubleshooting

**Dashboard shows blank or won't load**
- Confirm GitHub Pages is enabled (Settings > Pages in your fork)
- Wait 1-2 minutes after a push — Pages rebuilds take time
- The URL is case-sensitive

**Extension won't sync to dashboard**
- Verify the GitHub Pages URL in `manifest.json` matches your deployed URL exactly (include trailing slash if it has one)
- The dashboard tab must be open in Chrome for live sync to work
- Check that you saved the URL in the Sync tab of the dashboard

**Claude doesn't know my background**
- Confirm all three files are uploaded to your Claude Project as knowledge (not just pasted as messages)
- Re-upload after any edits — the Project knowledge base does not auto-sync
- Check for any remaining `[REPLACE]` markers in `CLAUDE.md`

**Resume preview shows placeholder content**
- Update `RV_LIB` in `index.html` with your actual company names and bullets (see Step 6 above)
- This only affects the in-app preview — the Claude rewrite prompt reads from your Claude Project

**Prompt buttons show empty or incomplete output**
- Complete the earlier steps in that panel first (company name, JD, role type)
- Most panels require at least one field filled before generating a prompt

---

## File inventory

| File | What it is |
|---|---|
| `index.html` | Full dashboard — all panels, resume builder, outreach tracker (single HTML file) |
| `CLAUDE.md` | Your professional identity template — fill this in |
| `BULLET_LIBRARY.md` | Your resume bullet library template — fill this in |
| `WORKFLOW_GUIDE.md` | Slash command logic — upload to Claude Project as-is |
| `DEV_CONTEXT.md` | System architecture reference for developers and LLMs |
| `FUTURE_FEATURES.md` | Planned features and roadmap |
| `jobos-extension-v2/` | Chrome extension source (Manifest V3) |

---

## License

MIT — free to use, fork, and modify.
