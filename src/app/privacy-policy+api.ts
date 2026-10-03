import { PRIVACY_SECTIONS, PRIVACY_SECTIONS_EN, SUPPORT_EMAIL } from '@/constants/privacy-policy';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character] ?? character);
}

function sectionsHtml(sections: readonly { title: string; body: string }[]) {
  return sections.map(({ title, body }) =>
    `<section><h2>${escapeHtml(title)}</h2><p>${escapeHtml(body)}</p></section>`,
  ).join('');
}

export function GET() {
  const html = `<!doctype html><html lang="ti"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ሳራ — ፖሊሲ ብሕትውና / Privacy Policy</title><style>body{font-family:system-ui,-apple-system,sans-serif;line-height:1.65;color:#242424;background:#faf9f6;max-width:760px;margin:auto;padding:24px}h1{line-height:1.2}h2{font-size:1.2rem;margin:2rem 0 .5rem}p{margin:.4rem 0}a{color:#a91624}hr{border:0;border-top:1px solid #ddd;margin:3rem 0}</style></head><body><main><h1>ሳራ — ፖሊሲ ብሕትውና</h1><p>ናይ መወዳእታ ምምሕያሽ፦ 3 ጥቅምቲ 2026</p><p>እዚ ፖሊሲ ሳራ ሓበሬታኻ ብኸመይ ከም እትጥቀመሉ ይገልጽ።</p>${sectionsHtml(PRIVACY_SECTIONS)}<hr><div lang="en"><h1>Sara Privacy Policy</h1><p>Last updated: October 3, 2026</p><p>This policy explains how Sara processes information when you use the app.</p>${sectionsHtml(PRIVACY_SECTIONS_EN)}</div><p><a href="mailto:${escapeHtml(SUPPORT_EMAIL)}">${escapeHtml(SUPPORT_EMAIL)}</a></p></main></body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
