const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || (process.env.RENDER ? "0.0.0.0" : "127.0.0.1");
const AUTH_COOKIE = "lumofy_session";
const SESSION_SECRET = "lumofy-preview";
const publicDir = path.join(__dirname, "public");
const loginHtmlPath = path.join(publicDir, "login.html");
const accountsPath = path.join(__dirname, "data", "accounts.json");
const uploadsDir = path.join(publicDir, "uploads");
const protectedHtmlRoutes = new Set([
  "/",
  "/index.html",
  "/employees.html",
  "/tree.html",
  "/plan.html",
  "/engagement.html"
]);
const sampleData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "sample-data.json"), "utf8")
);
const DEFAULT_PROFILE_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Default_pfp.jpg/250px-Default_pfp.jpg";
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

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "user";
}

function hashSession(accountId) {
  return crypto
    .createHash("sha256")
    .update(`${accountId}:${SESSION_SECRET}`)
    .digest("hex");
}

function buildPermissions(accessLevel) {
  const permissionMap = {
    full_access: [
      "dashboard:view",
      "employees:view",
      "tree:view",
      "plans:view",
      "plans:edit",
      "plans:create",
      "engagement:view",
      "accounts:edit",
      "reports:view",
      "admin:manage"
    ],
    hr_admin: [
      "dashboard:view",
      "employees:view",
      "tree:view",
      "plans:view",
      "plans:edit",
      "plans:create",
      "engagement:view",
      "accounts:edit",
      "reports:view"
    ],
    manager_access: [
      "dashboard:view",
      "employees:view",
      "tree:view",
      "plans:view",
      "plans:edit",
      "engagement:view",
      "accounts:edit"
    ],
    employee_access: [
      "dashboard:view",
      "plans:view",
      "engagement:view",
      "accounts:edit"
    ]
  };

  return permissionMap[accessLevel] || permissionMap.employee_access;
}

function deriveAccessLevel(employee) {
  const role = String(employee.jobTitle || "").toLowerCase();
  const department = String(employee.department || "").toLowerCase();
  const name = String(employee.fullName || "").toLowerCase();

  if (name === "ahmed faraj" || name === "mahmood malik") {
    return "full_access";
  }

  if (department.includes("people") || role.includes("hr")) {
    return "hr_admin";
  }

  if (
    role.includes("lead") ||
    role.includes("director") ||
    role.includes("manager") ||
    role.includes("founder") ||
    role.includes("cofounder") ||
    role.includes("coo")
  ) {
    return "manager_access";
  }

  return "employee_access";
}

function buildDefaultAccounts() {
  const accountMap = new Map();

  (sampleData.employees || []).forEach((employee, index) => {
    const id = `acct-${String(index + 1).padStart(3, "0")}`;
    const displayName = employee.fullName;
    const accessLevel = deriveAccessLevel(employee);
    accountMap.set(displayName, {
      id,
      displayName,
      username: slugify(displayName),
      password: "user",
      profileImage: DEFAULT_PROFILE_IMAGE,
      department: employee.department || "Unassigned",
      role: employee.jobTitle || "Unassigned Role",
      accessLevel,
      permissions: buildPermissions(accessLevel)
    });
  });

  (sampleData.engagement?.leaderboard || []).forEach((entry) => {
    if (!accountMap.has(entry.name)) {
      accountMap.set(entry.name, {
        id: `acct-${String(accountMap.size + 1).padStart(3, "0")}`,
        displayName: entry.name,
        username: slugify(entry.name),
        password: "user",
        profileImage: DEFAULT_PROFILE_IMAGE,
        department: "Unassigned",
        role: "Lumofy Team Member",
        accessLevel: "employee_access",
        permissions: buildPermissions("employee_access")
      });
    }
  });

  accountMap.set("Mohammed Jaber", {
    id: `acct-${String(accountMap.size + 1).padStart(3, "0")}`,
    displayName: "Mohammed Jaber",
    username: "mohammed-jaber",
    password: "user",
    profileImage: DEFAULT_PROFILE_IMAGE,
    department: "Engineering",
    role: "Platform Developer",
    accessLevel: "full_access",
    permissions: buildPermissions("full_access")
  });

  return Array.from(accountMap.values());
}

