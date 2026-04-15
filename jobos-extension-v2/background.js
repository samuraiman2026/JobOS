// Job Search OS - Background Service Worker v2

const STORAGE_KEY = 'jobos_ext_v1';
const OUTREACH_SYNC_KEY = 'jobos_outreach_sync'; // shared with popup for OS export
const NUDGE_THRESHOLD_DAYS = 10;

// ── INSTALL ──────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'jobos-score',
    title: 'Score this job with Job Search OS',
    contexts: ['page'],
    documentUrlPatterns: [
      'https://*.linkedin.com/*', 'https://*.greenhouse.io/*',
      'https://*.lever.co/*',     'https://*.ashbyhq.com/*',
      'https://*.indeed.com/*',   'https://*.wellfound.com/*',
      'https://*.glassdoor.com/*','https://*/*'
    ]
  });

  // Schedule daily nudge check
  chrome.alarms.create('nudge-check', { periodInMinutes: 60 });

  // Run immediately on install
  checkNudges();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'jobos-score') chrome.action.openPopup();
});

// ── ALARM - hourly nudge check ────────────────────────
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'nudge-check') checkNudges();
});

// ── BADGE for job pages ───────────────────────────────
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  if (tab) updateBadgeForTab(tab);
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') updateBadgeForTab(tab);
});

async function updateBadgeForTab(tab) {
  if (!tab?.url) return;
  const jobSites = [
    'linkedin.com/jobs', 'greenhouse.io', 'lever.co', 'ashbyhq.com',
    'indeed.com', 'glassdoor.com', 'wellfound.com', 'builtin.com'
  ];
  const isJobPage = jobSites.some(s => tab.url.includes(s));

  // Nudge count takes priority over job page indicator
  const nudgeCount = await getNudgeCount();
  if (nudgeCount > 0) {
    chrome.action.setBadgeText({ text: String(nudgeCount), tabId: tab.id });
    chrome.action.setBadgeBackgroundColor({ color: '#e0a84a', tabId: tab.id }); // amber
  } else if (isJobPage) {
    chrome.action.setBadgeText({ text: '▶', tabId: tab.id });
    chrome.action.setBadgeBackgroundColor({ color: '#b8e04a', tabId: tab.id }); // green
  } else {
    chrome.action.setBadgeText({ text: '', tabId: tab.id });
  }
}

// ── NUDGE LOGIC ───────────────────────────────────────
async function getNudgeCount() {
  return new Promise(resolve => {
    chrome.storage.local.get([OUTREACH_SYNC_KEY, STORAGE_KEY], data => {
      const contacts = data[OUTREACH_SYNC_KEY]?.contacts || [];
      const today = Date.now();
      const overdue = contacts.filter(c => {
        if (!c.lastOutreach || c.status === 'Replied' || c.status === 'Interviewing' || c.status === 'Not Started') return false;
        const last = parseDate(c.lastOutreach);
        if (!last) return false;
        const daysSince = Math.floor((today - last) / 86400000);
        return daysSince >= NUDGE_THRESHOLD_DAYS;
      });
      resolve(overdue.length);
    });
  });
}

function parseDate(str) {
  if (!str) return null;
  // Handle "Apr 1", "Feb 23", "Mar 2" etc.
  const months = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
  const m = str.match(/^([A-Za-z]+)\s+(\d+)/);
  if (!m) return null;
  const month = months[m[1]];
  const day = parseInt(m[2]);
  if (month === undefined || isNaN(day)) return null;
  const year = new Date().getFullYear();
  const d = new Date(year, month, day);
  // If date is in the future (e.g. "Dec" when it's April), use previous year
  if (d > new Date()) d.setFullYear(year - 1);
  return d.getTime();
}

