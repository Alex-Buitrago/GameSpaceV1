// /src/ui.js

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