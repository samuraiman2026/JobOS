# Job Search OS - Next Steps & Improvement Backlog
*Last updated: April 23, 2026 · v4.9*

## ✓ COMPLETED — Scoring Rules Alignment (v4.9)
The scoring logic in `WORKFLOW_GUIDE.md` (Claude) and `calcPenalties()` (Extension/Dashboard) now both include foreign-language penalties and follow the same seniority-logic overrides.

## ✓ COMPLETED — Live Sync Fix (v4.9)
Extension items now appear in the dashboard immediately without refresh via `window._jobosLiveSync` helpers.

## ✓ COMPLETED — Company Research in Resume Builder (v4.8)
Collapsible card at bottom of Step 1. Generates a structured Claude prompt covering recent news, strategic priorities, ecosystem signals, hiring signals, and competitive position — scoped to the JD.

## ✓ COMPLETED — Gmail Sources Configuration (v4.9)
Added `SOURCES.md` to allow users to easily add/remove email senders for the `/brief` command without touching code.

## 1. JD Persistence in the Pipeline
Most roles in the pipeline have no saved JD. The Apply dropdown and Resume quick-load only work when a JD is attached. Roles scored via the extension save a JD automatically, but roles added manually through the dashboard do not. A "paste JD" field on the pipeline card would fix the dropdown gap for all roles.

## 2. Brief → Score Loop
The brief surfaces roles but requires manually finding and scoring them. A "Score this role" button inline in the brief output — or a paste-JD field in the brief panel — would close that loop without leaving the dashboard.
