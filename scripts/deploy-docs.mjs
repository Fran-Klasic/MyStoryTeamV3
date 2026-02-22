#!/usr/bin/env node
/**
 * Deploys dist output to docs folder for GitHub Pages.
 * Deletes all docs contents except BACKEND_API.md, then copies dist/* into docs.
 */
import { readdirSync, statSync, rmSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const docsDir = join(root, "docs");
const distDir = join(root, "dist");
const KEEP = "BACKEND_API.md";

function deleteExcept(path, keep) {
  if (!existsSync(path)) return;
  const entries = readdirSync(path, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(path, entry.name);
    if (entry.isDirectory()) {
      rmSync(fullPath, { recursive: true });
    } else if (entry.name !== keep) {
      rmSync(fullPath);
    }
  }
}

function copyRecursive(src, dest) {
  const entries = readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.isDirectory()) {
      mkdirSync(destPath, { recursive: true });
      copyRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

deleteExcept(docsDir, KEEP);
copyRecursive(distDir, docsDir);
console.log("Deployed dist to docs (kept BACKEND_API.md)");
