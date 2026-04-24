// /src/ui.js

export function updateEraUI(eraId, erasData) {
  const el = document.getElementById("eraText");

  const era = erasData.find(e => e.id === eraId);

  if (el && era) {
    el.textContent = era.name;
  }
}

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