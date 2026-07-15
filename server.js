const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || (process.env.RENDER ? "0.0.0.0" : "127.0.0.1");
const AUTH_COOKIE = "lumofy_session";
const VALID_USERNAME = "user";
const VALID_PASSWORD = "user";
const AUTH_TOKEN = crypto
  .createHash("sha256")
  .update(`${VALID_USERNAME}:${VALID_PASSWORD}:lumofy-preview`)
  .digest("hex");
const publicDir = path.join(__dirname, "public");
const sampleData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "sample-data.json"), "utf8")
);
const deploymentInfo = {
  commit: (process.env.RENDER_GIT_COMMIT || process.env.COMMIT_SHA || "local").slice(0, 7),
  branch: process.env.RENDER_GIT_BRANCH || process.env.BRANCH || "local",
  service: process.env.RENDER_SERVICE_NAME || "onboarding-lumofy"
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon"
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });

    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function parseCookies(req) {
  const header = req.headers.cookie;
  if (!header) {
    return {};
  }

  return header.split(";").reduce((cookies, part) => {
    const [rawKey, ...rawValue] = part.trim().split("=");
    cookies[rawKey] = decodeURIComponent(rawValue.join("="));
    return cookies;
  }, {});
}

function getSession(req) {
  const cookies = parseCookies(req);
  const token = cookies[AUTH_COOKIE];
  if (token !== AUTH_TOKEN) {
    return null;
  }

  return {
    username: VALID_USERNAME
  };
}

function setSessionCookie(res) {
  const isSecure = process.env.RENDER ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${AUTH_COOKIE}=${AUTH_TOKEN}; Path=/; HttpOnly; SameSite=Lax${isSecure}; Max-Age=86400`
  );
}

function clearSessionCookie(res) {
  res.setHeader(
    "Set-Cookie",
    `${AUTH_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
}

function sendUnauthorized(res) {
  sendJson(res, 401, { error: "Authentication required" });
}

function serveFile(filePath, res) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream"
    });
    res.end(content);
  });
}

function getDashboardStats(plans) {
  const now = new Date();
  const currentMonth = now.getUTCMonth();
  const currentYear = now.getUTCFullYear();

  return {
    employeesCurrentlyOnboarding: plans.filter((plan) =>
      ["preparing", "ready_for_day_1", "in_progress", "delayed", "awaiting_manager_confirmation"].includes(plan.status)
    ).length,
    startingThisWeek: plans.filter((plan) => plan.startWindow === "this_week").length,
    notReadyForDay1: plans.filter((plan) => plan.status === "preparing" || plan.status === "delayed").length,
    overdueTasks: plans.reduce((sum, plan) => sum + plan.overdueTasks, 0),
    awaitingManagerAction: plans.filter((plan) => plan.status === "awaiting_manager_confirmation").length,
    completingThisMonth: plans.filter((plan) => {
      if (!plan.projectedCompletionDate) {
        return false;
      }
      const projected = new Date(plan.projectedCompletionDate);
      return projected.getUTCMonth() === currentMonth && projected.getUTCFullYear() === currentYear;
    }).length
  };
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);

  if (requestUrl.pathname === "/api/health") {
    sendJson(res, 200, {
      status: "ok",
      deployment: deploymentInfo
    });
    return;
  }

  if (requestUrl.pathname === "/api/session") {
    const session = getSession(req);
    sendJson(res, 200, {
      authenticated: Boolean(session),
      username: session ? session.username : null
    });
    return;
  }

  if (requestUrl.pathname === "/api/login" && req.method === "POST") {
    readBody(req)
      .then((body) => {
        const { username, password } = JSON.parse(body || "{}");

        if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
          sendJson(res, 401, { error: "Invalid username or password" });
          return;
        }

        setSessionCookie(res);
        sendJson(res, 200, {
          authenticated: true,
          username
        });
      })
      .catch(() => {
        sendJson(res, 400, { error: "Invalid request" });
      });
    return;
  }

  if (requestUrl.pathname === "/api/logout" && req.method === "POST") {
    clearSessionCookie(res);
    sendJson(res, 200, { authenticated: false });
    return;
  }

  if (requestUrl.pathname === "/api/onboarding") {
    sendJson(res, 200, {
      generatedAt: new Date().toISOString(),
      deployment: deploymentInfo,
      stats: getDashboardStats(sampleData.plans),
      ...sampleData
    });
    return;
  }

  let filePath = path.join(publicDir, requestUrl.pathname === "/" ? "index.html" : requestUrl.pathname);
  filePath = path.normalize(filePath);

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (!error && stats.isDirectory()) {
      serveFile(path.join(filePath, "index.html"), res);
      return;
    }

    if (error) {
      serveFile(path.join(publicDir, "index.html"), res);
      return;
    }

    serveFile(filePath, res);
  });
});

server.listen(PORT, HOST, () => {
  console.log(
    `Lumofy onboarding UI running on http://${HOST}:${PORT} (${deploymentInfo.branch}@${deploymentInfo.commit})`
  );
});
