# Job Search OS - Workflow Guide (v4.2)
# Reference this file for all slash command instructions.

## Global Constraints (Non-Negotiable)
- **NO EM-DASHES:** Never use em-dashes (-) in any generated text, especially resume bullets, cover notes, or scripts. Use standard hyphens (-) or colons (:) instead.
- **Data Integrity:** Preserve all metrics ($20M, 120%, etc.) exactly as found in CLAUDE.md.

## /brief - Morning Briefing
**Purpose:** Generate a high-impact daily game plan.
**Instructions:**
1. Search Google Calendar for today's events.
2. Search Gmail for: (a) new emails from senders listed in `SOURCES.md`, (b) new LinkedIn job alert emails today, (c) recruiter replies in the last 3 days.
3. Review the provided `<pipeline>` and `<overdue_followups>`.
**Deliver:**
- Top 3 actions for today, ranked by impact.
- Any pipeline roles going cold.
- New LinkedIn alerts worth scoring.
- Referral outreach to send today.
- One-line status on each active pipeline role.
**Constraint:** 90-second read. Game plan, not a report.
**Seniority rule:** Do not flag Senior Manager or Manager roles as "below target" unless the stated or estimated salary is below $150K. A strong skill match overrides title level.

## /score - JD Fit Analysis
**Purpose:** Analyze JD fit against profile dimensions.
**Instructions:**
1. Score 1-10 on each (show visual bars):
   - Ecosystem/partner motion match (25%)
   - 0-to-1 builder requirement (25%)
   - Technical BD depth needed (20%)
   - AI-native / Edge AI angle (20%)
   - Seniority and scope match (10%)
2. Calculate overall weighted score + verdict: Apply Now / Apply with Bridge / Pass.
3. **Seniority rule:** Do NOT penalize Senior Manager or Manager titles. Score seniority on scope, ownership, and team size - not title alone. Only flag a seniority gap if the role is clearly IC-only (no team, no budget ownership) or if stated compensation is below $150K.
**Deliver:**
- Weighted score + Verdict.
- 2 strongest angles + biggest gap for this specific role.

## /apply - Application Workflow
**Purpose:** Create a complete application package.
**Instructions:**
1. Use `<bullet_guidance>` and `<contact_context>` to tailor the output.
2. Perform JD analysis.
**Deliver:**
- **JD Analysis:** What does this company actually care about?
- **Resume Restructure:** 4-5 bullets per role, impact-first (use BULLET_LIBRARY.md).
- **Gap & Bridge Analysis:** Frame missing requirements using existing strengths.
- **Referral Strategy:** Who to reach and what angle to use.
- **Cover Note:** One specific hook, not a resume summary.

## /referral - Referral Strategy
**Purpose:** Build a referral-first approach for a role.
**Deliver:**
- **Who to reach:** Ideal (BD/Partnerships/GTM), second (HM's chain), third (2nd-degree).
- **The Angle:** What earns a response (NOT "I'm applying").
- **LinkedIn DM:** Under 80 words, specific, not a template.
- **Timing:** Apply first or wait?
- **Follow-up Plan:** If no reply in 5 days.

## /prep - Interview Preparation
**Purpose:** Full research and question bank for an interview.
**Instructions:**
1. Search the web for: (a) recent news about the company, (b) interviewer background (if provided).
2. Map questions to best STAR stories (A-E) in CLAUDE.md.
**Deliver:**
- What the company cares about right now.
- 10 BD-specific questions (Partner motion, deal structure, ecosystem GTM, etc.).
- Best story to use for each question.
- 3 gap questions with exact bridge narratives.
- "Tell me about yourself" (90 seconds, tailored).

## /mock - Mock Interview
**Purpose:** Interactive practice with live scoring.
**Instructions:**
1. Ask questions based on `<mode>` (Hardest, Weak, Full, Specific).
2. Ask one question at a time. Wait for answer.
3. After each answer, score: Relevance (1-5), Specificity (1-5), Impact Clarity (1-5), Story Fit (1-5).
**Deliver:**
- Score + Feedback (what landed/what to fix).
- Suggested story to use instead.
- One rewrite of the answer.

## /debrief - Post-Interview Analysis
**Purpose:** Analyze performance and generate follow-ups.
**Deliver:**
- **Scoring:** Relevance (1-5), Specificity (1-5), Impact Clarity (1-5).
- **Value Optimization:** 2-3 moments I left value on the table + specific rewrites.
- **Insights:** What the interviewer seemed to care most about.
- **Follow-up:** Personalized thank-you email (under 150 words).
- **Next Steps:** What to prepare differently for the next round.

## /negotiate - Offer Strategy
**Purpose:** Market benchmarking and counter-offer script.
**Instructions:**
1. Search the web for current compensation benchmarks for the role/market.
2. Use `<offer>` and `<leverage>` to build the strategy.
**Deliver:**
- Market benchmarks with sources.
- 3 strongest leverage points for this specific offer.
- Counter offer recommendation (Base, Equity, Signing).
- Exact script for the negotiation call (word for word).
- "Best offer" pushback response.

## /pattern - Pattern Analysis
**Purpose:** Cross-interview weakness identification.
**Deliver:**
- Question types I score low on (visual bars).
- Question types I score high on (auto-pilot stories).
- 3 specific repeating weaknesses.
- Story over-reliance / underuse flags.
- **Drill Plan:** 3 question types to practice.
- "Stop doing" / "Do more" items.

## /post - LinkedIn Post Generation
**Purpose:** Practitioner-grade thought leadership.
**Constraints:**
- 150–250 words.
- Strong first line (no "I've been thinking about...").
- Practitioner-grade (no AI buzzword soup).
- One concrete example from experience.
- Ends with a question to invite engagement.
- Voice: Direct, specific, occasionally wry, no corporate-speak.
- NO emojis (except bullet dots).
