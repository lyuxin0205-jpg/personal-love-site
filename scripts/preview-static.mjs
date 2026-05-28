import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const root = process.cwd();
const port = Number(process.env.PORT || 3000);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".wav": "audio/wav",
  ".ico": "image/x-icon"
};

function safePath(base, requestPath) {
  const decoded = decodeURIComponent(requestPath.split("?")[0]);
  const normalized = normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  return join(base, normalized);
}

function sendFile(response, file) {
  response.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" });
  createReadStream(file).pipe(response);
}

createServer((request, response) => {
  const url = request.url || "/";
  const bases = url.startsWith("/_next/") ? [join(root, ".next")] : [join(root, "public"), root];

  for (const base of bases) {
    const file = safePath(base, url.startsWith("/_next/") ? url.replace(/^\/_next/, "") : url);
    if (existsSync(file) && statSync(file).isFile()) {
      sendFile(response, file);
      return;
    }
  }

  const page = join(root, ".next", "server", "app", "index.html");
  if (existsSync(page)) {
    sendFile(response, page);
    return;
  }

  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("Not found");
}).listen(port, "127.0.0.1", () => {
  console.log(`Preview server running at http://127.0.0.1:${port}`);
});
