import { auth } from "./firebase.js";
import { onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { saveGame, loadGame } from "./storage.js";
import { updateEnergy, clickEffect } from "./ui.js";

let state = {
  energy: 0,
  click: 1
};

export function initGame() {
  const btn = document.getElementById("clickBtn");

  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const saved = await loadGame(user.uid);
    if (saved) state = saved;

    updateEnergy(state.energy);

    btn.onclick = () => {
      state.energy += state.click;
      updateEnergy(state.energy);
      clickEffect(btn);
    };

    setInterval(() => {
      saveGame(user.uid, state);
    }, 5000);
  });
}