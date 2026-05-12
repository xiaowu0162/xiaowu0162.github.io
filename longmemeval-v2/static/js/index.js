const state = {
  viewerData: null,
  questionIndex: 0,
  trajectoryIndex: 0,
  trajectoryStateIndex: 0,
  leaderboardSort: {
    small: { key: "lafsGain", direction: "desc" },
    medium: { key: "lafsGain", direction: "desc" },
  },
};

const leaderboardEntries = [
  {
    system: "No retrieval",
    family: "Reader only",
    smallAccuracy: "1.3%",
    mediumAccuracy: "1.3%",
    smallLatency: "0s",
    mediumLatency: "0s",
    smallStatic: "0.0%",
    mediumStatic: "0.0%",
    smallDynamic: "0.8%",
    mediumDynamic: "0.8%",
    smallProcedure: "9.4%",
    mediumProcedure: "9.4%",
    smallGotchas: "13.8%",
    mediumGotchas: "13.8%",
    smallAccuracyValue: 1.3,
    mediumAccuracyValue: 1.3,
    smallLatencyValue: 0,
    mediumLatencyValue: 0,
    smallStaticValue: 0.0,
    mediumStaticValue: 0.0,
    smallDynamicValue: 0.8,
    mediumDynamicValue: 0.8,
    smallProcedureValue: 9.4,
    mediumProcedureValue: 9.4,
    smallGotchasValue: 13.8,
    mediumGotchasValue: 13.8,
    lafsGain: null,
  },
  {
    system: "RAG: query to slice",
    family: "RAG",
    smallAccuracy: "42.8%",
    mediumAccuracy: "38.1%",
    smallLatency: "0.1s",
    mediumLatency: "0.1s",
    smallStatic: "47.1%",
    mediumStatic: "43.4%",
    smallDynamic: "42.5%",
    mediumDynamic: "40.5%",
    smallProcedure: "41.5%",
    mediumProcedure: "29.3%",
    smallGotchas: "20.7%",
    mediumGotchas: "24.2%",
    smallAccuracyValue: 42.8,
    mediumAccuracyValue: 38.1,
    smallLatencyValue: 0.1,
    mediumLatencyValue: 0.1,
    smallStaticValue: 47.1,
    mediumStaticValue: 43.4,
    smallDynamicValue: 42.5,
    mediumDynamicValue: 40.5,
    smallProcedureValue: 41.5,
    mediumProcedureValue: 29.3,
    smallGotchasValue: 20.7,
    mediumGotchasValue: 24.2,
    lafsGain: null,
  },
  {
    system: "RAG: query to slice + notes",
    family: "RAG",
    smallAccuracy: "51.0%",
    mediumAccuracy: "45.9%",
    smallLatency: "0.2s",
    mediumLatency: "0.3s",
    smallStatic: "52.4%",
    mediumStatic: "48.7%",
    smallDynamic: "49.6%",
    mediumDynamic: "47.2%",
    smallProcedure: "52.8%",
    mediumProcedure: "43.4%",
    smallGotchas: "41.4%",
    mediumGotchas: "31.0%",
    smallAccuracyValue: 51.0,
    mediumAccuracyValue: 45.9,
    smallLatencyValue: 0.2,
    mediumLatencyValue: 0.3,
    smallStaticValue: 52.4,
    mediumStaticValue: 48.7,
    smallDynamicValue: 49.6,
    mediumDynamicValue: 47.2,
    smallProcedureValue: 52.8,
    mediumProcedureValue: 43.4,
    smallGotchasValue: 41.4,
    mediumGotchasValue: 31.0,
    lafsGain: null,
  },
  {
    system: "AgentRunbook-R",
    family: "RAG",
    smallAccuracy: "58.6%",
    mediumAccuracy: "57.0%",
    smallLatency: "26.9s",
    mediumLatency: "25.8s",
    smallStatic: "66.1%",
    mediumStatic: "63.0%",
    smallDynamic: "58.3%",
    mediumDynamic: "61.4%",
    smallProcedure: "52.8%",
    mediumProcedure: "47.2%",
    smallGotchas: "31.0%",
    mediumGotchas: "34.5%",
    smallAccuracyValue: 58.6,
    mediumAccuracyValue: 57.0,
    smallLatencyValue: 26.9,
    mediumLatencyValue: 25.8,
    smallStaticValue: 66.1,
    mediumStaticValue: 63.0,
    smallDynamicValue: 58.3,
    mediumDynamicValue: 61.4,
    smallProcedureValue: 52.8,
    mediumProcedureValue: 47.2,
    smallGotchasValue: 31.0,
    mediumGotchasValue: 34.5,
    lafsGain: null,
  },
  {
    system: "Codex",
    family: "Coding agent",
    smallAccuracy: "69.9%",
    mediumAccuracy: "68.7%",
    smallLatency: "177.2s",
    mediumLatency: "185.8s",
    smallStatic: "80.4%",
    mediumStatic: "78.3%",
    smallDynamic: "67.0%",
    mediumDynamic: "64.6%",
    smallProcedure: "57.5%",
    mediumProcedure: "61.3%",
    smallGotchas: "58.6%",
    mediumGotchas: "51.7%",
    smallAccuracyValue: 69.9,
    mediumAccuracyValue: 68.7,
    smallLatencyValue: 177.2,
    mediumLatencyValue: 185.8,
    smallStaticValue: 80.4,
    mediumStaticValue: 78.3,
    smallDynamicValue: 67.0,
    mediumDynamicValue: 64.6,
    smallProcedureValue: 57.5,
    mediumProcedureValue: 61.3,
    smallGotchasValue: 58.6,
    mediumGotchasValue: 51.7,
    lafsGain: null,
  },
  {
    system: "AgentRunbook-C",
    family: "Coding agent",
    smallAccuracy: "74.9%",
    mediumAccuracy: "70.1%",
    smallLatency: "108.3s",
    mediumLatency: "139.9s",
    smallStatic: "82.0%",
    mediumStatic: "78.8%",
    smallDynamic: "72.4%",
    mediumDynamic: "70.1%",
    smallProcedure: "72.6%",
    mediumProcedure: "61.3%",
    smallGotchas: "48.3%",
    mediumGotchas: "44.9%",
    smallAccuracyValue: 74.9,
    mediumAccuracyValue: 70.1,
    smallLatencyValue: 108.3,
    mediumLatencyValue: 139.9,
    smallStaticValue: 82.0,
    mediumStaticValue: 78.8,
    smallDynamicValue: 72.4,
    mediumDynamicValue: 70.1,
    smallProcedureValue: 72.6,
    mediumProcedureValue: 61.3,
    smallGotchasValue: 48.3,
    mediumGotchasValue: 44.9,
    lafsGain: null,
  },
];

