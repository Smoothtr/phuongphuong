// Generates a dedicated 1200×630 Open Graph card from the hero image so link
// previews (Messenger/Zalo/Slack/iMessage) show a well-framed landscape crop.
// Run with: npm run images:og
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "public/images/hero-main.jpg");
const output = resolve(root, "public/images/og-card.jpg");

await sharp(source)
  .resize(1200, 630, { fit: "cover", position: "attention" })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(output);

console.log("OG card written →", output);
