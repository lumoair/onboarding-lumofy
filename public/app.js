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
const addEmployeeButton = document.getElementById("add-employee-button");
const addEmployeeForm = document.getElementById("add-employee-form");
const cancelEmployeeButton = document.getElementById("cancel-employee-button");
const employeeWorkspace = document.getElementById("employee-workspace");
const employeeRoleForm = document.getElementById("employee-role-form");
const employeeTaskList = document.getElementById("employee-task-list");
const employeeTaskForm = document.getElementById("employee-task-form");
const clockInButton = document.getElementById("clock-in-button");
const clockOutButton = document.getElementById("clock-out-button");
const publicChatList = document.getElementById("public-chat-list");
const privateChatList = document.getElementById("private-chat-list");
const publicChatForm = document.getElementById("public-chat-form");
const privateChatForm = document.getElementById("private-chat-form");
const privateChatRecipient = document.getElementById("private-chat-recipient");
let onboardingData = null;
let selectedEmployeeId = null;

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
    .map(
      (employee) => `
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
      `
    )
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
    employeeRoleForm.elements.manager.value = getEmployeeManager(employee);
    employeeRoleForm.elements.email.value = employee.email || "";
    employeeRoleForm.elements.phone.value = employee.phone || "";
    employeeRoleForm.elements.cpr.value = employee.cpr || "";
    employeeRoleForm.elements.passport.value = employee.passport || "";
  }

  if (employeeTaskList) {
    employeeTaskList.innerHTML = (employee.assignedTasks || [])
      .map(
        (task) => `
          <article class="task-card">
            <div class="pill-row">
              <span class="status-pill ${statusClass(task.status)}">${task.status.replaceAll("_", " ")}</span>
              <span class="pill">${task.owner}</span>
            </div>
            <strong>${task.title}</strong>
            <p class="muted">Due ${formatDate(task.dueDate)}</p>
          </article>
        `
      )
      .join("") || "<p class=\"muted\">No tasks assigned yet.</p>";
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
      <ul class="role-tree-level">
        ${items
          .map(
            (item) => `
              <li>
                <article class="role-node">
                  <strong class="role-title">${item.title}</strong>
                  <span class="role-name">${item.name}</span>
                </article>
                ${item.children && item.children.length ? renderNodes(item.children) : ""}
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

if (employeeRoleForm) {
  employeeRoleForm.addEventListener("submit", async (event) => {
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
}

if (employeeTaskForm) {
  employeeTaskForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const employee = getSelectedEmployee();
    if (!employee) {
      return;
    }

    const formData = new FormData(employeeTaskForm);
    try {
      const nextData = await postJson(`/api/employees/${employee.id}/tasks`, Object.fromEntries(formData.entries()));
      onboardingData = hydrateData(nextData);
      renderDashboard(onboardingData);
      employeeTaskForm.reset();
    } catch (error) {
      console.error(error);
    }
  });
}

if (clockInButton) {
  clockInButton.addEventListener("click", async () => {
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
  });
}

if (clockOutButton) {
  clockOutButton.addEventListener("click", async () => {
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
  });
}

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
