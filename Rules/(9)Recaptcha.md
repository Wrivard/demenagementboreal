# 🔐 reCAPTCHA Enterprise Setup (Production Ready)

This project uses reCAPTCHA Enterprise on the `soumission` form with serverless verification. Below is the exact, working setup and the troubleshooting notes based on our implementation.

## What we implemented
- Client loads Enterprise script with your site key and generates a token:
  - `<script src="https://www.google.com/recaptcha/enterprise.js?render=YOUR_SITE_KEY" data-cookieconsent="ignore" type="text/javascript"></script>`
  - `grecaptcha.enterprise.execute('YOUR_SITE_KEY', { action: 'LOGIN' })`
- Serverless (`api/submit-form.js`) verifies the token via the Enterprise Assessments API.
- Console logs and API response include verification info (`verified`, `score`, `hostname`, `action`).

## Prerequisites in Google Cloud
1) Enable the API
- Google Cloud Console → APIs & Services → Library → enable "reCAPTCHA Enterprise API" for the project that owns your site key.

2) Create an API key (not OAuth/service account)
- APIs & Services → Credentials → Create credentials → API key.
- Recommended restrictions:
  - Application restrictions: None (server-to-Google request from Vercel).
  - API restrictions: Restrict key → "reCAPTCHA Enterprise API".

3) Domains on the site key
- Add: `ceramiquesjlepage.ca` and `www.ceramiquesjlepage.ca` (if www used).
- Add preview domain(s) if needed: `*.vercel.app`.

## Environment variables (Vercel)
Set in the project → Settings → Environment Variables:
- `RECAPTCHA_ENTERPRISE_API_KEY` → the API key created above.
- `RECAPTCHA_PROJECT_ID` → your Google Cloud Project number (numeric). Using the site key ID here will fail.
- `RECAPTCHA_ENTERPRISE_SITE_KEY` → your Enterprise site key (e.g., `6LdxXPwrAAAAA…`).

Redeploy after adding/changing env vars.

## Client-side integration (already in code)
- Script tag is loaded in `soumission.html` and marked with `data-cookieconsent="ignore"` so Cookiebot won’t block it.
- On form submit, we call `grecaptcha.enterprise.execute(siteKey, { action: 'LOGIN' })` and include the token as `recaptchaToken` in the payload.
- Debug logs in the browser console:
  - `[reCAPTCHA] token generated <prefix…>`
  - `[reCAPTCHA] server verification { verified, score, action, hostname }`

## Server-side verification (already in code)
- Endpoint: `api/submit-form.js`
- Calls: `POST https://recaptchaenterprise.googleapis.com/v1/projects/{PROJECT_NUMBER}/assessments?key={API_KEY}`
- Required body:
```json
{
  "event": {
    "token": "<CLIENT_TOKEN>",
    "expectedAction": "LOGIN",
    "siteKey": "<YOUR_SITE_KEY>"
  }
}
```
- The server rejects if token is invalid or score < 0.3 (debug threshold). On success, the API response includes `{ recaptcha: { verified: true, score, action, hostname } }`.

## Cookiebot interaction
- Script tags include `data-cookieconsent="ignore"` to avoid auto-blocking in "auto" mode.
- If you switch Cookiebot mode, keep this attribute to prevent recaptcha from being blocked before consent.

## Verification thresholds
- Debug phase: threshold = 0.3 (to avoid false negatives during setup).
- Recommended production threshold: 0.5–0.7 depending on traffic. Update logic in `api/submit-form.js`.

## Common pitfalls we hit and how to fix them
1) 400 Bad Request / token invalid
- Cause: Using the site key ID as `RECAPTCHA_PROJECT_ID`. The API requires the Google Cloud Project NUMBER.
- Fix: Set `RECAPTCHA_PROJECT_ID` to the numeric project number (IAM & Admin → Settings).

2) 400 due to API key restrictions
- Cause: API key restricted by HTTP referrers (works for browser calls, fails from server).
- Fix: Application restrictions → None; API restrictions → reCAPTCHA Enterprise API.

3) Script blocked by Cookiebot
- Cause: Auto-blocking prevents `grecaptcha.enterprise` from loading.
- Fix: Add `data-cookieconsent="ignore"` to the script tag.

4) Action mismatch
- Cause: Client executes `{ action: 'LOGIN' }` but server expects a different action.
- Fix: Keep both set to `LOGIN` (or change consistently in both places).

5) Domain/hostname mismatch
- Cause: The request host isn’t in the site key’s allowed domains.
- Fix: Add both `ceramiquesjlepage.ca` and `www.ceramiquesjlepage.ca` to the site key.

6) Project mismatch
- Cause: Site key belongs to a different GCP project than the API key/Project number used.
- Fix: Use API key and project number from the same project that owns the site key.

## How to confirm it works
- In the browser console after submit you should see:
```
[reCAPTCHA] token generated <prefix…>
[reCAPTCHA] server verification { verified: true, score: 0.7+, action: 'LOGIN', hostname: 'www.ceramiquesjlepage.ca' }
```
- In Vercel logs: `reCAPTCHA Enterprise verified { siteKey, action, hostname, score }`.

## Maintenance
- If you tighten the score, adjust the threshold in `api/submit-form.js`.
- If you change the action name, update it on both client and server.
- Rotate the API key periodically and update Vercel env var.