async function checkNudges() {
  const count = await getNudgeCount();
  // Update badge on all tabs
  const tabs = await chrome.tabs.query({});
  tabs.forEach(tab => {
    if (!tab.id) return;
    if (count > 0) {
      chrome.action.setBadgeText({ text: String(count), tabId: tab.id });
      chrome.action.setBadgeBackgroundColor({ color: '#e0a84a', tabId: tab.id });
    } else {
      // Don't clear job page badge, just reset nudge
      chrome.action.setBadgeText({ text: '', tabId: tab.id });
    }
  });
}

// ── LIVE DASHBOARD SYNC ───────────────────────────────
// Injects directly into the open dashboard tab's localStorage so items
// appear immediately without the manual JSON export/paste step.
const DASHBOARD_KEY = 'jobos_dashboard_url';

async function tryLiveSyncToDashboard(type, item) {
  return new Promise(resolve => {
    chrome.storage.local.get(DASHBOARD_KEY, data => {
      const dashUrl = data[DASHBOARD_KEY];
      if (!dashUrl) { resolve(false); return; }

      // Find an open tab whose URL starts with the configured dashboard URL
      chrome.tabs.query({}, tabs => {
        const norm = url => url.replace(/\/$/, '');
        const tab = tabs.find(t => t.url && norm(t.url).startsWith(norm(dashUrl)));
        if (!tab) { resolve(false); return; }

        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          world: 'MAIN',   // access the dashboard's own globals (render functions)
          func: (type, item) => {
            try {
              if (type === 'pipeline') {
                const raw = localStorage.getItem('jobos_v3');
                const state = raw ? JSON.parse(raw) : { pipeline: [], history: [], scores: [], stats: {} };
                state.pipeline = state.pipeline || [];
                const exists = state.pipeline.some(r =>
                  r.company?.toLowerCase() === item.company?.toLowerCase() &&
                  r.role?.toLowerCase() === item.role?.toLowerCase()
                );
                if (exists) return false;
                state.pipeline.push(item);
                localStorage.setItem('jobos_v3', JSON.stringify(state));
                if (typeof renderPipelineMini === 'function') renderPipelineMini();
                if (typeof buildPipelinePrompt === 'function') buildPipelinePrompt();
                return true;
              }
              if (type === 'outreach') {
                const raw = localStorage.getItem('jobos_outreach_v1');
                const state = raw ? JSON.parse(raw) : { contacts: [], dailyLog: {} };
                state.contacts = state.contacts || [];
                const exists = state.contacts.some(c =>
                  c.company?.toLowerCase() === item.company?.toLowerCase()
                );
                if (exists) return false;
                state.contacts.push(item);
                localStorage.setItem('jobos_outreach_v1', JSON.stringify(state));
                if (typeof renderOutreachTable === 'function') renderOutreachTable();
                if (typeof updateOutreachMetrics === 'function') updateOutreachMetrics();
                return true;
              }
              return false;
            } catch(e) { return false; }
          },
          args: [type, item]
        }, results => {
          if (chrome.runtime.lastError) { resolve(false); return; }
          resolve(results?.[0]?.result === true);
        });
      });
    });
  });
}

