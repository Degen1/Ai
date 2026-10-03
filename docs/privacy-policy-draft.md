# Sara privacy policy — draft for review

This is a **draft**, not a published privacy policy. The owner supplied `degenlogistics@gmail.com` as the support/privacy email. Verify vendor configuration and retention, then publish the bilingual route staged at `/privacy-policy` on Sara's EAS Hosting domain before replacing the current App Store privacy URL. The native app now has an in-app Tigrinya privacy screen linked from the profile and Gold screens.

## Proposed public text

**Last updated:** [publication date]

Sara is a Tigrinya-first AI chat app. You can use chat without creating an account. If you choose to create one, Firebase Authentication processes your email address, password, and any display name you provide so you can sign in and manage your account. Firebase also processes technical information needed for authentication and security.

When you send a chat message, Sara sends the text and any photos you attach to Sara's hosted chat service and OpenAI to generate a response. Do not include information you do not want processed for that purpose. Sara's chat service requests that OpenAI not store the response as application state. OpenAI may retain abuse-monitoring logs under its API data controls. Sara does not make your conversations visible to other users.

Sara saves your conversation history, attached chat photos, chosen profile picture, display name, and theme preference on your device so they remain available after you close the app. Your locally saved conversations are not synced between devices. You can delete individual conversations in the chat history, remove your profile picture, and delete your account in the profile settings. Deleting an account removes its locally saved profile information; conversation history is stored separately on the device and should be deleted from the chat history if you want to remove it.

Sara Gold is an optional subscription. Apple processes App Store payments, and RevenueCat processes purchase history and an app user identifier to check subscription access and restore purchases. Prices and availability are shown in the app before you buy.

We use these services to operate Sara: Expo EAS Hosting for the chat service, OpenAI for AI responses, Firebase Authentication for optional accounts, RevenueCat for subscription access, and Apple for App Store payments. Each provider processes information under its own terms and privacy practices. We do not sell your chat content. [Confirm whether Google Mobile Ads SDK transmits any data in this build; no ads are displayed in the current UI.]

To ask about your data or privacy choices, contact **degenlogistics@gmail.com**. You can request account deletion from the app's profile settings. [Add a separate retention/deletion explanation for any server-side logs or backups after checking provider and hosting settings.]

## Before publication

- Add a publication date after the policy is deployed. Check that users can reach the support email.
- Verify Firebase, RevenueCat, OpenAI, EAS Hosting, and bundled Google Mobile Ads SDK settings and data practices against the release binary. Confirm whether the Google SDK sends data even though the app does not request ads.
- Confirm account deletion and chat-history deletion behavior on a physical device. Account deletion does **not** currently erase locally saved conversations; preserve that distinction in the policy or change the code.
- Publish the final policy at a Sara-specific HTTPS URL and add an in-app link. Replace the unrelated policy URL in App Store Connect, then update the App Privacy answers to match this build.

Official vendor references: [Apple App Privacy](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/), [Firebase privacy](https://firebase.google.com/support/privacy), [RevenueCat App Privacy](https://www.revenuecat.com/docs/platform-resources/apple-platform-resources/apple-app-privacy), [OpenAI API data controls](https://platform.openai.com/docs/models/default-usage-policies-by-endpoint).
