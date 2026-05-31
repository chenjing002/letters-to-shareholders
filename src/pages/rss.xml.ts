import { getCollection } from 'astro:content';

export async function GET() {
  const letters = await getCollection('letters');

  // Sort by year descending
  const sorted = letters.sort((a, b) => b.data.year - a.data.year);

  const site = 'https://aimunger.com';
  const base = '/letters';

  const items = sorted.map((letter) => {
    const companySlug = letter.slug.split('/')[0];
    const link = `${site}${base}/letter/${companySlug}/${letter.data.year}/`;
    return `    <item>
      <title>${escapeXml(letter.data.title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <description>${escapeXml(letter.data.company)} ${letter.data.year} 年致股东信</description>
    </item>`;
  });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>致股东信</title>
    <link>${site}${base}/</link>
    <description>中国上市公司致股东信合集</description>
    <language>zh-CN</language>
${items.join('\n')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: { 'Content-Type': 'application/xml' },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
