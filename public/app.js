const addPlanButton = document.getElementById("add-plan-button");
const addPlanForm = document.getElementById("add-plan-form");
const cancelPlanButton = document.getElementById("cancel-plan-button");
const roleTreeRoot = document.getElementById("role-tree");
const deploymentBadge = document.getElementById("deployment-badge");
const employeeRows = document.getElementById("employee-rows");
const employeeSummaryCards = document.getElementById("employee-summary-cards");
const departmentBreakdown = document.getElementById("department-breakdown");
const treeSummaryCards = document.getElementById("tree-summary-cards");
const engagementSummaryCards = document.getElementById("engagement-summary-cards");
const leaderboardList = document.getElementById("leaderboard-list");
const gamesList = document.getElementById("games-list");
const gamePlayground = document.getElementById("game-playground");
const addEmployeeButton = document.getElementById("add-employee-button");
const addEmployeeForm = document.getElementById("add-employee-form");
const cancelEmployeeButton = document.getElementById("cancel-employee-button");
const publicChatList = document.getElementById("public-chat-list");
const privateChatList = document.getElementById("private-chat-list");
const publicChatForm = document.getElementById("public-chat-form");
const privateChatForm = document.getElementById("private-chat-form");
const privateChatRecipient = document.getElementById("private-chat-recipient");
let onboardingData = null;
let selectedEmployeeId = null;
let activeGame = null;
let gameState = null;

function normalizeDepartmentName(value) {
  return String(value || "").trim();
}

function getEmployeesData() {
  return onboardingData?.employeeControl?.employees || onboardingData?.employees || [];
}

function getCurrentUser() {
  return onboardingData?.currentUser || null;
}

function getEmployeeManager(employee) {
  const managerMap = getManagerMap();
  return employee.manager || managerMap.get(employee.fullName) || "Ahmed Faraj";
}

function getSelectedEmployee() {
  const employees = getEmployeesData();
  if (!employees.length) {
    return null;
  }
  if (!selectedEmployeeId || !employees.find((employee) => employee.id === selectedEmployeeId)) {
    selectedEmployeeId = employees[0].id;
  }
  return employees.find((employee) => employee.id === selectedEmployeeId) || employees[0];
}

function getEmployeeWorkspaceNode() {
  return document.getElementById("employee-workspace");
}

function getEmployeeRoleForm() {
  return document.getElementById("employee-role-form");
}

function getClockInButton() {
  return document.getElementById("clock-in-button");
}

function getClockOutButton() {
  return document.getElementById("clock-out-button");
}

function buildEmployeeMap(employees) {
  return new Map(employees.map((employee) => [employee.fullName, employee]));
}

function getManagerMap() {
  return new Map([
    ["Mahmood Malik", "Ahmed Faraj"],
    ["Hasan Baqer Alhashimi", "Mahmood Malik"],
    ["Hussain AlSayyad", "Mahmood Malik"],
    ["Safa Alfulaij", "Mahmood Malik"],
    ["Shehab Mohamed ElHadi", "Mahmood Malik"],
    ["Reem Sharar", "Mahmood Malik"],
    ["Suzan Alkhriesat", "Mahmood Malik"],
    ["Nouha Esmail", "Mahmood Malik"],
    ["Mahmoud Elreweny", "Mahmood Malik"],
    ["Sayed Jehad Saeed Hasan", "Mahmood Malik"],
    ["Qasim AlShakhoori", "Mahmoud Elreweny"],

    ["Fatima Almasoud", "Hussain AlSayyad"],
    ["Rania Belal Mohammad Qasim", "Sara Mashrour"],
    ["Sara Mashrour", "Hussain AlSayyad"],

    ["Abdulrahman Mohamed AlTayeb", "Safa Alfulaij"],
    ["Adel El Nabarawy", "Safa Alfulaij"],
    ["Ahmad Hisham Yousif ElSayed", "Safa Alfulaij"],
    ["Ahmed Ibrahim", "Safa Alfulaij"],
    ["Ali Husain", "Safa Alfulaij"],
    ["Assma Tawfik Ali Ben Mussa", "Safa Alfulaij"],
    ["Mosses Oderinde", "Safa Alfulaij"],

    ["Ahmed Abdelrahem elsagher", "Qasim AlShakhoori"],
    ["Mohamed AbdulHadi Isa Shamlooh", "Qasim AlShakhoori"],

    ["Zainab Abdulla Ali Haider Ali", "Ali Maki Isa Ahmed Abbas"],
    ["Ali Maki Isa Ahmed Abbas", "Mahmoud Elreweny"],

    ["Abdelrahman tarek", "Shehab Mohamed ElHadi"],
    ["Mohamed Ahmed Mohamed Abel Wahab", "Shehab Mohamed ElHadi"],

    ["Sayed Hussain Asaad Ali Almukhtar", "Reem Sharar"],
    ["Tasneem ElGhareeb", "Reem Sharar"],

    ["Mustafa Mahmood Asghar AbdulWahab", "Suzan Alkhriesat"],
    ["Zahid Zaidi", "Suzan Alkhriesat"],

    ["Eman Farag Ktob", "Nouha Esmail"],
    ["Mary Ashraf", "Nouha Esmail"],
    ["Mohammed Jaber", "Safa Alfulaij"],

    ["Sayed Jehad Saeed Hasan", "Mahmood Malik"]
  ]);
}

