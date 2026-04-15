# Job Search OS - Future Roadmap & Feature Ideas

This document tracks proposed enhancements for future versions of the Job Search OS.

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

### Gmail/Calendar MCP Connector (Native)
- **Feature**: A dedicated Node.js helper that runs locally to provide Claude with direct, authenticated access to Gmail and Calendar.
- **Impact**: Removes the need for the manual copy-paste of briefing prompts.

---

## 4. Design & UX

### Advanced Activity Heatmap
- **Feature**: Expand the 26-week activity map to include specific event types (e.g., Green for Interview, Blue for Outreach, Purple for Application).
- **Impact**: Better visual feedback on "search velocity."

### Interactive Referral Network
- **Feature**: A visual graph (D3.js) showing the connections between your target companies and your warm referral paths.
- **Impact**: Easier identification of cluster opportunities where one contact might unlock multiple companies.

---

*Last updated: April 13, 2026*
