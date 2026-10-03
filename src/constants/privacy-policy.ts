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
    title: 'ጎልድ ግዝኢት',
    body: 'ጎልድ ኣማራጺ ግዝኢት እዩ። ክፍሊት ብ Apple ይስራሕ። RevenueCat ናይ ግዝኢት ታሪኽን መለለዪ ተጠቃሚን ንመሰል ኣገልግሎት ንምርግጋጽን ግዝኢት ንምምላስን ይስርሕ።',
  },
  {
    title: 'ኣገልግሎታትን ርክብን',
    body: 'ሳራ Expo EAS Hosting፣ OpenAI፣ Firebase Authentication፣ RevenueCatን Apple App Storeን ትጥቀም። ናይ Google Mobile Ads SDK ኣብ መተግበሪ ኣሎ፡ ኣብዚ ሕጂ ግን ምልክታታት ኣይንርእይን። ብዛዕባ ሓበሬታኻ ንምሕታት ናብ degenlogistics@gmail.com ጽሓፍ።',
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
    body: 'Sara saves chat history, attached chat photos, your chosen profile picture, locally saved display name, and theme preference on your device. These items do not sync between devices. You can delete chats from history and remove your profile picture. Deleting your account clears its local profile information, but does not automatically erase separately stored chat history; delete those chats in history if you want to remove them.',
  },
  {
    title: 'Subscriptions',
    body: 'Sara Gold is optional. Apple processes App Store payments. RevenueCat processes purchase history and an app user identifier to check access and restore purchases. You can manage or cancel your subscription in your Apple account settings.',
  },
  {
    title: 'Services and contact',
    body: 'Sara uses Expo EAS Hosting for its chat service, OpenAI for AI replies, Firebase Authentication for optional accounts, RevenueCat for subscription access, and Apple for App Store payments. The app also includes the Google Mobile Ads SDK, although no ads are currently displayed. These providers may process information under their own privacy terms. We do not sell your chat content. For privacy questions or requests, email degenlogistics@gmail.com. You can delete your account in profile settings.',
  },
] as const;
