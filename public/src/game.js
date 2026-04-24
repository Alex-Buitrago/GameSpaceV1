import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { saveGame, loadGame } from "./storage.js";
import { updateEnergy, clickEffect } from "./ui.js";
import { renderShop } from "./shop.js";

import { updateEraUI } from "./ui.js";

let state = {
  energy: 0,
  click: 1,
  auto: 0,
  upgrades: {},
  era: "stone"
};

let upgradesData = [];

function getLevel(upgId) {
  return state.upgrades[upgId] || 0;
}

function getCost(upg) {
  const level = getLevel(upg.id);
  return Math.floor(upg.baseCost * Math.pow(upg.scaling, level));
}

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
    if (!user) return;

    // 🔄 Cargar datos del usuario
    const saved = await loadGame(user.uid);
    console.log("CARGADO DESDE FIRE:", saved);

    if (saved) {
      state = {
        energy: saved.energy ?? 0,
        click: saved.click ?? 1,
        auto: saved.auto ?? 0,
        upgrades: saved.upgrades ?? []
      };
    }

   
    // 📦 Cargar upgrades
    await loadUpgrades();
    await loadEras();

    recalcStats();

    render();

    // 👆 Click manual
    btn.onclick = () => {
      state.energy += state.click;
      clickEffect(btn);
      render();
    };

    // ⚙️ Auto generación
    setInterval(() => {
      state.energy += state.auto;
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
  updateEnergy(state.energy);

  updateEra();

  const availableUpgrades = upgradesData.filter(
    upg => upg.era === state.era
  );

  renderShop(
    availableUpgrades,
    state,
    buyUpgrade,
    getCost,
    getLevel
  );

  updateEraUI(state.era, erasData);
}

// RecalcStats
function recalcStats() {
  state.click = 1; // base
  state.auto = 0;

  upgradesData.forEach(upg => {
    const level = getLevel(upg.id);

    if (upg.type === "click") {
      state.click += upg.value * level;
    }

    if (upg.type === "auto") {
      state.auto += upg.value * level;
    }
  });
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