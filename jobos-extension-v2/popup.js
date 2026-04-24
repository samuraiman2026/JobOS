// Job Search OS - Popup Script v2
// MV3 compliant: zero inline handlers - all wired via addEventListener in init()
'use strict';

const STORAGE_KEY    = 'jobos_ext_v1';
const OUTREACH_KEY   = 'jobos_outreach_sync';
const GIST_KEY       = 'jobos_gist_url';
const DASHBOARD_KEY  = 'jobos_dashboard_url';
const NUDGE_DAYS     = 10;

let jobData = null;
let jobDataFromPage = null; // preserved original page scrape
let prompts = {};
let profile = null;

// ── FALLBACK PROFILE ─────────────────────────────────
const FALLBACK_PROFILE = {
  background: "[Your background summary — paste from CLAUDE.md. Include your top companies, roles, and 3-5 key metrics.]",
  bulletMap: {
    hardware:   "Lead with: [Your hardware/device bullet].",
    enterprise: "Lead with: [Your strongest enterprise/scale bullet].",
    startup:    "Lead with: [Your 0-to-1 or founding-role bullet].",
    
    
    general:    "Lead with: [Your highest-impact metric and role]."
  }
};

// ── INIT ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  wireButtons();
  await loadProfile();
  loadHistory();
  await detectJobPage();
  await loadNudges();
  loadGistConfig();
  loadDashboardConfig();
  loadExportCount();
});

// ── WIRE ALL BUTTONS ─────────────────────────────────
// MV3 requires all handlers here, not as inline onclick attributes
function wireButtons() {
  // Tabs
  on('tab-score',     () => switchTab('score'));
  on('tab-apply',     () => switchTab('apply'));
  on('tab-brief',     () => switchTab('brief'));
  on('tab-nudges',    () => switchTab('nudges'));
  on('tab-history',   () => switchTab('history'));
  on('tab-shortcuts', () => switchTab('shortcuts'));

  // Nudge banner
  on('nudge-banner',  () => switchTab('nudges'));

  // Score tab
  on('btn-score-manual',    scoreManual);
  on('btn-sync-tracker',    syncToTracker);
  on('btn-sync-pipeline',   syncToPipeline);
  on('btn-fill-resume',     fillResume);
  on('btn-open-claude-score', () => openClaude('score'));
  on('btn-copy-score',        () => copyP('score'));

  // Apply tab
  on('btn-gen-apply',         generateApply);
  on('btn-open-claude-apply', () => openClaude('apply'));
  on('btn-copy-apply',        () => copyP('apply'));
  document.getElementById('p-apply-pipeline').addEventListener('change', onApplyPipelineSelect);

  // Brief tab
  on('btn-gen-brief',         generateBrief);
  on('btn-open-claude-brief', () => openClaude('brief'));
  on('btn-copy-brief',        () => copyP('brief'));

  // Nudges tab
  on('btn-export-os',  exportToOS);
  on('btn-save-dash',  saveDashboardUrl);
  on('btn-save-gist',  saveGistUrl);

  // Shortcuts tab
  on('sc-referral',      () => quickCmd('referral'));
  on('sc-prep',          () => quickCmd('prep'));
  on('sc-mock',          () => quickCmd('mock'));
  on('sc-debrief',       () => quickCmd('debrief'));
  on('sc-negotiate',     () => quickCmd('negotiate'));
  on('sc-pattern',       () => quickCmd('pattern'));
  on('sc-hiring-manager',() => quickCmd('hiring-manager'));
  on('sc-skeptic',       () => quickCmd('skeptic'));
  on('btn-open-os',      openOSApp);
}

// Helper - safe addEventListener
function on(id, fn) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', fn);
}

// ── GIST PROFILE SYNC ────────────────────────────────
async function loadProfile() {
  return new Promise(resolve => {
    chrome.storage.local.get(GIST_KEY, async data => {
      const url = data[GIST_KEY];
      if (!url) { profile = FALLBACK_PROFILE; resolve(); return; }
      try {
        const resp = await fetch(url, { cache: 'no-store' });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const json = await resp.json();
        profile = { ...FALLBACK_PROFILE, ...json };
      } catch(e) {
        profile = FALLBACK_PROFILE;
      }
      resolve();
    });
  });
}

function loadGistConfig() {
  chrome.storage.local.get(GIST_KEY, data => {
    const url = data[GIST_KEY] || '';
    const el = document.getElementById('gist-url');
    const st = document.getElementById('gist-status');
    if (el) el.value = url;
    if (st) st.innerHTML = url
      ? '<span class="g-ok">● Profile loaded from Gist</span>'
      : '<span class="g-loading">○ Using fallback - enter Gist URL to enable live sync</span>';
  });
}

