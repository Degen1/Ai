# ሳራ

ሳራ is an Expo/React Native chat app with an OpenAI-backed server. Text and photo messages use the Responses API. The API key stays on the server and is never bundled into the mobile app.

## Local setup

1. Install packages with `npm install`.
2. Copy `.env.example` to `.env.local` and set `OPENAI_API_KEY` in that ignored file. Set `EXPO_PUBLIC_CHAT_API_URL` to the URL the app can reach.
3. Start the chat server with `npm run chat-server`.
4. In another terminal, run `npx expo start` and open the app.

For an iOS simulator or the local web preview, `http://localhost:8787` works. For an Android emulator, use `http://10.0.2.2:8787`. For a physical phone, use your computer's LAN address, such as `http://192.168.1.10:8787`, in `EXPO_PUBLIC_CHAT_API_URL` and set `CHAT_SERVER_HOST=0.0.0.0`. Both devices must be on the same network. Set `CHAT_ALLOWED_ORIGIN` to the exact web preview origin if you use the browser. Reload the Expo app after changing its public URL.

TestFlight and store builds need a public HTTPS chat endpoint. The local `.env.local` is ignored by EAS Build, and a LAN address cannot serve remote testers. This project includes an Expo API route at `/chat` for EAS Hosting. Before a release build, configure `OPENAI_API_KEY` as a **sensitive server-side** EAS production variable, deploy the web export to EAS Hosting, then configure `EXPO_PUBLIC_CHAT_API_URL` as a **plain-text public** EAS production variable with the deployment's HTTPS origin. Build the iOS app after both variables are set. Keep the OpenAI key out of `EXPO_PUBLIC_` variables. The hosted endpoint currently has no user authentication, so add access control and spending limits before broad public distribution.

The local server's `GET /health` and hosted server's `GET /chat` report whether a key is configured, without revealing it. `OPENAI_MODEL` can change the model; it defaults to `gpt-6-luna`.

Tap the plus button beside the message field to attach up to four photos. Photos appear above the field and can be removed before sending. Tigrinya is the default chat language.

Sent chats and their attached photos are saved on the device and appear in the conversation drawer. They remain available after restarting the app, but are not synced between devices.

The local server is intended for development. Before exposing it on the public internet, add user authentication and request limits at the server or gateway, use HTTPS, and configure the deployed URL in `EXPO_PUBLIC_CHAT_API_URL`. Do not put `OPENAI_API_KEY` in an `EXPO_PUBLIC_` variable.

## Checks

```bash
npm run test:chat-server
npx expo lint
npx tsc --noEmit
npx expo export --platform web
```

Routes live in `src/app/`, reusable UI in `src/components/`, and theme values in `src/constants/theme.ts`.
