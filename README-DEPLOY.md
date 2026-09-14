# do³ backend — deploy to api.dodo-do.com

This package is the **booking + email backend** only. Your front stays exactly as it is on LWS (www.dodo-do.com). This runs on a small Node host and answers at `https://api.dodo-do.com`.

It already contains your live database and email settings in `.env` — keep this folder private.

---

## What you need
- A Node host that can run Docker (or plain Node 20). Easiest: **Railway** or **Render** (free/cheap tier is fine to start).
- Access to your domain DNS (LWS) to add one record for `api.dodo-do.com`.

---

## Step 1 — Deploy the backend

### Option A — Railway (recommended, easiest)
1. Go to railway.com → New Project → **Deploy from GitHub repo** (or "Empty Project" → "Deploy a Dockerfile").
2. Upload/connect this folder. Railway auto-detects the `Dockerfile` and builds it.
3. In the service → **Variables**, add everything from `.env` (Railway can import a `.env` file directly), **or** keep `.env` in the repo — either works.
4. Set the public domain: Settings → Networking → **Generate Domain** (gives you a `*.up.railway.app` URL), or add custom domain `api.dodo-do.com`.
5. Deploy. Test: open `https://<your-railway-url>/api/trpc/do3.health` — you should see `{"ok":true,...}`.

### Option B — Render
1. render.com → New → **Web Service** → connect this folder.
2. Runtime: **Docker**. It uses the `Dockerfile`.
3. Add env vars from `.env` in the dashboard.
4. Add custom domain `api.dodo-do.com` when ready.
5. Test the health URL the same way.

### Option C — any VPS with Docker
```bash
docker build -t do3-api .
docker run -d -p 3000:3000 --env-file .env --name do3-api do3-api
# put nginx/caddy in front for https on api.dodo-do.com
```

---

## Step 2 — Point api.dodo-do.com at it (DNS)
In your **LWS DNS zone** for dodo-do.com, add:

| Type | Name | Value |
|------|------|-------|
| CNAME | `api` | the host Railway/Render gives you (e.g. `yourapp.up.railway.app`) |

(Railway/Render show the exact target and enable HTTPS automatically once the CNAME resolves.)

---

## Step 3 — Rebuild & re-upload the front (one-time)
The front on LWS needs to know to call the API subdomain. This is already wired via `VITE_API_URL`:

```bash
cd app
VITE_API_URL="https://api.dodo-do.com" npm run build
# upload dist/public/* to LWS via FileZilla (overwrite), same as before
```

If you'd rather not rebuild, tell me and I'll regenerate the FTP zip with the API URL baked in.

---

## Step 4 — Verify
1. Open www.dodo-do.com → book a pod → you should get the confirmation screen (no "snag" message).
2. Check hello@dodo-do.com — confirmation + owner alert arrive.
3. Health: https://api.dodo-do.com/api/trpc/do3.health → `{"ok":true,...}`.

---

## Notes
- **CORS** is locked to dodo-do.com, www.dodo-do.com and api.dodo-do.com.
- **TiDB:** make sure your cluster's network allow-list includes the host's IPs (or `0.0.0.0/0`), or the API will be refused.
- Email uses `DO3_SMTP_*` in `.env` — already set to your LWS mailbox.

---

## Voucher lifecycle (new)
Vouchers now follow a payment lifecycle, since online payment is not integrated yet:

**Generate → Pending Payment → Payment confirmed → Active**

- Anyone (guest, individual, institution) can reserve a voucher from the website — no account, no card.
- On creation the voucher is **`pending_payment`** — it is reserved but NOT usable. It will not apply in the booking engine.
- The purchaser gets an email with the code, recipient, details, status "pending payment", and instructions that your team will contact them to complete payment (on-site or via a payment link).
- You get an alert email at hello@dodo-do.com with the buyer's contact info and the amount to collect.

### Activating a voucher (team workflow)
Once the customer pays (on-site or via the link you sent):
1. Open **https://www.dodo-do.com/ops** (not linked publicly).
2. Enter the ops key (see `DO3_ADMIN_KEY` below).
3. Find the pending voucher, choose **paid on-site** or **paid via link**, click **mark as paid & activate**.
4. The voucher flips to **`active`**, its 30-day validity starts now, and the recipient automatically gets the activation email with usage instructions.

### New environment variable
Add this to your host's env (already in the `.env` included here):
```
DO3_ADMIN_KEY=do3ops-ff6ffadec96368ef
```
This is the key the ops page asks for. Change it anytime — just keep it private.

### Database upgrade
If your `vouchers` table was created before this version, run **`do3-schema.sql`** (included) once in the TiDB Cloud SQL Editor. It adds the new columns (`status` enum with `pending_payment`, purchaser/recipient fields) via guarded `ALTER`s — safe to re-run.

---

## Verify it works
1. Open `https://api.dodo-do.com/api/trpc/do3.health` → should return `{"ok":true,...}` with all 4 tables.
2. On the live site, reserve a voucher → you should see "voucher reserved successfully / pending payment", get the reservation email, and get the alert email at hello@dodo-do.com.
3. Go to `/ops`, activate it → recipient gets the activation email, and the code now validates in the booking engine.