async function saveGistUrl() {
  const url = document.getElementById('gist-url').value.trim();
  chrome.storage.local.set({ [GIST_KEY]: url }, async () => {
    const st = document.getElementById('gist-status');
    if (!url) { loadGistConfig(); toast('Gist URL cleared'); return; }
    st.innerHTML = '<span class="g-loading"><span class="spinner"></span>Testing...</span>';
    try {
      const resp = await fetch(url, { cache: 'no-store' });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const json = await resp.json();
      profile = { ...FALLBACK_PROFILE, ...json };
      st.innerHTML = '<span class="g-ok">● Connected - profile synced</span>';
      toast('Gist profile loaded ✓');
    } catch(e) {
      st.innerHTML = '<span class="g-err">✗ Could not fetch - check URL is raw Gist link</span>';
    }
  });
}

// ── DASHBOARD URL CONFIG ──────────────────────────────
function loadDashboardConfig() {
  chrome.storage.local.get(DASHBOARD_KEY, data => {
    const url = data[DASHBOARD_KEY] || '';
    const el = document.getElementById('dash-url');
    const st = document.getElementById('dash-status');
    if (el) el.value = url;
    if (st) st.innerHTML = url
      ? `<span class="g-ok">● Live sync enabled - ${url}</span>`
      : '<span class="g-loading">○ Not configured - roles queue locally only</span>';
  });
}

function saveDashboardUrl() {
  const raw = document.getElementById('dash-url').value.trim();
  const st = document.getElementById('dash-status');
  if (!raw) {
    chrome.storage.local.remove(DASHBOARD_KEY);
    if (st) st.innerHTML = '<span class="g-loading">○ Not configured - roles queue locally only</span>';
    toast('Dashboard URL cleared');
    return;
  }
  if (!raw.startsWith('https://')) {
    if (st) st.innerHTML = '<span class="g-err">✗ URL must start with https://</span>';
    return;
  }
  const url = raw.replace(/\/$/, '') + '/';
  chrome.storage.local.set({ [DASHBOARD_KEY]: url }, () => {
    if (st) st.innerHTML = `<span class="g-ok">● Live sync enabled - ${url}</span>`;
    toast('Dashboard URL saved ✓');
  });
}

// ── PAGE DETECTION ────────────────────────────────────
async function detectJobPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;
  const url = tab.url || '';
  document.getElementById('site-url').textContent = url.replace('https://','').substring(0,46) + (url.length>46?'…':'');
  const sites = { 'linkedin.com':['in','LinkedIn'], 'greenhouse.io':['gh','Greenhouse'], 'lever.co':['lv','Lever'], 'ashbyhq.com':['ab','Ashby'], 'indeed.com':['in','Indeed'], 'glassdoor.com':['gd','Glassdoor'], 'wellfound.com':['wf','Wellfound'], 'builtin.com':['bt','Built In'] };
  let found = false;
  for (const [domain, [icon, label]] of Object.entries(sites)) {
    if (url.includes(domain)) {
      document.getElementById('site-icon').textContent = icon;
      document.getElementById('site-status').innerHTML = `<span class="s-ok">● ${label}</span>`;
      found = true; break;
    }
  }
  if (!found) {
    document.getElementById('site-icon').textContent = '?';
    document.getElementById('site-status').innerHTML = `<span class="s-warn">● unknown</span>`;
  }
  document.getElementById('score-loading').style.display = 'block';
  try {
    const resp = await chrome.tabs.sendMessage(tab.id, { action: 'extractJob' });
    document.getElementById('score-loading').style.display = 'none';
    if (resp && (resp.title || resp.jobText)) {
      jobData = resp;
      jobDataFromPage = resp;
      showJobDetected(resp);
      autoScore(resp);
    } else { showNoJob(); }
  } catch(e) {
    document.getElementById('score-loading').style.display = 'none';
    showNoJob();
  }
}

function showJobDetected(data) {
  document.getElementById('job-bar').style.display = 'block';
  document.getElementById('job-title-d').textContent = data.title || 'Job posting detected';
  document.getElementById('job-co-d').textContent = data.company || data.url;
  document.getElementById('job-src').textContent = data.source;
}

function showNoJob() {
  document.getElementById('score-no-job').style.display = 'block';
  document.getElementById('score-content').style.display = 'none';
}

// ── SCORING ───────────────────────────────────────────
function autoScore(data) {
  const jd = ((data.title||'') + ' ' + (data.company||'') + ' ' + (data.jobText||'')).toLowerCase();
  runScoreEngine(jd, data.title, data.company);
}

