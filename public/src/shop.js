export function renderShop(upgrades, state, onBuy) {
    const shop = document.getElementById("shop");
    shop.innerHTML = "";
  
    upgrades.forEach(upg => {
      const div = document.createElement("div");
      div.className = "shop-item";
  
      const owned = (state.upgrades || []).includes(upg.id);
  
      div.innerHTML = `
        <strong>${upg.name}</strong><br>
        Costo: ${upg.cost} ⚡<br>
        ${owned ? "Comprado" : ""}
      `;
  
      if (!owned) {
        div.onclick = () => onBuy(upg);
      } else {
        div.style.opacity = "0.5";
      }
  
      shop.appendChild(div);
    });
  }