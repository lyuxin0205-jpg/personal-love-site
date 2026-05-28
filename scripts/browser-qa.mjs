import { createRequire } from "node:module";
import { createServer } from "node:http";
import { createReadStream, existsSync, mkdirSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const require = createRequire("C:/Users/13770/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright/package.json");
const { chromium } = require("playwright");

const outDir = join(process.cwd(), "qa-artifacts");
mkdirSync(outDir, { recursive: true });
const root = process.cwd();
const privatePassword = process.env.QA_PRIVATE_PASSWORD || "";

function startServer() {
  const types = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".jpg": "image/jpeg",
    ".wav": "audio/wav"
  };
  const server = createServer((request, response) => {
    const url = request.url || "/";
    const bases = url.startsWith("/_next/") ? [join(root, ".next")] : [join(root, "public"), root];
    for (const base of bases) {
      const decoded = decodeURIComponent(url.split("?")[0]);
      const requestPath = url.startsWith("/_next/") ? decoded.replace(/^\/_next/, "") : decoded;
      const file = join(base, normalize(requestPath).replace(/^(\.\.[/\\])+/, ""));
      if (existsSync(file) && statSync(file).isFile()) {
        response.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" });
        createReadStream(file).pipe(response);
        return;
      }
    }
    const pathname = decodeURIComponent(url.split("?")[0]).replace(/^\/+/, "");
    const routedPage = pathname ? join(root, ".next", "server", "app", `${pathname}.html`) : join(root, ".next", "server", "app", "index.html");
    const page = existsSync(routedPage) ? routedPage : join(root, ".next", "server", "app", "index.html");
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    createReadStream(page).pipe(response);
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

async function inspectViewport(browser, name, viewport, url) {
  const page = await browser.newPage({ viewport });
  const messages = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) messages.push(`${message.type()}: ${message.text()}`);
  });
  page.on("pageerror", (error) => messages.push(`pageerror: ${error.message}`));
  await page.goto(url, { waitUntil: "networkidle" });
  await page.locator("input").first().fill(privatePassword);
  await page.getByRole("button").click();
  await page.waitForSelector("text=故事", { timeout: 10000 });
  await page.waitForTimeout(2200);
  await page.screenshot({ path: join(outDir, `${name}-hero.png`), fullPage: false });
  await page.mouse.move(viewport.width * 0.72, viewport.height * 0.34);
  await page.waitForTimeout(600);
  await page.screenshot({ path: join(outDir, `${name}-parallax.png`), fullPage: false });
  await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 1.12, behavior: "smooth" }));
  await page.waitForTimeout(900);
  await page.screenshot({ path: join(outDir, `${name}-time.png`), fullPage: false });
  await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 1.6, behavior: "smooth" }));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: join(outDir, `${name}-content.png`), fullPage: false });

  await page.goto(`${url}/story/late-night-walk`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: join(outDir, `${name}-story-detail.png`), fullPage: false });
  await page.goto(`${url}/admin`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: join(outDir, `${name}-admin.png`), fullPage: false });

  const metrics = await page.evaluate(async () => {
    const frames = [];
    let last = performance.now();
    await new Promise((resolve) => {
      function tick(now) {
        frames.push(now - last);
        last = now;
        if (frames.length > 90) resolve();
        else requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
    const overBudget = frames.filter((value) => value > 24).length;
    return {
      averageFrameMs: frames.reduce((sum, value) => sum + value, 0) / frames.length,
      overBudget
    };
  });

  await page.close();
  return { name, messages, metrics };
}

const server = await startServer();
const address = server.address();
const url = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
});
const results = [];
results.push(await inspectViewport(browser, "desktop", { width: 1440, height: 1000 }, url));
results.push(await inspectViewport(browser, "mobile", { width: 390, height: 844 }, url));
await browser.close();
server.close();

console.log(JSON.stringify(results, null, 2));