function scoreManual() {
  const jd = document.getElementById('manual-jd').value.trim();
  const company = document.getElementById('manual-company').value.trim();
  if (!jd && !company) { toast('Paste a JD to score'); return; }
  jobData = { title: company.split('-')[1]?.trim()||'', company: company.split('-')[0].trim(), jobText: jd, source:'manual', url:'' };
  showJobDetected(jobData);
  runScoreEngine((jd+' '+company).toLowerCase(), jobData.title, jobData.company);
}

function runScoreEngine(jdText, title, company) {
  const s1 = kw(jdText, ['ecosystem','partner','isv','marketplace','developer','sdk','platform','alliance','channel','go-to-market','gtm','integration','co-sell','distribution']);
  const s2 = kw(jdText, ['build','create','launch','from scratch','establish','first','greenfield','new','stand up','0 to 1','zero to one','founding','incubate']);
  const s3 = kw(jdText, ['technical','engineering','api','integration','sdk','architecture','infrastructure','protocol','developer','product','saas']);
  const s4 = kw(jdText, ['ai','artificial intelligence','ml','machine learning','llm','edge','on-device','genai','model','intelligent','deep learning','neural']);
  const s5 = kw(jdText, ['director','senior manager','vp','vice president','lead','head of','strategic','executive','global','principal']);
  const base = Math.round(s1*.25 + s2*.25 + s3*.20 + s4*.20 + s5*.10);
  const { pts: penaltyPts, flags: penaltyFlags } = calcPenalties(jdText);
  const total = Math.max(0, base - penaltyPts);

  document.getElementById('score-no-job').style.display = 'none';
  document.getElementById('score-content').style.display = 'block';

  setTimeout(() => {
    anim('p-sf1','p-sp1',s1); anim('p-sf2','p-sp2',s2); anim('p-sf3','p-sp3',s3);
    anim('p-sf4','p-sp4',s4); anim('p-sf5','p-sp5',s5);
    const te = document.getElementById('p-total');
    te.textContent = total + '%';
    te.className = 'score-num ' + (total>=75?'strong':total>=50?'mid':'weak');
    const ve = document.getElementById('p-verdict');
    ve.innerHTML = total>=75 ? '<span class="vtag v-apply">✓ Apply now</span>' : total>=50 ? '<span class="vtag v-consider">○ Consider</span>' : '<span class="vtag v-skip">✗ Skip</span>';
    document.getElementById('p-angles').innerHTML = buildAngles(jdText, penaltyFlags);
    document.getElementById('sync-row').style.display = 'flex';
    document.getElementById('sync-company').value = company || '';
    document.getElementById('sync-role').value = title || '';
    prompts.score = buildScorePrompt(title, company, jobData?.jobText || jdText);
    saveScore(company + (title ? ' - '+title : ''), total);
    logUsage('/score', (company||'Unknown') + (title ? ' - '+title : ''));
  }, 100);
}

function kw(text, words) {
  const hits = words.filter(w => text.includes(w)).length;
  return Math.round(50 + Math.min(hits / Math.max(words.length * 0.35, 1), 1) * 50);
}

// Detect must-have requirements that are genuine gaps and return a penalty + flags.
// Applied AFTER the weighted score so gaps actively pull the number down.
function calcPenalties(jd) {
  const flags = [];
  let pts = 0;

  // Hyperscaler-specific must-have (AWS/Azure/GCP as primary requirement, not just mentioned)
  const hyperscalerReq =
    /hyperscaler/i.test(jd) ||
    /(must.have|required|mandatory|essential|minimum).{0,80}(aws|azure|gcp|google cloud|cloud partner)/i.test(jd) ||
    /(aws|azure|gcp|google cloud).{0,50}(required|must.have|mandatory|essential|certification)/i.test(jd) ||
    /\d\+?\s*years?.{0,40}(aws|azure|gcp|hyperscaler|google cloud)/i.test(jd);
  if (hyperscalerReq) {
    flags.push('Hyperscaler must-have (AWS/Azure/GCP) — not a primary credential (-18)');
    pts += 18;
  }

  // Unusually high year requirements for specific skills (8+, 10+, 12+)
  const highYearMatch = jd.match(/\b(8|9|10|11|12|15|20)\+?\s*years?\b/i);
  if (highYearMatch) {
    flags.push(`${highYearMatch[0].trim()} minimum detected — verify this is the seniority bar, not a domain req (-8)`);
    pts += 8;
  }

  // Quota-carrying AE role, not a BD/partnerships role
  if (/(carry\s+a\s+quota|quota.carrier|sales\s+quota|revenue\s+quota|closed.{0,20}\$[\d]+M?\s+arr|close\s+rate)/i.test(jd) &&
      !/(partner|ecosystem|alliance|channel|platform)/i.test(jd)) {
    flags.push('Role is mismatched with core background (-15)');
    pts += 15;
  }

  // Federal / government / clearance — hard block
  if (/(federal|department\s+of\s+defense|\bdod\b|security\s+clearance|clearance\s+required|top\s+secret|ts\/sci)/i.test(jd)) {
    flags.push('Clearance or federal requirement — not applicable (-22)');
    pts += 22;
  }

  // Healthcare domain without a tech/platform angle
  if (/(healthcare|hipaa|\behr\b|medical\s+device|life\s+sciences|pharmaceutical|clinical\s+trials)/i.test(jd) &&
      !/(ai|platform|api|developer|partner)/i.test(jd)) {
    flags.push('Healthcare-specific domain — no direct credential (-10)');
    pts += 10;
  }

  // Specific platform certifications that are hard requirements
  if (/(salesforce\s+certified|salesforce\s+admin|sap\s+certif|oracle\s+certif|servicenow\s+certif)/i.test(jd)) {
    flags.push('Platform certification required — not held (-12)');
    pts += 12;
  }

  // User speaks Hindi and English only — penalize hard foreign-language requirements
  if (/(fluent\s+in|native\s+(speaker|proficiency)|full\s+professional\s+proficiency\s+in|business\s+proficiency\s+in|must\s+(speak|be\s+fluent)|bilingual|proficiency\s+in)\s+(french|german|spanish|mandarin|chinese|japanese|korean|portuguese|italian|dutch|arabic|russian|turkish|polish|hebrew|thai|vietnamese)/i.test(jd)) {
    flags.push('Non-English/Hindi language required — not a primary language (-18)');
    pts += 18;
  }

  return { pts: Math.min(pts, 40), flags };
}

