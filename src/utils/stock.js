export function movementToDelta(movement) {
    if (movement.type === "IN") return movement.qty;
    if (movement.type === "OUT") return -movement.qty;
    if (movement.type === "ADJUST") return movement.qty;
    return 0;
}

export function computeStockByItemId(movements) {
    const map = {};
    for (const m of movements) {
        const delta = movementToDelta(m);
        map[m.itemId] = (map[m.itemId] ?? 0) + delta;
    }
    return map;
}