# Job Search OS

An AI-powered job search operating system built on Claude. One dashboard to score roles, track your pipeline, manage outreach, build tailored resumes, prep for interviews, and analyze patterns - all connected to a Chrome extension that scores any job posting in one click.

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

The dashboard has a built-in password gate. Before deploying:

1. Open `index.html` in a text editor
2. Search for `ChangeThisPassword`
3. Replace it with your own password
4. Commit and push the change - GitHub Pages will redeploy automatically

---

## Step 3: Fill in your three brain files

These three files are the "brain" of the OS. Claude reads them to understand who you are and what you need. They are designed as templates - replace every `[REPLACE]` placeholder with your own information.

### `CLAUDE.md` - Your professional identity

Fill in:
- **Identity & Positioning** - your seniority, function, and what makes you distinctive
- **Core Metrics** - your 3-5 most powerful quantified achievements (never change these once set)
- **Interview Stories (A-E)** - your 5 best career stories, each tagged with a letter for easy reference in prep and mock sessions
- **Technical Depth** - your education and technical credentials
- **Contact** - your email, phone, and LinkedIn URL

### `BULLET_LIBRARY.md` - Your resume bullets

Fill in each company section with your actual resume bullets. Follow the bullet writing rules at the bottom of the file:
- Lead with impact, not activity ("Grew X by 40%" not "Responsible for growing X")
- Every bullet needs a metric - if you don't have an exact number, use a range or proxy
- Under 40 words per bullet
- No em-dashes (some ATS systems choke on them)

Also fill in the **Resume Relevance Mapping** at the top - this tells the resume builder which bullets to surface for each type of role you are targeting (e.g. "enterprise", "startup", "technical").

### `WORKFLOW_GUIDE.md` - Your slash commands

This file defines the logic for all slash commands (`/score`, `/apply`, `/prep`, etc.). It is already written - you do not need to modify it unless you want to change how the commands behave.

---

## Step 4: Create your Claude Project

