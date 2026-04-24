import { updateEnergy, clickEffect } from "./ui.js";

let state = {
  energy: 0,
  click: 1
};

export function initGame() {
  const btn = document.getElementById("clickBtn");

  load();

  btn.onclick = () => {
    state.energy += state.click;
    updateEnergy(state.energy);
    clickEffect(btn);
  };

  setInterval(save, 5000);

  function save() {
    localStorage.setItem("game", JSON.stringify(state));

    fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state)
    });
  }

  function load() {
    const data = localStorage.getItem("game");
    if (data) state = JSON.parse(data);
    updateEnergy(state.energy);
  }
}