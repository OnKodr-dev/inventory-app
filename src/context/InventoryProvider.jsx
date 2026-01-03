import { useEffect, useMemo, useState } from "react";
import { InventoryContext } from "./inventoryContext.js";
import { items as seedItems, movements as seedMovements } from "../data/mockData.js";

const LS_KEY = "inventory.movements.v1";

function loadMovements () {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return seedMovements;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed :seedMovements;
  } catch {
    return seedMovements;
  }
}
export function InventoryProvider({ children }) {
  const [items] = useState(seedItems);
  const [movements, setMovements] = useState(() => loadMovements());

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(movements));
    } catch {
      //ignore
    }
  }, [movements]);

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

  function resetMovements() {
    setMovements(seedMovements);
    try {
      localStorage.removeItem(LS_KEY);
    } catch {
      //ignore
    }
  }

  const value = useMemo(
    () => ({ items, movements, addMovement, resetMovements }),
    [items, movements]
  );

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}