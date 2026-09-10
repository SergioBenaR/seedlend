import { cpSync, mkdirSync, rmSync } from "node:fs";

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist", { recursive: true });
for (const file of ["index.html", "styles.css", "main.js"]) {
  cpSync(file, `dist/${file}`);
}
console.log("SeedLend static demo built to app/dist");