function ensureAccountsFile() {
  if (!fs.existsSync(accountsPath)) {
    fs.writeFileSync(accountsPath, JSON.stringify(buildDefaultAccounts(), null, 2));
  }
}

function readAccounts() {
  ensureAccountsFile();
  const accounts = JSON.parse(fs.readFileSync(accountsPath, "utf8"));
  const normalized = accounts.map((account) => ({
    ...account,
    profileImage: account.profileImage || DEFAULT_PROFILE_IMAGE,
    accessLevel: account.accessLevel || "employee_access",
    permissions: Array.isArray(account.permissions)
      ? account.permissions
      : buildPermissions(account.accessLevel || "employee_access")
  }));
  if (!normalized.find((account) => account.displayName === "Mohammed Jaber")) {
    normalized.push({
      id: `acct-${String(normalized.length + 1).padStart(3, "0")}`,
      displayName: "Mohammed Jaber",
      username: "mohammed-jaber",
      password: "user",
      profileImage: DEFAULT_PROFILE_IMAGE,
      department: "Engineering",
      role: "Platform Developer",
      accessLevel: "full_access",
      permissions: buildPermissions("full_access")
    });
  }
  if (JSON.stringify(accounts) !== JSON.stringify(normalized)) {
    writeAccounts(normalized);
  }
  return normalized;
}

function writeAccounts(accounts) {
  fs.writeFileSync(accountsPath, JSON.stringify(accounts, null, 2));
}

function ensureUploadsDir() {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

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

function parseFormBody(body) {
  const params = new URLSearchParams(body);
  return Object.fromEntries(params.entries());
}

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const contentType = req.headers["content-type"] || "";
    const match = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    if (!match) {
      reject(new Error("Missing multipart boundary"));
      return;
    }

    const boundary = `--${match[1] || match[2]}`;
    const chunks = [];

    req.on("data", (chunk) => {
      chunks.push(chunk);
      const total = chunks.reduce((sum, item) => sum + item.length, 0);
      if (total > 10 * 1024 * 1024) {
        reject(new Error("Multipart body too large"));
        req.destroy();
      }
    });

    req.on("end", () => {
      const buffer = Buffer.concat(chunks);
      const parts = buffer.toString("binary").split(boundary).slice(1, -1);
      const fields = {};
      const files = [];

      parts.forEach((part) => {
        const trimmed = part.replace(/^\r\n/, "").replace(/\r\n$/, "");
        const headerEnd = trimmed.indexOf("\r\n\r\n");
        if (headerEnd === -1) {
          return;
        }

        const headerText = trimmed.slice(0, headerEnd);
        const bodyBinary = trimmed.slice(headerEnd + 4);
        const dispositionLine = headerText
          .split("\r\n")
          .find((line) => line.toLowerCase().startsWith("content-disposition"));

        if (!dispositionLine) {
          return;
        }

        const nameMatch = dispositionLine.match(/name="([^"]+)"/i);
        const filenameMatch = dispositionLine.match(/filename="([^"]*)"/i);
        const typeLine = headerText
          .split("\r\n")
          .find((line) => line.toLowerCase().startsWith("content-type"));

        const name = nameMatch ? nameMatch[1] : "";
        const bodyBuffer = Buffer.from(bodyBinary, "binary");

        if (filenameMatch && filenameMatch[1]) {
          files.push({
            fieldName: name,
            filename: filenameMatch[1],
            contentType: typeLine ? typeLine.split(":")[1].trim() : "application/octet-stream",
            buffer: bodyBuffer
          });
        } else {
          fields[name] = bodyBuffer.toString("utf8");
        }
      });

      resolve({ fields, files });
    });

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
  if (!token) {
    return null;
  }

  const [accountId, signature] = token.split(".");
  if (!accountId || signature !== hashSession(accountId)) {
    return null;
  }

  const account = readAccounts().find((entry) => entry.id === accountId);
  if (!account) {
    return null;
  }

  return {
    accountId: account.id,
    username: account.username,
    displayName: account.displayName,
    profileImage: account.profileImage,
    department: account.department,
    role: account.role,
    accessLevel: account.accessLevel,
    permissions: account.permissions
  };
}

