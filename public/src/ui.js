// ui.js — Visual layer for Void Engine

// ── NODE ICONS ────────────────────────────────────────────────
const NODE_ICONS = {
  multiplier: "⚡",
  click:      "👆",
  auto:       "🔄",
  default:    "✦"
};

// ── PRESTIGE SHOP ─────────────────────────────────────────────
export function renderPrestigeShop(data, state, onBuy, getLevel) {
  const shop = document.getElementById("prestigeShop");
  if (!shop) return;
  shop.innerHTML = "";

  data.forEach(upg => {
    const level  = getLevel(upg.id);
    const cost   = upg.cost * (level + 1);
    const maxed  = upg.maxLevel && level >= upg.maxLevel;
    const canBuy = !maxed && state.prestigePoints >= cost;

    const div = document.createElement("div");
    div.className = "p-item" + (maxed ? " maxed" : "");
    div.innerHTML = `
      <div class="p-item-name">${upg.name}</div>
      <div class="p-item-cost ${canBuy ? "" : "cannot"}">${maxed ? "✓ MAX" : cost + " 💎"}</div>
      <div class="p-item-level">Nv. ${level}${upg.maxLevel ? "/" + upg.maxLevel : ""}</div>
      <div class="p-item-effect">+${upg.value} ${upg.type}</div>
    `;
    if (canBuy) div.onclick = () => onBuy(upg);
    shop.appendChild(div);
  });
}

// ── PRESTIGE TREE (draggable, full-pane) ──────────────────────
let _treeState = { dragging: false, startX: 0, startY: 0, ox: 0, oy: 0, tx: 0, ty: 0 };

