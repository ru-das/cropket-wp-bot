# AgriBot

WhatsApp chatbot backend that helps Indian farmers check crop prices at nearby mandis in their native language. It runs as a Vercel serverless function, talks to the WhatsApp Cloud API, translates with Gemini, geocodes with OpenCage, and reads mandi prices from data.gov.in.

## Accounts you need

- **Meta Developer** ([developers.facebook.com](https://developers.facebook.com)) — WhatsApp Cloud API + Flows
- **Google AI Studio** ([aistudio.google.com](https://aistudio.google.com)) — free Gemini API key, no credit card
- **data.gov.in** — register → My Account → API key (free)
- **OpenCage** ([opencagedata.com](https://opencagedata.com)) — free tier, 2500 req/day
- **Upstash** ([console.upstash.com](https://console.upstash.com)) — free Redis, choose Mumbai region
- **Vercel** ([vercel.com](https://vercel.com)) — free hosting

## Setup

```bash
npm install
cp .env.example .env
# fill every value in .env
npm run dev
```

## Deploy

```bash
npm run deploy
```

Paste the Vercel URL into Meta webhook config as `https://your-project.vercel.app/api/webhook`. Use the same `WHATSAPP_VERIFY_TOKEN` you put in Vercel env vars.

## WhatsApp Flows

Print the Flow JSON, then submit each in Meta Business Suite → WhatsApp Flows → Create Flow. Copy the resulting Flow IDs into `LANG_FLOW_ID` and `CROP_FLOW_ID`.

```js
import { buildLangFlowJson } from './src/flows/langFlow.js';
import { buildCropFlowJson } from './src/flows/cropFlow.js';

console.log(JSON.stringify(buildLangFlowJson(), null, 2));
console.log(JSON.stringify(await buildCropFlowJson('en'), null, 2));
```

## State machine

```
INIT → LANG_SENT → MENU_SENT → CROP_SENT → LOCATION_SENT → MENU_SENT (loop)
```

## Extending languages

Add one line to `SUPPORTED_LANGUAGES` in `src/utils/strings.js`.

## Extending crops

Add one line to `CROPS` in `src/utils/strings.js`.

## Env vars reference

| Variable | What it is | Where to get it |
| --- | --- | --- |
| `WHATSAPP_TOKEN` | Permanent or temporary Cloud API access token | Meta Developer → WhatsApp → API Setup |
| `WHATSAPP_PHONE_NUMBER_ID` | Phone number ID used to send messages | Meta Developer → WhatsApp → API Setup |
| `WHATSAPP_VERIFY_TOKEN` | Shared secret for webhook GET verification | Any random string you choose |
| `LANG_FLOW_ID` | Published language picker Flow ID | Meta Business Suite → WhatsApp Flows |
| `CROP_FLOW_ID` | Published crop picker Flow ID | Meta Business Suite → WhatsApp Flows |
| `GEMINI_API_KEY` | Gemini generateContent API key | Google AI Studio |
| `AGMARKET_KEY` | data.gov.in API key for mandi prices | data.gov.in → My Account → API key |
| `OPENCAGE_KEY` | Geocoding API key | opencagedata.com |
| `UPSTASH_REDIS_REST_URL` | Redis REST URL | Upstash console → REST API |
| `UPSTASH_REDIS_REST_TOKEN` | Redis REST token | Upstash console → REST API |
| `TRANSPORT_COST_PER_KM` | INR per km per quintal used in net-price ranking | You choose (default `2`) |
