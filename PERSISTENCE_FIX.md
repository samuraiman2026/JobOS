# Persistence Fix - v4.5 / v4.7
**v4.5: April 16, 2026 · v4.7: April 20, 2026**

---

## The problem

The Command Center stores all pipeline and outreach state in the browser's `localStorage`. `localStorage` is tied to the browser's browsing data — it is cleared by:

- Chrome's **"Clear cookies and other site data when you close all windows"** setting
- Manually clearing browsing history / site data
- Any browser with aggressive privacy defaults

When this happens, `loadState()` finds nothing in `localStorage` and silently falls back to the hardcoded `defaultState()` — showing the four placeholder companies (Nothing.tech, Microsoft, Emissary, Turing.com) instead of your real pipeline. Similarly, `loadOutreach()` falls back to the seed contacts, wiping your tracker.

---

## Why this is worse than it sounds

Both fallbacks were silent. There is no warning, no prompt to restore. Data just disappears with no obvious explanation.

---

## The fix (v4.5 - pipeline / v4.7 - outreach tracker)

`chrome.storage.local` — the extension's own storage — is **never** cleared by browser privacy settings. It is only removed if you uninstall the extension.

The fix adds a two-way mirror between `localStorage` and `chrome.storage.local` for **both** STATE (pipeline) and OT_STATE (outreach tracker).

### On every save
- `saveState()` calls `{ action: 'saveStateBackup', state: STATE }` → stored as `jobos_v3_backup`
- `saveOutreach()` calls `{ action: 'saveOutreachBackup', state: OT_STATE }` → stored as `jobos_outreach_backup`

Both are fire-and-forget. If the extension is unreachable they fail silently.

### On every page load
- `loadState()` sets `window._jobosLocalStorageWasEmpty = true` when `localStorage` is missing
- `loadOutreach()` sets `window._jobosOutreachWasEmpty = true` when outreach key is missing

`checkExtensionSync()` checks both flags in parallel on every load. For each flag that is set, it requests the matching backup from the extension. If the backup has data, it:
1. Replaces STATE / OT_STATE with the backup
2. Re-saves to `localStorage` (re-populating it for the session)
3. Re-renders the affected panel
4. Shows a toast: **"Pipeline restored from extension backup"** or **"Outreach tracker restored from extension backup"**

Both restores complete before the normal `getPendingSync` check runs.

### Files changed

| File | What changed |
|---|---|
| `jobos-extension-v2/background.js` | Added `saveStateBackup`, `loadStateBackup` (v4.5) and `saveOutreachBackup`, `loadOutreachBackup` (v4.7) handlers in `onMessageExternal` |
| `index.html` | `loadState()` flags `_jobosLocalStorageWasEmpty`; `saveState()` mirrors to extension; `loadOutreach()` flags `_jobosOutreachWasEmpty`; `saveOutreach()` mirrors to extension; `checkExtensionSync()` restores both in parallel; `doPendingSync()` extracted as separate function |

---

## Limitations

- **Requires the dashboard to be open via HTTPS** (GitHub Pages). `chrome.runtime.sendMessage` is blocked on `file://` origins due to the `externally_connectable` restriction in `manifest.json`. If you open `index.html` directly as a local file, the backup/restore will not trigger.
- The backup is only as fresh as the last time you saved a change. If your browser cleared localStorage between saves, you recover to the last backup point, not the exact moment the browser closed.

---

## One-time setup

1. Reload the extension at `chrome://extensions` after pulling this update.
2. Open the dashboard on GitHub Pages.
3. Make any change (update a stage, add a role) to trigger the first backup write.
4. From then on: every save mirrors to the extension automatically.

---

## Diagnosing the issue

If you open the dashboard and see the four placeholder companies:

1. Check if the toast "Pipeline restored from extension backup" appeared — if it did, the restore worked and your real data is back.
2. If the placeholder companies appear with no toast, either: the extension is not connected (check the sync status indicator), or no backup exists yet (first-time setup).
3. Open Chrome DevTools → Application → Local Storage → check whether `jobos_v3` is present and contains your real data.
