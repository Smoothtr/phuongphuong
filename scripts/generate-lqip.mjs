// Generates tiny blur-up placeholders (LQIP) for every optimized image.
// Output: src/data/lqip.json — { "<image-name>": "data:image/webp;base64,..." }
// Run with: npm run images:lqip
import { readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = resolve(root, "public/images/optimized");
const outputFile = resolve(root, "src/data/lqip.json");

const files = (await readdir(sourceDir)).filter((file) => /-480\.(jpg|webp)$/.test(file));

// Prefer the 480 jpg variant as the LQIP source; fall back to webp.
const byName = new Map();
for (const file of files) {
  const name = file.replace(/-480\.(jpg|webp)$/, "");
  const isJpg = file.endsWith(".jpg");
  if (!byName.has(name) || isJpg) byName.set(name, file);
}

const map = {};
for (const [name, file] of byName) {
  const buffer = await sharp(resolve(sourceDir, file))
    .resize(20, undefined, { fit: "inside" })
    .blur(1)
    .webp({ quality: 32 })
    .toBuffer();
  map[name] = "data:image/webp;base64," + buffer.toString("base64");
}

await writeFile(outputFile, JSON.stringify(map, null, 2) + "\n");
console.log("LQIP written for", Object.keys(map).length, "images →", outputFile);