function anim(fId, pId, val) {
  document.getElementById(fId).style.width = val + '%';
  document.getElementById(pId).textContent = val + '%';
}

function buildAngles(jd, penaltyFlags = []) {
  const pos=[], neg=[];
  if (jd.includes('ecosystem')||jd.includes('isv')||jd.includes('platform')) pos.push('Ecosystem builder match - check CLAUDE.md for strongest proof point');
  if (jd.includes('0 to 1')||jd.includes('from scratch')||jd.includes('founding')||jd.includes('build')) pos.push('0-to-1 builder signal - founding/first-hire story maps here');
  if (jd.includes('ai')||jd.includes('on-device')||jd.includes('edge')) pos.push('AI/domain angle - use most relevant technical or domain story');
  if (jd.includes('hardware')||jd.includes('device')||jd.includes('oem')) pos.push('Hardware/OEM signal - surface device/distribution experience');
  if (jd.includes('saas')&&!jd.includes('enterprise')) neg.push('SaaS-only framing - emphasize your specific API or product experience');
  if (jd.includes('sales')&&!jd.includes('partnership')) neg.push('Sales-heavy JD - reframe as partner-assisted and ecosystem revenue');
  if (!jd.includes('partner')&&!jd.includes('ecosystem')) neg.push('Light partnership language - verify role type before applying');
  const posHtml = pos.length ? '<span class="a-pos">+ </span>'+pos.join('<br><span class="a-pos">+ </span>') : '';
  const negHtml = neg.length ? '<br><span class="a-neg">− </span>'+neg.join('<br><span class="a-neg">− </span>') : '';
  const penHtml = penaltyFlags.length
    ? '<br><span style="color:#e05a4a;font-size:9px;font-family:var(--mono);">▼ </span>'
      + penaltyFlags.join('<br><span style="color:#e05a4a;font-size:9px;font-family:var(--mono);">▼ </span>')
    : '';
  return posHtml + negHtml + penHtml;
}

// ── PROMPT BUILDERS ───────────────────────────────────
function buildScorePrompt(title, company, jd) {
  return `Run /score for this role using the rules in WORKFLOW_GUIDE.md.

<role>${company ? company + ' - ' + title : title || '[role]'}</role>
<jd>
${jd || '[paste JD here]'}
</jd>`;
}

// ── APPLY PIPELINE DROPDOWN ───────────────────────────
let applyPipelineItems = [];

