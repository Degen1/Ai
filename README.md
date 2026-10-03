# ሳራ

ሳራ is an Expo/React Native chat app with an OpenAI-backed server. Text and photo messages use the Responses API. The API key stays on the server and is never bundled into the mobile app.

## Local setup

1. Install packages with `npm install`.
2. Copy `.env.example` to `.env.local`. The example points native chat at the public EAS Hosting endpoint. For a local web preview, set `OPENAI_API_KEY` in `.env.local` so its same-origin `/chat` route can answer. Keep the key out of mobile public variables.
3. Run `npx expo start` and open the app.

For local backend development, set `OPENAI_API_KEY` in `.env.local`, run `npm run chat-server`, and override `EXPO_PUBLIC_CHAT_API_URL`. An iOS simulator or local web preview can use `http://localhost:8787`; an Android emulator can use `http://10.0.2.2:8787`. A physical phone needs the computer's LAN address and `CHAT_SERVER_HOST=0.0.0.0`. Reload Expo after changing the URL.

TestFlight and store builds use `https://degengebre-ai.expo.app`. EAS production, preview, and development environments have `EXPO_PUBLIC_CHAT_API_URL` configured for builds. The hosted `OPENAI_API_KEY` is server-side. The hosted endpoint currently has no user authentication, so add access control and spending limits before broad public distribution.

The local server's `GET /health` and hosted server's `GET /chat` report whether a key is configured, without revealing it. `OPENAI_MODEL` can change the model; it defaults to `gpt-6-luna`.

Tap the plus button beside the message field to attach up to four photos. Photos appear above the field and can be removed before sending. Tigrinya is the default chat language.

Sent chats and their attached photos are saved on the device and appear in the conversation drawer. They remain available after restarting the app, but are not synced between devices.

Sara Gold uses the RevenueCat `gold` entitlement and the App Store's monthly and annual products. The iOS public SDK key is configured in EAS development, preview, and production environments. Before submitting a subscription-enabled release, provide a Sara-specific privacy policy and correct the App Store Connect privacy answers; the existing policy URL opens another app's policy and the current “Data Not Collected” answer does not describe accounts or purchases. Submit the first subscription products with a new app version and test the purchase and restore flows on a physical device.

The local server is intended for development. Before exposing it on the public internet, add user authentication and request limits at the server or gateway, use HTTPS, and configure the deployed URL in `EXPO_PUBLIC_CHAT_API_URL`. Do not put `OPENAI_API_KEY` in an `EXPO_PUBLIC_` variable.

## Checks

```bash
npm run test:chat-server
npx expo lint
npx tsc --noEmit
npx expo export --platform web
```

Routes live in `src/app/`, reusable UI in `src/components/`, and theme values in `src/constants/theme.ts`.