function derivePlansFromEmployees(employees) {
  const managerMap = getManagerMap();
  const statuses = ["completed", "in_progress", "awaiting_manager_confirmation", "ready_for_day_1"];

  return employees.map((employee, index) => {
    const department = normalizeDepartmentName(employee.department);
    const managerName = employee.fullName === "Ahmed Faraj"
      ? "Board / Founder"
      : (employee.manager || managerMap.get(employee.fullName) || "Ahmed Faraj");
    const isNewHire = employee.employmentStatus === "new hire";
    const status = isNewHire ? "preparing" : statuses[index % statuses.length];
    const progress = isNewHire ? 22 : status === "completed" ? 100 : status === "awaiting_manager_confirmation" ? 94 : status === "ready_for_day_1" ? 76 : 61;
    const overdueTasks = isNewHire ? 1 : status === "in_progress" ? 1 : 0;
    const startDate = isNewHire ? "2026-07-22" : `2026-0${(index % 4) + 4}-${String((index % 20) + 1).padStart(2, "0")}`;
    const nextAction = isNewHire ? "Finish access, equipment, and buddy handoff" : status === "awaiting_manager_confirmation" ? "Manager completion confirmation" : status === "ready_for_day_1" ? "Confirm Day 1 schedule" : status === "in_progress" ? "Complete milestone check-in" : "Onboarding archived";
    const stage = isNewHire ? "Pre-Start" : status === "in_progress" ? "Week 1" : status === "awaiting_manager_confirmation" ? "Day 90" : status === "ready_for_day_1" ? "Pre-Start" : "Completed";

    return {
      id: `plan-${String(index + 1).padStart(3, "0")}`,
      employeeName: employee.fullName,
      role: employee.jobTitle || "Unassigned Role",
      department,
      manager: managerName,
      buddy: "Assigned by HR",
      status,
      startDate,
      daysSinceJoining: 0,
      progress,
      overdueTasks,
      nextAction,
      stage,
      startWindow: isNewHire ? "this_week" : "this_month",
      projectedCompletionDate: isNewHire ? "2026-10-20" : "2026-07-30",
      highlight: isNewHire ? "Imported as a new hire from headcount report" : "Imported from headcount report"
    };
  });
}

function deriveRoleTreeFromEmployees(employees) {
  const employeeMap = buildEmployeeMap(employees);
  const managerMap = getManagerMap();
  const childrenByManager = new Map();
  const rootName = "Ahmed Faraj";

  employees.forEach((employee) => {
    const manager = employee.fullName === rootName
      ? null
      : (employee.manager || managerMap.get(employee.fullName) || rootName);

    if (!manager) {
      return;
    }

    if (!childrenByManager.has(manager)) {
      childrenByManager.set(manager, []);
    }
    childrenByManager.get(manager).push(employee.fullName);
  });

  function buildNode(fullName) {
    const employee = employeeMap.get(fullName);
    const directReports = (childrenByManager.get(fullName) || [])
      .sort((a, b) => a.localeCompare(b))
      .map((reportName) => buildNode(reportName));

    if (!employee) {
      return {
        title: "Founder & CEO",
        name: fullName,
        children: directReports
      };
    }

    return {
      title: employee.jobTitle || normalizeDepartmentName(employee.department) || "Team Member",
      name: employee.fullName,
      children: directReports
    };
  }

  return [
    buildNode(rootName)
  ];
}

function hydrateData(data) {
  if (!Array.isArray(data.employees) || data.employees.length === 0) {
    return data;
  }

  const plans = derivePlansFromEmployees(data.employees);
  return {
    ...data,
    plans,
    roleTree: deriveRoleTreeFromEmployees(data.employees),
    stats: computeStats(plans)
  };
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) {
    node.textContent = value;
  }
}

function statusClass(value) {
  return `status-${String(value).toLowerCase().replaceAll(" ", "_")}`;
}

