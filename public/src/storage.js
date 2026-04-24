import { db } from "./firebase.js";
import { doc, setDoc, getDoc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🧱 Estado base del juego
const defaultState = {
  energy: 0,
  click: 1,
  auto: 0,
  upgrades: data.upgrades ?? {}
};

// 💾 Guardar progreso
export async function saveGame(uid, data) {
  try {
    await setDoc(doc(db, "players", uid), data);
  } catch (err) {
    console.error("Error guardando:", err);
  }
}

// 📥 Cargar progreso
export async function loadGame(uid) {
  try {
    const docRef = doc(db, "players", uid);
    const snap = await getDoc(docRef);

    // 🆕 Si no existe, crear usuario nuevo
    if (!snap.exists()) {
      await setDoc(docRef, defaultState);
      return { ...defaultState };
    }

    const data = snap.data();

    // 🛡️ Normalizar datos (evita undefined)
    return {
      energy: data.energy ?? 0,
      click: data.click ?? 1,
      auto: data.auto ?? 0,
      upgrades: data.upgrades ?? []
    };

  } catch (err) {
    console.error("Error cargando:", err);

    // fallback seguro
    return { ...defaultState };
  }
}