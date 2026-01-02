import { useMemo, useState } from "react";
import { InventoryContext } from "./inventoryContext.js";
import { items as seedItems, movements as seedMovements } from "../data/mockData.js";

export function InventoryProvider({ children }) {
  const [items] = useState(seedItems);
  const [movements, setMovements] = useState(seedMovements);

  function addMovement({ itemId, type, qty, note }) {
    const newMovement = {
      id: crypto.randomUUID(),
      itemId,
      type,
      qty,
      note: note ?? "",
      createdAt: new Date().toISOString(),
    };

    setMovements((prev) => [newMovement, ...prev]);
  }

  const value = useMemo(
    () => ({ items, movements, addMovement }),
    [items, movements]
  );

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}
