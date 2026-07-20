import { createState, getCmsConfig, sendErrorPage, stateCookie } from "./_oauth.js";

export default function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return sendErrorPage(response, 405, "Phương thức không được hỗ trợ.");
  }

  try {
    const config = getCmsConfig();
    const { state, cookieValue } = createState(config.stateSecret);
    const authorizeUrl = new URL("https://github.com/login/oauth/authorize");

    authorizeUrl.searchParams.set("client_id", config.clientId);
    authorizeUrl.searchParams.set("redirect_uri", config.callbackUrl);
    authorizeUrl.searchParams.set("scope", config.scope);
    authorizeUrl.searchParams.set("state", state);

    response.statusCode = 302;
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("Set-Cookie", stateCookie(cookieValue));
    response.setHeader("Location", authorizeUrl.toString());
    response.end();
  } catch {
    sendErrorPage(response, 500, "CMS chưa được cấu hình đầy đủ trên Vercel.");
  }
}
