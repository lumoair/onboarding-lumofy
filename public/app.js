const authShell = document.getElementById("auth-shell");
const appShell = document.getElementById("app-shell");
const loginForm = document.getElementById("login-form");
const logoutButton = document.getElementById("logout-button");
const authError = document.getElementById("auth-error");
const addPlanButton = document.getElementById("add-plan-button");
const addPlanForm = document.getElementById("add-plan-form");
const cancelPlanButton = document.getElementById("cancel-plan-button");
const roleTreeRoot = document.getElementById("role-tree");
let onboardingData = null;

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

function renderManagerView(plans) {
  const container = document.getElementById("manager-cards");
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
  document.getElementById("detail-title").textContent = `${detail.employeeName} • ${detail.role}`;

  document.getElementById("tab-row").innerHTML = detail.tabs
    .map((tab, index) => `<span class="pill${index === 0 ? " active" : ""}">${tab}</span>`)
    .join("");

  document.getElementById("task-list").innerHTML = detail.preStartTasks
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

  document.getElementById("schedule-list").innerHTML = detail.dayOneSchedule
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

  document.getElementById("goals-list").innerHTML = detail.goals
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

  document.getElementById("tools-list").innerHTML = detail.tools
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

  document.getElementById("contacts-list").innerHTML = detail.contacts
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

async function load() {
  const response = await fetch("/api/onboarding", {
    credentials: "same-origin"
  });

  if (response.status === 401) {
    showAuth();
    return;
  }

  onboardingData = await response.json();

  renderDashboard(onboardingData);
  showApp();
}

function renderDashboard(data) {
  document.getElementById("generated-at").textContent = `Updated ${new Date(data.generatedAt).toLocaleString()}`;

  renderSummaryCards(data.summaryCards, data.stats);
  renderPlans(data.plans);
  renderManagerView(data.plans);
  renderEmployeeCard(data.detail);
  renderRoleTree(data.roleTree || []);
  renderDetail(data.detail);
}

function showAuth(message = "") {
  authShell.hidden = false;
  appShell.hidden = true;
  authError.hidden = !message;
  authError.textContent = message;
}

function showApp() {
  authShell.hidden = true;
  appShell.hidden = false;
  authError.hidden = true;
  authError.textContent = "";
}

async function checkSession() {
  const response = await fetch("/api/session", {
    credentials: "same-origin"
  });
  const data = await response.json();

  if (data.authenticated) {
    await load();
    return;
  }

  showAuth();
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  authError.hidden = true;

  const formData = new FormData(loginForm);
  const payload = {
    username: String(formData.get("username") || ""),
    password: String(formData.get("password") || "")
  };

  const response = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "same-origin",
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: "Login failed" }));
    showAuth(data.error || "Login failed");
    return;
  }

  await load();
});

logoutButton.addEventListener("click", async () => {
  await fetch("/api/logout", {
    method: "POST",
    credentials: "same-origin"
  });

  showAuth();
});

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

checkSession().catch((error) => {
  showAuth("Unable to verify session");
  console.error(error);
});
