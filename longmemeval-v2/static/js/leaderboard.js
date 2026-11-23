/*
 * LongMemEval-V2 leaderboard: accuracy-latency chart + ranked table.
 *
 * Data lives in static/data/leaderboard.json. To promote a validated
 * submission, add one entry to `systems` with role "submission"; colors,
 * ranks, the chart, and the table all derive from that file.
 *
 * Strings from the data file are always inserted with textContent.
 */
(function () {
  "use strict";

  const DATA_URL = "./static/data/leaderboard.json";
  const SVG_NS = "http://www.w3.org/2000/svg";

  // Categorical slots in fixed order (validated: slots 1-3 pass the all-pairs
  // colorblind checks on white). A submission's color follows its position in
  // leaderboard.json, never its rank, so it stays stable across tiers.
  const SERIES_COLORS = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6", "#e34948"];
  const NEUTRAL = "#7b8794";
  const X_DOMAIN = [0.07, 260];
  const BREAKDOWN_KEYS = ["static", "dynamic", "procedure", "gotchas"];
  const LABEL_FONT = '"Noto Sans", sans-serif';

  const state = {
    data: null,
    colors: new Map(),
    tier: "small",
    sort: { key: "lafsGain", direction: "desc" },
    pinned: {},
    hovered: null,
    expanded: new Set(),
    view: null,
    chart: null,
  };

  const measureContext = document.createElement("canvas").getContext("2d");

  /* ------------------------------------------------------------------ */
  /* Small helpers                                                       */
  /* ------------------------------------------------------------------ */

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

  function svgEl(tag, attrs, className) {
    const node = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs || {}).forEach(([key, value]) => node.setAttribute(key, String(value)));
    if (className) {
      node.setAttribute("class", className);
    }
    return node;
  }

  function trimZeros(text) {
    return text.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  }

  function formatPercent(value) {
    return Number.isFinite(value) ? `${value.toFixed(1)}%` : "—";
  }

  function formatLatency(value) {
    if (!Number.isFinite(value)) {
      return "—";
    }
    if (value === 0) {
      return "0 s";
    }
    if (value < 1) {
      return `${trimZeros(value.toFixed(2))} s`;
    }
    return value < 10 ? `${value.toFixed(2)} s` : `${value.toFixed(1)} s`;
  }

  function formatGain(value) {
    if (!Number.isFinite(value)) {
      return "—";
    }
    const text = value.toFixed(3);
    return value > 0 ? `+${text}` : text;
  }

  function textWidth(text, size, weight) {
    measureContext.font = `${weight || 400} ${size}px ${LABEL_FONT}`;
    return measureContext.measureText(text).width;
  }

  /* ------------------------------------------------------------------ */
  /* LAFS (mirrors leaderboard/compute_lafs.py in the benchmark repo)    */
  /* ------------------------------------------------------------------ */

  function bestAccuracyAt(points, latencyBudget, floor) {
    let best = floor;
    points.forEach((point) => {
      if (point.latency <= latencyBudget && point.accuracy > best) {
        best = point.accuracy;
      }
    });
    return best;
  }

  function lafsSegments(points, cfg) {
    const cuts = new Set([cfg.tMin, cfg.tMax]);
    points.forEach((point) => {
      if (point.latency > cfg.tMin && point.latency < cfg.tMax) {
        cuts.add(point.latency);
      }
    });
    const sorted = [...cuts].sort((a, b) => a - b);
    const segments = [];
    for (let i = 0; i < sorted.length - 1; i += 1) {
      const start = sorted[i];
      segments.push({ start, end: sorted[i + 1], value: bestAccuracyAt(points, start, cfg.floorAccuracy) });
    }
    return segments;
  }

  function lafs(points, cfg) {
    const total = lafsSegments(points, cfg).reduce(
      (sum, segment) => sum + segment.value * Math.log(segment.end / segment.start),
      0,
    );
    return total / Math.log(cfg.tMax / cfg.tMin);
  }

  // Latency intervals where adding the submission raises the frontier.
  function gainSegments(referencePoints, submissionPoints, cfg) {
    return lafsSegments(referencePoints.concat(submissionPoints), cfg)
      .map((segment) => ({
        ...segment,
        reference: bestAccuracyAt(referencePoints, segment.start, cfg.floorAccuracy),
      }))
      .filter((segment) => segment.value > segment.reference + 1e-9);
  }

  function paretoFrontier(points) {
    const sorted = points
      .filter((point) => point.latency > 0)
      .sort((a, b) => a.latency - b.latency || b.accuracy - a.accuracy);
    const frontier = [];
    let best = -Infinity;
    sorted.forEach((point) => {
      if (point.accuracy > best) {
        frontier.push(point);
        best = point.accuracy;
      }
    });
    return frontier;
  }

  /* ------------------------------------------------------------------ */
  /* View model for one tier                                             */
  /* ------------------------------------------------------------------ */

  function buildView(tier) {
    const cfg = state.data.lafs;
    const entries = state.data.systems
      .map((system, order) => ({ system, order }))
      .filter(({ system }) => system.results && system.results[tier])
      .map(({ system, order }) => {
        const result = system.results[tier];
        const points = result.operatingPoints.map((point) => ({ ...point, systemId: system.id }));
        const representative = points.reduce((best, point) => (point.accuracy > best.accuracy ? point : best), points[0]);
        return {
          id: system.id,
          system,
          order,
          role: system.role,
          points,
          representative,
          color: state.colors.get(system.id) || NEUTRAL,
          storedGain: Number.isFinite(result.lafsGain) ? result.lafsGain : null,
          gain: null,
          rank: null,
          gainSegments: [],
        };
      });

    const referencePoints = entries.filter((entry) => entry.role === "reference").flatMap((entry) => entry.points);
    const referenceLafs = lafs(referencePoints, cfg);
    const submissions = entries.filter((entry) => entry.role === "submission");

    submissions.forEach((entry) => {
      const computed = lafs(referencePoints.concat(entry.points), cfg) - referenceLafs;
      if (entry.storedGain !== null && Math.abs(computed - entry.storedGain) > 0.005) {
        console.warn(
          `[leaderboard] ${entry.id} (${tier}): published LAFS Gain ${entry.storedGain} ` +
            `differs from the value recomputed from its operating points (${computed.toFixed(4)}).`,
        );
      }
      entry.gain = entry.storedGain !== null ? entry.storedGain : computed;
      entry.gainSegments = gainSegments(referencePoints, entry.points, cfg);
    });

    [...submissions]
      .sort((a, b) => b.gain - a.gain || b.representative.accuracy - a.representative.accuracy)
      .forEach((entry, index) => {
        entry.rank = index + 1;
      });

    return {
      tier,
      cfg,
      entries,
      submissions,
      referencePoints,
      byId: new Map(entries.map((entry) => [entry.id, entry])),
      maxGain: Math.max(0, ...submissions.map((entry) => entry.gain)),
    };
  }

  // The submission whose frontier gain is shaded: hovered, else pinned, else rank 1.
  function areaFocusId() {
    const view = state.view;
    if (!view) {
      return null;
    }
    const hovered = view.byId.get(state.hovered);
    if (hovered && hovered.role === "submission") {
      return hovered.id;
    }
    const pinned = view.byId.get(state.pinned[view.tier]);
    if (pinned) {
      return pinned.id;
    }
    const top = view.submissions.find((entry) => entry.rank === 1);
    return top ? top.id : null;
  }

  /* ------------------------------------------------------------------ */
  /* Chart                                                               */
  /* ------------------------------------------------------------------ */

  function niceYDomain(points) {
    const values = points.map((point) => point.accuracy);
    const low = Math.min(...values);
    const high = Math.max(...values);
    const step = high - low > 30 ? 10 : 5;
    return {
      min: Math.max(0, Math.floor((low - 4) / step) * step),
      max: Math.min(100, Math.ceil((high + 4) / step) * step),
      step,
    };
  }

  function renderChart() {
    const host = document.getElementById("lb-chart");
    const view = state.view;
    if (!host || !view) {
      return;
    }

    const width = Math.max(280, Math.round(host.clientWidth || 720));
    const compact = width < 560;
    const height = Math.round(Math.min(440, Math.max(290, width * 0.5)));
    const margin = { top: 30, right: compact ? 12 : 20, bottom: 46, left: compact ? 40 : 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const plotted = view.entries.flatMap((entry) => entry.points.map((point) => ({ point, entry })))
      .filter(({ point }) => point.latency > 0);
    const yDomain = niceYDomain(plotted.map(({ point }) => point));

    const logMin = Math.log10(X_DOMAIN[0]);
    const logMax = Math.log10(X_DOMAIN[1]);
    const x = (value) => margin.left + ((Math.log10(value) - logMin) / (logMax - logMin)) * innerWidth;
    const y = (value) => margin.top + (1 - (value - yDomain.min) / (yDomain.max - yDomain.min)) * innerHeight;
    const right = margin.left + innerWidth;
    const bottom = margin.top + innerHeight;

    const root = svgEl("svg", {
      viewBox: `0 0 ${width} ${height}`,
      width,
      height,
      role: "img",
      "aria-label": `Accuracy versus memory-query latency for ${view.tier === "small" ? "LME-V2-Small" : "LME-V2-Medium"}. The table below lists every value.`,
    }, "lb-svg");

    // Outside-the-window shading and the scoring-window bracket.
    const { tMin, tMax } = view.cfg;
    root.append(
      svgEl("rect", { x: margin.left, y: margin.top, width: x(tMin) - margin.left, height: innerHeight }, "lb-outside"),
      svgEl("rect", { x: x(tMax), y: margin.top, width: right - x(tMax), height: innerHeight }, "lb-outside"),
    );
    const bracket = svgEl("g", {}, "lb-window");
    const bracketY = margin.top - 9;
    bracket.append(
      svgEl("path", { d: `M${x(tMin)},${bracketY + 5}V${bracketY}H${x(tMax)}V${bracketY + 5}` }),
    );
    const bracketLabel = svgEl("text", { x: (x(tMin) + x(tMax)) / 2, y: bracketY - 5, "text-anchor": "middle" });
    bracketLabel.textContent = compact ? "LAFS window 1–200 s" : "LAFS scoring window (1–200 s)";
    bracket.append(bracketLabel);
    root.append(bracket);

    // Grid and axes.
    const grid = svgEl("g", {}, "lb-grid");
    const axis = svgEl("g", {}, "lb-axis");
    for (let value = yDomain.min; value <= yDomain.max + 1e-9; value += yDomain.step) {
      grid.append(svgEl("line", { x1: margin.left, x2: right, y1: y(value), y2: y(value) }));
      const label = svgEl("text", { x: margin.left - 8, y: y(value) + 4, "text-anchor": "end" });
      label.textContent = `${value}%`;
      axis.append(label);
    }
    const xTicks = compact ? [0.1, 1, 10, 100] : [0.1, 0.3, 1, 3, 10, 30, 100, 200];
    xTicks.forEach((value) => {
      grid.append(svgEl("line", { x1: x(value), x2: x(value), y1: margin.top, y2: bottom }));
      const label = svgEl("text", { x: x(value), y: bottom + 17, "text-anchor": "middle" });
      label.textContent = `${value}s`;
      axis.append(label);
    });
    axis.append(svgEl("line", { x1: margin.left, x2: right, y1: bottom, y2: bottom }, "lb-baseline"));
    const xTitle = svgEl("text", { x: margin.left + innerWidth / 2, y: height - 6, "text-anchor": "middle" }, "lb-axis-title");
    xTitle.textContent = "Average memory-query latency (log scale)";
    axis.append(xTitle);
    root.append(grid, axis);

    // Layers filled below; focus layer is redrawn on hover.
    const focusLayer = svgEl("g", {}, "lb-focus-layer");
    const frontierLayer = svgEl("g", {}, "lb-frontier-layer");
    const seriesLayer = svgEl("g", {}, "lb-series-layer");
    const labelLayer = svgEl("g", {}, "lb-label-layer");
    const hitLayer = svgEl("g", {}, "lb-hit-layer");
    root.append(focusLayer, frontierLayer, seriesLayer, labelLayer, hitLayer);

    // Reference frontier as a step line.
    const lineSegments = [];
    const frontier = paretoFrontier(view.referencePoints);
    if (frontier.length) {
      let path = "";
      let previous = null;
      frontier.forEach((point, index) => {
        const px = x(Math.max(point.latency, X_DOMAIN[0]));
        const py = y(point.accuracy);
        if (index === 0) {
          path += `M${px},${py}`;
        } else {
          path += `H${px}V${py}`;
          lineSegments.push([previous[0], previous[1], px, previous[1]], [px, previous[1], px, py]);
        }
        previous = [px, py];
      });
      path += `H${right}`;
      lineSegments.push([previous[0], previous[1], right, previous[1]]);
      frontierLayer.append(svgEl("path", { d: path }, "lb-ref-frontier"));
    }

    // Series: reference + baseline dots, submission lines + dots.
    const markers = [];
    view.entries.forEach((entry) => {
      const visible = entry.points.filter((point) => point.latency > 0).sort((a, b) => a.latency - b.latency);
      if (!visible.length) {
        return;
      }
      const group = svgEl("g", { "data-id": entry.id }, `lb-series is-${entry.role}`);
      group.style.setProperty("--series", entry.color);
      if (entry.role === "submission" && visible.length > 1) {
        const d = visible.map((point, index) => `${index ? "L" : "M"}${x(point.latency)},${y(point.accuracy)}`).join("");
        group.append(svgEl("path", { d }, "lb-series-line"));
        for (let i = 1; i < visible.length; i += 1) {
          lineSegments.push([x(visible[i - 1].latency), y(visible[i - 1].accuracy), x(visible[i].latency), y(visible[i].accuracy)]);
        }
      }
      visible.forEach((point) => {
        const cx = x(point.latency);
        const cy = y(point.accuracy);
        const r = entry.role === "submission" ? 5.5 : 4.5;
        group.append(svgEl("circle", { cx, cy, r }, "lb-dot"));
        markers.push({ entry, point, cx, cy, r });
      });
      seriesLayer.append(group);
    });

    // Direct labels: submissions first (they matter most), then references.
    const labelItems = [];
    view.entries.forEach((entry) => {
      const anchor = entry.representative;
      if (!(anchor.latency > 0)) {
        return;
      }
      const isSubmission = entry.role === "submission";
      labelItems.push({
        text: isSubmission ? entry.system.name : entry.system.shortName || entry.system.name,
        px: x(anchor.latency),
        py: y(anchor.accuracy),
        r: isSubmission ? 5.5 : 4.5,
        size: isSubmission ? 11.5 : 11,
        weight: isSubmission ? 700 : 400,
        className: isSubmission ? "lb-point-label is-submission" : "lb-point-label",
        priority: isSubmission ? entry.rank : 100 + entry.order,
        id: entry.id,
      });
    });
    placeLabels(labelItems, markers, lineSegments, { left: margin.left + 2, top: margin.top + 2, right: width - 2, bottom: bottom - 2 })
      .forEach((label) => {
        const text = svgEl("text", { x: label.x, y: label.y, "text-anchor": label.anchor, "data-id": label.id }, label.className);
        text.textContent = label.text;
        labelLayer.append(text);
      });

    // Hit targets (24px+) with keyboard focus.
    markers.forEach((marker) => {
      const hit = svgEl("circle", { cx: marker.cx, cy: marker.cy, r: 13, tabindex: 0, "data-id": marker.entry.id }, "lb-hit");
      hit.setAttribute(
        "aria-label",
        `${marker.entry.system.name}${marker.entry.points.length > 1 ? `, ${marker.point.name}` : ""}: ` +
          `${formatPercent(marker.point.accuracy)} accuracy at ${formatLatency(marker.point.latency)}`,
      );
      const enter = () => {
        setHover(marker.entry.id);
        showTooltip(marker.entry, marker.point, marker.cx, marker.cy);
      };
      const leave = () => {
        hideTooltip();
        setHover(null);
      };
      hit.addEventListener("pointerenter", enter);
      hit.addEventListener("focus", enter);
      hit.addEventListener("pointerleave", leave);
      hit.addEventListener("blur", leave);
      hit.addEventListener("click", () => pin(marker.entry.id));
      hit.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          pin(marker.entry.id);
        }
      });
      hitLayer.append(hit);
    });

    host.replaceChildren(root);
    state.chart = { x, y, right, focusLayer, root };

    const omitted = view.entries.filter((entry) => !entry.points.some((point) => point.latency > 0));
    const note = document.getElementById("lb-omitted-note");
    if (note) {
      note.textContent = omitted.length
        ? `${omitted
            .map((entry) => `${entry.system.name} (${formatLatency(entry.representative.latency)}, ${formatPercent(entry.representative.accuracy)})`)
            .join(", ")} ${omitted.length === 1 ? "is" : "are"} in the table but cannot be placed on a log scale.`
        : "";
    }
    renderFocus();
  }

  function placeLabels(items, markers, segments, bounds) {
    const occupied = markers.map((marker) => ({
      left: marker.cx - marker.r - 2,
      right: marker.cx + marker.r + 2,
      top: marker.cy - marker.r - 2,
      bottom: marker.cy + marker.r + 2,
    }));
    // Lines become a chain of small boxes so labels never sit on a stroke.
    segments.forEach(([x1, y1, x2, y2]) => {
      const steps = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 4));
      for (let i = 0; i <= steps; i += 1) {
        const px = x1 + ((x2 - x1) * i) / steps;
        const py = y1 + ((y2 - y1) * i) / steps;
        occupied.push({ left: px - 2, right: px + 2, top: py - 2, bottom: py + 2 });
      }
    });
    const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    const inside = (box) =>
      box.left >= bounds.left && box.right <= bounds.right && box.top >= bounds.top && box.bottom <= bounds.bottom;

    const placed = [];
    [...items].sort((a, b) => a.priority - b.priority).forEach((item) => {
      const width = textWidth(item.text, item.size, item.weight);
      const height = item.size + 2;
      const gap = item.r + 5;
      const candidates = [
        { anchor: "start", x: item.px + gap, y: item.py + item.size * 0.36, box: { left: item.px + gap, right: item.px + gap + width, top: item.py - height / 2, bottom: item.py + height / 2 } },
        { anchor: "end", x: item.px - gap, y: item.py + item.size * 0.36, box: { left: item.px - gap - width, right: item.px - gap, top: item.py - height / 2, bottom: item.py + height / 2 } },
        { anchor: "middle", x: item.px, y: item.py - gap - 1, box: { left: item.px - width / 2, right: item.px + width / 2, top: item.py - gap - height, bottom: item.py - gap } },
        { anchor: "middle", x: item.px, y: item.py + gap + item.size * 0.8, box: { left: item.px - width / 2, right: item.px + width / 2, top: item.py + gap, bottom: item.py + gap + height } },
      ];
      const choice = candidates.find((candidate) => inside(candidate.box) && !occupied.some((box) => overlaps(candidate.box, box)));
      if (choice) {
        occupied.push({ left: choice.box.left - 3, right: choice.box.right + 3, top: choice.box.top - 1, bottom: choice.box.bottom + 1 });
        placed.push({ ...item, ...choice });
      }
    });
    return placed;
  }

  function renderFocus() {
    const chart = state.chart;
    const view = state.view;
    if (!chart || !view) {
      return;
    }
    const focusId = areaFocusId();
    const focus = view.byId.get(focusId);
    chart.focusLayer.replaceChildren();

    if (focus && focus.gainSegments.length) {
      chart.focusLayer.style.setProperty("--series", focus.color);
      let area = "";
      focus.gainSegments.forEach((segment) => {
        const x0 = chart.x(segment.start);
        const x1 = chart.x(segment.end);
        area += `M${x0},${chart.y(segment.value)}H${x1}V${chart.y(segment.reference)}H${x0}Z`;
      });
      chart.focusLayer.append(svgEl("path", { d: area }, "lb-gain-area"));
    }

    // Dim other submissions only while the reader is pointing at something.
    const hovered = state.hovered;
    chart.root.querySelectorAll(".lb-series, .lb-point-label").forEach((node) => {
      const id = node.getAttribute("data-id");
      const entry = view.byId.get(id);
      const dim = Boolean(hovered) && id !== hovered && entry && entry.role === "submission";
      node.classList.toggle("is-dimmed", dim);
    });

    document.querySelectorAll(".lb-legend-item[data-id]").forEach((item) => {
      item.setAttribute("aria-pressed", String(item.dataset.id === focusId));
    });
    document.querySelectorAll("#lb-body tr[data-id]").forEach((row) => {
      row.classList.toggle("is-focus", row.dataset.id === (hovered || focusId));
    });
    const caption = document.getElementById("lb-focus-caption");
    if (caption) {
      caption.textContent = focus
        ? `Shaded: the accuracy ${focus.system.name} adds above the reference frontier (LAFS Gain ${formatGain(focus.gain)}).`
        : "";
    }
  }

  function showTooltip(entry, point, px, py) {
    const tip = document.getElementById("lb-tooltip");
    if (!tip) {
      return;
    }
    tip.replaceChildren();
    const value = el("div", "lb-tip-value");
    value.append(el("strong", null, formatPercent(point.accuracy)), el("span", null, ` · ${formatLatency(point.latency)}`));
    const name = el("div", "lb-tip-name");
    const key = el("span", `lb-tip-key is-${entry.role}`);
    key.style.setProperty("--series", entry.color);
    name.append(key, el("span", null, entry.system.name));
    let meta;
    if (entry.role === "submission") {
      meta = `${entry.points.length > 1 ? `Operating point: ${point.name} · ` : ""}LAFS Gain ${formatGain(entry.gain)}`;
    } else if (entry.role === "reference") {
      meta = "Reference method (defines the frontier)";
    } else {
      meta = "Baseline (not in the reference set)";
    }
    tip.append(value, name, el("div", "lb-tip-meta", meta));
    tip.hidden = false;

    const wrap = tip.parentElement;
    let left = px + 14;
    let top = py - tip.offsetHeight - 12;
    if (left + tip.offsetWidth > wrap.clientWidth - 4) {
      left = px - tip.offsetWidth - 14;
    }
    if (top < 0) {
      top = py + 14;
    }
    tip.style.left = `${Math.max(4, left)}px`;
    tip.style.top = `${top}px`;
  }

  function hideTooltip() {
    const tip = document.getElementById("lb-tooltip");
    if (tip) {
      tip.hidden = true;
    }
  }

  function setHover(id) {
    if (state.hovered === id) {
      return;
    }
    state.hovered = id;
    renderFocus();
  }

  function pin(id) {
    const entry = state.view && state.view.byId.get(id);
    if (!entry || entry.role !== "submission") {
      return;
    }
    state.pinned[state.view.tier] = id;
    renderFocus();
  }

  /* ------------------------------------------------------------------ */
  /* Legend                                                              */
  /* ------------------------------------------------------------------ */

  function renderLegend() {
    const legend = document.getElementById("lb-legend");
    const view = state.view;
    if (!legend || !view) {
      return;
    }
    legend.replaceChildren();

    const staticItem = (keyClass, label) => {
      const item = el("span", "lb-legend-item is-static");
      item.append(el("span", `lb-key ${keyClass}`), el("span", null, label));
      return item;
    };

    [...view.submissions].sort((a, b) => a.rank - b.rank).forEach((entry) => {
      const button = el("button", "lb-legend-item");
      button.type = "button";
      button.dataset.id = entry.id;
      button.style.setProperty("--series", entry.color);
      button.append(el("span", `lb-key ${entry.points.length > 1 ? "is-line" : "is-dot"}`), el("span", null, entry.system.name));
      button.addEventListener("click", () => pin(entry.id));
      button.addEventListener("pointerenter", () => setHover(entry.id));
      button.addEventListener("pointerleave", () => setHover(null));
      button.addEventListener("focus", () => setHover(entry.id));
      button.addEventListener("blur", () => setHover(null));
      legend.append(button);
    });

    legend.append(
      staticItem("is-frontier", "Reference frontier"),
      staticItem("is-reference", "Reference method"),
      staticItem("is-baseline", "Other baseline"),
    );
  }

  /* ------------------------------------------------------------------ */
  /* Table                                                               */
  /* ------------------------------------------------------------------ */

  function sortValue(entry, key) {
    if (key === "lafsGain") {
      return entry.role === "submission" ? entry.gain : null;
    }
    const value = entry.representative[key];
    return Number.isFinite(value) ? value : null;
  }

  function compareEntries(a, b) {
    const { key, direction } = state.sort;
    const left = sortValue(a, key);
    const right = sortValue(b, key);
    if (left === null && right === null) {
      return (a.rank || 0) - (b.rank || 0) || a.order - b.order;
    }
    if (left === null) {
      return 1;
    }
    if (right === null) {
      return -1;
    }
    const diff = direction === "asc" ? left - right : right - left;
    return diff || (a.rank || 0) - (b.rank || 0) || a.order - b.order;
  }

  function linkChip(link) {
    const external = /^https?:\/\//.test(link.url);
    const anchor = el("a", `lb-link is-${link.type || "link"}${external ? " is-external" : ""}`, link.label);
    anchor.href = link.url;
    if (external) {
      anchor.target = "_blank";
      anchor.rel = "noopener";
    }
    return anchor;
  }

  // Description/Code chips come from the published package; other links follow.
  function systemLinks(system) {
    const links = [];
    if (system.package) {
      const page = `./submission.html?id=${encodeURIComponent(system.id)}`;
      links.push({ type: "description", label: "Description", url: page });
      if (system.package.code) {
        links.push({ type: "code", label: "Code", url: `${page}#code` });
      }
    }
    return links.concat(system.links || []);
  }

  function metricCells(row, point) {
    BREAKDOWN_KEYS.forEach((key) => {
      const value = point[key];
      row.append(el("td", `lb-num${Number.isFinite(value) ? "" : " is-empty"}`, formatPercent(value)));
    });
  }

  function groupRow(title, note) {
    const row = el("tr", "lb-group-row");
    const cell = el("td");
    cell.colSpan = 9;
    cell.append(el("span", "lb-group-title", title));
    if (note) {
      cell.append(el("span", "lb-group-note", note));
    }
    row.append(cell);
    return row;
  }

  function entryRow(entry) {
    const view = state.view;
    const row = el("tr", `lb-row is-${entry.role}`);
    row.dataset.id = entry.id;
    row.style.setProperty("--series", entry.color);

    const rankCell = el("td", "lb-rank");
    if (entry.rank) {
      const badge = el("span", `lb-rank-badge${entry.rank === 1 ? " is-first" : ""}`, String(entry.rank));
      badge.setAttribute("aria-label", `Rank ${entry.rank}`);
      rankCell.append(badge);
    }

    const systemCell = el("td", "lb-system");
    const nameLine = el("div", "lb-name-line");
    nameLine.append(el("span", `lb-swatch is-${entry.role}`), el("span", "lb-name", entry.system.name));
    systemCell.append(nameLine);
    const roleLabel = { reference: "Reference method", baseline: "Baseline" }[entry.role];
    const meta = [roleLabel, entry.system.family, entry.system.team].filter(Boolean).join(" · ");
    if (meta) {
      systemCell.append(el("div", "lb-meta", meta));
    }
    const actions = el("div", "lb-links");
    systemLinks(entry.system).forEach((link) => actions.append(linkChip(link)));
    if (entry.points.length > 1) {
      const open = state.expanded.has(entry.id);
      const toggle = el("button", "lb-op-toggle", `Showing ${entry.representative.name} · ${entry.points.length} operating points`);
      toggle.type = "button";
      toggle.setAttribute("aria-expanded", String(open));
      toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        if (state.expanded.has(entry.id)) {
          state.expanded.delete(entry.id);
        } else {
          state.expanded.add(entry.id);
        }
        renderTable();
      });
      actions.append(toggle);
    }
    if (actions.childNodes.length) {
      systemCell.append(actions);
    }

    const gainCell = el("td", "lb-num lb-gain-cell");
    if (entry.role === "submission") {
      const wrap = el("div", "lb-gain");
      wrap.append(el("span", "lb-gain-value", formatGain(entry.gain)));
      const track = el("span", "lb-gain-track");
      const bar = el("span", "lb-gain-bar");
      bar.style.width = `${view.maxGain > 0 ? Math.max(4, (entry.gain / view.maxGain) * 100) : 0}%`;
      track.append(bar);
      wrap.append(track);
      gainCell.append(wrap);
      gainCell.title = `LAFS Gain ${entry.gain}`;
    } else {
      gainCell.classList.add("is-empty");
      gainCell.textContent = "—";
    }

    const rep = entry.representative;
    const accuracyCell = el("td", "lb-num lb-strong", formatPercent(rep.accuracy));
    const latencyCell = el("td", "lb-num", formatLatency(rep.latency));

    row.append(rankCell, systemCell, gainCell, accuracyCell, latencyCell);
    metricCells(row, rep);

    row.addEventListener("pointerenter", () => setHover(entry.id));
    row.addEventListener("pointerleave", () => setHover(null));
    row.addEventListener("click", (event) => {
      if (!event.target.closest("a, button")) {
        pin(entry.id);
      }
    });
    return row;
  }

  function operatingPointRows(entry) {
    return [...entry.points]
      .sort((a, b) => a.latency - b.latency)
      .map((point) => {
        const row = el("tr", "lb-op-row");
        row.dataset.parent = entry.id;
        row.style.setProperty("--series", entry.color);
        const nameCell = el("td", "lb-op-label");
        nameCell.append(el("span", "lb-op-dot"), el("span", null, point.name));
        row.append(el("td"), nameCell, el("td"), el("td", "lb-num", formatPercent(point.accuracy)), el("td", "lb-num", formatLatency(point.latency)));
        metricCells(row, point);
        return row;
      });
  }

  function renderTable() {
    const body = document.getElementById("lb-body");
    const view = state.view;
    if (!body || !view) {
      return;
    }
    body.replaceChildren();
    const tierLabel = (state.data.tiers.find((tier) => tier.id === view.tier) || {}).label || view.tier;

    body.append(groupRow("Submissions", "Ranked by LAFS Gain"));
    if (view.submissions.length) {
      [...view.submissions].sort(compareEntries).forEach((entry) => {
        body.append(entryRow(entry));
        if (state.expanded.has(entry.id)) {
          operatingPointRows(entry).forEach((row) => body.append(row));
        }
      });
    } else {
      const row = el("tr", "lb-empty-row");
      const cell = el("td");
      cell.colSpan = 9;
      cell.append(el("span", null, `No validated submissions on ${tierLabel} yet. `));
      const link = el("a", null, "Submit a system");
      link.href = state.data.links.submitForm;
      link.target = "_blank";
      link.rel = "noopener";
      cell.append(link);
      row.append(cell);
      body.append(row);
    }

    body.append(groupRow("Reference frontier & baselines", "LAFS Gain is measured against the four reference methods"));
    view.entries
      .filter((entry) => entry.role !== "submission")
      .sort(compareEntries)
      .forEach((entry) => body.append(entryRow(entry)));

    document.querySelectorAll(".lb-sort").forEach((button) => {
      const active = button.dataset.sort === state.sort.key;
      button.classList.toggle("active", active);
      button.dataset.direction = active ? state.sort.direction : "";
      button.closest("th").setAttribute("aria-sort", active ? (state.sort.direction === "asc" ? "ascending" : "descending") : "none");
    });
    renderFocus();
  }

  /* ------------------------------------------------------------------ */
  /* Wiring                                                              */
  /* ------------------------------------------------------------------ */

  function renderTierToggle() {
    const toggle = document.getElementById("lb-tier-toggle");
    if (!toggle) {
      return;
    }
    toggle.replaceChildren();
    state.data.tiers.forEach((tier) => {
      const count = state.data.systems.filter((system) => system.role === "submission" && system.results && system.results[tier.id]).length;
      const button = el("button", "lb-tier-button");
      button.type = "button";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(tier.id === state.tier));
      button.append(el("span", null, tier.label), el("span", "lb-tier-count", String(count)));
      button.title = `${count} validated submission${count === 1 ? "" : "s"}`;
      button.addEventListener("click", () => {
        if (state.tier !== tier.id) {
          state.tier = tier.id;
          state.hovered = null;
          renderAll();
        }
      });
      toggle.append(button);
    });
  }

  function renderAll() {
    state.view = buildView(state.tier);
    hideTooltip();
    renderTierToggle();
    renderLegend();
    renderChart();
    renderTable();
  }

  function setupSorting() {
    document.querySelectorAll(".lb-sort").forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.dataset.sort;
        const defaultDirection = key === "latency" ? "asc" : "desc";
        const direction = state.sort.key === key ? (state.sort.direction === "desc" ? "asc" : "desc") : defaultDirection;
        state.sort = { key, direction };
        renderTable();
      });
    });
  }

  function setupResize() {
    const host = document.getElementById("lb-chart");
    if (!host || typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", () => renderChart());
      return;
    }
    let lastWidth = 0;
    let frame = 0;
    new ResizeObserver((entries) => {
      const width = Math.round(entries[0].contentRect.width);
      if (width === lastWidth) {
        return;
      }
      lastWidth = width;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => renderChart());
    }).observe(host);
  }

  async function init() {
    const app = document.getElementById("leaderboard-app");
    if (!app) {
      return;
    }
    try {
      const response = await fetch(DATA_URL);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      state.data = await response.json();
    } catch (error) {
      const body = document.getElementById("lb-body");
      if (body) {
        body.innerHTML = '<tr><td colspan="9">Leaderboard data could not be loaded.</td></tr>';
      }
      console.error("[leaderboard]", error);
      return;
    }
    state.data.systems
      .filter((system) => system.role === "submission")
      .forEach((system, index) => state.colors.set(system.id, SERIES_COLORS[index] || NEUTRAL));
    document.getElementById("lb-chart").addEventListener("pointerleave", () => {
      hideTooltip();
      setHover(null);
    });
    setupSorting();
    setupResize();
    renderAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
