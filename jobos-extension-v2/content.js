// Job Search OS - Content Script v2
// Improved extraction: waits for DOM, multiple selector strategies, retry on short text

(function() {
  'use strict';

  // ── EXTRACT WITH RETRY ───────────────────────────────
  function extractJobData() {
    const url = window.location.href;
    const hostname = window.location.hostname;

    let data = { url, title: '', company: '', location: '', jobText: '', source: 'unknown' };

    if (hostname.includes('linkedin.com')) {
      data.source = 'linkedin';
      data = extractLinkedIn(data);
    } else if (hostname.includes('greenhouse.io') || url.includes('boards.greenhouse.io')) {
      data.source = 'greenhouse';
      data.title   = getText(['h1.app-title', 'h1.job-title', '.header h1', 'h1']);
      data.company = getMetaOrTitle();
      data.jobText = getText(['#content', '.content', '.job-post-content', 'main', 'article']);
    } else if (hostname.includes('lever.co')) {
      data.source = 'lever';
      data.title   = getText(['.posting-headline h2', 'h2.posting-title', 'h2', 'h1']);
      data.company = getMetaOrTitle();
      data.jobText = getText(['.posting-content', '.section-wrapper', 'main']);
    } else if (hostname.includes('ashbyhq.com')) {
      data.source = 'ashby';
      data.title   = getText(['h1', '.job-title', '[data-testid="job-title"]']);
      data.company = getText(['.company-name', '[data-testid="company-name"]']) || getMetaOrTitle();
      data.jobText = getText(['.job-description', '.description', '[data-testid="job-description"]', 'main']);
    } else if (hostname.includes('indeed.com')) {
      data.source = 'indeed';
      data.title   = getText(['.jobsearch-JobInfoHeader-title', 'h1.jobTitle', 'h1']);
      data.company = getText(['.jobsearch-InlineCompanyRating-companyHeader a', '[data-testid="inlineHeader-companyName"]']);
      data.jobText = getText(['#jobDescriptionText', '.jobsearch-jobDescriptionText']);
    } else if (hostname.includes('glassdoor.com')) {
      data.source = 'glassdoor';
      data.title   = getText(['[data-test="job-title"]', 'h1', '.job-title']);
      data.company = getText(['[data-test="employer-name"]', '.employer-name']);
      data.jobText = getText(['[data-test="jobDescriptionContent"]', '.desc', '.jobDescriptionContent']);
    } else if (hostname.includes('wellfound.com') || hostname.includes('angel.co')) {
      data.source = 'wellfound';
      data.title   = getText(['h1', '[class*="JobListingHeader"] h2', '[class*="title"]']);
      data.company = getText(['.company-name', '[class*="startupName"]']);
      data.jobText = getText(['.job-description', '[class*="description"]', 'main']);
    } else {
      data.source = 'generic';
      data.title   = document.querySelector('h1')?.innerText?.trim() || document.title.split('|')[0].trim();
      data.company = getMetaOrTitle();
      data.jobText = getLargestTextBlock();
    }

    // Clean up
    data.title   = clean(data.title).substring(0, 200);
    data.company = clean(data.company).substring(0, 150);
    data.location = clean(data.location).substring(0, 150);
    data.jobText = clean(data.jobText).substring(0, 20000);

    return data;
  }

  function extractLinkedIn(data) {
    // ── TITLE ────────────────────────────────────────────
    // Try known class-based selectors (LinkedIn rotates these but these cover 2022-2026 layouts)
    data.title = getText([
      '.job-details-jobs-unified-top-card__job-title h1',
      '.job-details-jobs-unified-top-card__job-title',
      '.jobs-unified-top-card__job-title h1',
      '.jobs-unified-top-card__job-title',
      'h1.topcard__title',
      'h1.t-24',
      'h1[class*="job-title"]',
      'h1[class*="title"]',
    ]);

    // Robust title fallback: use first h1 that isn't "LinkedIn" or very short
    if (!data.title) {
      const h1s = Array.from(document.querySelectorAll('h1'));
      const h1 = h1s.find(el => {
        const t = el.innerText?.trim() || '';
        return t.length > 3 && t.toLowerCase() !== 'linkedin';
      });
      if (h1) data.title = h1.innerText.trim();
    }

    // Last title fallback: parse from document.title
    // Handles: "Title at Company | LinkedIn", "Title | Company | LinkedIn", "Title · Company | LinkedIn"
    if (!data.title) {
      const m = document.title.match(/^(.+?)(?:\s+at\s+|\s*[|·\-])/i);
      if (m) data.title = m[1].trim();
    }

    // ── COMPANY ──────────────────────────────────────────
    // Try known class-based selectors first
    data.company = getText([
      '.job-details-jobs-unified-top-card__company-name a',
      '.job-details-jobs-unified-top-card__company-name',
      '.jobs-unified-top-card__company-name a',
      '.jobs-unified-top-card__company-name',
      '.job-details-jobs-unified-top-card__primary-description-container a',
      '.topcard__org-name-link',
      '.topcard__flavor--black-link',
      'a[data-tracking-control-name*="company"]',
    ]);

    // Most reliable fallback: LinkedIn always links company name to /company/<slug>
    // Find the first anchor near the top of the page pointing to a /company/ URL
    if (!data.company) {
      const companyLink = findCompanyLink();
      if (companyLink) data.company = companyLink;
    }

    // Parse company from document.title — handles all common LinkedIn formats:
    //   "Title at Company | LinkedIn"       → "Company"
    //   "Title | Company | LinkedIn"        → "Company"
    //   "Title · Company | LinkedIn"        → "Company"
    if (!data.company) {
      data.company = parseCompanyFromTitle(document.title);
    }

    // Same parse against og:title meta as final fallback
    if (!data.company) {
      const ogTitle = document.querySelector('meta[property="og:title"]')?.content || '';
      if (ogTitle) data.company = parseCompanyFromTitle(ogTitle);
    }

    // ── LOCATION ─────────────────────────────────────────
    data.location = getText([
      '.job-details-jobs-unified-top-card__primary-description-container .tvm__text',
      '.jobs-unified-top-card__bullet:first-child',
      '.topcard__flavor--bullet',
    ]);

    // ── JOB DESCRIPTION ─────────────────────────────────
    data.jobText = getText([
      '.jobs-description__content .jobs-description-content__text',
      '.jobs-description__content',
      '.jobs-description',
      '#job-details',
      '.show-more-less-html__markup',
      '[id*="job-details"]',
      'article',
    ]);

    // If description is too short, try the full article/main text
    if (data.jobText.length < 300) {
      const container = document.querySelector('article, .jobs-description, main');
      if (container) data.jobText = container.innerText.trim();
    }

    return data;
  }

  // Parse company name from LinkedIn-style page titles
  // Handles: "Title at Company | LinkedIn", "Title | Company | LinkedIn", "Title · Company | LinkedIn"
  function parseCompanyFromTitle(title) {
    // "at Company" format (most common)
    const atMatch = title.match(/\bat\s+([^|·\-]+?)(?:\s*[|·\-]|$)/i);
    if (atMatch) return atMatch[1].trim();
    // "Title | Company | LinkedIn" or "Title · Company | LinkedIn" format
    const parts = title.split(/[|·]/).map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      // Last non-"LinkedIn" segment before the end is the company
      const candidate = parts[parts.length - 1].toLowerCase() === 'linkedin'
        ? parts[parts.length - 2]
        : parts[parts.length - 1];
      if (candidate && candidate.toLowerCase() !== 'linkedin' && candidate.length < 60) {
        return candidate;
      }
    }
    return '';
  }

  // Find the company name via /company/ anchor — LinkedIn always uses this URL pattern
  function findCompanyLink() {
    // Look for a[href*="/company/"] anchors, preferring those inside a header/top-card area
    const headerArea = document.querySelector([
      '.job-details-jobs-unified-top-card__content-container',
      '.jobs-unified-top-card',
      '.topcard',
      '.job-view-layout',
      'main',
    ].join(', '));

    const scope = headerArea || document;
    const links = Array.from(scope.querySelectorAll('a[href*="/company/"]'));
    // Prefer shorter text (company names are short, job titles aren't links to /company/)
    for (const a of links) {
      const text = a.innerText?.trim();
      if (text && text.length > 1 && text.length < 80) return text;
    }
    return '';
  }

  function getText(selectors) {
    for (const sel of selectors) {
      try {
        const el = document.querySelector(sel);
        if (el?.innerText?.trim().length > 2) return el.innerText.trim();
      } catch(e) {}
    }
    return '';
  }

  function getMetaOrTitle() {
    const og = document.querySelector('meta[property="og:site_name"]');
    if (og?.content) return og.content;
    const author = document.querySelector('meta[name="author"]');
    if (author?.content) return author.content;
    // Extract from page title: "Job Title at Company | ..."
    const title = document.title;
    const atMatch = title.match(/(?:at|@)\s+([^|·-]+)/i);
    if (atMatch) return atMatch[1].trim();
    const parts = title.split(/[|·-]/);
    return parts.length > 1 ? parts[parts.length - 1].trim() : '';
  }

  function getLargestTextBlock() {
    const candidates = ['main', 'article', '.job-description', '#job-description', '.description', '#content', '.content'];
    let best = '';
    for (const sel of candidates) {
      const el = document.querySelector(sel);
      if (el?.innerText?.trim().length > best.length) best = el.innerText.trim();
    }
    return best.length > 200 ? best : document.body.innerText.trim();
  }

  function clean(str) {
    return (str || '').replace(/\s+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  }

  // ── MESSAGE LISTENER ─────────────────────────────────
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractJob') {
      // Try immediately, retry once after 1000ms if text is short (LinkedIn lazy-loads)
      const data = extractJobData();
      if (data.jobText.length > 300 && data.title && data.company) {
        sendResponse(data);
      } else {
        setTimeout(() => sendResponse(extractJobData()), 1000);
      }
      return true; // keep channel open for async
    }
    if (request.action === 'ping') {
      sendResponse({ alive: true, url: window.location.href });
      return true;
    }
  });

})();
