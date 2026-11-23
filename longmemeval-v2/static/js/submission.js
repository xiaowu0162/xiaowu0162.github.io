/*
 * Renders one leaderboard submission: headline metrics, operating points,
 * the submitted SYSTEM_DESCRIPTION.md (sanitized), and the code artifact.
 * The submission is chosen with ?id=<system id> from static/data/leaderboard.json.
 */
(function () {
  "use strict";

  const DATA_URL = "./static/data/leaderboard.json";
  const BREAKDOWN = [
    ["static", "Static"],
    ["dynamic", "Dynamic"],
    ["procedure", "Procedure"],
    ["gotchas", "Gotchas"],
  ];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text !== undefined && text !== null) {
      node.textContent = text;
    }
    return node;
  }

  function formatPercent(value) {
    return Number.isFinite(value) ? `${value.toFixed(1)}%` : "—";
  }

  function formatLatency(value) {
    if (!Number.isFinite(value)) {
      return "—";
    }
    if (value < 1) {
      return `${value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")} s`;
    }
    return value < 10 ? `${value.toFixed(2)} s` : `${value.toFixed(1)} s`;
  }

  function formatGain(value) {
    if (!Number.isFinite(value)) {
      return "—";
    }
    return `${value > 0 ? "+" : ""}${value.toFixed(3)}`;
  }

  function formatDate(iso) {
    const date = new Date(`${iso}T00:00:00`);
    return Number.isNaN(date.getTime())
      ? iso
      : date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }

  function statTile(label, value, note) {
    const tile = el("div", "sub-stat");
    tile.append(el("span", "sub-stat-label", label), el("strong", "sub-stat-value", value));
    if (note) {
      tile.append(el("span", "sub-stat-note", note));
    }
    return tile;
  }

  function section(id, title) {
    const node = el("section", "sub-card");
    if (id) {
      node.id = id;
    }
    node.append(el("h2", "sub-section-title", title));
    return node;
  }

  function rankIn(data, system, tierId) {
    const gains = data.systems
      .filter((other) => other.role === "submission" && other.results && other.results[tierId])
      .map((other) => other.results[tierId].lafsGain)
      .filter(Number.isFinite);
    const own = system.results[tierId].lafsGain;
    return Number.isFinite(own) ? 1 + gains.filter((gain) => gain > own).length : null;
  }

  function operatingPointTable(points) {
    const wrap = el("div", "table-wrap sub-table-wrap");
    const table = el("table", "table is-fullwidth sub-table");
    const head = el("thead");
    const headRow = el("tr");
    ["Operating point", "Accuracy", "Latency", ...BREAKDOWN.map(([, label]) => label)].forEach((label, index) => {
      const th = el("th", index ? "lb-num" : null, label);
      th.scope = "col";
      headRow.append(th);
    });
    head.append(headRow);
    const body = el("tbody");
    [...points].sort((a, b) => a.latency - b.latency).forEach((point) => {
      const row = el("tr");
      row.append(
        el("td", "sub-op-name", point.name),
        el("td", "lb-num lb-strong", formatPercent(point.accuracy)),
        el("td", "lb-num", formatLatency(point.latency)),
        ...BREAKDOWN.map(([key]) => el("td", `lb-num${Number.isFinite(point[key]) ? "" : " is-empty"}`, formatPercent(point[key]))),
      );
      body.append(row);
    });
    table.append(head, body);
    wrap.append(table);
    return wrap;
  }

  async function fetchText(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${url}: HTTP ${response.status}`);
    }
    return response.text();
  }

  function renderMarkdown(target, markdown) {
    if (!window.marked || !window.DOMPurify) {
      const fallback = el("pre", "sub-markdown-fallback");
      fallback.textContent = markdown;
      target.append(fallback);
      return;
    }
    const html = window.marked.parse(markdown, { gfm: true, breaks: false });
    target.innerHTML = window.DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
    // Keep the page outline intact: submitted headings start two levels down.
    target.querySelectorAll("h1, h2, h3, h4").forEach((heading) => {
      const level = Math.min(6, Number(heading.tagName.slice(1)) + 2);
      const replacement = document.createElement(`h${level}`);
      replacement.innerHTML = heading.innerHTML;
      heading.replaceWith(replacement);
    });
    target.querySelectorAll("a[href]").forEach((anchor) => {
      if (/^https?:\/\//.test(anchor.getAttribute("href"))) {
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
      }
    });
    target.querySelectorAll("table").forEach((table) => {
      table.classList.add("table");
      const wrap = el("div", "sub-md-table");
      table.replaceWith(wrap);
      wrap.append(table);
    });
    if (window.MathJax && window.MathJax.startup) {
      window.MathJax.startup.promise.then(() => window.MathJax.typesetPromise([target])).catch(() => {});
    }
  }

  function notFound(app, message) {
    app.replaceChildren();
    const box = el("div", "sub-card sub-missing");
    box.append(el("h1", "sub-title", "Submission not found"), el("p", null, message));
    const back = el("a", "lb-action is-primary", "Back to the leaderboard");
    back.href = "./#leaderboard";
    box.append(back);
    app.append(box);
  }

  async function init() {
    const app = document.getElementById("sub-app");
    const id = new URLSearchParams(window.location.search).get("id");
    let data;
    try {
      const response = await fetch(DATA_URL);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      data = await response.json();
    } catch (error) {
      notFound(app, "Leaderboard data could not be loaded.");
      return;
    }
    const system = data.systems.find((candidate) => candidate.id === id && candidate.package);
    if (!system) {
      notFound(app, "This link does not match a published leaderboard submission.");
      return;
    }

    const pkg = system.package;
    const base = `./${pkg.path}/`;
    document.title = `${system.name} · LongMemEval-V2 leaderboard`;
    app.replaceChildren();

    // Header.
    const header = el("header", "sub-header");
    header.append(el("p", "sub-kicker", "LongMemEval-V2 leaderboard submission"), el("h1", "sub-title", system.name));
    const meta = [system.family, system.team, system.published ? `Published ${formatDate(system.published)}` : null]
      .filter(Boolean)
      .join(" · ");
    header.append(el("p", "sub-meta", meta));
    const jump = el("nav", "sub-jump");
    jump.setAttribute("aria-label", "On this page");
    [["#description", "Description"], pkg.code ? ["#code", "Code"] : null, [base + pkg.overview, "Package overview (JSON)"]]
      .filter(Boolean)
      .forEach(([href, label]) => {
        const link = el("a", "lb-link", label);
        link.href = href;
        jump.append(link);
      });
    header.append(jump);
    app.append(header);

    // Results per tier.
    const tierLabels = Object.fromEntries(data.tiers.map((tier) => [tier.id, tier.label]));
    data.tiers.filter((tier) => system.results[tier.id]).forEach((tier) => {
      const result = system.results[tier.id];
      const best = result.operatingPoints.reduce((a, b) => (b.accuracy > a.accuracy ? b : a), result.operatingPoints[0]);
      const rank = rankIn(data, system, tier.id);
      const card = section(null, `Results on ${tierLabels[tier.id]}`);
      const stats = el("div", "sub-stats");
      stats.append(
        statTile("LAFS Gain", formatGain(result.lafsGain), rank ? `Rank ${rank} on ${tierLabels[tier.id]}` : null),
        statTile("Accuracy", formatPercent(best.accuracy), result.operatingPoints.length > 1 ? `best point: ${best.name}` : null),
        statTile("Memory-query latency", formatLatency(best.latency), "average per question"),
        statTile("Operating points", String(result.operatingPoints.length)),
      );
      card.append(stats, operatingPointTable(result.operatingPoints));
      card.append(el("p", "sub-note", "Metrics and LAFS Gain were recomputed by the maintainers from the submitted run logs."));
      app.append(card);
    });

    // System description.
    const descriptionCard = section("description", "System description");
    descriptionCard.append(el("p", "sub-note is-intro", "As submitted by the authors in SYSTEM_DESCRIPTION.md."));
    const markdownTarget = el("div", "sub-markdown content");
    descriptionCard.append(markdownTarget);
    app.append(descriptionCard);

    // Code artifact.
    let codeTarget = null;
    if (pkg.code) {
      const codeCard = section("code", "Code artifact");
      const bar = el("div", "sub-code-bar");
      bar.append(el("code", "sub-code-file", pkg.code));
      const lines = el("span", "sub-code-lines");
      bar.append(lines);
      const download = el("a", "lb-link", "Download");
      download.href = base + pkg.code;
      download.setAttribute("download", pkg.code);
      bar.append(download);
      const pre = el("pre", "sub-code");
      codeTarget = { code: el("code"), lines };
      pre.append(codeTarget.code);
      codeCard.append(bar, pre);
      app.append(codeCard);
    }

    try {
      renderMarkdown(markdownTarget, await fetchText(base + pkg.description));
    } catch (error) {
      markdownTarget.append(el("p", "sub-note", "The system description could not be loaded."));
    }
    if (codeTarget) {
      try {
        const source = await fetchText(base + pkg.code);
        codeTarget.code.textContent = source;
        codeTarget.lines.textContent = `${source.split("\n").length.toLocaleString("en-US")} lines`;
      } catch (error) {
        codeTarget.code.textContent = "The code artifact could not be loaded.";
      }
    }
    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target) {
        target.scrollIntoView();
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
