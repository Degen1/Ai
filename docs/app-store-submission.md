# ሳራ — next iOS submission

Prepared October 3, 2026. The owner authorized a new build and asked to replace the in-review 1.0.0 build 3 with the translated app and both Sara Gold subscriptions.

## Build state

- Expo app: `com.degengebre.ai`; EAS project: `8ab79247-6531-4d03-bfdc-389b3c09479a`.
- The production profile uses remote build numbers and `autoIncrement`. Production iOS build 1.0.0 (4), EAS build `5fe9b178-6c11-4b66-a1d1-886b0cd05221`, finished successfully October 3.
- The older 1.0.0 (3) submission was removed from review. App Store Connect has accepted build 4 as Ready to Submit in TestFlight, and EAS submission `1f557add-0d97-46b1-b05b-3e45e474d621` finished.
- Build 4, both Sara Gold plans, and the subscription group are together in one four-item App Store Connect draft. The plans are currently available only in the United States: $4.99 monthly or $49.90 annually.
- The English (U.S.) store name is now **Sara: Tigrinya AI** with subtitle **AI Chat in Tigrinya**. Apple rejected Tigrinya characters in those listing fields and reported that **Sara** alone is taken. The native installed app name remains **ሳራ**. The product description now describes the actual Gold badge, US prices, renewal terms, and Apple's standard EULA.

## Review information for the new build

The old review notes claiming no accounts or purchases have been replaced with instructions matching build 4. The draft notes cover the optional account, photo attachment, local history, Gold purchase and restore, service providers, and US-only Gold availability.

> Sara is a general-purpose AI assistant for Tigrinya speakers. Users can ask questions in Tigrinya, attach photos for context, choose Chat or Work mode, and revisit or delete locally saved conversations. The AI can reply in another language if requested.
>
> Chat does not require an account. Users may register with email and password, sign in, reset their password, edit their display name and avatar, update their email or password, sign out, and delete their account. Provide a working demo account in the Sign-In Information section so App Review can inspect these account features.
>
> Sara Gold is an optional monthly or annual auto-renewing subscription. Open the profile drawer, tap the membership row, and select a plan; Restore Purchases is on that screen. Use an App Store sandbox account to test a purchase. The app shows a Gold badge for an active subscription. No ad placements are currently displayed.
>
> Sara uses Expo EAS Hosting to forward chat requests to OpenAI, Firebase Authentication for accounts, RevenueCat for subscription status, and Apple In-App Purchase for iOS payments. Conversations and attached photos are saved locally on the device; prompts and attached photos are transmitted to the chat service and OpenAI to generate replies. The same main features are offered across regions, while store prices and purchase availability depend on the user's storefront.
>
> Sara does not publish one user's conversations to other users and has no public user-generated-content feed. It does not provide regulated services or licensed third-party content.

Record a fresh walkthrough on a supported physical iPhone using the **new build**. Show launch, chat and photo attachment, history and deletion, account registration/login/edit/deletion, and the membership/purchase/restore flow. Attach that recording to the next App Review submission.

## Tigrinya product-page draft

**Description:**

> ሳራ ብትግርኛ ክትዘራረብ እትኽእል ናይ AI ሓጋዚት እያ። ሕቶኻ ጽሓፍ፣ ንተወሳኺ ሓበሬታ ስእሊ ወስኽ፣ ዕላላትካ ኣብ መሳርሒኻ ዓቅብ። ንመዓልታዊ ሕቶታት ወይ ናይ ስራሕ ጽሑፍ ተጠቐመላ። ካልእ ቋንቋ እንተደሊኻ ክትሓትታ ትኽእል።
>
> ብዘይ መለለዪ ዕላል ጀምር። ናይ ጎልድ ግዝኢት ኣማራጺ እዩ፤ ወርሓዊን ዓመታዊን መደባት ኣለዉ። ዋጋ ኣብ መተግበሪ ካብ App Store ይርአ።

Check the final copy, screenshots, keywords, and subscription display names against the actual new build before updating App Store Connect.

## Remaining store-side requirements

1. Publish the prepared Sara-specific static privacy and support pages, then replace the incorrect App Privacy and Support URLs. The EAS-hosted routes return 404. Publishing the entire EAS deployment was blocked because it would also expose the unauthenticated chat API; publishing the isolated static GitHub Pages branch requires explicit approval after automatic review rejected its public payload and destination. The support contact is `degenlogistics@gmail.com`.
2. App Privacy answers have been updated and published for account data, chats/photos, purchases, and SDK data. Verify the final disclosure against the actual vendor settings and any enabled SDK data collection.
3. The first Sara Gold subscription products are grouped with build 4 in the four-item draft. Confirm the RevenueCat `gold` entitlement and default offering on a physical-device sandbox purchase and restore.
4. Provide a working demo account for App Review, or remove account features from the release. The current review notes saying no account or purchases must be replaced for the new build.
5. Test the production build on a physical iPhone, including Tigrinya text layout, photo access, chat responses, account changes, purchase/restore, and account deletion. Confirm the new icon and home-screen name.

Build 4 is ready in TestFlight, and the previous review is withdrawn. Finish the physical-device checks above, publish the static privacy and support pages with approval, and update App Store URLs. Existing screenshots and the recording were made for the previous build; replace them if they no longer represent the current UI. Then submit the four-item draft for review.

## App Privacy inventory to verify

- **Contact Info / Email Address and Name:** optional Firebase account email and display name. Firebase Authentication also handles credentials and security metadata. [Firebase's privacy reference](https://firebase.google.com/support/privacy).
- **Purchases and Identifiers / User ID:** RevenueCat processes purchase history and, after sign-in, this app passes the Firebase user ID to RevenueCat. RevenueCat says purchase history must be declared, including App Functionality and Analytics use. [RevenueCat's Apple App Privacy guidance](https://www.revenuecat.com/docs/platform-resources/apple-platform-resources/apple-app-privacy).
- **User Content / Photos and other user content:** chat prompts and attached photos reach the hosted service and OpenAI; OpenAI's API may retain abuse-monitoring logs even though Sara sends `store: false`. Verify the applicable OpenAI organization controls. [OpenAI API data controls](https://platform.openai.com/docs/models/default-usage-policies-by-endpoint).
- **Advertising SDK:** Google Mobile Ads is included in the native config but the app has no active ad placement. Check the actual bundled SDK behavior and [Google's iOS disclosure guidance](https://developers.google.com/admob/ios/privacy/data-disclosure) before finalizing answers.

Apple requires these answers to include relevant third-party SDK practices, so treat this as a starting inventory rather than the final App Privacy declaration. [Apple App Privacy guidance](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/).
