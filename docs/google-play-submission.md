# Sara Google Play preparation

Updated October 21, 2026. Draft preparation only; no Android build or app release was started.

## Console entry

- App: Tigrinya Ai: Sara / ሳራ
- Package: `com.degengebre.ai`
- Developer account: DEJEN (`8402323096750311272`)
- Console app ID: `4973694130560272893`
- [Dashboard](https://play.google.com/console/u/0/developers/8402323096750311272/app/4973694130560272893/app-dashboard)

## Saved in Play Console

- Privacy policy: https://ai-5f115.web.app/privacy-policy
- App access: supplied reviewer account and Tigrinya navigation instructions; owner confirmed Gold access. Credentials are saved only in the Console, not this repository. Optional trusted-partner-device credential testing is off.
- Ads: Yes.
- Target audience: 13–15, 16–17, 18 and over, as requested.
- Content rating: IARC completed after the owner authorized acceptance of its terms. ESRB Teen; Brazil 14+; PEGI parental guidance; USK 12+; IARC generic 12+.
- Government app: No.
- Financial features: None.
- Health features: None.
- Advertising ID: Yes, for advertising, analytics, and fraud prevention/security.
- Data safety: collected account data (name, email, IDs), optional purchase history/photos, AI prompt content, and advertising SDK technical data. Ad SDK disclosures include approximate location, interactions, crash logs, diagnostics/performance, and identifiers as collected/shared; service-provider account, purchase, photo, and prompt processing is disclosed as collection. HTTPS encryption declared.
- Account deletion URL: https://ai-5f115.web.app/delete-account
- Category: App / Productivity.
- Contact: degenlogistics@gmail.com; https://ai-5f115.web.app/support
- Default English (US) listing: short/full description, 512×512 red-ring icon, 1024×500 feature graphic saved as a draft.

Dashboard verified **10 of 11 setup tasks complete**; App content says there are no outstanding declarations.

## Required before release

1. Add at least two actual phone/tablet screenshots. Console currently requires 16:9 or 9:16 screenshots, each side 320–3840 px, PNG/JPEG up to 8 MB. Prefer four phone screenshots at least 1080 px on each side for promotion. Capture real Android app screens after installing a production-equivalent build; do not substitute mockups or iOS chrome.
2. Verify the prepared in-app AI response flag on a native Android device. The report UI and private Firebase receiver are implemented and passed a live end-to-end web check. Google requires reporting without leaving the app: https://support.google.com/googleplay/android-developer/answer/13985936
3. After the first Android bundle is uploaded, create Google Play subscription `sara_gold` with base plans `monthly` ($4.99/month) and `annual` ($49.90/year), then activate the intended regions. These identifiers are already mapped in RevenueCat to Gold and the current default offering. The annual discount equals two monthly payments, not a free trial. Validate purchases/restores and the reviewer entitlement on Android. RevenueCat currently reads both catalogs but cannot validate purchases because Google cannot find the package before its first binary upload.
4. Check age-appropriate AI/ads behavior for the selected 13+ audience, including local requirements for minors. Ads initialization now sets maximum ad content rating G and disables publisher personalization; existing non-personalized requests and consent handling remain. There is no neutral age screen. Do not treat Console acceptance of the age selection as proof of app compliance. Reference: https://support.google.com/googleplay/android-developer/answer/9867159
5. Build a signed production Android App Bundle only after owner go-ahead. EAS Android build list was empty. No AAB has been uploaded to this Console entry.
6. Test on supported Android devices: guest chat/photo replies, offline/error handling, sign-up/sign-in/password reset, local history deletion, account deletion, purchase/restore, banners, rewarded questions, no-fill fallback, and Gold ad-free behavior. Avoid interacting with live ads during QA; explicitly enable test units for that build.
7. Choose release track, distribution regions, testers as applicable, verify the final AAB permissions/SDK data practices against these declarations, and review Publishing overview before submitting.

## RevenueCat connection prepared

- Project Sara `e0221303`; Android app `appec0f36751e`, package `com.degengebre.ai`.
- Android public SDK key configured locally and in EAS production as `EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY`.
- Products `sara_gold:monthly` and `sara_gold:annual` are attached to entitlement `gold` and packages `$rc_monthly` / `$rc_annual` in the current `default` offering. Existing iOS and Test Store mappings are preserved.
- Dedicated account `revenuecat-sara@ai-5f115.iam.gserviceaccount.com` created with project roles Pub/Sub Editor and Monitoring Viewer. No Firebase data access was granted to it.
- Play Console access is active and limited to Sara: app information, financial data, orders/subscriptions, and store presence (Google also includes dependent quality/policy permissions). No account administration or release permissions.
- Google Play Android Developer API and Developer Reporting API enabled; Pub/Sub already enabled.
- Dedicated JSON credential uploaded and saved only in Sara’s RevenueCat app. No private credential is in the repository or mobile app. An unusable key from the stalled browser download was disabled.
- RevenueCat validation: product catalog and subscription/base-plan catalog reads pass; purchase validation reports “No application was found for the given package name.” Recheck after first binary upload and permissions propagation.
- After separate owner approval, RevenueCat connected Google real-time developer notifications through `projects/ai-5f115/topics/Play-Store-Notifications`. Sara’s Play Console notifications are enabled for subscriptions, voided purchases, and one-time products. Google Play test delivery succeeded; RevenueCat shows last received October 21, 2026 at 14:13 UTC. Google’s official notification service has Pub/Sub Publisher on this topic only. Tracking unknown purchases directly from server notifications remains off because the app uses the RevenueCat SDK.

## AI response reporting

- `ReportResponse` provides an inline Tigrinya flag, reason selection, disclosure, cancel/send, retry, and confirmation on assistant messages.
- Production receiver: `https://us-central1-ai-5f115.cloudfunctions.net/reportAiResponse`, configured in local and EAS production `EXPO_PUBLIC_REPORT_API_URL`.
- Firebase project `ai-5f115`, private `(default)` Firestore database in `us-central1`, deny-all client rules. Only authorized server/operator access can read reports.
- Function codebase `sara-reports`: Node 22, min 0/max 1 instance, 256 MiB, 15-second timeout; rate limits 10 new reports per IP/hour and 500/day overall. Duplicate report IDs are idempotent. Raw IP addresses are not stored.
- Only the selected response (up to 24,000 characters), reason, random report ID and platform are submitted; no full chat, photos, email or avatar.
- Operator review: open Firebase Firestore → `ai_content_reports`; review documents with `status: pending`. Assess the flagged response, record the resolution/status in that private document, and adjust server safety handling when appropriate. Reports are not automatically reviewed or emailed; an authorized operator must review them regularly.
- Two synthetic QA reports were accepted during setup. Live valid report returned 202, invalid reason returned 400, and unauthenticated direct Firestore read returned 403. In-app web submission displayed success after durable acceptance.
- Privacy policy and hosting were updated to disclose reports. Generated function container images have a seven-day cleanup policy; this does not delete report data.

## Assets and website

- `docs/google-play-assets/icon-512.png`: derived from the existing app icon without changing the design.
- `docs/google-play-assets/feature-graphic.png`: minimal brand graphic, no simulated app UI.
- Firebase Hosting project/site `ai-5f115`, public directory `docs/app-store-legal`.
- Privacy policy now covers Apple App Store and Google Play billing; support links to account deletion.
- Account-deletion page provides in-app steps and an email request method, ownership verification, device-local data instructions, and subscription/retention limitations.
- Firebase deployment succeeded; privacy-policy, support, and delete-account all returned HTTPS 200.

## Verification

- `npm run lint`: passed.
- `tsc --noEmit`: passed.
- Backend, report, history/credit, and chat tests: 35/35 passed.
- Android JavaScript/assets export passed (2,046 modules); this is not a native build, APK or AAB.
- Live report receiver and in-app web flow passed. Native Android device QA remains required.
- No build, OTA update, or app review submission started.