function formatDate(value) {
  const date = new Date(value);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function formatDateTime(value) {
  if (!value) {
    return "Not recorded";
  }

  const date = new Date(value);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

function renderSummaryCards(cards, stats) {
  const container = document.getElementById("summary-cards");
  if (!container) {
    return;
  }
  const resolved = cards.map((card) => {
    const map = {
      "Employees Currently Onboarding": stats.employeesCurrentlyOnboarding,
      "Starting This Week": stats.startingThisWeek,
      "Not Ready for Day 1": stats.notReadyForDay1,
      "Overdue Tasks": stats.overdueTasks,
      "Awaiting Manager Action": stats.awaitingManagerAction,
      "Completing This Month": stats.completingThisMonth
    };

    return {
      ...card,
      value: map[card.label] ?? card.value
    };
  });

  container.innerHTML = resolved
    .map(
      (card) => `
        <article class="metric-card ${card.tone}">
          <p class="eyebrow">${card.label}</p>
          <strong>${card.value}</strong>
        </article>
      `
    )
    .join("");
}

function computeStats(plans) {
  const now = new Date();
  const currentMonth = now.getUTCMonth();
  const currentYear = now.getUTCFullYear();

  return {
    employeesCurrentlyOnboarding: plans.filter((plan) =>
      ["preparing", "ready_for_day_1", "in_progress", "delayed", "awaiting_manager_confirmation"].includes(plan.status)
    ).length,
    startingThisWeek: plans.filter((plan) => plan.startWindow === "this_week").length,
    notReadyForDay1: plans.filter((plan) => plan.status === "preparing" || plan.status === "delayed").length,
    overdueTasks: plans.reduce((sum, plan) => sum + Number(plan.overdueTasks || 0), 0),
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

function renderPlans(plans) {
  const tbody = document.getElementById("plan-rows");
  if (!tbody) {
    return;
  }
  tbody.innerHTML = plans
    .map(
      (plan) => `
        <tr>
          <td>
            <div class="employee-identity">
              <strong>${plan.employeeName}</strong>
              <span class="muted">${plan.department}</span>
            </div>
          </td>
          <td>${plan.role}</td>
          <td>${formatDate(plan.startDate)}</td>
          <td>${plan.manager}</td>
          <td>
            <div class="progress-track">
              <div class="progress-bar" style="width: ${plan.progress}%"></div>
            </div>
            <div class="muted">${plan.progress}%</div>
          </td>
          <td>${plan.overdueTasks}</td>
          <td><span class="status-pill ${statusClass(plan.status)}">${plan.status.replaceAll("_", " ")}</span></td>
          <td>${plan.nextAction}</td>
        </tr>
      `
    )
    .join("");
}

function renderEmployees(employees) {
  if (!employeeRows) {
    return;
  }

  if (!selectedEmployeeId && employees.length) {
    selectedEmployeeId = employees[0].id;
  }

  employeeRows.innerHTML = employees
    .map((employee) => {
      const isSelected = employee.id === selectedEmployeeId;
      return `
        <tr class="${employee.id === selectedEmployeeId ? "is-selected" : ""}" data-employee-id="${employee.id}">
          <td>
            <strong>${employee.fullName}</strong>
            <div class="muted">${employee.email || "No Outlook email yet"}</div>
          </td>
          <td>${employee.jobTitle || "Unassigned Role"}</td>
          <td>${normalizeDepartmentName(employee.department)}</td>
          <td>${employee.employmentStatus}</td>
          <td>${getEmployeeManager(employee)}</td>
        </tr>
        ${isSelected ? `
          <tr class="employee-dropdown-row">
            <td colspan="5">
              <div class="employee-dropdown-card">
                <div class="employee-dropdown-head">
                  <p class="eyebrow">Selected Employee Control</p>
                  <span class="pill">Inline dropdown</span>
                </div>
                <div class="employee-workspace-card" id="employee-workspace"></div>
                <div class="clock-action-row">
                  <button class="primary-button utility-button" id="clock-in-button" type="button">Clock In</button>
                  <button class="ghost-button utility-button" id="clock-out-button" type="button">Clock Out</button>
                </div>
                <form class="inline-form compact-form" id="employee-role-form">
                  <label class="field">
                    <span>Role</span>
                    <input name="jobTitle" type="text" required />
                  </label>
                  <label class="field">
                    <span>Gender</span>
                    <select name="gender" required>
                      <option value="he/him">he/him</option>
                      <option value="she/her">she/her</option>
                    </select>
                  </label>
                  <label class="field">
                    <span>Manager</span>
                    <input name="manager" type="text" required />
                  </label>
                  <label class="field">
                    <span>Outlook Email</span>
                    <input name="email" type="email" />
                  </label>
                  <label class="field">
                    <span>Mobile Number</span>
                    <input name="phone" type="text" />
                  </label>
                  <label class="field">
                    <span>CPR</span>
                    <input name="cpr" type="text" />
                  </label>
                  <label class="field">
                    <span>Passport</span>
                    <input name="passport" type="text" />
                  </label>
                  <div class="form-actions">
                    <button class="primary-button" type="submit">Save Employee</button>
                  </div>
                </form>
              </div>
            </td>
          </tr>
        ` : ""}
      `;
    })
    .join("");

  if (employeeSummaryCards) {
    const active = employees.filter((employee) => employee.employmentStatus === "active").length;
    const newHires = employees.filter((employee) => employee.employmentStatus === "new hire").length;
    const departments = new Set(employees.map((employee) => normalizeDepartmentName(employee.department))).size;
    const managers = new Set(employees.map((employee) => getEmployeeManager(employee))).size;
    const clockedIn = employees.filter((employee) => employee.attendance && employee.attendance.clockedIn).length;

    employeeSummaryCards.innerHTML = [
      { label: "Total Employees", value: employees.length, tone: "neutral" },
      { label: "Active", value: active, tone: "accent" },
      { label: "New Hires", value: newHires, tone: "warn" },
      { label: "Departments", value: departments, tone: "neutral" },
      { label: "Reporting Managers", value: managers, tone: "accent" },
      { label: "Clocked In", value: clockedIn, tone: "neutral" }
    ]
      .map(
        (card) => `
          <article class="metric-card ${card.tone}">
            <p class="eyebrow">${card.label}</p>
            <strong>${card.value}</strong>
          </article>
        `
      )
      .join("");
  }

  if (departmentBreakdown) {
    const counts = new Map();
    employees.forEach((employee) => {
      const department = normalizeDepartmentName(employee.department) || "Unassigned";
      counts.set(department, (counts.get(department) || 0) + 1);
    });

    departmentBreakdown.innerHTML = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(
        ([department, count]) => `
          <article class="manager-card">
            <strong>${department}</strong>
            <p class="muted">${count} employees</p>
          </article>
        `
      )
      .join("");
  }

  renderEmployeeWorkspace();
  renderEmployeeChats();
}

function renderEmployeeWorkspace() {
  const employee = getSelectedEmployee();
  const employeeWorkspace = getEmployeeWorkspaceNode();
  const employeeRoleForm = getEmployeeRoleForm();
  const clockInButton = getClockInButton();
  const clockOutButton = getClockOutButton();

  if (!employee) {
    if (employeeWorkspace) {
      employeeWorkspace.innerHTML = "<p class=\"muted\">No employee selected.</p>";
    }
    return;
  }

  if (employeeWorkspace) {
    const attendance = employee.attendance || {};
    employeeWorkspace.innerHTML = `
      <div class="employee-workspace-head">
        <img class="profile-avatar profile-avatar-large" src="${employee.profileImage || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Default_pfp.jpg/250px-Default_pfp.jpg"}" alt="${employee.fullName}" />
        <div>
          <strong>${employee.fullName}</strong>
          <p class="muted">${employee.jobTitle || "Unassigned Role"} • ${employee.department}</p>
          <p class="muted">Gender: ${employee.gender || "he/him"}</p>
          <p class="muted">Manager: ${getEmployeeManager(employee)}</p>
        </div>
      </div>
      <div class="employee-meta-grid">
        <article class="asset-card">
          <strong>Attendance</strong>
          <p>${attendance.clockedIn ? "Clocked in" : "Clocked out"}</p>
          <p class="muted">Last in: ${formatDateTime(attendance.lastClockIn)}</p>
          <p class="muted">Last out: ${formatDateTime(attendance.lastClockOut)}</p>
        </article>
        <article class="asset-card">
          <strong>Identity</strong>
          <p>${employee.email || "No Outlook email yet"}</p>
          <p class="muted">${employee.phone || "No mobile number"}</p>
          <p class="muted">CPR: ${employee.cpr || "Not recorded"}</p>
          <p class="muted">Passport: ${employee.passport || "Not recorded"}</p>
        </article>
      </div>
    `;
  }

  if (employeeRoleForm) {
    employeeRoleForm.elements.jobTitle.value = employee.jobTitle || "";
    employeeRoleForm.elements.gender.value = employee.gender || "he/him";
    employeeRoleForm.elements.manager.value = getEmployeeManager(employee);
    employeeRoleForm.elements.email.value = employee.email || "";
    employeeRoleForm.elements.phone.value = employee.phone || "";
    employeeRoleForm.elements.cpr.value = employee.cpr || "";
    employeeRoleForm.elements.passport.value = employee.passport || "";
  }

  if (privateChatRecipient) {
    privateChatRecipient.textContent = `Private thread with ${employee.fullName}`;
  }

  if (clockInButton) {
    clockInButton.disabled = employee.attendance?.clockedIn;
  }
  if (clockOutButton) {
    clockOutButton.disabled = !employee.attendance?.clockedIn;
  }
}

function renderEmployeeChats() {
  const employee = getSelectedEmployee();
  const currentUser = getCurrentUser();
  const control = onboardingData?.employeeControl || {};

  if (publicChatList) {
    publicChatList.innerHTML = (control.publicMessages || [])
      .map(
        (message) => `
          <article class="chat-message ${message.author === currentUser?.displayName ? "is-own" : ""}">
            <strong>${message.author}</strong>
            <p>${message.message}</p>
            <span class="muted">${formatDateTime(message.createdAt)}</span>
          </article>
        `
      )
      .join("") || "<p class=\"muted\">No public messages yet.</p>";
  }

  if (privateChatList) {
    const thread = (control.privateMessages || []).filter((message) => {
      if (!employee || !currentUser) {
        return false;
      }
      return (
        (message.from === currentUser.displayName && message.to === employee.fullName) ||
        (message.from === employee.fullName && message.to === currentUser.displayName)
      );
    });

    privateChatList.innerHTML = thread
      .map(
        (message) => `
          <article class="chat-message ${message.from === currentUser?.displayName ? "is-own" : ""}">
            <strong>${message.from}</strong>
            <p>${message.message}</p>
            <span class="muted">${formatDateTime(message.createdAt)}</span>
          </article>
        `
      )
      .join("") || "<p class=\"muted\">No private messages with this employee yet.</p>";
  }
}

function startGame(name) {
  activeGame = name;
  if (name === "Minesweeper") {
    const mines = new Set();
    while (mines.size < 6) mines.add(Math.floor(Math.random() * 36));
    gameState = { mines, opened: new Set(), ended: false };
  } else if (name === "Connect Four") {
    gameState = { board: Array.from({ length: 6 }, () => Array(7).fill("")), ended: false };
  } else {
    const words = ["onboarding", "lumofy", "teamwork", "momentum", "progress"];
    const word = words[Math.floor(Math.random() * words.length)];
    gameState = { word, scrambled: word.split("").sort(() => Math.random() - 0.5).join(""), score: 0 };
  }
  renderGame();
}

function renderGame(message = "") {
  if (!gamePlayground || !activeGame || !gameState) return;
  if (activeGame === "Minesweeper") {
    gamePlayground.innerHTML = `<div class="game-head"><h3>Minesweeper</h3><button class="ghost-button" data-close-game>Close</button></div><p class="muted">Reveal every safe square. Avoid the six mines.</p><div class="mine-grid">${Array.from({ length: 36 }, (_, index) => `<button class="mine-cell ${gameState.opened.has(index) ? "is-open" : ""}" data-mine-cell="${index}">${gameState.opened.has(index) ? (gameState.mines.has(index) ? "✹" : "•") : ""}</button>`).join("")}</div><p class="game-message">${message}</p>`;
    return;
  }
  if (activeGame === "Connect Four") {
    gamePlayground.innerHTML = `<div class="game-head"><h3>Connect Four</h3><button class="ghost-button" data-close-game>Close</button></div><p class="muted">Choose a column. Get four red pieces in a row before the computer does.</p><div class="connect-controls">${Array.from({ length: 7 }, (_, col) => `<button class="ghost-button" data-connect-column="${col}" ${gameState.ended ? "disabled" : ""}>Drop ${col + 1}</button>`).join("")}</div><div class="connect-grid">${gameState.board.flatMap((row) => row.map((cell) => `<span class="connect-cell ${cell === "R" ? "red" : cell === "Y" ? "yellow" : ""}"></span>`)).join("")}</div><p class="game-message">${message}</p>`;
    return;
  }
  gamePlayground.innerHTML = `<div class="game-head"><h3>Word Sprint</h3><button class="ghost-button" data-close-game>Close</button></div><p class="muted">Unscramble this word: <strong>${gameState.scrambled}</strong></p><form id="word-sprint-form" class="game-form"><input name="guess" autocomplete="off" required autofocus /><button class="primary-button">Check word</button></form><p class="game-message">${message}</p>`;
}

function connectWinner(board, token) {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
  return board.some((row, r) => row.some((cell, c) => cell === token && directions.some(([dr, dc]) => [1, 2, 3].every((step) => board[r + dr * step]?.[c + dc * step] === token))));
}

function dropConnectPiece(column, token) {
  for (let row = 5; row >= 0; row -= 1) {
    if (!gameState.board[row][column]) { gameState.board[row][column] = token; return true; }
  }
  return false;
}

function renderEngagement(engagement) {
  if (!engagement) {
    return;
  }

  if (engagementSummaryCards) {
    const totalPlayers = (engagement.games || []).reduce((sum, game) => sum + Number(game.players || 0), 0);
    const topElo = engagement.leaderboard && engagement.leaderboard.length ? engagement.leaderboard[0].elo : 0;
    engagementSummaryCards.innerHTML = [
      { label: "Games", value: (engagement.games || []).length, tone: "neutral" },
      { label: "Participants", value: totalPlayers, tone: "accent" },
      { label: "Top ELO", value: topElo, tone: "neutral" },
      { label: "Leaderboard Spots", value: 3, tone: "accent" },
      { label: "Open Access", value: "All", tone: "neutral" },
      { label: "Mode", value: "Ranked", tone: "accent" }
    ]
      .map(
        (card) => `
          <article class="metric-card ${card.tone}">
            <p class="eyebrow">${card.label}</p>
            <strong>${card.value}</strong>
          </article>
        `
      )
      .join("");
  }

  if (leaderboardList) {
    leaderboardList.innerHTML = (engagement.leaderboard || [])
      .map(
        (entry) => `
          <article class="leaderboard-card">
            <div class="pill-row">
              <span class="leaderboard-rank">${entry.rank}</span>
              <span class="pill">${entry.game}</span>
              <span class="status-pill status-in_progress">ELO ${entry.elo}</span>
            </div>
            <strong>${entry.name}</strong>
          </article>
        `
      )
      .join("");
  }

  if (gamesList) {
    gamesList.innerHTML = (engagement.games || [])
      .map(
        (game) => `
          <article class="asset-card">
            <strong>${game.name}</strong>
            <p>${game.description}</p>
            <p class="muted">${game.format}</p>
            <p class="muted">${game.players} participants</p>
            <button class="primary-button game-launch" data-start-game="${game.name}">Play now</button>
          </article>
        `
      )
      .join("");
  }
}

function renderManagerView(plans) {
  const container = document.getElementById("manager-cards");
  if (!container) {
    return;
  }
  container.innerHTML = plans
    .map(
      (plan) => `
        <article class="manager-card">
          <div class="pill-row">
            <span class="status-pill ${statusClass(plan.status)}">${plan.status.replaceAll("_", " ")}</span>
            <span class="pill">${plan.stage}</span>
          </div>
          <strong>${plan.employeeName}</strong>
          <p class="muted">${plan.role} • ${plan.manager}</p>
          <p>${plan.highlight}</p>
          <p class="muted">Next: ${plan.nextAction}</p>
        </article>
      `
    )
    .join("");
}

function renderEmployeeCard(detail) {
  const container = document.getElementById("employee-card");
  if (!container) {
    return;
  }
  container.innerHTML = `
    <span class="status-pill ${statusClass(detail.status)}">${detail.status.replaceAll("_", " ")}</span>
    <strong>${detail.employeeName}</strong>
    <p class="muted">${detail.role} • ${detail.department}</p>
    <p>Start date: ${formatDate(detail.startDate)}</p>
    <p>Next activity: ${detail.nextActivity}</p>
    <div class="progress-track">
      <div class="progress-bar" style="width: ${detail.completion}%"></div>
    </div>
    <p class="muted">${detail.completion}% complete • ${detail.overdueTasks} overdue tasks</p>
  `;
}

function renderRoleTree(nodes) {
  if (!roleTreeRoot) {
    return;
  }

  if (treeSummaryCards && onboardingData) {
    const managerMap = getManagerMap();
    const employees = onboardingData.employees || [];
    const topLevelLeaders = employees.filter((employee) => managerMap.get(employee.fullName) === "Mahmood Malik").length;
    const directToOwner = employees.filter((employee) => managerMap.get(employee.fullName) === "Ahmed Faraj").length;

    treeSummaryCards.innerHTML = [
      { label: "Owner", value: "Ahmed Faraj", tone: "neutral" },
      { label: "Direct to Owner", value: directToOwner, tone: "accent" },
      { label: "Leadership Layer", value: topLevelLeaders, tone: "neutral" },
      { label: "Total Headcount", value: employees.length, tone: "accent" },
      { label: "New Hires", value: employees.filter((employee) => employee.employmentStatus === "new hire").length, tone: "warn" },
      { label: "Departments", value: new Set(employees.map((employee) => normalizeDepartmentName(employee.department))).size, tone: "neutral" }
    ]
      .map(
        (card) => `
          <article class="metric-card ${card.tone}">
            <p class="eyebrow">${card.label}</p>
            <strong>${card.value}</strong>
          </article>
        `
      )
      .join("");
  }

  function renderNodes(items) {
    return `
      <ul class="org-chart-level">
        ${items
          .map(
            (item) => `
              <li class="org-chart-item ${item.children && item.children.length ? "has-children" : "is-leaf"}">
                <article class="role-node org-chart-card">
                  <strong class="role-name">${item.name}</strong>
                  <span class="role-title">${item.title}</span>
                  <span class="role-meta">${item.children && item.children.length ? `${item.children.length} direct report${item.children.length === 1 ? "" : "s"}` : "Individual contributor"}</span>
                </article>
                ${item.children && item.children.length ? `<div class="org-chart-children">${renderNodes(item.children)}</div>` : ""}
              </li>
            `
          )
          .join("")}
      </ul>
    `;
  }

  roleTreeRoot.innerHTML = renderNodes(nodes);
}

function renderDetail(detail) {
  setText("detail-title", `${detail.employeeName} • ${detail.role}`);

  const tabRow = document.getElementById("tab-row");
  if (tabRow) {
    tabRow.innerHTML = detail.tabs
    .map((tab, index) => `<span class="pill${index === 0 ? " active" : ""}">${tab}</span>`)
    .join("");
  }

  const taskList = document.getElementById("task-list");
  if (taskList) {
    taskList.innerHTML = detail.preStartTasks
    .map(
      (task) => `
        <article class="task-card">
          <div class="pill-row">
            <span class="status-pill ${statusClass(task.status)}">${task.status}</span>
            <span class="pill">${task.required ? "Required" : "Optional"}</span>
          </div>
          <strong>${task.title}</strong>
          <p class="muted">Owner: ${task.owner}</p>
          <p class="muted">Due: ${formatDate(task.dueDate)}</p>
        </article>
      `
    )
    .join("");
  }

  const scheduleList = document.getElementById("schedule-list");
  if (scheduleList) {
    scheduleList.innerHTML = detail.dayOneSchedule
    .map(
      (item) => `
        <div class="timeline-item">
          <div class="timeline-time">${item.time}</div>
          <div>
            <strong>${item.activity}</strong>
            <p class="muted">${item.owner}</p>
            <p class="muted">${item.location}</p>
          </div>
        </div>
      `
    )
    .join("");
  }

  const goalsList = document.getElementById("goals-list");
  if (goalsList) {
    goalsList.innerHTML = detail.goals
    .map(
      (goal) => `
        <article class="goal-card">
          <div class="pill-row">
            <span class="pill">${goal.milestone}</span>
            <span class="status-pill ${statusClass(goal.status)}">${goal.status}</span>
          </div>
          <strong>${goal.title}</strong>
          <div class="progress-track">
            <div class="progress-bar" style="width: ${goal.progress}%"></div>
          </div>
          <p class="muted">${goal.progress}% complete</p>
        </article>
      `
    )
    .join("");
  }

  const toolsList = document.getElementById("tools-list");
  if (toolsList) {
    toolsList.innerHTML = detail.tools
    .map(
      (tool) => `
        <article class="tool-card">
          <div class="pill-row">
            <span class="status-pill ${statusClass(tool.status)}">${tool.status}</span>
          </div>
          <strong>${tool.tool}</strong>
          <p class="muted">Owner: ${tool.owner}</p>
        </article>
      `
    )
    .join("");
  }

  const contactsList = document.getElementById("contacts-list");
  if (contactsList) {
    contactsList.innerHTML = detail.contacts
    .map(
      (contact) => `
        <article class="contact-card">
          <strong>${contact.name}</strong>
          <p class="muted">${contact.role}</p>
          <p>${contact.purpose}</p>
        </article>
      `
    )
    .join("");
  }
}

async function load() {
  setText("generated-at", "Loading dashboard...");
  if (window.__ONBOARDING_DATA__) {
    onboardingData = window.__ONBOARDING_DATA__;
  } else {
    const response = await fetch("/api/onboarding", {
      cache: "no-store",
      credentials: "same-origin"
    });

    if (response.status === 401) {
      window.location.href = "/login";
      return;
    }

    onboardingData = await response.json();
  }

  onboardingData = hydrateData(onboardingData);

  renderDashboard(onboardingData);
}

function renderDashboard(data) {
  setText("generated-at", `Updated ${new Date(data.generatedAt).toLocaleString()}`);
  if (deploymentBadge && data.deployment) {
    deploymentBadge.textContent = `Build ${data.deployment.branch}@${data.deployment.commit}`;
  }

  renderSummaryCards(data.summaryCards, data.stats);
  renderPlans(data.plans);
  renderEmployees(data.employees || []);
  renderManagerView(data.plans);
  renderEmployeeCard(data.detail);
  renderRoleTree(data.roleTree || []);
  renderDetail(data.detail);
  renderEngagement(data.engagement);
  const auditLogList = document.getElementById("audit-log-list");
  if (auditLogList) {
    auditLogList.innerHTML = (data.auditLogs || []).map((log) => `<article class="manager-card"><strong>${log.action}</strong><p>${log.actor} · ${log.role}</p><p class="muted">${log.detail}</p><p class="muted">${formatDateTime(log.at)}</p></article>`).join("") || "<p class=\"muted\">No activity recorded yet.</p>";
  }
}

if (addPlanButton && addPlanForm && cancelPlanButton) {
  addPlanButton.addEventListener("click", () => {
    addPlanForm.hidden = false;
    addPlanButton.disabled = true;
  });

  cancelPlanButton.addEventListener("click", () => {
    addPlanForm.reset();
    addPlanForm.hidden = true;
    addPlanButton.disabled = false;
  });

  addPlanForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!onboardingData) {
      return;
    }

    const formData = new FormData(addPlanForm);
    const startDate = String(formData.get("startDate") || "");
    const newPlan = {
      id: `plan-${Date.now()}`,
      employeeName: String(formData.get("employeeName") || ""),
      department: String(formData.get("department") || ""),
      role: String(formData.get("role") || ""),
      manager: String(formData.get("manager") || ""),
      buddy: "Unassigned",
      status: String(formData.get("status") || "preparing"),
      startDate,
      daysSinceJoining: 0,
      progress: Number(formData.get("progress") || 0),
      overdueTasks: Number(formData.get("overdueTasks") || 0),
      nextAction: String(formData.get("nextAction") || ""),
      stage: "Pre-Start",
      startWindow: "this_week",
      projectedCompletionDate: startDate,
      highlight: "Added manually from HR control queue"
    };

    onboardingData.plans = [newPlan, ...onboardingData.plans];
    onboardingData.stats = computeStats(onboardingData.plans);
    onboardingData.generatedAt = new Date().toISOString();

    renderDashboard(onboardingData);
    addPlanForm.reset();
    addPlanForm.hidden = true;
    addPlanButton.disabled = false;
  });
}

if (employeeRows) {
  employeeRows.addEventListener("click", (event) => {
    const row = event.target.closest("[data-employee-id]");
    if (!row) {
      return;
    }

    selectedEmployeeId = row.getAttribute("data-employee-id");
    renderEmployees(getEmployeesData());
  });
}

if (addEmployeeButton && addEmployeeForm && cancelEmployeeButton) {
  addEmployeeButton.addEventListener("click", () => {
    addEmployeeForm.hidden = false;
    addEmployeeButton.disabled = true;
  });

  cancelEmployeeButton.addEventListener("click", () => {
    addEmployeeForm.reset();
    addEmployeeForm.hidden = true;
    addEmployeeButton.disabled = false;
  });

  addEmployeeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(addEmployeeForm);

    try {
      const nextData = await postJson("/api/employees", Object.fromEntries(formData.entries()));
      onboardingData = hydrateData(nextData);
      selectedEmployeeId = `emp-${String(formData.get("fullName") || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`;
      renderDashboard(onboardingData);
      addEmployeeForm.reset();
      addEmployeeForm.hidden = true;
      addEmployeeButton.disabled = false;
    } catch (error) {
      console.error(error);
    }
  });
}

