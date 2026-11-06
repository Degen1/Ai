# ሳራ

ሳራ is an Expo/React Native chat app with an OpenAI-backed server. Text and photo messages use the Responses API. The API key stays on the server and is never bundled into the mobile app.

## Local setup

1. Install packages with `npm install`.
2. Copy `.env.example` to `.env.local`. The example points native chat at the public EAS Hosting endpoint. For a local web preview, set `OPENAI_API_KEY` in `.env.local` so its same-origin `/chat` route can answer. Keep the key out of mobile public variables.
3. Run `npm start` and open the installed **ሳራ Dev** development client.

## Development app alongside the store app

The `development` EAS profile uses **ሳራ Dev**, identifier `com.degengebre.ai.dev` on iOS and Android, the DEV-marked icon, and the `ai-dev` link scheme. Production and preview retain **ሳራ**, `com.degengebre.ai`, and `ai`.

`app.config.ts` applies these overrides to the existing `app.json`. Matching development Firebase files are `GoogleService-Info.dev.plist` and `google-services.dev.json`. They register separate native apps in the existing Firebase project: accounts and hosted services are shared, while on-device chat history and settings belong to each installed app.

`npm start`, `npm run ios`, and `npm run android` select the development identity for Metro. AdMob uses live units in all builds by default; set `EXPO_PUBLIC_ADMOB_TEST_ADS=true` in `.env.local` and restart Metro to use test units when testing ad interactions. Development clients use `EXPO_PUBLIC_REVENUECAT_TEST_KEY` for simulated purchases. Release builds use their platform store key. The EAS development environment has the public chat/report endpoints and Test Store key configured.

One new native development build must be installed before both apps can coexist. Build only when explicitly approved:

```bash
npx eas-cli@latest build --platform ios --profile development
# Or Android:
npx eas-cli@latest build --platform android --profile development
```

The iOS development profile uses internal distribution; EAS will need the phone registered for signing. Install its development build link alongside the App Store app, then connect it to `npm start`. This setup does not start a build or submit a store release.

For local backend development, set `OPENAI_API_KEY` in `.env.local`, run `npm run chat-server`, and override `EXPO_PUBLIC_CHAT_API_URL`. An iOS simulator or local web preview can use `http://localhost:8787`; an Android emulator can use `http://10.0.2.2:8787`. A physical phone needs the computer's LAN address and `CHAT_SERVER_HOST=0.0.0.0`. Reload Expo after changing the URL.

TestFlight and store builds use `https://degengebre-ai.expo.app`. EAS production, preview, and development environments have `EXPO_PUBLIC_CHAT_API_URL` configured for builds. The hosted `OPENAI_API_KEY` is server-side. The hosted endpoint currently has no user authentication, so add access control and spending limits before broad public distribution.

The local server's `GET /health` and hosted server's `GET /chat` report whether a key is configured, without revealing it. `OPENAI_MODEL` can change the model; it defaults to `gpt-6-luna`.

Tap the plus button beside the message field to attach up to four photos. Photos appear above the field and can be removed before sending. Tigrinya is the default chat language.

Sent chats and their attached photos are saved on the device and appear in the conversation drawer. They remain available after restarting the app, but are not synced between devices.

Sara Gold uses the RevenueCat `gold` entitlement and the App Store's monthly and annual products. The iOS public SDK key is configured in EAS development, preview, and production environments. The code now includes a Tigrinya privacy screen and staged public `/privacy-policy` and `/support` routes. Before submitting a subscription-enabled release, publish those pages, replace the unrelated App Store Connect policy/support URLs, and correct the App Privacy answers; the current “Data Not Collected” answer does not describe accounts or purchases. Submit the first subscription products with the new build and test purchase and restore on a physical device. See [the submission checklist](docs/app-store-submission.md).

The local server is intended for development. Before exposing it on the public internet, add user authentication and request limits at the server or gateway, use HTTPS, and configure the deployed URL in `EXPO_PUBLIC_CHAT_API_URL`. Do not put `OPENAI_API_KEY` in an `EXPO_PUBLIC_` variable.

## Checks

```bash
npm run test:chat-server
npx expo lint
npx tsc --noEmit
npx expo export --platform web
```

Routes live in `src/app/`, reusable UI in `src/components/`, and theme values in `src/constants/theme.ts`.
