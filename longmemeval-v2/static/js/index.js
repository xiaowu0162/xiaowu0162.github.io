const state = {
  viewerData: null,
};

function setupToc() {
  const burger = document.getElementById("toc-burger");
  const wrapper = document.getElementById("toc-wrapper");
  const overlay = document.getElementById("toc-overlay");
  const close = document.getElementById("toc-close");
  const links = wrapper.querySelectorAll("a");

  function setOpen(open) {
    burger.classList.toggle("active", open);
    wrapper.classList.toggle("active", open);
    overlay.classList.toggle("active", open);
  }

  burger.addEventListener("click", () => setOpen(!wrapper.classList.contains("active")));
  close.addEventListener("click", () => setOpen(false));
  overlay.addEventListener("click", () => setOpen(false));
  links.forEach((link) => link.addEventListener("click", () => setOpen(false)));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function compactText(value, limit = 360) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= limit) {
    return text;
  }
  return `${text.slice(0, limit).trim()}...`;
}

function setupViewerSummary(dataset) {
  const summary = document.getElementById("viewer-summary");
  summary.innerHTML = [
    ["Questions", dataset.questions.toLocaleString()],
    ["Trajectories", dataset.trajectories.toLocaleString()],
    ["Question images", dataset.question_images.toLocaleString()],
    ["License", dataset.license],
  ]
    .map(
      ([label, value]) => `
        <div class="viewer-stat">
          <strong>${escapeHtml(value)}</strong>
          <span>${escapeHtml(label)}</span>
        </div>
      `,
    )
    .join("");
}

function setupQuestionFilter(questions) {
  const filter = document.getElementById("question-filter");
  const types = [...new Set(questions.map((question) => question.question_type))].sort();
  types.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    filter.appendChild(option);
  });
  filter.addEventListener("change", () => renderQuestions());
}

function renderQuestions() {
  const list = document.getElementById("question-list");
  const filter = document.getElementById("question-filter").value;
  const questions = state.viewerData.questions.filter((question) => {
    return filter === "all" || question.question_type === filter;
  });

  list.innerHTML = questions
    .map((question) => {
      const image = question.image
        ? `<img src="./${escapeHtml(question.image)}" alt="Screenshot for question ${escapeHtml(question.id)}">`
        : "";
      return `
        <article class="question-card">
          <div class="question-meta">
            <span class="meta-pill">${escapeHtml(question.id)}</span>
            <span class="meta-pill">${escapeHtml(question.domain)}</span>
            <span class="meta-pill">${escapeHtml(question.question_type)}</span>
          </div>
          <p>${escapeHtml(compactText(question.question, 460))}</p>
          ${image}
          <div class="answer-line"><strong>Answer:</strong> ${escapeHtml(compactText(question.answer, 240))}</div>
        </article>
      `;
    })
    .join("");
}

function setupTrajectorySelect(trajectories) {
  const select = document.getElementById("trajectory-select");
  trajectories.forEach((trajectory) => {
    const option = document.createElement("option");
    option.value = trajectory.id;
    option.textContent = `${trajectory.id} (${trajectory.domain}, ${trajectory.outcome})`;
    select.appendChild(option);
  });
  select.addEventListener("change", () => renderTrajectory());
}

function renderTrajectory() {
  const viewer = document.getElementById("trajectory-viewer");
  const selected = document.getElementById("trajectory-select").value;
  const trajectory = state.viewerData.trajectories.find((item) => item.id === selected);
  if (!trajectory) {
    viewer.innerHTML = "";
    return;
  }

  const states = trajectory.states
    .map(
      (item) => `
        <article class="trajectory-state">
          <img src="./${escapeHtml(item.screenshot)}" alt="Trajectory ${escapeHtml(trajectory.id)} state ${escapeHtml(item.state_index)}">
          <div class="state-text">
            <div class="state-meta">
              <span class="meta-pill">state ${escapeHtml(item.state_index)}</span>
              <span class="meta-pill">step ${escapeHtml(item.step)}</span>
              <span class="meta-pill">${escapeHtml(item.action || "start")}</span>
            </div>
            <p><code>${escapeHtml(item.url)}</code></p>
            <p>${escapeHtml(item.thought || "No model thought recorded for this sampled state.")}</p>
            <p>${escapeHtml(compactText(item.observation_snippet, 520))}</p>
          </div>
        </article>
      `,
    )
    .join("");

  viewer.innerHTML = `
    <div class="trajectory-title">${escapeHtml(trajectory.goal)}</div>
    <div class="question-meta">
      <span class="meta-pill">${escapeHtml(trajectory.id)}</span>
      <span class="meta-pill">${escapeHtml(trajectory.environment)}</span>
      <span class="meta-pill">${escapeHtml(trajectory.outcome)}</span>
    </div>
    ${states}
  `;
}

async function setupDataViewer() {
  const response = await fetch("./static/data/viewer-data.json");
  state.viewerData = await response.json();
  setupViewerSummary(state.viewerData.dataset);
  setupQuestionFilter(state.viewerData.questions);
  setupTrajectorySelect(state.viewerData.trajectories);
  renderQuestions();
  renderTrajectory();
}

document.addEventListener("DOMContentLoaded", () => {
  setupToc();
  setupDataViewer().catch((error) => {
    const summary = document.getElementById("viewer-summary");
    summary.innerHTML = `<div class="viewer-stat"><strong>Data unavailable</strong><span>${escapeHtml(error.message)}</span></div>`;
  });
});