// ── MESSAGE HANDLER ───────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'getNudgeCount') {
    getNudgeCount().then(count => sendResponse({ count }));
    return true;
  }
  if (msg.action === 'syncOutreach') {
    chrome.storage.local.get(OUTREACH_SYNC_KEY, async data => {
      const existing = data[OUTREACH_SYNC_KEY] || { contacts: [], lastUpdated: null };
      const contacts = existing.contacts || [];
      const { company, role, score, pov } = msg.data;

      const alreadyExists = contacts.some(c =>
        c.company?.toLowerCase() === company?.toLowerCase()
      );
      if (!alreadyExists) {
        const item = {
          id: Date.now(),
          company,
          role: role || '',
          tier: score >= 75 ? '1' : '2',
          contact: '',
          pov: pov || `Scored ${score}% via Chrome extension`,
          followups: 0,
          lastOutreach: '',
          status: 'Not Started',
          selected: false,
          scoreFromExt: score
        };
        contacts.push(item);
        existing.contacts = contacts;
        existing.lastUpdated = new Date().toISOString();
        chrome.storage.local.set({ [OUTREACH_SYNC_KEY]: existing }, async () => {
          const liveSynced = await tryLiveSyncToDashboard('outreach', item);
          sendResponse({ added: true, liveSynced });
        });
      } else {
        sendResponse({ added: false, reason: 'already exists' });
      }
    });
    return true;
  }
  if (msg.action === 'syncPipeline') {
    chrome.storage.local.get(OUTREACH_SYNC_KEY, async data => {
      const existing = data[OUTREACH_SYNC_KEY] || { contacts: [], pipeline: [], lastUpdated: null };
      const pipeline = existing.pipeline || [];
      const { company, role, score, url } = msg.data;

      const alreadyExists = pipeline.some(r =>
        r.company?.toLowerCase() === company?.toLowerCase() && r.role?.toLowerCase() === role?.toLowerCase()
      );
      if (!alreadyExists) {
        const item = {
          id: Date.now(),
          company,
          role: role || '',
          url: url || '',
          stage: 'Applied',
          health: score >= 75 ? 'green' : score >= 50 ? 'amber' : 'red',
          lastAction: new Date().toLocaleDateString('en-US', { month:'short', day:'numeric' }),
          nextStep: 'Awaiting response',
          addedAt: new Date().toISOString(),
          scoreFromExt: score
        };
        pipeline.push(item);
        existing.pipeline = pipeline;
        existing.lastUpdated = new Date().toISOString();
        chrome.storage.local.set({ [OUTREACH_SYNC_KEY]: existing }, async () => {
          const liveSynced = await tryLiveSyncToDashboard('pipeline', item);
          sendResponse({ added: true, liveSynced });
        });
      } else {
        sendResponse({ added: false, reason: 'already exists' });
      }
    });
    return true;
  }
  if (msg.action === 'getOverdueContacts') {
    chrome.storage.local.get(OUTREACH_SYNC_KEY, data => {
      const contacts = data[OUTREACH_SYNC_KEY]?.contacts || [];
      const today = Date.now();
      const overdue = contacts.filter(c => {
        if (!c.lastOutreach || c.status === 'Replied' || c.status === 'Interviewing') return false;
        const last = parseDate(c.lastOutreach);
        if (!last) return false;
        return Math.floor((today - last) / 86400000) >= NUDGE_THRESHOLD_DAYS;
      }).map(c => ({
        ...c,
        daysSince: Math.floor((today - parseDate(c.lastOutreach)) / 86400000)
      }));
      sendResponse({ overdue });
    });
    return true;
  }
});

// ── EXTERNAL MESSAGES (from dashboard page) ───────────
// Dashboard calls chrome.runtime.sendMessage(JOBOS_EXT_ID, ...) on load
// to pull any queued pipeline/outreach items without needing a tab open.
chrome.runtime.onMessageExternal.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'getPendingSync') {
    chrome.storage.local.get(OUTREACH_SYNC_KEY, data => {
      const payload = data[OUTREACH_SYNC_KEY] || { contacts: [], pipeline: [] };
      sendResponse({ contacts: payload.contacts || [], pipeline: payload.pipeline || [] });
    });
    return true;
  }
  if (msg.action === 'acknowledgePendingSync') {
    // Dashboard has imported all items — clear the queue so they don't re-sync on next load.
    chrome.storage.local.get(OUTREACH_SYNC_KEY, data => {
      const existing = data[OUTREACH_SYNC_KEY] || {};
      existing.contacts = [];
      existing.pipeline = [];
      existing.lastUpdated = new Date().toISOString();
      chrome.storage.local.set({ [OUTREACH_SYNC_KEY]: existing }, () => sendResponse({ cleared: true }));
    });
    return true;
  }
});
