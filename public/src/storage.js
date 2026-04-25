import { db } from "./firebase.js";
import { doc, setDoc, getDoc }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🧱 Estado base del juego
const defaultState = {
  energy:           0,
  click:            1,
  auto:             0,
  multiplier:       1,
  upgrades:         {},
  era:              "stone",
  prestigePoints:   0,
  prestigeBonus:    1,
  prestigeUpgrades: {}
};

// Sanitize email to be a valid Firestore document ID
function emailToKey(email) {
  return email.replace(/[.#$[\]/]/g, "_");
}

// 💾 Guardar progreso
export async function saveGame(userKey, state) {
  try {
    const key = emailToKey(userKey);
    await setDoc(doc(db, "players", key), state);
  } catch (err) {
    console.error("Error guardando:", err);
  }
}

// 📥 Cargar progreso
export async function loadGame(userKey) {
  try {
    const key = emailToKey(userKey);
    const ref  = doc(db, "players", key);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, defaultState);
      return { ...defaultState };
    }

    const data = snap.data();

    // 🔥 MIGRACIÓN: array → objeto
    let upgrades = data.upgrades ?? {};
    if (Array.isArray(upgrades)) {
      const converted = {};
      upgrades.forEach(id => { converted[id] = 1; });
      upgrades = converted;
    }

    return {
      energy:           data.energy           ?? 0,
      click:            data.click            ?? 1,
      auto:             data.auto             ?? 0,
      multiplier:       data.multiplier       ?? 1,
      upgrades:         upgrades,
      era:              data.era              ?? "stone",
      prestigeUpgrades: data.prestigeUpgrades ?? {},
      prestigePoints:   data.prestigePoints   ?? 0,
      prestigeBonus:    data.prestigeBonus    ?? 1
    };

  } catch (err) {
    console.error("Error cargando:", err);
    return { ...defaultState };
  }
}
