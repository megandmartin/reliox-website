import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
const root = resolve('dist');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.mp4': 'video/mp4', '.vtt': 'text/vtt', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain' };
const server = createServer(async (req, res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }).end(); return; }
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/download/mac/') { res.writeHead(307, { Location: 'https://github.com/megandmartin/reliox-website/releases/download/v0.10.0/Reliox-0.10.0-macOS-Apple-Silicon.zip' }).end(); return; }
    let path = resolve(root, `.${decodeURIComponent(url.pathname)}`);
    if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    const size = (await stat(path)).size;
    const headers = { 'Content-Type': mime[extname(path)] || 'application/octet-stream', 'Accept-Ranges': 'bytes' };
    let start = 0;
    let end = size - 1;
    const rangeHeader = req.method === 'GET' ? req.headers.range : undefined;
    if (rangeHeader) {
      const range = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
      if (!range || (!range[1] && !range[2])) { res.writeHead(416, { 'Content-Range': `bytes */${size}` }).end(); return; }
      start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
      end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
      if (start >= size || start > end) { res.writeHead(416, { 'Content-Range': `bytes */${size}` }).end(); return; }
      headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
    }
    headers['Content-Length'] = String(end - start + 1);
    res.writeHead(rangeHeader ? 206 : 200, headers);
    if (req.method === 'HEAD' || size === 0) { res.end(); return; }
    createReadStream(path, { start, end }).on('error', () => res.destroy()).pipe(res);
  } catch {
    if (res.headersSent || res.destroyed) { res.destroy(); return; }
    const fallback = await readFile(resolve(root, '404.html')).catch(() => 'Page not found');
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }).end(req.method === 'HEAD' ? undefined : fallback);
  }
});
server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log(`Reliox preview at http://127.0.0.1:${server.address().port}`));
