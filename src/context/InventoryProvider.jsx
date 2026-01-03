import { useEffect, useState } from "react";
import { InventoryContext } from "./inventoryContext.js";
import { items as seedItems, movements as seedMovements } from "../data/mockData.js";

const LS_MOVEMENTS_KEY = "inventory.movements.v1";
const LS_ITEMS_KEY = "inventory.items.v1";

function safeId() {
  return crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

/* -------------------- LOAD / SAVE -------------------- */

function loadMovements() {
  try {
    const raw = localStorage.getItem(LS_MOVEMENTS_KEY);
    if (!raw) return seedMovements;

    const parsed = JSON.parse(raw);
    const arr = Array.isArray(parsed) ? parsed : parsed?.movements; // podporujeme i { movements: [...] }
    return Array.isArray(arr) ? arr : (Array.isArray(seedMovements) ? seedMovements : []);
  } catch {
    return Array.isArray(seedMovements) ? seedMovements : [];
  }
  
  
}

function loadItems() {
  try {
    const raw = localStorage.getItem(LS_ITEMS_KEY);
    if (!raw) return seedItems;

    const parsed = JSON.parse(raw);
    const arr = Array.isArray(parsed) ? parsed : parsed?.items; // podporujeme i { items: [...] }
    return Array.isArray(arr) ? arr : (Array.isArray(seedItems) ? seedItems : []);
  } catch {
    return Array.isArray(seedItems) ? seedItems : [];
  }
  
}

/* -------------------- NORMALIZACE -------------------- */

function normalizeItem(input) {
  const it = input && typeof input === "object" ? input : {};

  return {
    id: typeof it.id === "string" ? it.id : safeId(),
    name: String(it.name ?? "").trim(),
    sku: String(it.sku ?? "").trim(),
    unit: String(it.unit ?? "ks").trim(),
    minStock: Number.isFinite(Number(it.minStock)) ? Number(it.minStock) : 0,
  };
}

function normalizeItems(input) {
  if (!Array.isArray(input)) return seedItems;

  return input
    .map(normalizeItem)
    .filter((it) => it.name && it.sku);
}

/* -------------------- PROVIDER -------------------- */

export function InventoryProvider({ children }) {
  // items už nejsou read-only
  const [items, setItems] = useState(() => loadItems());
  const [movements, setMovements] = useState(() => loadMovements());

  useEffect(() => {
    try {
      localStorage.setItem(LS_MOVEMENTS_KEY, JSON.stringify(movements));
    } catch {
      // ignore
    }
  }, [movements]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_ITEMS_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  /* -------------------- MOVEMENTS API -------------------- */

  function addMovement({ itemId, type, qty, note }) {
    const newMovement = {
      id: safeId(),
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
      localStorage.removeItem(LS_MOVEMENTS_KEY);
    } catch {
      // ignore
    }
  }

  function replaceMovements(nextMovements) {
    if (!Array.isArray(nextMovements)) return;
    setMovements(nextMovements);
  }

  /* -------------------- ITEMS API -------------------- */

  function addItem({ name, sku, unit, minStock }) {
    const next = normalizeItem({ name, sku, unit, minStock });

    // základní validace (ať nepřidáš prázdné)
    if (!next.name || !next.sku) {
      return { ok: false, reason: "NAME_OR_SKU_EMPTY" };
    }

    // SKU musí být unikátní (je to identifikátor, který lidi čekají)
    const existsSku = items.some(
      (it) => it.sku.toLowerCase() === next.sku.toLowerCase()
    );
    if (existsSku) {
      return { ok: false, reason: "SKU_EXISTS" };
    }

    setItems((prev) => [next, ...prev]);
    return { ok: true };
  }

  function updateItem(id, patch) {
    setItems((prev) => {
      const nextPatch = normalizeItem({ ...patch, id });

      // u update nechceme přepsat id, jen použijeme normalizaci polí
      return prev.map((it) => {
        if (it.id !== id) return it;

        const merged = {
          ...it,
          name: nextPatch.name || it.name,
          sku: nextPatch.sku || it.sku,
          unit: nextPatch.unit || it.unit,
          minStock: Number.isFinite(nextPatch.minStock)
            ? nextPatch.minStock
            : it.minStock,
        };

        return merged;
      });
    });
  }

  function deleteItem(id) {
    // bezpečnost: nesmažeme, pokud existují movements
    const hasMovements = movements.some((m) => m.itemId === id);
    if (hasMovements) {
      return { ok: false, reason: "ITEM_HAS_MOVEMENTS" };
    }

    setItems((prev) => prev.filter((it) => it.id !== id));
    return { ok: true };
  }

  function resetItems() {
    setItems(seedItems);
    try {
      localStorage.removeItem(LS_ITEMS_KEY);
    } catch {
      // ignore
    }
  }

  function replaceItems(nextItems) {
    const normalized = normalizeItems(nextItems);
    setItems(normalized);
  }

  const value = {
    items,
    movements,
    addMovement,
    resetMovements,
    replaceMovements,
  
    addItem,
    updateItem,
    deleteItem,
    resetItems,
    replaceItems,
  };
  
  

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}
