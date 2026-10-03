import { SUPPORT_EMAIL } from '@/constants/privacy-policy';

export function GET() {
  const html = `<!doctype html><html lang="ti"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ሳራ — ሓገዝ / Support</title><style>body{font-family:system-ui,-apple-system,sans-serif;line-height:1.65;color:#242424;background:#faf9f6;max-width:760px;margin:auto;padding:24px}a{color:#a91624}</style></head><body><main><h1>ሳራ — ሓገዝ</h1><p>ብዛዕባ ሳራ ሓገዝ እንተደሊኻ፡ ናብ <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> ጽሓፍ።</p><div lang="en"><h2>Sara support</h2><p>For app support, account questions, or privacy requests, email <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p></div></main></body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
