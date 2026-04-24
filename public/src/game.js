import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { saveGame, loadGame } from "./storage.js";

import { renderShop } from "./shop.js";

import { updateEnergy, updateEPS, updateEraUI, updatePrestige, updatePrestigePreview, renderPrestigeShop, renderPrestigeTree  } from "./ui.js";

let state = {
  energy: 0,
  click: 1,
  auto: 0,
  upgrades: {},
  era: "stone",
  multiplier: 1,

  prestigePoints: 0,
  prestigeBonus: 1,

  prestigeUpgrades: {}
};

//CalcPres
function calculatePrestigeGain() {
  return Math.floor(Math.sqrt(state.energy / 1000));
}

//Arbol
let prestigeData = [];

async function loadPrestige() {
  const res = await fetch("/data/prestige.json");
  prestigeData = await res.json();
}

//UpgradeData
let upgradesData = [];

function getLevel(upgId) {
  return state.upgrades[upgId] || 0;
}

function getPrestigeLevel(id) {
  return state.prestigeUpgrades?.[id] || 0;
}

function getCost(upg) {
  const level = getLevel(upg.id);
  return Math.floor(upg.baseCost * Math.pow(upg.scaling, level));
}

//ErasData
let erasData = [];

async function loadEras() {
  const res = await fetch("/data/eras.json");
  erasData = await res.json();
}

function updateEra() {
  for (let i = erasData.length - 1; i >= 0; i--) {
    const era = erasData[i];

    if (state.energy >= era.requiredEnergy) {
      state.era = era.id;
      break;
    }
  }
}

//EPS
function getEPS() {
  return state.auto * state.multiplier * state.prestigeBonus;
}

// 🔥 Cargar upgrades desde JSON
async function loadUpgrades() {
  const res = await fetch("/data/upgrades.json");

  if (!res.ok) {
    throw new Error("No se pudo cargar upgrades.json");
  }

  const text = await res.text();
  console.log("Respuesta:", text);

  upgradesData = JSON.parse(text);
}

// 🎮 Inicializar juego
export function initGame() {
  const btn = document.getElementById("clickBtn");

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "/login.html";
      return;
    }

    // 📦 Cargar datos
    await loadUpgrades();
    await loadEras();
    await loadPrestige();

    const saved = await loadGame(user.uid);
    if (saved) state = saved;

    // 🔥 CLAVE
    recalcStats();

    render();

    const prestigeBtn = document.getElementById("prestigeBtn");

    prestigeBtn.onclick = () => {
      const gain = calculatePrestigeGain();

      if (gain <= 0) {
        alert("Necesitas más energía para prestigio");
        return;
      }

      if (confirm(`Ganarás ${gain} fragmentos. ¿Continuar?`)) {
        doPrestige();
      }
    };

    // 👆 Click manual
    btn.onclick = () => {
      state.energy += state.click * state.prestigeBonus;
      render();
    };

    // ⚙️ Producción automática
    setInterval(() => {
      state.energy += getEPS();
      state.energy = Math.min(state.energy, 1e12);
      render();
    }, 1000);

    // 💾 Guardado automático
    setInterval(() => {
      saveGame(user.uid, state);
    }, 5000);
  });
}

// 🎨 Render general
function render() {
  updateEra();

  const availableUpgrades = upgradesData.filter(
    upg => erasData.find(e => e.id === upg.era)?.requiredEnergy <= state.energy
  );

  const preview = calculatePrestigeGain();

  updatePrestigePreview(preview);
  updateEnergy(state.energy);
  updateEPS(getEPS());
  updateEraUI(state.era, erasData);
  updatePrestige(state.prestigePoints, state.prestigeBonus);
  drawLines(container, data);

  renderPrestigeShop(
    prestigeData,
    state,
    buyPrestigeUpgrade,
    getPrestigeLevel
  );

  renderPrestigeTree(
    prestigeData,
    state,
    buyPrestigeUpgrade,
    getPrestigeLevel,
    isUnlocked
  );

  renderShop(
    availableUpgrades,
    state,
    buyUpgrade,
    getCost,
    getLevel
  );
}

// RecalcStats
function recalcStats() {
  state.click = 1;
  state.auto = 0;
  state.multiplier = 1;

  prestigeData.forEach(upg => {
    const level = getPrestigeLevel(upg.id);
  
    if (upg.type === "click") {
      state.click *= 1 + upg.value * level;
    }
  
    if (upg.type === "auto") {
      state.auto *= 1 + upg.value * level;
    }
  
    if (upg.type === "multiplier") {
      state.multiplier *= 1 + upg.value * level;
    }
  });
}

// Prestigio
function doPrestige() {
  const gain = calculatePrestigeGain();

  if (gain <= 0) return;

  state.prestigePoints += gain;

  // 🔥 Bonus permanente
  state.prestigeBonus = 1 + state.prestigePoints * 0.1;

  // 🔄 RESET del juego
  state.energy = 0;
  state.upgrades = {};
  state.era = "stone";

  recalcStats();
  render();
}

// 🛒 Comprar upgrade
function buyUpgrade(upg) {
  const cost = getCost(upg);

  if (state.energy < cost) return;

  state.energy -= cost;

  // subir nivel
  state.upgrades[upg.id] = getLevel(upg.id) + 1;

  // aplicar efecto
  if (upg.type === "click") {
    state.click += upg.value;
  }

  if (upg.type === "auto") {
    state.auto += upg.value;
  }

  recalcStats();

  render();
}

function buyPrestigeUpgrade(upg) {
  const level = getPrestigeLevel(upg.id);
  const cost = upg.cost * (level + 1);

  if (state.prestigePoints < cost) return;

  state.prestigePoints -= cost;
  state.prestigeUpgrades[upg.id] = level + 1;

  recalcStats();
  render();
}