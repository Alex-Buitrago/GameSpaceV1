export function renderShop(upgrades, state, onBuy, getCost, getLevel) {
    const shop = document.getElementById("shop");
    shop.innerHTML = "";
  
    upgrades.forEach(upg => {
      const level = getLevel(upg.id);
      const cost = getCost(upg);
  
      const canBuy = state.energy >= cost;
  
      const div = document.createElement("div");
      div.className = "shop-item";
  
      div.innerHTML = `
        <strong>${upg.name}</strong><br>
        Nivel: ${level}<br>
        Costo: ${cost} ⚡ ${canBuy ? "🟢" : "🔴"}<br>
        +${upg.value} ${upg.type}
      `;
  
      // 🎨 Estilos dinámicos
      div.style.opacity = canBuy ? "1" : "0.5";
      div.style.cursor = canBuy ? "pointer" : "not-allowed";
      div.style.border = canBuy 
        ? "2px solid #00ff88" 
        : "2px solid #ff1a1a";
  
      // 🛒 Solo permite comprar si alcanza
      if (canBuy) {
        div.onclick = () => onBuy(upg);
      }
  
      shop.appendChild(div);
    });
  }