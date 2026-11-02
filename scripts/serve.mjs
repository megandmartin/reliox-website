import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('dist');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain' };
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/download/mac/') { res.writeHead(307, { Location: 'https://github.com/megandmartin/reliox-website/releases/download/v0.9.0/Reliox-0.9.0-macOS-Apple-Silicon.zip' }).end(); return; }
    let path = resolve(root, `.${decodeURIComponent(url.pathname)}`);
    if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    res.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream' }).end(await readFile(path));
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }).end(await readFile(resolve(root, '404.html')));
  }
}).listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log(`Reliox preview at http://127.0.0.1:${process.env.PORT || 4173}`));
