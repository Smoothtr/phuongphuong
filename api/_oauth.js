import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const STATE_COOKIE_NAME = "phuongphuong_cms_state";
const STATE_TTL_MS = 10 * 60 * 1000;

const requiredEnvironment = (name) => {
  const value = process.env[name];
  if (!value) throw new Error("Missing " + name);
  return value;
};

const normalizeOrigin = (value) => {
  try {
    return new URL(value).origin;
  } catch {
    throw new Error("Invalid URL configuration");
  }
};

const signState = (state, secret) =>
  createHmac("sha256", secret).update(state).digest("base64url");

const safeEqual = (left, right) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
};

export const getCmsConfig = () => {
  const callbackUrl = requiredEnvironment("CMS_OAUTH_CALLBACK_URL");
  const allowedOrigin = normalizeOrigin(
    process.env.CMS_ALLOWED_ORIGIN || new URL(callbackUrl).origin
  );

  return {
    allowedOrigin,
    callbackUrl,
    clientId: requiredEnvironment("GITHUB_OAUTH_CLIENT_ID"),
    clientSecret: requiredEnvironment("GITHUB_OAUTH_CLIENT_SECRET"),
    scope: process.env.CMS_GITHUB_SCOPE || "public_repo",
    stateSecret: requiredEnvironment("CMS_STATE_SECRET")
  };
};

export const createState = (secret) => {
  const state = String(Date.now()) + "." + randomBytes(24).toString("base64url");
  return {
    state,
    cookieValue: state + "." + signState(state, secret)
  };
};

export const isValidState = (cookieValue, requestedState, secret) => {
  if (!cookieValue || !requestedState) return false;

  const signatureBoundary = cookieValue.lastIndexOf(".");
  if (signatureBoundary <= 0) return false;

  const state = cookieValue.slice(0, signatureBoundary);
  const signature = cookieValue.slice(signatureBoundary + 1);
  const issuedAt = Number(state.split(".")[0]);
  const age = Date.now() - issuedAt;

  if (!Number.isFinite(issuedAt) || age < 0 || age > STATE_TTL_MS) return false;
  if (!safeEqual(state, requestedState)) return false;

  return safeEqual(signature, signState(state, secret));
};

export const readCookie = (request, name) => {
  const header = request.headers.cookie || "";
  const entry = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(name + "="));

  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : "";
};

export const stateCookie = (value, maxAge = 600) =>
  STATE_COOKIE_NAME +
  "=" +
  encodeURIComponent(value) +
  "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=" +
  maxAge;

export const clearStateCookie = () => stateCookie("", 0);

export const stateCookieName = STATE_COOKIE_NAME;

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const sendErrorPage = (response, status, message) => {
  response.statusCode = status;
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(
    "<!doctype html><html lang=\"vi\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>CMS login</title></head><body style=\"font-family:system-ui,sans-serif;padding:2rem;background:#f5f1ec;color:#171312\"><h1>Không thể đăng nhập CMS</h1><p>" +
      escapeHtml(message) +
      "</p><p>Hãy đóng cửa sổ này và thử lại, hoặc liên hệ người quản trị website.</p></body></html>"
  );
};
