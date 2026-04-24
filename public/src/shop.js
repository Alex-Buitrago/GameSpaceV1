// shop.js — Main upgrade shop renderer

const TYPE_COLORS = {
  click:      "#00c8ff",
  auto:       "#00ff9f",
  multiplier: "#ff2d6b"
};

export function renderShop(upgrades, state, onBuy, getCost, getLevel, fmt) {
  const grid = document.getElementById("shop") || document.getElementById("shopGrid");
  if (!grid) return;

  grid.innerHTML = "";

  if (!upgrades.length) {
    grid.innerHTML = `<p style="color:#4a6080;font-size:11px;text-align:center;padding:20px">
      Sin mejoras disponibles aún
    </p>`;
    return;
  }

  upgrades.forEach(upg => {
    const level   = getLevel(upg.id);
    const cost    = getCost(upg);
    const canBuy  = state.energy >= cost;
    const color   = upg.color ?? TYPE_COLORS[upg.type] ?? "#00c8ff";

    const div = document.createElement("div");
    div.className = "shop-item" + (canBuy ? "" : " locked");
    div.style.setProperty("--item-color", color);
    if (canBuy) div.onclick = () => onBuy(upg);

    const costStr = fmt ? fmt(cost) : Math.floor(cost);

    div.innerHTML = `
      <div>
        <div class="item-name">${upg.icon ?? "⚡"} ${upg.name}</div>
        <div class="item-meta">+${upg.value} <span>${upg.type}</span> por nivel</div>
      </div>
      <div style="text-align:right">
        <div class="item-cost ${canBuy ? "" : "cannot"}">${costStr} ⚡</div>
        ${level > 0 ? `<div style="font-size:9px;color:#ffd700;margin-top:3px;font-family:Orbitron,sans-serif">Nv.${level}</div>` : ""}
      </div>
    `;

    grid.appendChild(div);
  });
}