leaderboardEntries.forEach((entry, index) => {
  entry.order = index;
});

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

function formatTrajectoryUrl(value) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return "";
  }

  try {
    const url = new URL(raw);
    const originLabels = {
      "http://localhost:9080": "REDDIT_ROOT",
      "http://localhost:9082": "SHOPPING_ROOT",
      "http://localhost:9083": "SHOPPING_ADMIN_ROOT",
    };
    const rootLabel =
      originLabels[url.origin] ||
      (url.hostname.endsWith(".service-now.com") ? "WORKARENA_ROOT" : "SITE_ROOT");
    return `${rootLabel}${url.pathname}${url.search}${url.hash}`;
  } catch {
    return raw;
  }
}

function normalizeIndex(index, length) {
  if (length <= 0) {
    return 0;
  }
  return ((index % length) + length) % length;
}

function formatMetric(value, suffix = "") {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return `${Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}${suffix}`;
}

function currentPageLink() {
  return `${window.location.pathname}${window.location.search}#leaderboard`;
}

function trajectoryDomainLabel(trajectory) {
  return trajectory.subdomain || trajectory.environment || trajectory.domain || "trajectory";
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
    const stateCount = trajectory.state_count || (trajectory.states || []).length;
    option.textContent = `${trajectory.id} (${trajectoryDomainLabel(trajectory)}, ${trajectory.outcome}, ${stateCount} states)`;
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
  const displayUrl = item ? formatTrajectoryUrl(item.url) : "";
  const stateCount = trajectory.state_count || states.length;
  const domainLabel = trajectoryDomainLabel(trajectory);

  const stateCard = item
    ? `
      <article class="trajectory-state">
        <figure class="trajectory-observation">
          <img src="./${escapeHtml(item.screenshot)}" alt="Trajectory ${escapeHtml(trajectory.id)} state ${escapeHtml(item.state_index)} observation screenshot">
          <figcaption>Observation screenshot</figcaption>
        </figure>
        <div class="state-text">
          ${displayUrl ? `<div class="state-field"><strong>URL</strong><code>${escapeHtml(displayUrl)}</code></div>` : ""}
          <div class="state-field">
            <strong>Thought</strong>
            <p>${escapeHtml(item.thought || "No model thought recorded for this state.")}</p>
          </div>
          <div class="state-field">
            <strong>Action</strong>
            <code>${escapeHtml(item.action || "Start state")}</code>
          </div>
        </div>
      </article>
      <div class="viewer-card-controls">
        <button class="viewer-nav-button" id="state-prev" type="button">Previous state</button>
        <span class="viewer-counter">State ${state.trajectoryStateIndex + 1} / ${states.length}</span>
        <button class="viewer-nav-button" id="state-next" type="button">Next state</button>
      </div>
    `
    : `<div class="viewer-empty">No states are available for this trajectory.</div>`;

  viewer.innerHTML = `
    <div class="trajectory-shell">
      <div class="trajectory-goal">
        <span>Goal</span>
        <p>${escapeHtml(trajectory.goal)}</p>
      </div>
      <div class="question-meta">
        <span class="meta-pill">${escapeHtml(trajectory.id)}</span>
        <span class="meta-pill">${escapeHtml(domainLabel)}</span>
        <span class="meta-pill">${escapeHtml(trajectory.outcome)}</span>
        <span class="meta-pill">${stateCount} states</span>
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

function leaderboardMetricKey(tier, sortKey) {
  if (sortKey === "lafsGain") {
    return sortKey;
  }
  return `${tier}${sortKey.charAt(0).toUpperCase()}${sortKey.slice(1)}Value`;
}

function compareLeaderboardValues(leftValue, rightValue, direction) {
  const leftMissing = leftValue === null || leftValue === undefined;
  const rightMissing = rightValue === null || rightValue === undefined;
  if (leftMissing && rightMissing) {
    return 0;
  }
  if (leftMissing) {
    return 1;
  }
  if (rightMissing) {
    return -1;
  }
  return direction === "asc" ? leftValue - rightValue : rightValue - leftValue;
}

function renderLeaderboardTier(tier) {
  const body = document.getElementById(`leaderboard-${tier}-body`);
  if (!body) {
    return;
  }

  if (leaderboardEntries.length === 0) {
    body.innerHTML = `<tr><td colspan="9">Leaderboard entries coming soon.</td></tr>`;
    return;
  }

  const { key: sortKey, direction } = state.leaderboardSort[tier];
  const metricKey = leaderboardMetricKey(tier, sortKey);
  const sorted = [...leaderboardEntries].sort((left, right) => {
    const diff = compareLeaderboardValues(left[metricKey], right[metricKey], direction);
    return Number.isFinite(diff) && diff !== 0 ? diff : left.order - right.order;
  });

  body.innerHTML = sorted
    .map(
      (entry) => `
        <tr>
          <td><a href="${escapeHtml(entry.url || currentPageLink())}">${escapeHtml(entry.system)}</a></td>
          <td>${escapeHtml(entry.family)}</td>
          <td>${escapeHtml(formatMetric(entry.lafsGain))}</td>
          <td>${escapeHtml(entry[`${tier}Latency`])}</td>
          <td>${escapeHtml(entry[`${tier}Accuracy`])}</td>
          <td>${escapeHtml(entry[`${tier}Static`])}</td>
          <td>${escapeHtml(entry[`${tier}Dynamic`])}</td>
          <td>${escapeHtml(entry[`${tier}Procedure`])}</td>
          <td>${escapeHtml(entry[`${tier}Gotchas`])}</td>
        </tr>
      `,
    )
    .join("");
}

function renderLeaderboard() {
  renderLeaderboardTier("small");
  renderLeaderboardTier("medium");
}

function setupLeaderboard() {
  const buttons = document.querySelectorAll(".leaderboard-sort");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const tier = button.dataset.tier;
      const sortKey = button.dataset.sort;
      const current = state.leaderboardSort[tier];
      const defaultDirection = sortKey === "latency" ? "asc" : "desc";
      const direction = current.key === sortKey
        ? (current.direction === "desc" ? "asc" : "desc")
        : defaultDirection;
      state.leaderboardSort[tier] = { key: sortKey, direction };
      document.querySelectorAll(`.leaderboard-sort[data-tier="${tier}"]`).forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
        if (active) {
          item.dataset.direction = direction;
        } else {
          delete item.dataset.direction;
        }
      });
      renderLeaderboardTier(tier);
    });
  });
  renderLeaderboard();
}

document.addEventListener("DOMContentLoaded", () => {
  setupToc();
  setupLeaderboard();
  setupDataViewer().catch((error) => {
    const summary = document.getElementById("viewer-summary");
    summary.innerHTML = `<div class="viewer-stat"><strong>Data unavailable</strong><span>${escapeHtml(error.message)}</span></div>`;
  });
});
