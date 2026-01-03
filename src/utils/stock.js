export function movementToDelta(m) {
    const qty = Number(m?.qty) || 0;
  
    if (m?.type === "IN") return Math.abs(qty);
    if (m?.type === "OUT") return -Math.abs(qty);
    if (m?.type === "ADJUST") return qty; // může být + i -
    return 0;
  }
  
  export function computeStockByItemId(movements = []) {
    // když přijde undefined / null / něco jiného, vrátíme prázdnou mapu
    if (!Array.isArray(movements)) return {};
  
    const map = {};
    for (const m of movements) {
      if (!m?.itemId) continue;
  
      const delta = movementToDelta(m);
      map[m.itemId] = (map[m.itemId] ?? 0) + delta;
    }
    return map;
  }
  