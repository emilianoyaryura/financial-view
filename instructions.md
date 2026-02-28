# StockAR Setup Instructions

## Environment Variables

Create a `.env` file in the project root with the following variables:

### Supabase (required)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Finnhub (required for stock quotes)
```
FINNHUB_API_KEY=your-finnhub-api-key
```
Get one at https://finnhub.io/register

### Resend (required for alert emails)
```
RESEND_API_KEY=re_xxxxxxxxxxxx
```
Get one at https://resend.com. You'll need a verified domain to send from `alerts@yourdomain.com`.

### QStash (required for alert cron)
```
QSTASH_TOKEN=your-qstash-token
QSTASH_CURRENT_SIGNING_KEY=sig_xxxxx
QSTASH_NEXT_SIGNING_KEY=sig_xxxxx
```
Get these at https://console.upstash.com/qstash

### App URL
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
Set to your production URL in deployment (e.g., `https://stockar.yourdomain.com`).

---

## Supabase Auth Setup

### 1. Enable Email/Password auth
- Go to Supabase Dashboard > Authentication > Providers
- Enable **Email** provider
- Keep "Confirm email" enabled

### 2. Configure Custom SMTP (Resend)
- Go to Supabase Dashboard > Project Settings > Authentication > SMTP Settings
- Toggle "Enable Custom SMTP"
- Fill in:
  - **Host**: `smtp.resend.com`
  - **Port**: `465`
  - **Username**: `resend`
  - **Password**: Your Resend API key (`re_xxxxxxxxxxxx`)
  - **Sender email**: `noreply@yourdomain.com` (must match a verified domain in Resend)

### 3. Configure Auth redirect URL
- Go to Supabase Dashboard > Authentication > URL Configuration
- Add your site URL to **Redirect URLs**: `http://localhost:3000/api/auth/confirm`
- For production, add: `https://yourdomain.com/api/auth/confirm`

---

## QStash Cron Setup

Schedule a cron job to check alerts periodically:

1. Go to https://console.upstash.com/qstash
2. Create a new schedule:
   - **URL**: `https://yourdomain.com/api/alerts/cron`
   - **Method**: POST
   - **Schedule**: `*/5 9-17 * * 1-5` (every 5 minutes during market hours, Mon-Fri)
3. The endpoint verifies the QStash signature using your signing keys

To test manually:
```bash
curl -X POST http://localhost:3000/api/alerts/check
```

---

## Allowed Emails (Registration)

Only emails in the allowlist can register. Edit `lib/constants.ts`:

```ts
export const ALLOWED_EMAILS = ["emilianoyaryurat@gmail.com"];
```

Add more emails to the array as needed.

---

## Supabase Database Tables

The app expects these tables in your Supabase project:
- `users` - User profiles
- `holdings` - Portfolio positions
- `transactions` - Buy/sell records
- `dividends` - Dividend payments
- `watchlist` - Watched stocks
- `alerts` - Price alerts
- `cedear_ratios` - CEDEAR conversion ratios
- `user_preferences` - User settings

See `supabase/types.ts` for the exact column definitions.

---

## Running Locally

```bash
yarn install
yarn dev
```

Open http://localhost:3000. You'll be redirected to `/login`.

## Resend Email Setup (for alert notifications)

1. Sign up at https://resend.com
2. Add and verify your domain in Resend Dashboard > Domains
3. Update the `from` address in `app/api/alerts/check/route.ts` to match your verified domain:
   ```ts
   from: "StockAR <alerts@yourdomain.com>"
   ```
