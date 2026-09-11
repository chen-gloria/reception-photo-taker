# Reception Photo Taker

Live at:
- GitHub Pages: https://chen-gloria.github.io/reception-photo-taker/
- Netlify: https://reception-photo-taker.netlify.app

A tiny, zero-database web app for weddings & events. Guests type their name,
then snap/upload photos that land straight in your shared Google Drive
folder, and browse everyone else's photos on a live photo wall.

This app was split out of the [please-find-your-seat](https://github.com/chen-gloria/please-find-your-seat)
project — it's now fully standalone with its own Apps Script backend and no
dependency on any guest list.

- **Frontend:** React + Vite (static site) — hosted free on GitHub Pages
- **Backend:** Google Apps Script Web App (runs under your Google account) — no
  database, no API keys, no server to maintain
- **Gate:** guests just type any name to unlock the uploader + photo wall —
  there's no guest-list verification (unlike the seat-finder app)

---

## What YOU need to do (≈10 min)

### 1. Deploy the Apps Script
1. Create (or reuse) the shared Google Drive folder for the photos.
2. Open its URL — the folder ID is the long string after `/folders/`:
   `https://drive.google.com/drive/folders/THIS_IS_THE_FOLDER_ID`
3. Go to [script.google.com](https://script.google.com) → **New project**.
4. Paste in [`apps-script/Code.gs`](apps-script/Code.gs).
5. At the top, set `FOLDER_ID` to your Drive folder ID.
6. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Copy the **Web App URL** and paste it into `src/config.ts`:
   - `APPS_SCRIPT_URL = '...your url...'`

> Re-deploy note: after editing `Code.gs` you must **Manage deployments → edit →
> Version: New version** for changes to take effect at the same URL.

### 2. Push your config change
Commit `src/config.ts` and push to `main` — GitHub Actions rebuilds and
redeploys automatically.

### 3. Make the QR code
Point a QR generator at your live URL:
`https://chen-gloria.github.io/reception-photo-taker/`

---

## Run locally

```bash
npm install
npm run dev      # http://localhost:5174/reception-photo-taker/
```

## Notes
- The matched name is cached in `localStorage`, so returning visitors skip
  straight to the uploader. A **"Not you? Switch name"** link clears it.
- Photos are downscaled in the browser before upload to keep things fast.
- Privacy: anyone who types a name (any name — it isn't checked) can view the
  photo wall. If you want stricter gating, add a shared password check in
  `apps-script/Code.gs`.
- **Custom domain?** Change `base` in `vite.config.ts` to `'/'`.
