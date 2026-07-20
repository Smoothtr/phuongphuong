import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceDirectory = path.resolve("public/images");
const outputDirectory = path.join(sourceDirectory, "optimized");
const sources = [
  { name: "hero-main", widths: [480, 768, 1200] },
  { name: "editorial-high-01", widths: [480, 768, 1200] },
  { name: "editorial-high-02", widths: [480, 768, 1200] },
  { name: "editorial-high-03", widths: [480, 768, 1200] },
  { name: "editorial-high-04", widths: [480, 768, 1200] },
  { name: "editorial-high-05", widths: [480, 768, 1200] },
  { name: "editorial-high-06", widths: [480, 768, 1200] },
  { name: "editorial-high-07", widths: [480, 768, 1200] },
  { name: "editorial-high-08", widths: [480, 768, 1200] },
  { name: "fullbody-01", widths: [480, 768, 1200] },
  { name: "fullbody-02", widths: [480, 768, 1200] },
  { name: "fullbody-03", widths: [480, 768, 1200] },
  { name: "portrait-blush", widths: [480] },
  { name: "beauty-wide", widths: [480] },
  { name: "look-01", widths: [480] },
  { name: "look-02", widths: [480] },
  { name: "look-03", widths: [480] },
  { name: "campaign-03", widths: [480] }
];

await mkdir(outputDirectory, { recursive: true });

for (const source of sources) {
  const input = path.join(sourceDirectory, source.name + ".jpg");

  for (const width of source.widths) {
    const resized = sharp(input)
      .rotate()
      .resize({ width, withoutEnlargement: true });

    await resized
      .clone()
      .webp({ quality: 72, effort: 5, smartSubsample: true })
      .toFile(path.join(outputDirectory, source.name + "-" + width + ".webp"));

    await resized
      .clone()
      .jpeg({ quality: 74, progressive: true, mozjpeg: true })
      .toFile(path.join(outputDirectory, source.name + "-" + width + ".jpg"));
  }
}

console.log("Optimized " + sources.length + " source images in " + outputDirectory);
