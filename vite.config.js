import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const rootDirectory = dirname(fileURLToPath(import.meta.url));

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const replaceMeta = (html, attribute, key, value) => {
  const expression = new RegExp(
    "(<meta\\s+" + attribute + "=\"" + key + "\"\\s+content=\")[^\"]*(\"\\s*/?>)",
    "i"
  );
  return html.replace(expression, "$1" + escapeHtml(value) + "$2");
};

const replaceCanonical = (html, value) =>
  html.replace(
    /(<link\s+rel="canonical"\s+href=")[^"]*("\s*\/?>)/i,
    "$1" + escapeHtml(value) + "$2"
  );

const readContent = () => {
  const filePath = resolve(rootDirectory, "src/content/site.json");
  return JSON.parse(readFileSync(filePath, "utf8"));
};

const toValidUrl = (value, fallback) => {
  try {
    return new URL(value, fallback).toString();
  } catch {
    return fallback;
  }
};

export default defineConfig(() => {
  const content = readContent();
  const seo = content.site.seo;
  const canonicalUrl = toValidUrl(
    seo.canonicalUrl,
    "https://phuongphuong.vercel.app/"
  );
  const shareImage = toValidUrl(
    seo.shareImage,
    new URL("/images/hero-main.jpg", canonicalUrl).toString()
  );

  return {
    plugins: [
      react(),
      {
        name: "cms-seo-html",
        transformIndexHtml(html) {
          let nextHtml = html.replace(
            /<title>[^<]*<\/title>/i,
            "<title>" + escapeHtml(seo.title) + "</title>"
          );
          nextHtml = replaceMeta(nextHtml, "name", "description", seo.description);
          nextHtml = replaceMeta(nextHtml, "property", "og:title", seo.title);
          nextHtml = replaceMeta(nextHtml, "property", "og:description", seo.description);
          nextHtml = replaceMeta(nextHtml, "property", "og:image", shareImage);
          nextHtml = replaceMeta(nextHtml, "property", "og:url", canonicalUrl);
          nextHtml = replaceCanonical(nextHtml, canonicalUrl);
          nextHtml = nextHtml.replaceAll(
            "<!-- CMS_NOSCRIPT_ROLE -->",
            escapeHtml(content.site.role + " · " + content.site.location)
          );
          nextHtml = nextHtml.replaceAll(
            "<!-- CMS_NOSCRIPT_NAME -->",
            escapeHtml(content.site.name)
          );
          return nextHtml.replaceAll(
            "<!-- CMS_NOSCRIPT_EMAIL -->",
            escapeHtml(content.site.email)
          );
        }
      }
    ]
  };
});
