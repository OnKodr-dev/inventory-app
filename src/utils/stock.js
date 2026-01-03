export function movementToDelta(m) {
    const qty = Number(m.qty) || 0;
    if (m.type === "IN") return Math.abs(qty);
    if (m.type === "OUT") return -Math.abs(qty);
    if (m.type === "ADJUST") return qty; // může být + i -
    return 0;
  }
  // Sklad může spadnout pod 0
  export function computeStockByItemId(movements) {
    const map = {};
    for (const m of movements) {
      const delta = movementToDelta(m);
      map[m.itemId] = (map[m.itemId] ?? 0) + delta;
    }
    return map;
  }
  // Když bych nechtěl sklad do minusu //
  /*export function computeStockByItemId(movements) {
    const map = {};
    for (const m of movements) {
      const delta = movementToDelta(m);
      const next = (map[m.itemId] ?? 0) + delta;
      map[m.itemId] = Math.max(0, next); // clamp na 0
    }
    return map;
  }*/
  