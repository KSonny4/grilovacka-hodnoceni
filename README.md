# Grilovačka 2026 — Feedback Form

Simple feedback form for a barbecue party, hosted on **Cloudflare Pages** with **KV** storage.

## How it works

1. **`index.html`** — The form visitors see. Sends data as JSON to `/api/submit`.
2. **`functions/api/submit.js`** — Cloudflare Pages Function. Validates input, stores in KV.
3. **`functions/api/results.js`** — Admin page. View all submissions (password: `gril2026`).

Data is stored in Cloudflare KV under keys like `submission:{timestamp}:{uuid}`.

## Setup

### Prerequisites
- Domain on Cloudflare (optional but recommended)
- Cloudflare account

### Cloudflare Pages setup

1. Go to **Cloudflare Dashboard → Workers & Pages → Create**
2. Select "Pages" → "Connect to Git"
3. Connect this repository
4. Set project name: `grilovacka-hodnoceni`
5. Deploy

### Add KV namespace binding

1. In your Pages project → **Settings → Functions → KV namespace bindings**
2. Add a binding named **`FORM_SUBMISSIONS`**
3. Create a new KV namespace (or use existing)
4. Deploy again

### Custom domain (optional)

In Pages project → **Custom domains** → add `forms.pkubelka.cz`

## URLs

- **Form:** `https://grilovacka-hodnoceni.pages.dev`
- **Results:** `https://grilovacka-hodnoceni.pages.dev/api/results?key=gril2026`

## Tech

- [Cloudflare Pages](https://pages.cloudflare.com/)
- [Cloudflare KV](https://developers.cloudflare.com/kv/)
- [Pages Functions](https://developers.cloudflare.com/pages/functions/)