export function renderPrestigeTree(data, state, onBuy, getLevel, isUnlocked) {
  const viewport = document.getElementById("treeViewport");
  const canvas   = document.getElementById("treeCanvas");
  if (!viewport || !canvas) return;
  canvas.innerHTML = "";

  // Layout constants
  const NW = 120, NH = 110, PAD = 60;
  const maxX   = Math.max(...data.map(n => n.x));
  const maxY   = Math.max(...data.map(n => n.y));
  const cWidth  = (maxX + 1) * NW + PAD * 2;
  const cHeight = (maxY + 1) * NH + PAD * 2;

  canvas.style.width  = cWidth  + "px";
  canvas.style.height = cHeight + "px";

  // Center tree in viewport on first render
  const vw = viewport.clientWidth  || 360;
  const vh = viewport.clientHeight || 400;
  if (_treeState.tx === 0 && _treeState.ty === 0) {
    _treeState.tx = Math.max(0, (vw - cWidth)  / 2);
    _treeState.ty = Math.max(0, (vh - cHeight) / 2);
  }
  canvas.style.transform = `translate(${_treeState.tx}px, ${_treeState.ty}px)`;

  // ── SVG connections ──
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "tree-svg");
  svg.setAttribute("viewBox", `0 0 ${cWidth} ${cHeight}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

  data.forEach(node => {
    (node.requires || []).forEach(reqId => {
      const from = data.find(n => n.id === reqId);
      if (!from) return;

      const x1 = from.x * NW + PAD + 50;
      const y1 = from.y * NH + PAD + 50;
      const x2 = node.x  * NW + PAD + 50;
      const y2 = node.y  * NH + PAD + 50;

      const active = getLevel(reqId) > 0;

      // Curved connector
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", `M${x1},${y1} C${x1},${cy} ${x2},${cy} ${x2},${y2}`);
      path.setAttribute("stroke",       active ? "#00ff9f" : "#1e2d40");
      path.setAttribute("stroke-width", active ? "2.5" : "1.5");
      path.setAttribute("fill",         "none");
      path.setAttribute("stroke-linecap", "round");
      if (active) path.setAttribute("filter", "drop-shadow(0 0 5px #00ff9f)");
      svg.appendChild(path);

      // Arrow dot at end
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("cx", x2); dot.setAttribute("cy", y2);
      dot.setAttribute("r", active ? "4" : "3");
      dot.setAttribute("fill", active ? "#00ff9f" : "#1e2d40");
      if (active) dot.setAttribute("filter", "drop-shadow(0 0 4px #00ff9f)");
      svg.appendChild(dot);
    });
  });
  canvas.appendChild(svg);

  // ── Node divs ──
  data.forEach(node => {
    const lvl       = getLevel(node.id);
    const unlocked  = isUnlocked(node);
    const purchased = lvl > 0;
    const cost      = node.cost * (lvl + 1);
    const maxed     = node.maxLevel && lvl >= node.maxLevel;
    const canBuy    = unlocked && state.prestigePoints >= cost && !maxed;

    const icon = NODE_ICONS[node.type] || NODE_ICONS.default;

    const div = document.createElement("div");
    div.className = "tree-node " + (purchased ? "purchased" : unlocked ? "unlocked" : "locked");
    div.style.left = (node.x * NW + PAD) + "px";
    div.style.top  = (node.y * NH + PAD) + "px";

    div.innerHTML = `
      <div class="tree-node-icon">${icon}</div>
      <div class="tree-node-name">${node.name}</div>
      <div class="tree-node-cost">${maxed ? "✓ MAX" : cost + " 💎"}</div>
      <div class="tree-node-level">Nv. ${lvl}${node.maxLevel ? "/" + node.maxLevel : ""}</div>
    `;

    if (canBuy) div.onclick = () => onBuy(node);
    canvas.appendChild(div);
  });

  // ── Drag to pan ──
  _setupDrag(viewport, canvas, cWidth, cHeight);
}

function _setupDrag(viewport, canvas, cWidth, cHeight) {
  // Avoid attaching duplicate listeners
  if (viewport._dragSetup) return;
  viewport._dragSetup = true;

  const ts = _treeState;

  function applyTransform() {
    canvas.style.transform = `translate(${ts.tx}px, ${ts.ty}px)`;
  }

  function clamp() {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const minX = Math.min(0, vw  - cWidth);
    const minY = Math.min(0, vh  - cHeight);
    ts.tx = Math.max(minX, Math.min(40, ts.tx));
    ts.ty = Math.max(minY, Math.min(40, ts.ty));
  }

  // Mouse
  viewport.onmousedown = (e) => {
    ts.dragging = true;
    ts.startX = e.clientX - ts.tx;
    ts.startY = e.clientY - ts.ty;
    e.preventDefault();
  };
  window.onmousemove = (e) => {
    if (!ts.dragging) return;
    ts.tx = e.clientX - ts.startX;
    ts.ty = e.clientY - ts.startY;
    clamp();
    applyTransform();
  };
  window.onmouseup = () => { ts.dragging = false; };

  // Touch
  viewport.ontouchstart = (e) => {
    const t = e.touches[0];
    ts.dragging = true;
    ts.startX = t.clientX - ts.tx;
    ts.startY = t.clientY - ts.ty;
  };
  viewport.ontouchmove = (e) => {
    if (!ts.dragging) return;
    const t = e.touches[0];
    ts.tx = t.clientX - ts.startX;
    ts.ty = t.clientY - ts.startY;
    clamp();
    applyTransform();
    e.preventDefault();
  };
  viewport.ontouchend = () => { ts.dragging = false; };
}

// ── PRESTIGE STATS ────────────────────────────────────────────
export function updatePrestige(points, bonus) {
  const p = document.getElementById("prestigePoints");
  const b = document.getElementById("prestigeBonus");
  if (p) p.textContent = points ?? 0;
  if (b) b.textContent = (bonus ?? 1).toFixed(2) + "x";
}

export function updatePrestigePreview(value) {
  const el = document.getElementById("prestigePreview");
  const gt = document.getElementById("pGainText");
  if (el) {
    el.textContent = value;
    el.style.color = value > 0 ? "#ffd700" : "#555";
  }
  if (gt) gt.textContent = value;
}

// ── EPS ───────────────────────────────────────────────────────
export function updateEPS(value, fmt) {
  const el = document.getElementById("eps");
  if (!el) return;
  el.textContent = (fmt ? fmt(value) : value.toFixed(1)) + "/s";
  el.style.color = value > 10 ? "#00ff9f" : "#c8deff";
}

// ── ERA ───────────────────────────────────────────────────────
export function updateEraUI(eraId, erasData) {
  const el  = document.getElementById("eraText");
  const era = erasData.find(e => e.id === eraId);
  if (el && era) el.textContent = era.name;
}

export function updateEraBar(energy, erasData, currentEraId) {
  const fill = document.getElementById("eraBarFill");
  if (!fill) return;
  const idx  = erasData.findIndex(e => e.id === currentEraId);
  const era  = erasData[idx];
  const next = erasData[idx + 1];
  if (!next) { fill.style.width = "100%"; return; }
  const prog = Math.min(1, Math.max(0,
    (energy - era.requiredEnergy) / (next.requiredEnergy - era.requiredEnergy)
  ));
  fill.style.width = (prog * 100) + "%";
}

// ── ENERGY ────────────────────────────────────────────────────
export function updateEnergy(value, fmt) {
  const el = document.getElementById("energy");
  if (el) el.textContent = fmt ? fmt(value) : Math.floor(value);
}

// ── FLOATING TEXT ─────────────────────────────────────────────
export function spawnFloatingText(value, x, y, fmt) {
  const el = document.createElement("div");
  el.className   = "float-text";
  el.textContent = "+" + (fmt ? fmt(value) : Math.floor(value));
  el.style.left  = (x - 20) + "px";
  el.style.top   = (y - 10) + "px";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

// ── TOAST ─────────────────────────────────────────────────────
let _toastTimer;
export function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

// ── TABS ──────────────────────────────────────────────────────
export function initTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  const panes   = document.querySelectorAll(".tab-pane");

  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.onclick = () => {
      buttons.forEach(b => b.classList.remove("active"));
      panes.forEach(p   => p.classList.remove("active"));
      btn.classList.add("active");
      // Try mainPane, shopPane, treePane, prestigePane
      const tabName = btn.dataset.tab;
      const target =
        document.getElementById(tabName + "Pane") ||
        document.getElementById(tabName + "Tab");
      if (target) target.classList.add("active");
    };
  });
}