function setSessionCookie(res, accountId) {
  const isSecure = process.env.RENDER ? "; Secure" : "";
  const token = `${accountId}.${hashSession(accountId)}`;
  res.setHeader(
    "Set-Cookie",
    `${AUTH_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax${isSecure}; Max-Age=86400`
  );
}

function clearSessionCookie(res) {
  res.setHeader(
    "Set-Cookie",
    `${AUTH_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
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
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": "no-store, no-cache, must-revalidate"
    });
    res.end(content);
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getAccountEngagement(account) {
  const leaderboard = sampleData.engagement?.leaderboard || [];
  const games = sampleData.engagement?.games || [];
  const rankEntry = leaderboard.find((entry) => entry.name === account.displayName);
  const featuredGames = games.filter((game) => game.name === rankEntry?.game);

  return {
    rankEntry: rankEntry || null,
    featuredGames: featuredGames.length ? featuredGames : games.slice(0, 2)
  };
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

function buildAppPayload(session) {
  const accounts = readAccounts();
  const account = accounts.find((entry) => entry.id === session?.accountId) || null;
  const engagement = account ? getAccountEngagement(account) : { rankEntry: null, featuredGames: [] };

  return {
    generatedAt: new Date().toISOString(),
    deployment: deploymentInfo,
    stats: getDashboardStats(sampleData.plans),
    currentUser: account
      ? {
          id: account.id,
          username: account.username,
          displayName: account.displayName,
          department: account.department,
          role: account.role,
          profileImage: account.profileImage,
          accessLevel: account.accessLevel,
          permissions: account.permissions,
          rank: engagement.rankEntry ? engagement.rankEntry.rank : null,
          elo: engagement.rankEntry ? engagement.rankEntry.elo : null,
          game: engagement.rankEntry ? engagement.rankEntry.game : null
        }
      : null,
    ...sampleData
  };
}

function buildAccountPanel(session, query, pathname) {
  const success = query.get("account") === "updated";
  const avatarUploaded = query.get("avatar") === "updated";
  return `
    <div class="account-panel">
      <p class="eyebrow">Signed In</p>
      <div class="account-identity">
        <img class="profile-avatar profile-avatar-large" src="${escapeHtml(session.profileImage || DEFAULT_PROFILE_IMAGE)}" alt="${escapeHtml(session.displayName)}" />
        <div>
          <strong class="account-name">${escapeHtml(session.displayName)}</strong>
          <p class="account-meta">${escapeHtml(session.role || "Lumofy User")}</p>
          <p class="account-meta">@${escapeHtml(session.username)}</p>
          <p class="account-meta">${escapeHtml(String(session.accessLevel || "employee_access").replaceAll("_", " "))}</p>
        </div>
      </div>
      ${success ? '<p class="account-success">Account details updated.</p>' : ""}
      ${avatarUploaded ? '<p class="account-success">Profile picture updated.</p>' : ""}
      <form class="account-form" method="post" action="/account/update">
        <input type="hidden" name="from" value="${escapeHtml(pathname || "/")}" />
        <label class="field">
          <span>Display name</span>
          <input name="displayName" type="text" value="${escapeHtml(session.displayName)}" required />
        </label>
        <label class="field">
          <span>New password</span>
          <input name="password" type="password" placeholder="Change password" required />
        </label>
        <label class="field">
          <span>Profile picture URL</span>
          <input name="profileImage" type="url" value="${escapeHtml(session.profileImage || DEFAULT_PROFILE_IMAGE)}" required />
        </label>
        <button class="primary-button account-save" type="submit">Save account</button>
      </form>
      <form class="account-form" method="post" action="/account/upload-avatar" enctype="multipart/form-data">
        <input type="hidden" name="from" value="${escapeHtml(pathname || "/")}" />
        <label class="field">
          <span>Upload profile picture</span>
          <input name="avatar" type="file" accept="image/png,image/jpeg,image/webp,image/gif" required />
        </label>
        <button class="ghost-button account-save" type="submit">Upload picture</button>
      </form>
      <form method="post" action="/logout">
        <button class="secondary-button" type="submit">Log Out</button>
      </form>
    </div>
  `;
}

function buildTopbarAccount(session) {
  return `
    <div class="topbar-user">
      <img class="profile-avatar" src="${escapeHtml(session.profileImage || DEFAULT_PROFILE_IMAGE)}" alt="${escapeHtml(session.displayName)}" />
      <div class="topbar-user-copy">
        <strong>${escapeHtml(session.displayName)}</strong>
        <span>@${escapeHtml(session.username)}</span>
      </div>
      <form method="post" action="/logout">
        <button class="ghost-button" type="submit">Log out</button>
      </form>
    </div>
  `;
}

function buildEngagementSpotlight(session) {
  const accounts = readAccounts();
  const account = accounts.find((entry) => entry.id === session.accountId);
  const { rankEntry, featuredGames } = getAccountEngagement(account);
  const rankLabel = rankEntry
    ? `#${rankEntry.rank} in ${escapeHtml(rankEntry.game)} · ELO ${rankEntry.elo}`
    : "Not ranked yet";

  return `
    <section class="panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Your Engagement</p>
          <h3>${escapeHtml(account.displayName)}</h3>
          <p class="section-copy">Current account context, linked to the leaderboard and available games.</p>
        </div>
      </div>
      <div class="stack">
        <article class="manager-card">
          <div class="spotlight-head">
            <img class="profile-avatar profile-avatar-large" src="${escapeHtml(account.profileImage || DEFAULT_PROFILE_IMAGE)}" alt="${escapeHtml(account.displayName)}" />
            <div>
              <strong>${rankLabel}</strong>
              <p class="muted">${escapeHtml(account.role || "Lumofy User")}</p>
            </div>
          </div>
        </article>
        ${featuredGames
          .map(
            (game) => `
              <article class="asset-card">
                <strong>${escapeHtml(game.name)}</strong>
                <p>${escapeHtml(game.description)}</p>
                <p class="muted">${escapeHtml(game.format)}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function buildGameSelectionSection() {
  const games = sampleData.engagement?.games || [];
  const leaderboard = sampleData.engagement?.leaderboard || [];
  const byGame = new Map();

  leaderboard.forEach((entry) => {
    const current = byGame.get(entry.game);
    if (!current || Number(entry.elo || 0) > Number(current.elo || 0)) {
      byGame.set(entry.game, entry);
    }
  });

  const rankedGames = games
    .map((game) => ({
      ...game,
      champion: byGame.get(game.name) || null,
      score: byGame.get(game.name) ? Number(byGame.get(game.name).elo || 0) : 0
    }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  return `
    <section class="panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Game Selection</p>
          <h3>Best games by strongest current players</h3>
          <p class="section-copy">Higher ELO ranks a game higher. The top player attached to each game drives its position.</p>
        </div>
      </div>
      <div class="stack">
        ${rankedGames
          .map(
            (game, index) => `
              <article class="manager-card game-selection-card">
                <div class="pill-row">
                  <span class="leaderboard-rank game-selection-rank">${index + 1}</span>
                  <span class="pill">${escapeHtml(game.name)}</span>
                  <span class="status-pill status-in_progress">${game.champion ? `ELO ${game.champion.elo}` : "Open"}</span>
                </div>
                <strong>${escapeHtml(game.name)}</strong>
                <p>${escapeHtml(game.description)}</p>
                <p class="muted">${escapeHtml(game.format)}</p>
                <p class="muted">${game.champion ? `Top player: ${escapeHtml(game.champion.name)}` : "No ranked player yet"}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function buildLoginUserOptions(accounts, selectedAccountId) {
  return accounts
    .map((account) => {
      const checked = account.id === selectedAccountId ? "checked" : "";
      return `
        <label class="login-user-card">
          <input class="login-user-input" type="radio" name="accountId" value="${escapeHtml(account.id)}" ${checked} required />
          <img class="profile-avatar login-user-avatar" src="${escapeHtml(account.profileImage || DEFAULT_PROFILE_IMAGE)}" alt="${escapeHtml(account.displayName)}" />
          <span class="login-user-copy">
            <strong>${escapeHtml(account.displayName)}</strong>
            <span>${escapeHtml(account.role || "Lumofy User")}</span>
          </span>
        </label>
      `;
    })
    .join("");
}

function buildLoginLeaderboard() {
  return (sampleData.engagement?.leaderboard || [])
    .slice(0, 3)
    .map(
      (entry) => `
        <article class="leaderboard-card">
          <div class="pill-row">
            <span class="leaderboard-rank">${entry.rank}</span>
            <span class="pill">${escapeHtml(entry.game)}</span>
            <span class="status-pill status-in_progress">ELO ${entry.elo}</span>
          </div>
          <strong>${escapeHtml(entry.name)}</strong>
        </article>
      `
    )
    .join("");
}

function serveLoginPage(res, requestUrl) {
  fs.readFile(loginHtmlPath, "utf8", (error, content) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const accounts = readAccounts();
    const selectedAccountId = requestUrl.searchParams.get("accountId") || accounts[0]?.id || "";
    const loginMarkup = content
      .replace("__LOGIN_USER_OPTIONS__", buildLoginUserOptions(accounts, selectedAccountId))
      .replace("__LOGIN_LEADERBOARD__", buildLoginLeaderboard());

    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate"
    });
    res.end(loginMarkup);
  });
}

function serveAppPage(filePath, res, req, requestUrl) {
  fs.readFile(filePath, "utf8", (error, content) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const session = getSession(req);
    const payload = JSON.stringify(buildAppPayload(session)).replace(/</g, "\\u003c");
    let injected = content.replace(
      "__ONBOARDING_DATA_SCRIPT__",
      `<script>window.__ONBOARDING_DATA__ = ${payload};</script>`
    );

    injected = injected
      .replace("__TOPBAR_ACCOUNT__", buildTopbarAccount(session))
      .replace("__ACCOUNT_PANEL__", buildAccountPanel(session, requestUrl.searchParams, requestUrl.pathname))
      .replace("__ENGAGEMENT_SPOTLIGHT__", requestUrl.pathname === "/engagement.html" ? buildEngagementSpotlight(session) : "")
      .replace("__GAME_SELECTION__", requestUrl.pathname === "/engagement.html" ? buildGameSelectionSection() : "");

    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate"
    });
    res.end(injected);
  });
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);

  if (requestUrl.pathname === "/api/health") {
    sendJson(res, 200, { status: "ok", deployment: deploymentInfo });
    return;
  }

  if (requestUrl.pathname === "/api/session") {
    const session = getSession(req);
    sendJson(res, 200, {
      authenticated: Boolean(session),
      username: session ? session.username : null,
      displayName: session ? session.displayName : null
    });
    return;
  }

  if (requestUrl.pathname === "/login" && req.method === "GET") {
    serveLoginPage(res, requestUrl);
    return;
  }

  if (requestUrl.pathname === "/login" && req.method === "POST") {
    readBody(req)
      .then((body) => {
        const { accountId = "", password = "" } = parseFormBody(body || "");
        const account = readAccounts().find((entry) => entry.id === accountId);

        if (!account || password !== account.password) {
          res.writeHead(303, { Location: `/login?error=1&accountId=${encodeURIComponent(accountId)}` });
          res.end();
          return;
        }

        setSessionCookie(res, account.id);
        res.writeHead(303, { Location: "/" });
        res.end();
      })
      .catch(() => {
        res.writeHead(303, { Location: "/login?error=1" });
        res.end();
      });
    return;
  }

  if (requestUrl.pathname === "/account/update" && req.method === "POST") {
    const session = getSession(req);
    if (!session) {
      res.writeHead(303, { Location: "/login" });
      res.end();
      return;
    }

    readBody(req)
      .then((body) => {
        const { displayName = "", password = "", from = "", profileImage = "" } = parseFormBody(body || "");
        const accounts = readAccounts();
        const index = accounts.findIndex((entry) => entry.id === session.accountId);

        if (index === -1 || !displayName.trim() || !password.trim()) {
          res.writeHead(303, { Location: "/?account=error" });
          res.end();
          return;
        }

        accounts[index] = {
          ...accounts[index],
          displayName: displayName.trim(),
          username: slugify(displayName),
          password: password.trim(),
          profileImage: profileImage.trim() || DEFAULT_PROFILE_IMAGE
        };
        writeAccounts(accounts);
        setSessionCookie(res, session.accountId);
        const normalizedFrom = `/${String(from).replace(/^\//, "")}`.replace("//", "/");
        const backTo = protectedHtmlRoutes.has(normalizedFrom) ? normalizedFrom : "/";
        res.writeHead(303, { Location: `${backTo}?account=updated` });
        res.end();
      })
      .catch(() => {
        res.writeHead(303, { Location: "/?account=error" });
        res.end();
      });
    return;
  }

  if (requestUrl.pathname === "/account/upload-avatar" && req.method === "POST") {
    const session = getSession(req);
    if (!session) {
      res.writeHead(303, { Location: "/login" });
      res.end();
      return;
    }

    parseMultipart(req)
      .then(({ fields, files }) => {
        const file = files.find((entry) => entry.fieldName === "avatar");
        const normalizedFrom = `/${String(fields.from || "").replace(/^\//, "")}`.replace("//", "/");
        const backTo = protectedHtmlRoutes.has(normalizedFrom) ? normalizedFrom : "/";

        if (!file || !file.buffer.length) {
          res.writeHead(303, { Location: `${backTo}?account=error` });
          res.end();
          return;
        }

        const allowedTypes = new Map([
          ["image/png", ".png"],
          ["image/jpeg", ".jpg"],
          ["image/webp", ".webp"],
          ["image/gif", ".gif"]
        ]);
        const ext = allowedTypes.get(file.contentType);
        if (!ext) {
          res.writeHead(303, { Location: `${backTo}?account=error` });
          res.end();
          return;
        }

        ensureUploadsDir();
        const filename = `${session.accountId}-${Date.now()}${ext}`;
        fs.writeFileSync(path.join(uploadsDir, filename), file.buffer);

        const accounts = readAccounts();
        const index = accounts.findIndex((entry) => entry.id === session.accountId);
        if (index === -1) {
          res.writeHead(303, { Location: `${backTo}?account=error` });
          res.end();
          return;
        }

        accounts[index] = {
          ...accounts[index],
          profileImage: `/uploads/${filename}`
        };
        writeAccounts(accounts);
        setSessionCookie(res, session.accountId);
        res.writeHead(303, { Location: `${backTo}?avatar=updated` });
        res.end();
      })
      .catch(() => {
        res.writeHead(303, { Location: "/?account=error" });
        res.end();
      });
    return;
  }

  if (requestUrl.pathname === "/logout" && req.method === "POST") {
    clearSessionCookie(res);
    res.writeHead(303, { Location: "/login" });
    res.end();
    return;
  }

  if (requestUrl.pathname === "/api/onboarding") {
    sendJson(res, 200, buildAppPayload(getSession(req)));
    return;
  }

  if (requestUrl.pathname === "/") {
    if (!getSession(req)) {
      serveLoginPage(res, requestUrl);
      return;
    }

    serveAppPage(path.join(publicDir, "index.html"), res, req, requestUrl);
    return;
  }

  let filePath = path.join(publicDir, requestUrl.pathname === "/" ? "index.html" : requestUrl.pathname);
  filePath = path.normalize(filePath);

  if (protectedHtmlRoutes.has(requestUrl.pathname) && !getSession(req)) {
    serveLoginPage(res, requestUrl);
    return;
  }

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (!error && stats.isDirectory()) {
      serveAppPage(path.join(filePath, "index.html"), res, req, requestUrl);
      return;
    }

    if (error) {
      serveAppPage(path.join(publicDir, "index.html"), res, req, requestUrl);
      return;
    }

    if (path.extname(filePath).toLowerCase() === ".html" && protectedHtmlRoutes.has(requestUrl.pathname)) {
      serveAppPage(filePath, res, req, requestUrl);
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
