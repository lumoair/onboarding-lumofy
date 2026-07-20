const addPlanButton = document.getElementById("add-plan-button");
const addPlanForm = document.getElementById("add-plan-form");
const cancelPlanButton = document.getElementById("cancel-plan-button");
const roleTreeRoot = document.getElementById("role-tree");
const deploymentBadge = document.getElementById("deployment-badge");
const employeeRows = document.getElementById("employee-rows");
const employeeSummaryCards = document.getElementById("employee-summary-cards");
const departmentBreakdown = document.getElementById("department-breakdown");
const treeSummaryCards = document.getElementById("tree-summary-cards");
let onboardingData = null;

function normalizeDepartmentName(value) {
  return String(value || "").trim();
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

    ["Sayed Jehad Saeed Hasan", "Mahmood Malik"]
  ]);
}

function derivePlansFromEmployees(employees) {
  const managerMap = getManagerMap();
  const statuses = ["completed", "in_progress", "awaiting_manager_confirmation", "ready_for_day_1"];

  return employees.map((employee, index) => {
    const department = normalizeDepartmentName(employee.department);
    const managerName = managerMap.get(employee.fullName) || "Ahmed Faraj";
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

  employees.forEach((employee) => {
    const manager = managerMap.get(employee.fullName) || "Ahmed Faraj";
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
    buildNode("Ahmed Faraj")
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

  const managerMap = getManagerMap();
  employeeRows.innerHTML = employees
    .map(
      (employee) => `
        <tr>
          <td><strong>${employee.fullName}</strong></td>
          <td>${employee.jobTitle || "Unassigned Role"}</td>
          <td>${normalizeDepartmentName(employee.department)}</td>
          <td>${employee.employmentStatus}</td>
          <td>${managerMap.get(employee.fullName) || "Ahmed Faraj"}</td>
        </tr>
      `
    )
    .join("");

  if (employeeSummaryCards) {
    const active = employees.filter((employee) => employee.employmentStatus === "active").length;
    const newHires = employees.filter((employee) => employee.employmentStatus === "new hire").length;
    const departments = new Set(employees.map((employee) => normalizeDepartmentName(employee.department))).size;
    const managers = new Set(employees.map((employee) => managerMap.get(employee.fullName) || "Ahmed Faraj")).size;

    employeeSummaryCards.innerHTML = [
      { label: "Total Employees", value: employees.length, tone: "neutral" },
      { label: "Active", value: active, tone: "accent" },
      { label: "New Hires", value: newHires, tone: "warn" },
      { label: "Departments", value: departments, tone: "neutral" },
      { label: "Reporting Managers", value: managers, tone: "accent" },
      { label: "Data Source", value: "XLSX", tone: "neutral" }
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
  const response = await fetch("/api/onboarding", {
    cache: "no-store",
    credentials: "same-origin"
  });

  if (response.status === 401) {
    window.location.href = "/login";
    return;
  }

  onboardingData = await response.json();
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

load().catch((error) => {
  setText("generated-at", "Dashboard failed to load");
  console.error(error);
});