function populateApplyPipeline() {
  chrome.storage.local.get([OUTREACH_KEY, 'jobos_v3_backup'], data => {
    const CLOSED = ['Rejected','Withdrawn','Closed'];
    const outreachItems = (data[OUTREACH_KEY]?.pipeline || []).filter(r => r.jd);
    const backupItems = (data['jobos_v3_backup']?.pipeline || [])
      .filter(r => r.jd && !CLOSED.includes(r.stage))
      .map(r => ({ company: r.company, role: r.role, jd: r.jd, url: r.url || '' }));
    const seen = new Set(outreachItems.map(r => `${r.company}|${r.role}`));
    applyPipelineItems = [...outreachItems, ...backupItems.filter(r => !seen.has(`${r.company}|${r.role}`))];
    const sel = document.getElementById('p-apply-pipeline');
    while (sel.options.length > 1) sel.remove(1);
    applyPipelineItems.forEach((r, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${r.company} — ${r.role}`;
      sel.appendChild(opt);
    });
    if (!applyPipelineItems.length) {
      const opt = document.createElement('option');
      opt.value = ''; opt.textContent = '— no pipeline roles with JD saved —'; opt.disabled = true;
      sel.appendChild(opt);
    }
  });
}

function onApplyPipelineSelect() {
  const sel = document.getElementById('p-apply-pipeline');
  const idx = sel.value;
  if (idx === '') { jobData = jobDataFromPage; return; }
  const r = applyPipelineItems[parseInt(idx)];
  if (!r) return;
  jobData = { company: r.company, title: r.role, jobText: r.jd, url: r.url || '' };
  toast(`Loaded: ${r.company} — ${r.role}`);
}

function generateApply() {
  if (!jobData && !document.getElementById('manual-jd').value) { toast('Navigate to a job page first'); return; }
  const type = document.getElementById('p-apply-type').value;
  const contact = document.getElementById('p-apply-contact').value;
  const role = jobData ? `${jobData.company} - ${jobData.title}` : 'this role';
  const jd = jobData?.jobText || document.getElementById('manual-jd').value;
  const bm = profile.bulletMap?.[type] || '';
  
  prompts.apply = `Run /apply for this role using the rules in WORKFLOW_GUIDE.md.

<role>${role}</role>
<jd>
${jd}
</jd>
<bullet_guidance>${bm}</bullet_guidance>
<contact_context>${contact==='none'?'No warm contact - cold referral strategy needed':contact==='weak'?'Weak 2nd-degree - warm outreach angle needed':contact==='weak1'?'Weak 1st-degree - know them but not closely, use a specific angle to re-engage before applying':'Strong 1st-degree contact - referral path available, activate directly'}</contact_context>`;

  const el = document.getElementById('apply-out');
  el.textContent = prompts.apply; el.style.display = 'block';
  document.getElementById('apply-copy').style.display = 'flex';
  logUsage('/apply', role); toast('Application prompt ready');
}

function generateBrief() {
  const pipeline = document.getElementById('p-brief-pipeline').value.trim();
  const followups = document.getElementById('p-brief-followups').value.trim();
  
  prompts.brief = `Run /brief using the rules in WORKFLOW_GUIDE.md.

<pipeline>
${pipeline || 'Reference my current pipeline in CLAUDE.md if not provided here.'}
</pipeline>

<overdue_followups>
${followups || 'None flagged.'}
</overdue_followups>

<gmail_sources>
Also search Gmail for emails from these senders and include any new role opportunities, status updates, or recruiter messages in the briefing:
- help@welcometothejungle.com (job board alerts)
- donotreply@email.careers.microsoft.com (Microsoft Careers)
Limit to last 48–72 hours. Summarize subject + any role/location mentioned.
</gmail_sources>`;

  const el = document.getElementById('brief-out');
  el.textContent = prompts.brief; el.style.display = 'block';
  document.getElementById('brief-copy').style.display = 'flex';
  logUsage('/brief', 'Morning briefing'); toast('Briefing prompt ready');
}

// ── OUTREACH SYNC ─────────────────────────────────────
function syncToTracker() {
  if (!jobData) { toast('No job data to sync'); return; }
  const company = document.getElementById('sync-company').value.trim() || jobData.company || 'Unknown';
  const role = document.getElementById('sync-role').value.trim() || jobData.title || '';
  const total = parseInt(document.getElementById('p-total').textContent) || 0;
  const pov = `Scored ${total}% via extension on ${new Date().toLocaleDateString()}`;
  chrome.runtime.sendMessage({ action: 'syncOutreach', data: { company, role, score: total, pov } }, resp => {
    if (chrome.runtime.lastError) { toast('Sync error - try again'); return; }
    const btn = document.getElementById('btn-sync-tracker');
    if (resp?.added) {
      toast(resp.liveSynced ? `${company} added to tracker - live ✓` : `${company} queued - open dashboard to sync`);
      if (btn) { btn.textContent = resp.liveSynced ? '✓ Live synced' : '✓ Queued'; btn.disabled = true; }
      loadExportCount();
      logUsage('/outreach-sync', company);
    } else {
      toast(`${company} already in tracker`);
      if (btn) { btn.textContent = '✓ Already tracked'; btn.disabled = true; }
    }
  });
}

function syncToPipeline() {
  if (!jobData) { toast('No job data to sync'); return; }
  const company = document.getElementById('sync-company').value.trim() || jobData.company || 'Unknown';
  const role = document.getElementById('sync-role').value.trim() || jobData.title || '';
  const total = parseInt(document.getElementById('p-total').textContent) || 0;
  chrome.runtime.sendMessage({ action: 'syncPipeline', data: { company, role, score: total, url: jobData.url || '', jd: jobData.jobText || '' } }, resp => {
    if (chrome.runtime.lastError) { toast('Sync error - try again'); return; }
    const btn = document.getElementById('btn-sync-pipeline');
    if (resp?.added) {
      toast(resp.liveSynced ? `${company} → inbox live ✓` : `${company} queued for inbox`);
      if (btn) { btn.textContent = resp.liveSynced ? '✓ In inbox' : '✓ Queued'; btn.disabled = true; }
      loadExportCount();
      logUsage('/pipeline-sync', company);
    } else {
      toast(`${company} already in pipeline`);
      if (btn) { btn.textContent = '✓ Already tracked'; btn.disabled = true; }
    }
  });
}

function fillResume() {
  if (!jobData) { toast('No job data - navigate to a job page first'); return; }
  const company = document.getElementById('sync-company').value.trim() || jobData.company || '';
  const role    = document.getElementById('sync-role').value.trim()    || jobData.title   || '';
  const jd      = jobData.jobText || '';
  chrome.runtime.sendMessage({ action: 'fillResume', data: { company, role, jd } }, resp => {
    if (chrome.runtime.lastError) { toast('Dashboard not open - open it first'); return; }
    const btn = document.getElementById('btn-fill-resume');
    if (resp?.filled) {
      toast('Filled /resume - check dashboard');
      if (btn) { btn.textContent = '✓ Filled'; btn.disabled = true; }
    } else {
      toast('Dashboard not found - open it first');
    }
  });
}

function loadExportCount() {
  chrome.storage.local.get(OUTREACH_KEY, data => {
    const contacts = data[OUTREACH_KEY]?.contacts || [];
    const pipeline = data[OUTREACH_KEY]?.pipeline || [];
    const total = contacts.length + pipeline.length;
    const el = document.getElementById('export-count');
    const sub = document.getElementById('export-sub');
    if (el) el.textContent = total;
    if (sub) sub.textContent = total === 0
      ? 'No items to sync yet. Score a role and click add.'
      : `${total} item${total===1?'':'s'} queued. Export to import into the dashboard.`;
  });
}

function exportToOS() {
  chrome.storage.local.get(OUTREACH_KEY, data => {
    const contacts = data[OUTREACH_KEY]?.contacts || [];
    const pipeline = data[OUTREACH_KEY]?.pipeline || [];
    if (!contacts.length && !pipeline.length) { toast('Nothing to export yet'); return; }
    const json = JSON.stringify({ contacts, pipeline, exportedAt: new Date().toISOString() }, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      toast(`${contacts.length + pipeline.length} items copied`);
      logUsage('/export', (contacts.length + pipeline.length) + ' items');
    });
  });
}

// ── NUDGE ALERTS ──────────────────────────────────────
async function loadNudges() {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ action: 'getOverdueContacts' }, resp => {
      const overdue = resp?.overdue || [];
      renderNudges(overdue);
      updateNudgeBadge(overdue.length);
      resolve();
    });
  });
}

function renderNudges(overdue) {
  const list = document.getElementById('nudge-list');
  const banner = document.getElementById('nudge-banner');
  const bannerText = document.getElementById('nudge-banner-text');
  if (!overdue.length) {
    list.innerHTML = `<div style="text-align:center;padding:20px 14px;"><div style="font-family:var(--mono);font-size:20px;color:var(--text3);margin-bottom:8px;">✓</div><div style="font-size:12px;color:var(--text2);">No overdue follow-ups.</div></div>`;
    banner.style.display = 'none';
    return;
  }
  banner.style.display = 'block';
  bannerText.textContent = `⚠ ${overdue.length} follow-up${overdue.length===1?'':'s'} overdue - click to review`;
  list.innerHTML = overdue.map((c, i) => `
    <div class="nudge-item" id="nudge-${i}">
      <div class="nudge-co">${c.company}</div>
      ${c.role ? `<div class="nudge-meta">${c.role}</div>` : ''}
      ${c.contact ? `<div class="nudge-meta">Contact: ${c.contact}</div>` : ''}
      <div class="nudge-days">Last outreach: ${c.lastOutreach||'unknown'} - ${c.daysSince} days ago</div>
      <div class="nudge-btns">
        <button class="nudge-btn nb-copy" data-nudge-idx="${i}">Copy nudge →</button>
        <button class="nudge-btn nb-done" data-done-idx="${i}" data-done-co="${c.company}">Mark sent</button>
      </div>
    </div>`).join('');
  // Wire nudge buttons - must be done after innerHTML
  window._nudges = overdue;
  list.querySelectorAll('[data-nudge-idx]').forEach(btn => {
    btn.addEventListener('click', () => copyNudgePrompt(parseInt(btn.dataset.nudgeIdx)));
  });
  list.querySelectorAll('[data-done-idx]').forEach(btn => {
    btn.addEventListener('click', () => markNudgeDone(parseInt(btn.dataset.doneIdx), btn.dataset.doneCo));
  });
}

function copyNudgePrompt(i) {
  const c = window._nudges?.[i]; if (!c) return;
  const prompt = `Write a brief, warm follow-up message for ${c.company}${c.contact?` (contact: ${c.contact})`:''}.\n\nLast outreach: ${c.lastOutreach||'unknown'} (${c.daysSince} days ago)\n${c.role?'Role: '+c.role:''}\n${c.pov?'My angle: '+c.pov:''}\n\nRequirements:\n- Under 60 words\n- Does NOT say "just checking in"\n- Adds value - share a recent insight about ${c.company} or a specific question\n- Ends with a clear but low-pressure ask\n\nMy full background and metrics are available in CLAUDE.md. Use that context for this prompt.`;
  navigator.clipboard.writeText(prompt).then(() => {
    toast(`Nudge prompt for ${c.company} copied`);
    logUsage('/nudge', c.company);
  });
}

function markNudgeDone(i, company) {
  const today = new Date().toLocaleDateString('en-US', { month:'short', day:'numeric' });
  chrome.storage.local.get(OUTREACH_KEY, data => {
    const contacts = data[OUTREACH_KEY]?.contacts || [];
    const c = contacts.find(x => x.company?.toLowerCase() === company.toLowerCase());
    if (c) { c.lastOutreach = today; c.status = c.status === 'Reached Out' ? 'Follow-up Sent' : 'Reached Out'; }
    chrome.storage.local.set({ [OUTREACH_KEY]: { ...data[OUTREACH_KEY], contacts } }, () => {
      const el = document.getElementById(`nudge-${i}`);
      if (el) el.style.opacity = '0.4';
      toast(`${company} - logged for ${today}`);
      logUsage('/nudge-done', company);
      loadNudges();
    });
  });
}

function updateNudgeBadge(count) {
  const badge = document.getElementById('nudge-badge');
  if (!badge) return;
  badge.textContent = count;
  badge.style.display = count > 0 ? 'block' : 'none';
}

// ── SHORTCUTS ─────────────────────────────────────────
const SHORTCUT_PROMPTS = {
  referral: () => {
    const role = jobData ? `${jobData.company} - ${jobData.title}` : '[paste role here]';
    return `Run /referral for this role using the rules in WORKFLOW_GUIDE.md.\n\n<role>${role}</role>\n<context>No extra context provided.</context>`;
  },
  prep: () => {
    const role = jobData ? `${jobData.company} - ${jobData.title}` : '[role here]';
    return `Run /prep for this interview using the rules in WORKFLOW_GUIDE.md.\n\n<role>${role}</role>\n<round>unknown</round>\n<interviewer>unknown</interviewer>\n<concerns>No specific concerns flagged.</concerns>`;
  },
  mock: () => {
    const role = jobData ? `${jobData.company} - ${jobData.title}` : '[role]';
    return `Run /mock for this role using the rules in WORKFLOW_GUIDE.md.\n\n<role>${role}</role>\n<mode>hardest</mode>`;
  },
  debrief: () => `Run /debrief using the rules in WORKFLOW_GUIDE.md.\n\n<interview_info>[company - role - interviewer]</interview_info>\n<questions_asked>\n1. [question]\n2. [question]\n3. [question]\n</questions_asked>\n<key_moments>\n[No specific notes.]\n</key_moments>\n<gut_read>Positive - felt good</gut_read>`,
  negotiate: () => `Run /negotiate using the rules in WORKFLOW_GUIDE.md.\n\n<role>[company - role]</role>\n<offer>\nBase: $[X]\nBonus: [%]\nEquity: [details]\nSigning: $[X]\n</offer>\n<competing_offers>none</competing_offers>\n<desire_level>8/10</desire_level>`,
  pattern: () => `Run /pattern using the rules in WORKFLOW_GUIDE.md.\n\n<debrief_history>\n[Paste debrief history here]\n</debrief_history>`,
  'hiring-manager': () => `You are a VP of Partnerships who has hired 20+ BD professionals. Review this material as a hiring manager - 6-second scan, skeptical lens.\n\n[Paste resume, cover note, or answer here]\n\nGive me: (1) first impression, (2) what's working - top 3, (3) what's not working - top 3 with fixes, (4) one bullet to rewrite, (5) verdict: HIRE / STRONG MAYBE / MAYBE / NOT YET.`,
  skeptic: () => {
    const role = jobData ? `${jobData.company} - ${jobData.title}` : '[this role]';
    return `Make the strongest possible case against hiring me for: ${role}\n\nMy full career history and metrics are in CLAUDE.md. Use that context for this prompt.\n\nFor each concern: what triggers it, how serious (1-5), and the exact bridge narrative. Then: the hardest question a skeptical interviewer would ask.`
  }
};

function quickCmd(cmd) {
  const prompt = SHORTCUT_PROMPTS[cmd]?.();
  if (!prompt) return;
  navigator.clipboard.writeText(prompt).then(() => {
    toast(cmd + ' prompt copied');
    logUsage('/'+cmd, jobData ? jobData.company : 'quick command');
  });
}

// ── CLAUDE / COPY ─────────────────────────────────────
function openClaude(type) {
  const prompt = prompts[type] || '';
  if (!prompt) { toast('Generate a prompt first'); return; }
  navigator.clipboard.writeText(prompt).then(() => {
    chrome.tabs.create({ url: 'https://claude.ai/new' });
    toast('Prompt copied - paste it in Claude');
  });
}

function copyP(type) {
  const prompt = prompts[type] || '';
  if (!prompt) { toast('Generate a prompt first'); return; }
  navigator.clipboard.writeText(prompt).then(() => toast('Copied to clipboard'));
}

function openOSApp() {
  chrome.tabs.create({ url: 'https://claude.ai' });
}

// ── STORAGE ───────────────────────────────────────────
function loadState() {
  return new Promise(resolve => {
    chrome.storage.local.get(STORAGE_KEY, data => {
      resolve(data[STORAGE_KEY] || { history:[], scores:[], stats:{ total:0, streak:0, lastDate:null } });
    });
  });
}
function saveState(state) { chrome.storage.local.set({ [STORAGE_KEY]: state }); }

function logUsage(cmd, detail) {
  loadState().then(state => {
    const now = new Date();
    state.history.unshift({ cmd, detail, date: now.toLocaleDateString('en-US',{month:'short',day:'numeric'}), time: now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}), ts: now.toISOString() });
    if (state.history.length > 100) state.history = state.history.slice(0,100);
    state.stats.total = (state.stats.total||0) + 1;
    const today = now.toISOString().split('T')[0];
    if (state.stats.lastDate !== today) {
      const yest = new Date(now-86400000).toISOString().split('T')[0];
      state.stats.streak = state.stats.lastDate === yest ? (state.stats.streak||0)+1 : 1;
      state.stats.lastDate = today;
    }
    saveState(state);
    renderHistory(state);
  });
}

function saveScore(company, score) {
  loadState().then(state => {
    state.scores = state.scores || [];
    state.scores.unshift({ company, score, date: new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'}) });
    if (state.scores.length > 50) state.scores = state.scores.slice(0,50);
    saveState(state);
  });
}

function loadHistory() { loadState().then(renderHistory); }

function renderHistory(state) {
  if (!state) return;
  const today = new Date().toISOString().split('T')[0];
  const todayCount = (state.history||[]).filter(h => h.ts?.startsWith(today)).length;
  document.getElementById('h-total').textContent = state.stats?.total || 0;
  document.getElementById('h-today').textContent = todayCount;
  document.getElementById('h-scored').textContent = (state.scores||[]).length;
  document.getElementById('h-streak').textContent = (state.stats?.streak||0) + 'd';
  const el = document.getElementById('history-items');
  const hist = state.history || [];
  if (!hist.length) { el.innerHTML = '<div style="font-family:var(--mono);font-size:10px;color:var(--text3);padding:10px 0;">No activity yet.</div>'; return; }
  el.innerHTML = hist.slice(0,12).map(h => `<div class="hist-item"><div class="h-cmd">${h.cmd}</div><div class="h-detail">${h.detail}</div><div class="h-time">${h.date}</div></div>`).join('');
}

// ── TABS ──────────────────────────────────────────────
function switchTab(id) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const tab = document.getElementById('tab-'+id);
  const panel = document.getElementById('panel-'+id);
  if (tab) tab.classList.add('active');
  if (panel) panel.classList.add('active');
  if (id === 'history') loadHistory();
  if (id === 'nudges') { loadNudges(); loadExportCount(); loadGistConfig(); loadDashboardConfig(); }
  if (id === 'apply') populateApplyPipeline();
}

// ── TOAST ─────────────────────────────────────────────
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}
