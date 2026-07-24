#!/usr/bin/env node
/**
 * LOCKED build step — precompile the in-page JSX.
 *
 * The app ships one huge <script type="text/babel"> block that was being
 * transpiled by @babel/standalone in every user's browser on every load
 * (~2.8 MB of Babel + a full compile of ~900 KB of JSX on the main thread).
 *
 * This script compiles that block once, at deploy time, and writes a
 * production dist/index.html that:
 *   • contains plain compiled JS (no <script type="text/babel">)
 *   • drops the @babel/standalone CDN <script> entirely
 *
 * Source index.html stays the editable, Babel-in-browser version for local
 * hacking. Run `npm run build`, then deploy dist/.
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, cpSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import babel from "@babel/core";

const root = dirname(fileURLToPath(import.meta.url));
const srcPath = join(root, "index.html");
const distDir = join(root, "dist");
const outPath = join(distDir, "index.html");

const html = readFileSync(srcPath, "utf8");

const OPEN = '<script type="text/babel">';
const start = html.indexOf(OPEN);
if (start === -1) { console.error("No <script type=\"text/babel\"> block found."); process.exit(1); }
const afterOpen = start + OPEN.length;
const end = html.indexOf("</script>", afterOpen);
if (end === -1) { console.error("Unterminated text/babel block."); process.exit(1); }

const jsx = html.slice(afterOpen, end);
console.log(`Compiling JSX block: ${(jsx.length / 1024).toFixed(0)} KB ...`);

const t0 = Date.now();
const { code } = babel.transformSync(jsx, {
  presets: [["@babel/preset-react", { runtime: "classic", pragma: "React.createElement", pragmaFrag: "React.Fragment" }]],
  compact: false,
  comments: false,
  babelrc: false,
  configFile: false,
});
console.log(`Compiled in ${Date.now() - t0} ms → ${(code.length / 1024).toFixed(0)} KB JS`);

// Rebuild the document: replace the text/babel block with plain compiled JS.
let out = html.slice(0, start) + "<script>\n" + code + "\n</script>" + html.slice(end + "</script>".length);

// Drop the now-unused @babel/standalone CDN script (any pinned version).
out = out.replace(
  /\s*<script[^>]*@babel\/standalone[^>]*><\/script>/,
  "\n  <!-- Babel runtime removed: JSX is precompiled at build time -->"
);

mkdirSync(distDir, { recursive: true });
writeFileSync(outPath, out, "utf8");

// Carry over sibling static assets the app references, when present.
// NOTE: admin/ is deliberately NOT copied — admin/dashboard.html works with
// the Supabase service-role key and must never be deployed to the public site.
for (const asset of ["manifest.json", "sw.js", "icon.svg"]) {
  const p = join(root, asset);
  if (existsSync(p)) copyFileSync(p, join(distDir, asset));
}

console.log(`\nWrote ${outPath}`);
console.log(`  source : ${(html.length / 1024).toFixed(0)} KB (Babel-in-browser)`);
console.log(`  dist   : ${(out.length / 1024).toFixed(0)} KB (precompiled, no Babel runtime)`);
