// Downloads binary assets (images, fonts, PDF) at install time so deploys stay
// tiny. Sources: the existing live deployment + Google Fonts CDN. Also writes
// public/fonts/fonts.css with gstatic URLs rewritten to the local /fonts files.
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import manifest from "./assets-manifest.json" with { type: "json" };

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const jobs = [];

for (const path of [...manifest.images, ...manifest.files]) {
  jobs.push({ url: manifest.origin + path, dest: resolve(root, "public" + path) });
}
for (const [local, url] of Object.entries(manifest.fonts)) {
  jobs.push({ url, dest: resolve(root, "public/fonts", local) });
}

let done = 0;
const worker = async () => {
  while (jobs.length) {
    const job = jobs.shift();
    const response = await fetch(job.url);
    if (!response.ok) throw new Error(response.status + " for " + job.url);
    await mkdir(dirname(job.dest), { recursive: true });
    await writeFile(job.dest, Buffer.from(await response.arrayBuffer()));
    done += 1;
  }
};
await Promise.all(Array.from({ length: 8 }, worker));

// fonts.css: fetch the stylesheet with a modern UA (so Google serves woff2 with
// per-subset unicode-range blocks) and point every URL at our local copies.
const cssResponse = await fetch(manifest.fontsCss, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
  }
});
if (!cssResponse.ok) throw new Error("fonts css " + cssResponse.status);
let css = await cssResponse.text();
for (const [local, url] of Object.entries(manifest.fonts)) {
  css = css.split(url).join("/fonts/" + local);
}
await mkdir(resolve(root, "public/fonts"), { recursive: true });
await writeFile(resolve(root, "public/fonts/fonts.css"), css);

console.log("fetched", done, "assets + fonts.css");
