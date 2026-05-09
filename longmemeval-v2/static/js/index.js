const state = {
  viewerData: null,
  questionIndex: 0,
  trajectoryIndex: 0,
  trajectoryStateIndex: 0,
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

function normalizeIndex(index, length) {
  if (length <= 0) {
    return 0;
  }
  return ((index % length) + length) % length;
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
  filter.addEventListener("change", () => {
    state.questionIndex = 0;
    renderQuestions();
  });
}

function renderQuestions() {
  const list = document.getElementById("question-list");
  const filter = document.getElementById("question-filter").value;
  const questions = state.viewerData.questions.filter((question) => {
    return filter === "all" || question.question_type === filter;
  });

  if (questions.length === 0) {
    list.innerHTML = `<div class="viewer-empty">No questions match this filter.</div>`;
    return;
  }

  state.questionIndex = normalizeIndex(state.questionIndex, questions.length);
  const question = questions[state.questionIndex];
  const image = question.image
    ? `<img src="./${escapeHtml(question.image)}" alt="Screenshot for question ${escapeHtml(question.id)}">`
    : "";

  list.innerHTML = `
    <article class="question-card">
      <div class="question-meta">
        <span class="meta-pill">${escapeHtml(question.id)}</span>
        <span class="meta-pill">${escapeHtml(question.domain)}</span>
        <span class="meta-pill">${escapeHtml(question.question_type)}</span>
      </div>
      <p>${escapeHtml(compactText(question.question, 540))}</p>
      ${image}
      <div class="answer-line"><strong>Answer:</strong> ${escapeHtml(compactText(question.answer, 280))}</div>
      <div class="viewer-card-controls">
        <button class="viewer-nav-button" id="question-prev" type="button">Previous</button>
        <span class="viewer-counter">${state.questionIndex + 1} / ${questions.length}</span>
        <button class="viewer-nav-button" id="question-next" type="button">Next</button>
      </div>
    </article>
  `;

  const prev = document.getElementById("question-prev");
  const next = document.getElementById("question-next");
  prev.disabled = questions.length < 2;
  next.disabled = questions.length < 2;
  prev.addEventListener("click", () => {
    state.questionIndex -= 1;
    renderQuestions();
  });
  next.addEventListener("click", () => {
    state.questionIndex += 1;
    renderQuestions();
  });
}

function setupTrajectorySelect(trajectories) {
  const select = document.getElementById("trajectory-select");
  trajectories.forEach((trajectory) => {
    const option = document.createElement("option");
    option.value = trajectory.id;
    option.textContent = `${trajectory.id} (${trajectory.domain}, ${trajectory.outcome})`;
    select.appendChild(option);
  });
  select.addEventListener("change", () => {
    const index = trajectories.findIndex((item) => item.id === select.value);
    state.trajectoryIndex = index >= 0 ? index : 0;
    state.trajectoryStateIndex = 0;
    renderTrajectory();
  });
}

function renderTrajectory() {
  const viewer = document.getElementById("trajectory-viewer");
  const select = document.getElementById("trajectory-select");
  const trajectories = state.viewerData.trajectories;
  state.trajectoryIndex = normalizeIndex(state.trajectoryIndex, trajectories.length);
  const trajectory = trajectories[state.trajectoryIndex];
  if (!trajectory) {
    viewer.innerHTML = "";
    return;
  }

  select.value = trajectory.id;
  const states = trajectory.states || [];
  state.trajectoryStateIndex = normalizeIndex(state.trajectoryStateIndex, states.length);
  const item = states[state.trajectoryStateIndex];

  const stateCard = item
    ? `
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
          <p>${escapeHtml(compactText(item.observation_snippet, 620))}</p>
        </div>
      </article>
      <div class="viewer-card-controls">
        <button class="viewer-nav-button" id="state-prev" type="button">Previous state</button>
        <span class="viewer-counter">State ${state.trajectoryStateIndex + 1} / ${states.length}</span>
        <button class="viewer-nav-button" id="state-next" type="button">Next state</button>
      </div>
    `
    : `<div class="viewer-empty">No sampled states are available for this trajectory.</div>`;

  viewer.innerHTML = `
    <div class="trajectory-shell">
      <div class="trajectory-title">${escapeHtml(trajectory.goal)}</div>
      <div class="question-meta">
        <span class="meta-pill">${escapeHtml(trajectory.id)}</span>
        <span class="meta-pill">${escapeHtml(trajectory.environment)}</span>
        <span class="meta-pill">${escapeHtml(trajectory.outcome)}</span>
      </div>
      <div class="viewer-card-controls">
        <button class="viewer-nav-button" id="trajectory-prev" type="button">Previous trajectory</button>
        <span class="viewer-counter">Trajectory ${state.trajectoryIndex + 1} / ${trajectories.length}</span>
        <button class="viewer-nav-button" id="trajectory-next" type="button">Next trajectory</button>
      </div>
      ${stateCard}
    </div>
  `;

  const trajectoryPrev = document.getElementById("trajectory-prev");
  const trajectoryNext = document.getElementById("trajectory-next");
  trajectoryPrev.disabled = trajectories.length < 2;
  trajectoryNext.disabled = trajectories.length < 2;
  trajectoryPrev.addEventListener("click", () => {
    state.trajectoryIndex -= 1;
    state.trajectoryStateIndex = 0;
    renderTrajectory();
  });
  trajectoryNext.addEventListener("click", () => {
    state.trajectoryIndex += 1;
    state.trajectoryStateIndex = 0;
    renderTrajectory();
  });

  if (item) {
    const statePrev = document.getElementById("state-prev");
    const stateNext = document.getElementById("state-next");
    statePrev.disabled = states.length < 2;
    stateNext.disabled = states.length < 2;
    statePrev.addEventListener("click", () => {
      state.trajectoryStateIndex -= 1;
      renderTrajectory();
    });
    stateNext.addEventListener("click", () => {
      state.trajectoryStateIndex += 1;
      renderTrajectory();
    });
  }
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
