import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const sourceDirs = ["app", "components", "data", "lib"];
const issues = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      walk(path);
      continue;
    }
    if (!/\.(tsx?|css)$/.test(entry)) continue;
    inspect(path);
  }
}

function inspect(path) {
  const text = readFileSync(path, "utf8");
  const name = relative(root, path).replaceAll("\\", "/");
  const lines = text.split(/\r?\n/);

  lines.forEach((line, index) => {
    const at = `${name}:${index + 1}`;
    if (/\bconsole\.(log|warn|error|debug)\b/.test(line)) issues.push(`${at} console statement is not allowed`);
    if (/TODO|FIXME/.test(line)) issues.push(`${at} unresolved marker found`);
    if (/<img\b/.test(line)) issues.push(`${at} use next/image instead of raw img`);
    if (/letter-spacing:\s*-/.test(line)) issues.push(`${at} negative letter spacing is disallowed`);
  });
}

for (const dir of sourceDirs) walk(join(root, dir));

if (issues.length) {
  console.error(issues.join("\n"));
  process.exit(1);
}

console.log("Custom lint checks passed.");
