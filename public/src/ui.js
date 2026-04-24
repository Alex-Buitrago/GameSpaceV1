// ui.js — Visual layer for Void Engine

// ── PRESTIGE SHOP ────────────────────────────────────────────
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

// ── PRESTIGE TREE ────────────────────────────────────────────
export function renderPrestigeTree(data, state, onBuy, getLevel, isUnlocked) {
  const container = document.getElementById("prestigeTree");
  if (!container) return;
  container.innerHTML = "";

  const W = 110, H = 84, PAD = 16;
  const maxX     = Math.max(...data.map(n => n.x));
  const maxY     = Math.max(...data.map(n => n.y));
  const cWidth   = (maxX + 1) * W + PAD * 2;
  const cHeight  = (maxY + 1) * H + PAD * 2;
  container.style.minHeight = cHeight + "px";

  // SVG connections
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "tree-svg");
  svg.setAttribute("viewBox", `0 0 ${cWidth} ${cHeight}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

  data.forEach(node => {
    (node.requires || []).forEach(reqId => {
      const from   = data.find(n => n.id === reqId);
      if (!from) return;
      const x1     = from.x * W + PAD + 44;
      const y1     = from.y * H + PAD + 34;
      const x2     = node.x  * W + PAD + 44;
      const y2     = node.y  * H + PAD + 34;
      const active = getLevel(reqId) > 0;

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", x1); line.setAttribute("y1", y1);
      line.setAttribute("x2", x2); line.setAttribute("y2", y2);
      line.setAttribute("stroke",       active ? "#00ff9f" : "#2a3a50");
      line.setAttribute("stroke-width", active ? "2" : "1.5");
      if (active) line.setAttribute("filter", "drop-shadow(0 0 4px #00ff9f)");
      svg.appendChild(line);
    });
  });
  container.appendChild(svg);

  // Node divs
  data.forEach(node => {
    const lvl       = getLevel(node.id);
    const unlocked  = isUnlocked(node);
    const purchased = lvl > 0;
    const cost      = node.cost * (lvl + 1);
    const maxed     = node.maxLevel && lvl >= node.maxLevel;
    const canBuy    = unlocked && state.prestigePoints >= cost && !maxed;

    const div = document.createElement("div");
    div.className = "tree-node " + (purchased ? "purchased" : unlocked ? "unlocked" : "locked");
    div.style.left = (node.x * W + PAD) + "px";
    div.style.top  = (node.y * H + PAD) + "px";
    if (canBuy) div.onclick = () => onBuy(node);

    div.innerHTML = `
      <div class="tree-node-name">${node.name}</div>
      <div class="tree-node-cost">${maxed ? "✓" : cost + "💎"}</div>
      <div class="tree-node-level">Nv.${lvl}</div>
    `;
    container.appendChild(div);
  });
}

// ── PRESTIGE STATS ───────────────────────────────────────────
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

// ── EPS ──────────────────────────────────────────────────────
export function updateEPS(value, fmt) {
  const el = document.getElementById("eps");
  if (!el) return;
  el.textContent = (fmt ? fmt(value) : value.toFixed(1)) + "/s";
  el.style.color = value > 10 ? "#00ff9f" : "#c8deff";
}

// ── ERA ──────────────────────────────────────────────────────
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

// ── ENERGY ───────────────────────────────────────────────────
export function updateEnergy(value, fmt) {
  const el = document.getElementById("energy");
  if (el) el.textContent = fmt ? fmt(value) : Math.floor(value);
}

// ── FLOATING TEXT ────────────────────────────────────────────
export function spawnFloatingText(value, x, y, fmt) {
  const el = document.createElement("div");
  el.className  = "float-text";
  el.textContent = "+" + (fmt ? fmt(value) : Math.floor(value));
  el.style.left  = (x - 20) + "px";
  el.style.top   = (y - 10) + "px";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

// ── TOAST ────────────────────────────────────────────────────
let _toastTimer;
export function showToast(msg) {
  let t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

// ── TABS ─────────────────────────────────────────────────────
export function initTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  const panes   = document.querySelectorAll(".tab-pane, .tab");

  buttons.forEach(btn => {
    btn.onclick = () => {
      buttons.forEach(b => b.classList.remove("active"));
      panes.forEach(p   => p.classList.remove("active"));
      btn.classList.add("active");
      const target = document.getElementById(btn.dataset.tab + "Tab") ||
                     document.getElementById(btn.dataset.tab + "Pane");
      if (target) target.classList.add("active");
    };
  });
}
