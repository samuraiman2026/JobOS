# Job Search OS - Detailed Onboarding & Setup Guide

Welcome to Job Search OS! This is a connected workspace (a persistent web dashboard) that pairs with a Chrome Extension to help you score roles, orchestrate outreach, and instantly draft perfectly tailored resumes using Claude.

**Approximate Onboarding Time:** 10–15 Minutes

---

## Technical Overview: Data Transfer & Persistence

Before starting, it's important to understand how the system manages your data. Job Search OS is completely private and runs locally on your machine.

1. **Dashboard Storage (`localStorage`):** The primary brain of the OS is the dashboard. When you open the dashboard page, it stores your pipeline, outreach trackers, and resume bullets entirely within your browser's local storage.
2. **Extension Storage (`chrome.storage.local`):** The Chrome Extension functions as your scout. As you browse LinkedIn or Greenhouse, you score roles. If the dashboard is not open, the extension queues this data securely in your browser's background storage. 
3. **Cross-Origin Live Sync:** 
   - When the dashboard is open, the extension uses secure message-passing (`chrome.runtime.sendMessage`) to send scored roles directly into the dashboard in real-time.
   - If the dashboard was closed when you scored a role, the dashboard will automatically pull any queued items from the extension (`onMessageExternal`) the next time you load it.
4. **Persistent Backup:** Because strict browser privacy settings sometimes clear `localStorage`, the dashboard mirrors all critical data to the extension's persistent `chrome.storage.local`. If your dashboard is ever wiped, the extension restores it automatically upon the next load.

No external databases. No telemetry. Your data stays in your browser.

---

## Step 1: Customize Your "Brain" (3 mins)

The system relies on LLMs (like Claude) referencing your specific career history. You must customize the core knowledge files before doing anything else.

1. **Open `CLAUDE.md`:** 
   - Fill in your `[Your Name]`, `[Your Target Title]`, `[Key Metrics]`, and `[Core Narratives]`. 
   - This file is the master context that Claude will use when writing cover letters, outreach emails, or debriefs.
2. **Open `BULLET_LIBRARY.md`:** 
   - Replace the generic `[REPLACE]` bullets with your actual resume highlights. 
   - Assign them to specific narrative tags (e.g., `enterprise`, `startup`).
3. **Open `SOURCES.md`:**
   - Add the email addresses of job boards and recruiters you want Claude to track.
4. **(Optional) Configure AI:** 
   - Start a new Project in Claude (or your preferred LLM interface). 
   - Upload `CLAUDE.md`, `BULLET_LIBRARY.md`, `WORKFLOW_GUIDE.md`, and `SOURCES.md` to the project's knowledge base.

---

## Step 2: Host the Dashboard (2 mins)

The dashboard is a static HTML file, but it must be hosted securely (HTTPS) for the Chrome Extension to communicate with it.

1. **Fork/Clone the Repository:** 
   - Fork this repository to your GitHub account.
2. **Enable GitHub Pages:** 
   - Go to your repository settings -> Pages. 
   - Deploy from the `main` branch. 
   - Note your new URL (e.g., `https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME/`).
3. **Set the Security Password:**
   - In `index.html`, find the `KEY` variable (`const KEY = 'ChangeThisPassword';`) and change it to something secure. You will enter this once to unlock the dashboard.

---

## Step 3: Configure the Extension (5 mins)

For the dashboard to receive live updates, the extension must explicitly authorize your specific GitHub Pages URL.

1. **Update `manifest.json`:**
   - Open `jobos-extension-v2/manifest.json`.
   - Locate the `externally_connectable` block and the `content_scripts` block.
   - Replace `YOUR_GITHUB_USERNAME.github.io` with your actual GitHub Pages domain.
2. **Update `popup.html`:**
   - Open `jobos-extension-v2/popup.html`.
   - Locate the `<input id="dash-url">` and replace the placeholder domain with your GitHub Pages domain.
3. **Update `popup.js` (Optional but highly recommended):**
   - At the top of `popup.js`, configure your `background` summary and adjust the `ANGLES` logic to match your strongest resume bullets (e.g., matching a `startup` tag to a specific 0-to-1 bullet you wrote in Step 1).

---

## Step 4: Install the Extension (2 mins)

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top right corner).
3. Click **Load unpacked**.
4. Select the `jobos-extension-v2/` folder from your local machine.

---

## Step 5: Test the Sync (3 mins)

1. **Open your Dashboard:** Navigate to your GitHub Pages URL. Enter your password.
2. **Set Extension Target:** Click the Job Search OS extension icon in your toolbar. Switch to the **Nudges** tab and ensure your dashboard URL is pasted in the input field. Click **Save dashboard URL**.
3. **Test a Score:** Go to a job posting on LinkedIn or Greenhouse. Open the extension, configure your outreach angle, and click **Queue for review**.
4. **Verify:** Check your dashboard. The role should instantly appear in the **Inbox (To Review)** section.

You are now fully onboarded and ready to start applying.