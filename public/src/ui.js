// /src/ui.js

//ARBOLSHOP
export function renderPrestigeShop(data, state, onBuy, getLevel) {
  const shop = document.getElementById("prestigeShop");
  if (!shop) return;

  shop.innerHTML = "";

  data.forEach(upg => {
    const level = getLevel(upg.id);
    const cost = upg.cost * (level + 1);
    const canBuy = state.prestigePoints >= cost;

    const div = document.createElement("div");
    div.className = "shop-item";

    div.innerHTML = `
      <strong>${upg.name}</strong><br>
      Nivel: ${level}<br>
      Costo: ${cost} 💎<br>
      +${upg.value} ${upg.type}
    `;

    div.style.opacity = canBuy ? "1" : "0.5";

    if (canBuy) {
      div.onclick = () => onBuy(upg);
    }

    shop.appendChild(div);
  });
}

//ARBOLTREE
export function renderPrestigeTree(data, state, onBuy, getLevel, isUnlocked) {
  const container = document.getElementById("prestigeTree");
  if (!container) return;

  container.innerHTML = "";

  data.forEach(node => {
    const level = getLevel(node.id);
    const unlocked = isUnlocked(node);
    const cost = node.cost * (level + 1);

    const div = document.createElement("div");
    div.className = "node";

    div.style.left = node.x * 120 + "px";
    div.style.top = node.y * 100 + "px";

    div.classList.add(unlocked ? "unlocked" : "locked");

    div.innerHTML = `
      <strong>${node.name}</strong><br>
      Lvl: ${level}<br>
      ${cost} 💎
    `;

    if (unlocked && state.prestigePoints >= cost) {
      div.onclick = () => onBuy(node);
    }

    container.appendChild(div);
  });
}

//PRESTIGIO
export function updatePrestige(points, bonus) {
  const p = document.getElementById("prestigePoints");
  const b = document.getElementById("prestigeBonus");

  if (p) p.textContent = points ?? 0;

  if (b) {
    const safeBonus = bonus ?? 1;
    b.textContent = safeBonus.toFixed(2) + "x";
  }
}

//UIpRESTIGIO
export function updatePrestigePreview(value) {
  const el = document.getElementById("prestigePreview");

  if (!el) return;

  el.textContent = value;

  // 🎨 color dinámico
  el.style.color = value > 0 ? "#00ff88" : "#888";
}

//EPS
export function updateEPS(value) {
  const el = document.getElementById("eps");
  if (!el) return;

  el.textContent = value.toFixed(1) + "/s";

  el.style.color = value > 10 ? "#00ff88" : "#ffffff";
}

//ERA
export function updateEraUI(eraId, erasData) {
  const el = document.getElementById("eraText");

  const era = erasData.find(e => e.id === eraId);

  if (el && era) {
    el.textContent = era.name;
  }
}

//ENERGY
export function updateEnergy(value) {
    const el = document.getElementById("energy");
    if (el) el.textContent = value;
  }
  
  export function clickEffect(button) {
    button.style.transform = "scale(0.95)";
    setTimeout(() => {
      button.style.transform = "scale(1)";
    }, 100);
  }

  //LINEAS
  function drawLines(container, data) {
    data.forEach(node => {
      node.requires.forEach(reqId => {
        const from = data.find(n => n.id === reqId);
        if (!from) return;
  
        const line = document.createElement("div");
        line.className = "line";
  
        const x1 = from.x * 120 + 50;
        const y1 = from.y * 100 + 30;
        const x2 = node.x * 120 + 50;
        const y2 = node.y * 100 + 30;
  
        const length = Math.hypot(x2 - x1, y2 - y1);
        const angle = Math.atan2(y2 - y1, x2 - x1);
  
        line.style.width = length + "px";
        line.style.left = x1 + "px";
        line.style.top = y1 + "px";
        line.style.transform = `rotate(${angle}rad)`;
  
        container.appendChild(line);
      });
    });
  }