1. Go to [claude.ai](https://claude.ai) and click **Projects** in the sidebar
2. Create a new project - name it "Job Search OS" or similar
3. In the project, click the **+** icon to add content
4. Upload all three files: `CLAUDE.md`, `BULLET_LIBRARY.md`, `WORKFLOW_GUIDE.md`
5. Optionally connect Google Calendar, Gmail, and web search in the project settings
6. This is now your job search workspace - run all slash commands from here

To verify setup, open a new chat in the project and type: *What do you know about me?* Claude should respond with your background and core metrics from CLAUDE.md.

---

## Step 5: Install the Chrome extension

The extension lets you score any job posting with one click and sync it to your dashboard.

### Configure the extension for your GitHub Pages URL

Before installing, update two files in `jobos-extension-v2/`:

**`manifest.json`** - Replace `YOUR_GITHUB_USERNAME` in two places with your actual GitHub username:
```json
"host_permissions": [
  ...
  "https://YOUR_GITHUB_USERNAME.github.io/*"
],
"externally_connectable": {
  "matches": ["https://YOUR_GITHUB_USERNAME.github.io/*"]
}
```

**`popup.js`** - Search for `YOUR_GITHUB_USERNAME` and replace with your actual GitHub username.

### Install in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top right)
3. Click **Load unpacked**
4. Select the `jobos-extension-v2/` folder
5. The Job Search OS icon will appear in your Chrome toolbar

### Connect the extension to your dashboard

1. Open your deployed dashboard in Chrome and log in
2. Go to the **Sync** tab in the dashboard
3. Enter your GitHub Pages URL and click **Save**

Now when you score a job in the extension and click "Sync to Outreach" or "Sync to Pipeline", it will appear in your dashboard automatically.

---

## Step 6: Set up the email digest (optional)

The morning digest scans your Gmail for new job alert emails and recruiter replies, then generates a prioritized briefing.

1. Open Google Sheets and create a new spreadsheet
2. Go to **Extensions > Apps Script**
3. In your dashboard, go to the **Digest** tab > **Configure** > scroll to the **Apps Script** section
4. Copy the generated Apps Script code
5. Paste it into your Apps Script editor and click **Save**
6. Click **Run** once to authorize Gmail access
7. Set up a daily trigger: click the **Triggers** icon (clock) > **Add Trigger** > choose `sendDigest`, time-driven, day timer, 7-8am

---

## How to use the slash commands

Once your Claude Project is set up, open it and use these commands:

| Command | What it does |
|---|---|
| `/brief` | Morning briefing - top 3 priorities, pipeline going cold, new job alerts |
| `/score` | Score a job description for fit (paste the full JD after the command) |
| `/apply` | Full application package - tailored resume bullets, gap bridges, referral strategy, cover note |
| `/referral` | Referral-first outreach strategy for a specific role |
| `/prep` | Interview prep - 10 role-specific questions with your best story mapped to each |
| `/mock` | Interactive mock interview with live scoring and rewrites |
| `/debrief` | Post-interview analysis and personalized thank-you email |
| `/negotiate` | Market benchmarking and negotiation script for an offer |
| `/pattern` | Cross-interview weakness analysis and drill plan |
| `/post` | LinkedIn thought leadership post from your own experience |

**How to use them:**
1. Open your Claude Project
2. Type the command followed by any relevant context
3. For `/score` and `/apply`: paste the full job description after the command
4. For `/prep`: include the company name and role; add the interviewer's name if you have it
5. Use the **Copy prompt** buttons in the dashboard panels - they include structured XML context that Claude uses for more precise output

---

## Adding target companies to your outreach tracker

The outreach tracker starts empty. Add companies in three ways:

1. **From the dashboard**: Click **+ Add company** in the Outreach panel
2. **From the extension**: Score a job, then click "Sync to Outreach" - it appears in your tracker automatically
3. **Pre-seeded list**: Edit the `OUTREACH_SEED` array in `index.html` to pre-populate companies when a user first loads the dashboard (useful if you fork this for a specific job search focus)

For each company, set:
- **Tier** - 1 = top priority, 2 = strong interest, 3 = exploratory
- **Role** - the specific role title you are targeting at that company
- **Contact** - your warm connection at the company, if any
- **POV** - your angle: why this company, why now, which part of your background is most relevant

---

## Troubleshooting

**Dashboard shows blank or won't load**
- Confirm GitHub Pages is enabled in your repo settings (Settings > Pages)
- Wait 1-2 minutes after pushing changes - Pages takes time to rebuild
- The URL is case-sensitive - double-check it matches exactly

**Extension won't sync to dashboard**
- Verify the GitHub Pages URL in `manifest.json` exactly matches your actual deployed URL
- Make sure your dashboard tab is open in Chrome when you click sync
- Check that you entered the correct URL in the Sync tab of the dashboard

**Claude doesn't seem to know my background**
- Confirm all three files are uploaded to your Claude Project (not just pasted as messages)
- Re-upload after any edits - the Project knowledge base does not auto-update
- Make sure you replaced all `[REPLACE]` markers in `CLAUDE.md`

**Resume builder shows placeholder content**
- Fill in `BULLET_LIBRARY.md` with your actual bullets and re-upload it to your Claude Project
- For the in-app resume preview, also update the `RV_LIB` object in `index.html` with your company names and bullets, following the `company_a / company_b / company_c` structure already in place

---

## File inventory

| File | What it is |
|---|---|
| `index.html` | Full dashboard - all workflow panels, resume builder, outreach tracker, tools |
| `CLAUDE.md` | Your professional identity - fill this in with your background |
| `BULLET_LIBRARY.md` | Your resume bullets - fill this in with your actual bullets |
| `WORKFLOW_GUIDE.md` | Slash command logic - upload to Claude Project as-is |
| `DEV_CONTEXT.md` | System architecture reference for developers and LLMs |
| `FUTURE_FEATURES.md` | Planned features and roadmap |
| `jobos-extension-v2/` | Chrome extension source (Manifest V3) |

---

## License

MIT - free to use, fork, and modify.
