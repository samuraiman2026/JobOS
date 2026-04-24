# Job Search OS - Future Roadmap & Feature Ideas

This document tracks proposed enhancements for future versions of the Job Search OS.

---

## Shipped in v4.9
- **Live sync fix** ✓ — Extension items appear in dashboard immediately without refresh via MAIN-world helpers.
- **ID stability** ✓ — Migrated to timestamp-based unique IDs to prevent sync collisions.
- **JD preprocessing** ✓ — Auto-trimming of boilerplate from JDs to save tokens.
- **Outreach inline editing** ✓ — Live contact editing directly in the outreach table.
- **Externalized Gmail search** ✓ — `SOURCES.md` file for managing briefing sources.

## Shipped in v4.8

- **Company Research** ✓ — Context-aware Claude research (news, priorities, ecosystem) for every role in the resume builder.
- **Apply feedback loop** ✓ — "Mark as sent" stamps appliedAt and updates pipeline role after prompt generation.

## Shipped in v4.7

- **Outreach tracker backup** ✓ — Clearing browser cookies no longer wipes the outreach tracker. Backed up to `chrome.storage.local` on every save, auto-restored on next load.

## Shipped in v4.6

- **Role inbox / triage queue** ✓ — "To Review" stage, Inbox panel, Apply/Resume/Pass actions, extension routes to inbox by default.
- **Daily affirmation** ✓ — Rotating quote at top of dashboard, stable all day, changes each morning.
- **Resume fill from extension** ✓ — "→ Fill /resume" button sends company, role, and JD directly into Step 1 fields.

---

## 1. Intelligence & Automation

### Semantic Bullet Search
- **Feature**: Instead of static template mapping, use local embeddings to find the top 5 most relevant bullets from `BULLET_LIBRARY.md` based on the specific keywords in a JD.
- **Impact**: Higher precision in resume tailoring with zero manual effort.

### In-Page Extension AI
- **Feature**: Integrate the Anthropic API directly into the Chrome extension `popup.js`.
- **Impact**: Get instant JD scoring, gap analysis, and "skeptic mode" questions without leaving the job board page.

### Auto-Follow-up Agent
- **Feature**: A background worker that scans the outreach tracker every Sunday night and drafts personalized "nudge" emails for every overdue contact.
- **Impact**: Maintains networking momentum automatically.

---

## 2. Interview & Performance

### Audio Transcription & Scoring
- **Feature**: Add an upload field in `/debrief` for MP3/WAV files. Use a transcription service (or local model) to convert the interview to text.
- **Impact**: Claude scores your actual delivery, tonality, and confidence rather than just your memory of the answers.

### Real-time "Cheat Sheet" Generator
- **Feature**: A button in `/prep` that generates a one-page "Battle Card" for a specific interviewer, including their background, common questions they ask, and your mapped STAR stories.
- **Impact**: Instant, high-value reference for the 5 minutes before an interview starts.

---

## 3. Infrastructure & Sync

### Lightweight Backend (Cloud Sync)
- **Feature**: Replace `localStorage` with a Supabase or Firebase backend.
- **Impact**: Seamless syncing between laptop, desktop, and mobile without manual JSON export/import.
- **Status**: Partially addressed in v4.5 - `chrome.storage.local` now acts as a persistent backup that survives browser restarts. Full cross-device sync still requires a backend.

### Gmail/Calendar MCP Connector (Native)
- **Feature**: A dedicated Node.js helper that runs locally to provide Claude with direct, authenticated access to Gmail and Calendar.
- **Impact**: Removes the need for the manual copy-paste of briefing prompts.

---

## 4. Design & UX

### Advanced Activity Heatmap
- **Feature**: Expand the 26-week activity map to include specific event types (e.g., Green for Interview, Blue for Outreach, Purple for Application).
- **Impact**: Better visual feedback on "search velocity."

### Interactive Referral Network
- **Feature**: A visual graph (D3.js) showing the connections between your 59 target companies and your 20+ priority referral paths.
- **Impact**: Easier identification of cluster opportunities where one contact might unlock three companies.

---

*Last updated: April 23, 2026 · v4.9*