document.addEventListener("submit", async (event) => {
  const employeeRoleForm = event.target.closest("#employee-role-form");
  if (!employeeRoleForm) {
    return;
  }

  event.preventDefault();
  const employee = getSelectedEmployee();
  if (!employee) {
    return;
  }

  const formData = new FormData(employeeRoleForm);
  try {
    const nextData = await postJson(`/api/employees/${employee.id}/update`, Object.fromEntries(formData.entries()));
    onboardingData = hydrateData(nextData);
    renderDashboard(onboardingData);
  } catch (error) {
    console.error(error);
  }
});

document.addEventListener("click", async (event) => {
  const gameButton = event.target.closest("[data-start-game]");
  if (gameButton) {
    startGame(gameButton.getAttribute("data-start-game"));
    return;
  }
  if (event.target.closest("[data-close-game]")) {
    activeGame = null;
    gameState = null;
    if (gamePlayground) gamePlayground.innerHTML = "";
    return;
  }
  const mineCell = event.target.closest("[data-mine-cell]");
  if (mineCell && activeGame === "Minesweeper" && !gameState.ended) {
    const index = Number(mineCell.getAttribute("data-mine-cell"));
    gameState.opened.add(index);
    if (gameState.mines.has(index)) {
      gameState.ended = true;
      gameState.mines.forEach((mine) => gameState.opened.add(mine));
      renderGame("Mine hit — start a new round to try again.");
    } else if (gameState.opened.size === 30) {
      gameState.ended = true;
      renderGame("You cleared the board. Great round!");
    } else {
      renderGame();
    }
    return;
  }
  const connectColumn = event.target.closest("[data-connect-column]");
  if (connectColumn && activeGame === "Connect Four" && !gameState.ended) {
    const column = Number(connectColumn.getAttribute("data-connect-column"));
    if (!dropConnectPiece(column, "R")) { renderGame("That column is full. Choose another."); return; }
    if (connectWinner(gameState.board, "R")) { gameState.ended = true; renderGame("You win! Four in a row."); return; }
    const available = Array.from({ length: 7 }, (_, i) => i).filter((i) => !gameState.board[0][i]);
    if (!available.length) { gameState.ended = true; renderGame("Draw game."); return; }
    dropConnectPiece(available[Math.floor(Math.random() * available.length)], "Y");
    if (connectWinner(gameState.board, "Y")) { gameState.ended = true; renderGame("The computer wins this round."); return; }
    renderGame("Your turn.");
    return;
  }
  const clockInButton = event.target.closest("#clock-in-button");
  if (clockInButton) {
    const employee = getSelectedEmployee();
    if (!employee) {
      return;
    }

    try {
      const nextData = await postJson(`/api/employees/${employee.id}/clock`, { action: "clock_in" });
      onboardingData = hydrateData(nextData);
      renderDashboard(onboardingData);
    } catch (error) {
      console.error(error);
    }
    return;
  }

  const clockOutButton = event.target.closest("#clock-out-button");
  if (clockOutButton) {
    const employee = getSelectedEmployee();
    if (!employee) {
      return;
    }

    try {
      const nextData = await postJson(`/api/employees/${employee.id}/clock`, { action: "clock_out" });
      onboardingData = hydrateData(nextData);
      renderDashboard(onboardingData);
    } catch (error) {
      console.error(error);
    }
  }
});

