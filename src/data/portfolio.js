import siteContent from "../content/site.json";
import lqipMap from "./lqip.json";

const defaultWidths = [480, 768, 1200];

const localAssetMeta = {
  "hero-main": { width: 1366, height: 2048 },
  "portrait-blush": { width: 533, height: 799, widths: [480] },
  "editorial-high-01": { width: 1714, height: 2400 },
  "editorial-high-02": { width: 1800, height: 2400 },
  "editorial-high-03": { width: 1800, height: 2400 },
  "editorial-high-04": { width: 2399, height: 1799 },
  "editorial-high-05": { width: 1800, height: 2400 },
  "editorial-high-06": { width: 1714, height: 2399 },
  "editorial-high-07": { width: 1714, height: 2399 },
  "editorial-high-08": { width: 1714, height: 2400 },
  "fullbody-01": { width: 1638, height: 2048 },
  "fullbody-02": { width: 1638, height: 2048 },
  "fullbody-03": { width: 1638, height: 2048 },
  "beauty-wide": { width: 800, height: 796, widths: [480] },
  "look-01": { width: 533, height: 799, widths: [480] },
  "look-02": { width: 640, height: 800, widths: [480] },
  "look-03": { width: 522, height: 798, widths: [480] },
  "campaign-03": { width: 639, height: 799, widths: [480] }
};

const imageAsset = (name, width, height, widths = defaultWidths) => {
  const largestWidth = widths[widths.length - 1];
  const srcSet = (format) =>
    widths
      .map(
        (variantWidth) =>
          "/images/optimized/" + name + "-" + variantWidth + "." + format + " " + variantWidth + "w"
      )
      .join(", ");

  return {
    src: "/images/optimized/" + name + "-" + largestWidth + ".jpg",
    webpSrcSet: srcSet("webp"),
    jpegSrcSet: srcSet("jpg"),
    width,
    height,
    lqip: lqipMap[name] || ""
  };
};

const getImageName = (src) => {
  if (typeof src !== "string") return "";
  const filename = src.split("/").pop() || "";
  return filename.replace(/\.[^/.]+$/, "");
};

export const resolveImage = (src) => {
  const name = getImageName(src);
  const meta = localAssetMeta[name];
  const isLegacyAsset = src === "/images/" + name + ".jpg";

  if (meta && isLegacyAsset) {
    return imageAsset(name, meta.width, meta.height, meta.widths || defaultWidths);
  }

  return {
    src,
    webpSrcSet: "",
    jpegSrcSet: "",
    width: undefined,
    height: undefined
  };
};

const normalizeWork = (item, index) => ({
  ...item,
  id: item.id || String(index + 1).padStart(2, "0"),
  image: resolveImage(item.image)
});

const normalizeEditorial = (item, index) => ({
  ...item,
  number: item.number || String(index + 1).padStart(2, "0"),
  image: resolveImage(item.image)
});

const normalizeFrame = (item) => ({
  ...item,
  image: resolveImage(item.image)
});

export const content = siteContent;
export const profile = siteContent.site;
export const heroImage = resolveImage(siteContent.hero.image);
export const aboutImage = resolveImage(siteContent.about.image);
export const measurements = siteContent.about.measurements.map(({ label, value }) => [label, value]);
export const works = siteContent.selectedWork.items.slice(0, 8).map(normalizeWork);
export const editorials = siteContent.editorial.items.map(normalizeEditorial);
export const reelFrames = siteContent.reel.frames.map(normalizeFrame);
