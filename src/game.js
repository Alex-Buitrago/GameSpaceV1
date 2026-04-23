let state = {
    energy: 0,
    click: 1
  };
  
  export function initGame() {
    const energyEl = document.getElementById("energy");
    const btn = document.getElementById("clickBtn");
  
    load();
  
    btn.onclick = () => {
      state.energy += state.click;
      update();
    };
  
    setInterval(() => {
      save();
    }, 5000);
  
    function update() {
      energyEl.textContent = state.energy;
    }
  
    function save() {
      localStorage.setItem("game", JSON.stringify(state));
  
      fetch("/api/save", {
        method: "POST",
        body: JSON.stringify(state)
      });
    }
  
    function load() {
      const data = localStorage.getItem("game");
      if (data) state = JSON.parse(data);
      update();
    }
  }