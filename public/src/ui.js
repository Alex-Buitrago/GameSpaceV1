// /src/ui.js

//PRESTIGIO
export function updatePrestige(points, bonus) {
  document.getElementById("prestigePoints").textContent = points;
  document.getElementById("prestigeBonus").textContent = bonus.toFixed(2) + "x";
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