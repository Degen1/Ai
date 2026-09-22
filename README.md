# Aura AI

Aura is a polished Expo and React Native chat app shell. It includes a responsive conversation screen, local demo replies, prompt starters, searchable chat history, dark mode, and a clean boundary for connecting a real AI backend.

## Run the app

```bash
npm install
npx expo start
```

Open the project in Expo Go, an iOS or Android simulator, or the web preview shown by Expo CLI.

## Connect an AI backend

The UI talks to the `chatTransport` object in `src/services/chat-service.ts`. Its current implementation returns local demo responses so the full interaction can be tested without credentials.

When the backend is ready, replace only the `send` method with a request to your own authenticated server. Do not ship an OpenAI API key inside the mobile app or expose it through an `EXPO_PUBLIC_` environment variable; client-side values can be extracted from the app bundle.

## Project checks

```bash
npm run lint
npx tsc --noEmit
npx expo export --platform web
```

Routes live in `src/app/`, reusable UI lives in `src/components/`, and theme values are centralized in `src/constants/theme.ts`.