document.addEventListener("submit", (event) => {
  if (event.target.id !== "word-sprint-form") return;
  event.preventDefault();
  const guess = String(new FormData(event.target).get("guess") || "").trim().toLowerCase();
  if (guess === gameState.word) {
    gameState.score += 1;
    renderGame(`Correct! Score: ${gameState.score}. Start another game from the Games cards.`);
  } else {
    renderGame("Not quite — try again.");
  }
});

if (publicChatForm) {
  publicChatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(publicChatForm);

    try {
      const nextData = await postJson("/api/chat/public", Object.fromEntries(formData.entries()));
      onboardingData = hydrateData(nextData);
      renderDashboard(onboardingData);
      publicChatForm.reset();
    } catch (error) {
      console.error(error);
    }
  });
}

if (privateChatForm) {
  privateChatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const employee = getSelectedEmployee();
    if (!employee) {
      return;
    }

    const formData = new FormData(privateChatForm);
    try {
      const nextData = await postJson("/api/chat/private", {
        to: employee.fullName,
        message: String(formData.get("message") || "")
      });
      onboardingData = hydrateData(nextData);
      renderDashboard(onboardingData);
      privateChatForm.reset();
    } catch (error) {
      console.error(error);
    }
  });
}

load().catch((error) => {
  setText("generated-at", "Dashboard failed to load");
  console.error(error);
});
