Tier 1 — High impact, buildable now
Live outreach sync via shared Claude Project file
The biggest gap right now is that scoring a role in the extension and having it appear in the OS dashboard requires a manual export/import. The fix: host the OS HTML on a simple static URL (GitHub Pages or Vercel — one command to deploy) so both the extension and the browser share the same origin and can read/write the same localStorage. Zero backend required. This makes the extension's "+ Add to tracker" button instant and bidirectional.
Automated morning email digest as a Claude artifact
Right now /brief requires you to open Claude and ask. The better version: a Gmail Apps Script that runs at 7am, searches your inbox for LinkedIn alerts + recruiter replies, formats them into a structured digest, and either emails it to you or posts it to a Slack channel. One message with everything pre-scored. You read it over coffee instead of doing it manually.
Interview recording → debrief automation
Currently you reconstruct questions from memory in /debrief. The upgrade: connect Granola (already connected via MCP) to the debrief workflow. After any interview Granola attended, /debrief automatically pulls the meeting transcript, extracts questions asked, and scores your answers without you typing anything. This makes the pattern log actually compound — you won't skip it because it's effortless.
Offer comparison calculator
When you have multiple offers (which you will), /negotiate currently handles one offer at a time. A simple interactive artifact — base + bonus + equity + signing + remote value + growth trajectory — that renders a side-by-side total comp comparison with breakeven analysis on equity. Particularly relevant for comparing a startup offer with equity against a big-tech offer without it.

Tier 2 — Meaningful additions with moderate effort
LinkedIn post generator for thought leadership
The AI Partnership Stack framework you built is a genuine differentiator — it's a publishable POV. A /post workflow that takes a topic (e.g. "MCP and what it means for BD/partnerships") and generates a LinkedIn post in your voice: specific, practitioner-grade, ends with a question. Posts that demonstrate you understand the space before companies even interview you. Particularly valuable for the AI-native company targets.
Referral network map
Right now referrals are ad hoc — you know you have contacts at Pinterest/Adobe/Airbnb from Huawei, but there's no structured view. A simple artifact in the OS that maps your network by company tier (Tier 1 targets, Tier 2 targets, known warm contacts) and surfaces the shortest path to a warm intro for any company on your outreach list. Could be as simple as a visual graph or as functional as a filterable table.
Salary negotiation market data refresh
The comp benchmarks in /negotiate are hardcoded as of April 2026. A scheduled Gmail search for "compensation report" + web search automation that refreshes the market benchmarks monthly and updates the CLAUDE.md comp section. Always negotiating with current data.
Pattern log → performance dashboard
After 10+ interviews, the pattern log has enough data to generate a real performance view: question type scores over time, story usage distribution, which companies you advance at vs stall at, average days between rounds. A simple artifact that reads the pattern log and renders it visually. Right now the data is there but invisible until you run /pattern.

Tier 3 — Longer term, higher leverage
CricVantage as a portfolio proof point
CricVantage is already a serious project — 9.6M ball-by-ball deliveries, FastAPI + React, real deployment. The missing piece is making it visible to BD/Partnerships hiring managers who care about technical depth. A one-page case study artifact (what problem you solved, what you built, what the technical decisions were, why it matters for on-device AI/data partnerships) that you can attach to applications for Tenstorrent-type roles where Builder-Seller credibility is the differentiator.
AI Partnership Stack as a published framework
The six-layer taxonomy (Intelligence core → Capability extension → Developer ecosystem → Vertical solution → Motion design → Distribution) is a real practitioner framework with no public equivalent. Publishing it as a LinkedIn article or Substack piece would do two things: (1) establish you as a thought leader in AI partnerships before you have a title, (2) give the extension's Gist profile something to link to as external validation. The interactive courseware you built around it is already the foundation.
Job Search OS as an open-source template
The system itself is a product. Stripped of your personal background (replace CLAUDE.md with a template), the OS is a transferable framework that any senior professional could use. Open-sourcing it on GitHub would: generate inbound from other people using it, demonstrate your ability to build and distribute a product from scratch, and create a public proof point of the 0-to-1 program design you talk about in every interview. The Chrome extension + HTML dashboard is genuinely novel infrastructure that doesn't exist elsewhere.
Application tracking integrated with ATS signals
Right now you track pipeline manually. A smarter version reads your Gmail for ATS-generated emails (Greenhouse "application received", Lever "your application", Workday rejections) and auto-updates the pipeline stage in the OS. No manual logging — the pipeline just reflects reality. Combined with the nudge system, this means the OS always knows where every application stands without you touching it.

The one I'd build next
Granola → debrief automation — it eliminates the biggest friction point in the entire system. The pattern log is where all the compounding value lives, but it only compounds if you actually fill it in. Right now you have to reconstruct the interview from memory within 2 hours. Granola already has the transcript. Connecting them makes the most valuable feature essentially free.
The second would be deploying the OS HTML to a static URL — it's a one-command fix that unlocks the extension↔dashboard live sync and turns the tool from a local file into something you can access from any browser without carrying the HTML file around.