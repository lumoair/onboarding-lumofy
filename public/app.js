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
  const response = await fetch("/api/onboarding");
  const data = await response.json();

  document.getElementById("generated-at").textContent = `Updated ${new Date(data.generatedAt).toLocaleString()}`;

  renderSummaryCards(data.summaryCards, data.stats);
  renderPlans(data.plans);
  renderManagerView(data.plans);
  renderEmployeeCard(data.detail);
  renderDetail(data.detail);
}

load().catch((error) => {
  document.getElementById("generated-at").textContent = "Failed to load prototype data";
  console.error(error);
});
