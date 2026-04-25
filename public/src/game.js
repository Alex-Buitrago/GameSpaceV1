import { getCurrentUser } from "./auth.js";
import { saveGame, loadGame } from "./storage.js";
import { renderShop } from "./shop.js";
import {
  updateEnergy, updateEPS, updateEraUI, updatePrestige,
  updatePrestigePreview, renderPrestigeShop, renderPrestigeTree,
  spawnFloatingText, initTabs, updateEraBar, showToast
} from "./ui.js";

initTabs();

// ── DEFAULT STATE ──────────────────────────────────────────────
const DEFAULT_STATE = Object.freeze({
  energy:           0,
  click:            1,
  auto:             0,
  multiplier:       1,
  upgrades:         {},
  era:              "stone",
  prestigePoints:   0,
  prestigeBonus:    1,
  prestigeUpgrades: {}
});

let state = { ...DEFAULT_STATE };

// ── DATA ───────────────────────────────────────────────────────
let upgradesData  = [];
let erasData      = [];
let prestigeData  = [];

async function loadData() {
  const [upg, eras, pres] = await Promise.all([
    fetch("/data/upgrades.json").then(r => r.json()),
    fetch("/data/eras.json").then(r => r.json()),
    fetch("/data/prestige.json").then(r => r.json())
  ]);
  upgradesData = upg;
  erasData     = eras;
  prestigeData = pres;
}

// ── HELPERS ────────────────────────────────────────────────────
const getLevel    = id  => state.upgrades[id]         || 0;
const getPLevel   = id  => state.prestigeUpgrades[id] || 0;
const getCost     = upg => Math.floor(upg.baseCost * Math.pow(upg.scaling, getLevel(upg.id)));
const getEPS      = ()  => state.auto * state.multiplier * state.prestigeBonus;
const getClickGain= ()  => state.click * state.prestigeBonus;

function calcPrestigeGain() {
  return Math.floor(Math.sqrt(state.energy / 1000));
}

function isUnlocked(node) {
  if (!node.requires?.length) return true;
  return node.requires.every(id => getPLevel(id) > 0);
}

function formatNum(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "G";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return Math.floor(n).toString();
}

// ── ERA ────────────────────────────────────────────────────────
function updateEra() {
  const prev = state.era;
  for (let i = erasData.length - 1; i >= 0; i--) {
    if (state.energy >= erasData[i].requiredEnergy) {
      state.era = erasData[i].id;
      break;
    }
  }
  if (state.era !== prev) {
    const era = erasData.find(e => e.id === state.era);
    showToast?.(`🌌 Nueva era: ${era?.name ?? state.era}`);
  }
}

// ── RECALC ─────────────────────────────────────────────────────
/**
 * Recalculates click, auto, and multiplier from scratch
 * based on purchased upgrades and prestige tree nodes.
 *
 * BUG FIX (original): prestige tree was using *= for all stat types,
 * causing incorrect stacking — now only multiplier uses *.
 */
function recalcStats() {
  state.click      = 1;
  state.auto       = 0;
  state.multiplier = 1;

  // Base upgrades (additive per level)
  upgradesData.forEach(upg => {
    const lvl = getLevel(upg.id);
    if (!lvl) return;
    if (upg.type === "click")      state.click      += upg.value * lvl;
    if (upg.type === "auto")       state.auto       += upg.value * lvl;
    if (upg.type === "multiplier") state.multiplier *= (1 + upg.value * lvl);
  });

  // Prestige tree bonuses (multiplicative)
  prestigeData.forEach(node => {
    const lvl = getPLevel(node.id);
    if (!lvl) return;
    if (node.type === "click")      state.click      *= (1 + node.value * lvl);
    if (node.type === "auto")       state.auto       *= (1 + node.value * lvl);
    if (node.type === "multiplier") state.multiplier *= (1 + node.value * lvl);
  });
}

// ── BUY ───────────────────────────────────────────────────────
function buyUpgrade(upg) {
  const cost = getCost(upg);
  if (state.energy < cost) return;
  state.energy -= cost;
  state.upgrades[upg.id] = getLevel(upg.id) + 1;
  recalcStats();
  render();
}

function buyPrestigeUpgrade(node) {
  if (!isUnlocked(node)) return;
  const lvl = getPLevel(node.id);
  if (node.maxLevel && lvl >= node.maxLevel) return;
  const cost = node.cost * (lvl + 1);
  if (state.prestigePoints < cost) return;
  state.prestigePoints -= cost;
  state.prestigeUpgrades[node.id] = lvl + 1;
  recalcStats();
  render();
}

// ── PRESTIGE ──────────────────────────────────────────────────
function doPrestige() {
  const gain = calcPrestigeGain();
  if (gain <= 0) {
    alert("Necesitas más energía para prestigio");
    return;
  }
  if (!confirm(`Ganarás ${gain} fragmentos 💎. ¿Continuar?`)) return;

  state.prestigePoints += gain;
  state.prestigeBonus   = 1 + state.prestigePoints * 0.1;
  state.energy          = 0;
  state.upgrades        = {};
  state.era             = "stone";

  recalcStats();
  render();
}

// ── RENDER ────────────────────────────────────────────────────
function render() {
  updateEra();

  const availableUpgrades = upgradesData.filter(upg => {
    const era = erasData.find(e => e.id === upg.era);
    return era && (era.requiredEnergy <= state.energy || getLevel(upg.id) > 0);
  });

  updateEnergy(state.energy, formatNum);
  updateEPS(getEPS(), formatNum);
  updateEraUI(state.era, erasData);
  updatePrestige(state.prestigePoints, state.prestigeBonus);
  updatePrestigePreview(calcPrestigeGain());
  updateEraBar?.(state.energy, erasData, state.era);

  renderPrestigeShop(prestigeData, state, buyPrestigeUpgrade, getPLevel);
  renderPrestigeTree(prestigeData, state, buyPrestigeUpgrade, getPLevel, isUnlocked);
  renderShop(availableUpgrades, state, buyUpgrade, getCost, getLevel, formatNum);
}

// ── INIT ─────────────────────────────────────────────────────
export async function initGame() {
  const btn = document.getElementById("clickBtn");

  const user = getCurrentUser();
  if (!user) {
    window.location.href = "/login.html";
    return;
  }

  const userKey = user.email;

  await loadData();

  const saved = await loadGame(userKey);
  if (saved) state = { ...DEFAULT_STATE, ...saved };

  recalcStats();
  render();

  // Prestige button
  document.getElementById("prestigeBtn").onclick = doPrestige;

  // Click
  btn.onclick = (e) => {
    const gain = getClickGain();
    state.energy += gain;
    const r = e.target.getBoundingClientRect();
    spawnFloatingText(gain, r.left + r.width / 2, r.top, formatNum);
    render();
  };

  // Auto-produce (1s tick)
  setInterval(() => {
    state.energy = Math.min(state.energy + getEPS(), 1e12);
    render();
  }, 1000);

  // Auto-save (5s)
  setInterval(() => saveGame(userKey, state), 5000);
}