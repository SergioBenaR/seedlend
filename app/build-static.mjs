import { cpSync, mkdirSync, rmSync } from "node:fs";

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist", { recursive: true });

const files = [
  "index.html",
  "styles.css",
  "product-concept.css",
  "hero-fix.css",
  "evidence-fix.css",
  "main.js",
  "product-layout.js",
  "seedlend-isotype.png",
  "seedlend-logo-full.png"
];

for (const file of files) {
  cpSync(file, `dist/${file}`);
}

console.log("SeedLend static demo built to app/dist");
