import {
  clearStateCookie,
  getCmsConfig,
  isValidState,
  readCookie,
  sendErrorPage,
  stateCookieName
} from "./_oauth.js";

const buildSuccessPage = (token, allowedOrigin) => {
  const message =
    "authorization:github:success:" +
    JSON.stringify({ token, provider: "github" });
  const serializedMessage = JSON.stringify(message).replace(/</g, "\\u003c");
  const serializedOrigin = JSON.stringify(allowedOrigin).replace(/</g, "\\u003c");

  return (
    "<!doctype html><html lang=\"vi\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>CMS login</title></head><body><script>(function(){var allowedOrigin=" +
    serializedOrigin +
    ";var message=" +
    serializedMessage +
    ";function receiveMessage(event){if(event.origin!==allowedOrigin){return;}if(window.opener){window.opener.postMessage(message,allowedOrigin);}window.removeEventListener('message',receiveMessage,false);window.close();}window.addEventListener('message',receiveMessage,false);if(window.opener){window.opener.postMessage('authorizing:github',allowedOrigin);}})();</script><p>Đăng nhập thành công. Cửa sổ này sẽ tự đóng.</p></body></html>"
  );
};

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return sendErrorPage(response, 405, "Phương thức không được hỗ trợ.");
  }

  try {
    const config = getCmsConfig();
    const requestUrl = new URL(request.url, config.callbackUrl);
    const error = requestUrl.searchParams.get("error");
    const code = requestUrl.searchParams.get("code");
    const state = requestUrl.searchParams.get("state");
    const storedState = readCookie(request, stateCookieName);

    response.setHeader("Cache-Control", "no-store");
    response.setHeader("Set-Cookie", clearStateCookie());

    if (error || !code) {
      return sendErrorPage(response, 400, "GitHub đã hủy hoặc từ chối yêu cầu đăng nhập.");
    }

    if (!isValidState(storedState, state, config.stateSecret)) {
      return sendErrorPage(response, 400, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.");
    }

    const body = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.callbackUrl
    });

    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body.toString()
    });
    const tokenPayload = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenPayload.access_token) {
      return sendErrorPage(response, 502, "GitHub không trả về quyền truy cập CMS.");
    }

    response.statusCode = 200;
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.setHeader(
      "Content-Security-Policy",
      "default-src 'none'; script-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'"
    );
    response.end(buildSuccessPage(tokenPayload.access_token, config.allowedOrigin));
  } catch {
    sendErrorPage(response, 500, "Có lỗi trong quá trình xác thực CMS.");
  }
}
