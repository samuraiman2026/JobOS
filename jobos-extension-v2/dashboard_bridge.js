// Job Search OS - Dashboard Bridge
// Injected into the dashboard page at document_start to expose the extension ID.
// Uses a DOM data attribute (shared across isolated + main worlds).
// Script-tag injection is intentionally omitted - GitHub Pages CSP blocks inline scripts.
(function () {
  document.documentElement.dataset.jobosExtId = chrome.runtime.id;
})();
