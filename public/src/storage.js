import { db } from "./firebase.js";
import { doc, setDoc, getDoc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🧱 Estado base del juego
const defaultState = {
  energy: 0,
  click: 1,
  auto: 0,
  upgrades: {}
};

// 💾 Guardar progreso
export async function saveGame(uid, state) {
  try {
    await setDoc(doc(db, "players", uid), state);
  } catch (err) {
    console.error("Error guardando:", err);
  }
}

// 📥 Cargar progreso
export async function loadGame(uid) {
  try {
    const ref = doc(db, "players", uid);
    const snap = await getDoc(ref);

    // 🆕 Si no existe el usuario, lo crea
    if (!snap.exists()) {
      await setDoc(ref, defaultState);
      return { ...defaultState };
    }

    const data = snap.data();

    // 🔥 MIGRACIÓN: array → objeto
    let upgrades = data.upgrades ?? {};

    if (Array.isArray(upgrades)) {
      const converted = {};

      upgrades.forEach(id => {
        converted[id] = 1;
      });

      upgrades = converted;
    }

    // 🛡️ Normalización completa (evita undefined)
    return {
        energy: data.energy ?? 0,
        click: data.click ?? 1,
        auto: data.auto ?? 0,
        upgrades: upgrades ?? {},
        era: data.era ?? "stone",
      
        prestigeUpgrades: data.prestigeUpgrades ?? {},
        prestigePoints: data.prestigePoints ?? 0,
        prestigeBonus: data.prestigeBonus ?? 1
    };

  } catch (err) {
    console.error("Error cargando:", err);

    // fallback seguro
    return { ...defaultState };
  }
}