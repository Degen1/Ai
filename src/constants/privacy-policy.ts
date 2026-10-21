export const SUPPORT_EMAIL = 'degenlogistics@gmail.com';

export const PRIVACY_SECTIONS = [
  {
    title: 'መለለዪ',
    body: 'ብዘይ መለለዪ ምስ ሳራ ክትዘራረብ ትኽእል። መለለዪ እንተፈጢርካ፡ ኢመይልካ፣ ምስጢራዊ ቃልካን ዝሃብካዮ ስምን ብ Firebase Authentication ንመእተዊን ምሕደራ መለለዪን ይስርሑ።',
  },
  {
    title: 'ዕላልን ስእልታትን',
    body: 'መልእኽቲ ወይ ስእሊ ክትሰድድ ከለኻ፡ መልሲ ንምድላው ናብ ኣገልጋሊ ሳራን OpenAIን ይለኣኽ። ዕላላትካ ንኻልኦት ተጠቀምቲ ኣይንሕትሞን። OpenAI ንድሕነት ኣገልግሎቱ መዝገብ ከዕቅብ ይኽእል።',
  },
  {
    title: 'ኣብ መሳርሒኻ ዝዕቀብ',
    body: 'ታሪኽ ዕላልካ፣ ናብ ዕላል ዝወሰኽካዮ ስእሊ፣ ስእሊ መገለጺኻን ምርጫ መልክዕካን ኣብ መሳርሒኻ ይዕቀቡ። ኣብ መንጎ መሳርሒታት ኣይተዛመዱን። ዕላል ካብ ታሪኽ ክትሰርዞ ትኽእል። መለለዪኻ ምስ ትሰርዝ፡ ኣብ መሳርሒኻ ዘሎ ታሪኽ ዕላል በይኑ ኣይስረዝን።',
  },
  {
    title: 'ጸብጻብ መልሲ',
    body: 'መልሲ ክትጸብጽብ ምስ ትመርጽ፡ እቲ ዝመረጽካዮ መልስን ምኽንያትካን ንጉጅለ ሳራ ንምርመራ ኣብ Firebase Cloud Firestore ይዕቀብ። ምሉእ ታሪኽ ዕላልካ፣ ስእልታትካን ኢመይልካን ምስ ጸብጻብ ኣይለኣኹን።',
  },
  {
    title: 'ጎልድ ግዝኢት',
    body: 'ጎልድ ኣማራጺ ግዝኢት እዩ። ክፍሊት ብ Apple App Store ወይ Google Play ይስራሕ። RevenueCat ናይ ግዝኢት ታሪኽን መለለዪ ተጠቃሚን ንመሰል ኣገልግሎት ንምርግጋጽን ግዝኢት ንምምላስን ይስርሕ።',
  },
  {
    title: 'ኣገልግሎታትን ርክብን',
    body: 'ሳራ Expo EAS Hosting፣ OpenAI፣ Firebase Authentication፣ Firebase Hosting፣ RevenueCat፣ Apple App Storeን Google Playን ትጥቀም። ንነጻ ተጠቀምቲ Google AdMob ማስታወቂያታት የቕርብ። ማስታወቂያ ብምርኣይ 2 ተወሰኽቲ ሕቶታት ክትረክብ ትኽእል። ጎልድ ማስታወቂያ የብሉን፡ ሕቶታት ድማ ዘይተወሰኑ እዮም። Google ኣድራሻ IP፣ መለለዪ መሳርሒን ኣጠቓቕማ ማስታወቂያን ክእክብ ይኽእል። ትሕዝቶ ዕላልካ ንማስታወቂያ ኣይንሰዶን። ብዝሒ ዝተረፉ ሕቶታትካ ኣብ መሳርሒኻ ይዕቀብ። ኣብ ዝምልከተሉ ዞባ፡ ምርጫታት ብሕትውና ማስታወቂያ ኣብ መገለጺኻ ክትቅይር ትኽእል። ብዛዕባ ሓበሬታኻ ንምሕታት ናብ degenlogistics@gmail.com ጽሓፍ።',
  },
] as const;

export const PRIVACY_SECTIONS_EN = [
  {
    title: 'Accounts',
    body: 'You can use Sara chat without an account. If you create one, Firebase Authentication processes your email address, password, and any display name you provide to let you sign in and manage your account. Firebase also processes technical information needed for authentication and security.',
  },
  {
    title: 'Chats and photos',
    body: 'When you send a message or attach a photo, Sara sends it to its hosted chat service and OpenAI to generate a reply. Sara requests that OpenAI not store the response as application state. OpenAI may retain abuse-monitoring logs under its API data controls. Sara does not publish your chats to other users.',
  },
  {
    title: 'Information saved on your device',
    body: 'Sara saves chat history, attached chat photos, your chosen profile picture, and locally saved display name on your device. These items do not sync between devices. You can delete chats from history and remove your profile picture. Deleting your account clears its local profile information, but does not automatically erase separately stored chat history; delete those chats in history if you want to remove them.',
  },
  {
    title: 'Response reports',
    body: 'If you choose to report an AI response, Sara sends the selected response (up to 24,000 characters), your selected reason, a random report identifier, and the app platform to a Firebase Cloud Function. The report is saved privately in Cloud Firestore for authorized Sara operators to review and improve content safety. Your full conversation, attached photos, account email, and profile picture are not included. Technical request information may be processed for security; an hourly hashed network-address bucket limits abuse. Reports are retained for review and safety follow-up. Contact support for privacy or deletion requests; security records may be retained where necessary.',
  },
  {
    title: 'Subscriptions',
    body: 'Sara Gold is optional. Apple processes App Store payments, and Google processes Google Play payments. RevenueCat processes purchase history and an app user identifier to check access and restore purchases. You can manage or cancel your subscription in the store account where you subscribed (Apple App Store or Google Play).',
  },
  {
    title: 'Services and contact',
    body: 'Sara uses Expo EAS Hosting for its chat service, OpenAI for AI replies, Firebase Authentication for optional accounts, RevenueCat for subscription access, Firebase Hosting for public support and policy pages, and Apple App Store or Google Play for store payments. Google AdMob provides banner and optional rewarded ads for free users. Completing a rewarded ad unlocks two more questions; Sara Gold has no ads and unlimited questions. The SDK may process IP address, device identifiers, diagnostics, and ad interactions. We request non-personalized ads and do not send chat content to AdMob. Question credits are stored locally on this installation. Where required, you can revisit ad privacy choices from your profile. These providers may process information under their own privacy terms. We do not sell your chat content. For privacy questions or requests, email degenlogistics@gmail.com. You can delete your account in profile settings.',
  },
] as const;
