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
    // Title - multiple strategies for different LinkedIn page types
    data.title = getText([
      '.job-details-jobs-unified-top-card__job-title h1',
      '.jobs-unified-top-card__job-title h1',
      '.jobs-unified-top-card__job-title',
      'h1.t-24',
      'h1.topcard__title',
      'h1'
    ]);

    // Company
    data.company = getText([
      '.job-details-jobs-unified-top-card__company-name a',
      '.job-details-jobs-unified-top-card__company-name',
      '.jobs-unified-top-card__company-name a',
      '.topcard__org-name-link',
      '.topcard__flavor--black-link',
      'a[data-tracking-control-name*="company"]'
    ]);

    // Location
    data.location = getText([
      '.job-details-jobs-unified-top-card__primary-description-container .tvm__text',
      '.jobs-unified-top-card__bullet:first-child',
      '.topcard__flavor--bullet'
    ]);

    // Job description - LinkedIn loads lazily, try multiple
    data.jobText = getText([
      '.jobs-description__content .jobs-description-content__text',
      '.jobs-description__content',
      '.jobs-description',
      '#job-details',
      '.show-more-less-html__markup',
      '[id*="job-details"]',
      'article'
    ]);

    // If description is too short, try the full article text
    if (data.jobText.length < 300) {
      const article = document.querySelector('article, .jobs-description, main');
      if (article) data.jobText = article.innerText.trim();
    }

    return data;
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
      // Try immediately, retry once after 800ms if text is short
      const data = extractJobData();
      if (data.jobText.length > 300) {
        sendResponse(data);
      } else {
        // Short text - wait for lazy-loaded content then retry
        setTimeout(() => sendResponse(extractJobData()), 800);
      }
      return true; // keep channel open for async
    }
    if (request.action === 'ping') {
      sendResponse({ alive: true, url: window.location.href });
      return true;
    }
  });

})();
