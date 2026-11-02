import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
const root = resolve('dist');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.mp4': 'video/mp4', '.vtt': 'text/vtt', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain' };
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/download/mac/') { res.writeHead(307, { Location: 'https://github.com/megandmartin/reliox-website/releases/download/v0.9.0/Reliox-0.9.0-macOS-Apple-Silicon.zip' }).end(); return; }
    let path = resolve(root, `.${decodeURIComponent(url.pathname)}`);
    if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    const size = (await stat(path)).size;
    const headers = { 'Content-Type': mime[extname(path)] || 'application/octet-stream', 'Accept-Ranges': 'bytes' };
    let start = 0;
    let end = size - 1;
    if (req.headers.range) {
      const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (!range || (!range[1] && !range[2])) { res.writeHead(416, { 'Content-Range': `bytes */${size}` }).end(); return; }
      start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
      end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
      if (start >= size || start > end) { res.writeHead(416, { 'Content-Range': `bytes */${size}` }).end(); return; }
      headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
    }
    headers['Content-Length'] = String(end - start + 1);
    res.writeHead(req.headers.range ? 206 : 200, headers);
    if (req.method === 'HEAD') { res.end(); return; }
    createReadStream(path, { start, end }).on('error', () => res.destroy()).pipe(res);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }).end(await readFile(resolve(root, '404.html')));
  }
}).listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log(`Reliox preview at http://127.0.0.1:${process.env.PORT || 4173}`));
