# Connecting analytics.html to live GA4 data

This adds a small **Cloudflare Pages Function** (`functions/api/analytics.js`) that
securely talks to the GA4 Data API on the server side. Your `analytics.html` calls
`/api/analytics` — no Google credentials ever reach the browser.

## 1. Enable the Google Analytics Data API

1. Go to https://console.cloud.google.com/
2. Create a project (or pick your existing one).
3. Go to **APIs & Services → Library**, search **"Google Analytics Data API"**, click **Enable**.

## 2. Create a service account

1. **APIs & Services → Credentials → Create Credentials → Service account**.
2. Give it any name (e.g. `nepalipatro-analytics-reader`). No special roles needed at the project level — skip that step.
3. Once created, open it → **Keys** tab → **Add Key → Create new key → JSON**. This downloads a `.json` file. Keep it private — never commit it to GitHub.

## 3. Give the service account access to your GA4 property

1. Open the downloaded JSON and copy the `client_email` value (looks like `xxxx@xxxx.iam.gserviceaccount.com`).
2. Go to https://analytics.google.com/ → **Admin** (bottom left) → under the **Property** column click **Property Access Management**.
3. Click **+ → Add users**, paste that email, give it the **Viewer** role, save.

## 4. Find your GA4 Property ID

In GA4 Admin → **Property Settings**, copy the **Property ID** (a plain number, e.g. `123456789`).

## 5. Prepare your Cloudflare environment variables

From the downloaded JSON key file you need three values:

| Cloudflare variable | Where it comes from |
|---|---|
| `GA_CLIENT_EMAIL` | the `client_email` field, as-is |
| `GA_PRIVATE_KEY_B64` | the `private_key` field, **base64-encoded** (see below) |
| `GA_PROPERTY_ID` | `properties/123456789` (prefix `properties/` + your numeric ID) |

To base64-encode the private key so it survives Cloudflare's env var input safely, run this
on your own machine (not needed in this chat) with the downloaded JSON file:

```bash
# macOS / Linux
node -e "const k=require('./your-key-file.json').private_key; console.log(Buffer.from(k).toString('base64'))"
```

This prints one long line — that whole line is the value for `GA_PRIVATE_KEY_B64`.

## 6. Add the environment variables in Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages** → your Pages project → **Settings → Environment variables**.
2. Add the three variables above for the **Production** environment (and Preview, if you use it).
3. Save, then trigger a new deployment (env var changes need a redeploy to take effect).

## 7. Deploy

Commit and push these files to your GitHub repo, in the same structure as this zip:

```
your-repo/
├── analytics.html
└── functions/
    └── api/
        └── analytics.js
```

Cloudflare Pages auto-detects the `functions/` folder and deploys it as serverless
functions alongside your static site — no extra config needed.

## 8. Verify

Visit `https://yourdomain.com/analytics.html`. The banner at the top will say:

- **"Live"** (green) — it's pulling real GA4 numbers.
- **"Sample data"** (yellow) — the backend isn't reachable yet; check the three env vars and that the service account was added as a Viewer on the correct property.

You can also hit `https://yourdomain.com/api/analytics?action=realtime` directly in
a browser tab — it should return JSON like `{"activeUsers": 3}`, not an error.

## Notes

- The realtime panel polls every 15 seconds. GA4's Realtime API has generous but
  finite quotas, so avoid dropping this below ~10s across many simultaneous visitors.
- This dashboard is public at `/analytics.html` by default. If you don't want visitors
  to see your traffic numbers, either don't link to the page publicly, or add
  Cloudflare Access (Zero Trust) in front of just that one path.
