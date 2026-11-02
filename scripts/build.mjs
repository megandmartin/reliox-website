import { cp, mkdir, writeFile, rm } from 'node:fs/promises';
import { home, downloadPage, privacyPage, releasesPage, transcriptsPage, notFoundPage, site } from '../src/site.mjs';
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('public', 'dist', { recursive: true });
const pages = [['/', home], ['/download/', downloadPage], ['/privacy/', privacyPage], ['/releases/', releasesPage], ['/films/', transcriptsPage]];
for (const [path, render] of pages) {
  await mkdir(`dist${path}`, { recursive: true });
  await writeFile(`dist${path}index.html`, render());
}
await writeFile('dist/404.html', notFoundPage());
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${site.origin}/sitemap.xml\n`);
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(([path]) => `<url><loc>${site.origin}${path}</loc></url>`).join('')}</urlset>\n`);
console.log(`Built ${pages.length} public pages, custom 404, robots and sitemap. No runtime dependencies.`);
