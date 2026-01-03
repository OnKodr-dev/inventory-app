import { useMemo, useState } from "react";
import { useInventory } from "../context/useInventory.js";
import { computeStockByItemId } from "../utils/stock.js";

function Badge({ children }) {
  return (
    <span className="rounded-full border border-slate-700 bg-slate-900/40 px-2 py-0.5 text-xs text-slate-200">
      {children}
    </span>
  );
}

function FilterPill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-3 py-1 text-xs font-medium",
        active
          ? "border-slate-600 bg-slate-800/60 text-slate-100"
          : "border-slate-800 bg-slate-900/20 text-slate-300 hover:bg-slate-900/40",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function Items() {
  const { items, movements, addItem, deleteItem } = useInventory();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL"); // ALL | LOW | OUT

  // form state
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [unit, setUnit] = useState("ks");
  const [minStock, setMinStock] = useState(0);

  const [formError, setFormError] = useState("");
  const [actionError, setActionError] = useState("");

  const stockById = useMemo(
    () => computeStockByItemId(movements),
    [movements]
  );

  const enrichedBase = useMemo(() => {
    const q = query.trim().toLowerCase();

    return items
      .map((it) => {
        const stock = stockById[it.id] ?? 0;
        const isLow = stock < it.minStock;
        const isOut = stock === 0;
        return { ...it, stock, isLow, isOut };
      })
      .filter((it) => {
        if (!q) return true;
        return (
          it.name.toLowerCase().includes(q) ||
          it.sku.toLowerCase().includes(q)
        );
      });
  }, [items, stockById, query]);

  const rows = useMemo(() => {
    if (filter === "LOW") return enrichedBase.filter((it) => it.isLow);
    if (filter === "OUT") return enrichedBase.filter((it) => it.isOut);
    return enrichedBase;
  }, [enrichedBase, filter]);

  const counts = useMemo(() => {
    const all = enrichedBase.length;
    const low = enrichedBase.filter((it) => it.isLow).length;
    const out = enrichedBase.filter((it) => it.isOut).length;
    return { all, low, out };
  }, [enrichedBase]);

  function onAddItem(e) {
    e.preventDefault();
    setFormError("");
    setActionError("");

    const nextMin = Number(minStock);

    const res = addItem({
      name: name.trim(),
      sku: sku.trim(),
      unit: unit.trim(),
      minStock: Number.isFinite(nextMin) ? nextMin : 0,
    });

    if (!res?.ok) {
      if (res?.reason === "NAME_OR_SKU_EMPTY") {
        setFormError("Name a SKU nesmí být prázdné.");
        return;
      }
      if (res?.reason === "SKU_EXISTS") {
        setFormError("SKU už existuje. Musí být unikátní.");
        return;
      }
      setFormError("Nepodařilo se přidat item.");
      return;
    }

    // reset formu
    setName("");
    setSku("");
    setUnit("pcs");
    setMinStock(0);
  }

  function onDeleteItem(it) {
    setActionError("");
    setFormError("");

    const ok = window.confirm(
      `Smazat item "${it.name}" (${it.sku})?`
    );
    if (!ok) return;

    const res = deleteItem(it.id);

    if (!res?.ok) {
      if (res?.reason === "ITEM_HAS_MOVEMENTS") {
        setActionError(
          "Tento item nejde smazat, protože má historii pohybů. (Nejdřív smaž movements nebo udělej reset.)"
        );
        return;
      }
      setActionError("Nepodařilo se smazat item.");
      return;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Items</h1>
          <p className="mt-1 text-slate-300">
            Stav se počítá ze skladových pohybů (IN/OUT/ADJUST).
          </p>
        </div>

        <div className="w-full sm:w-72">
          <label className="text-xs text-slate-400">Search (name / SKU)</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm outline-none focus:border-slate-600"
            placeholder="e.g. HDMI, USBC-65W..."
          />
        </div>
      </div>

      {/* ADD ITEM */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">Add item</h2>
          <div className="text-xs text-slate-400">
            Tip: SKU drž unikátní (např. “HDMI-2M”)
          </div>
        </div>

        <form onSubmit={onAddItem} className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="text-xs text-slate-400">Name</label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFormError("");
              }}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-slate-600"
              placeholder="e.g. HDMI cable"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400">SKU</label>
            <input
              value={sku}
              onChange={(e) => {
                setSku(e.target.value);
                setFormError("");
              }}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-slate-600"
              placeholder="e.g. HDMI-2M"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400">Unit</label>
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-slate-600"
              placeholder="pcs, m, kg..."
            />
          </div>

          <div>
            <label className="text-xs text-slate-400">Min stock</label>
            <input
              type="number"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-slate-600"
              min="0"
            />
          </div>

          <div className="md:col-span-3">
            {formError ? (
              <p className="text-sm text-red-300">{formError}</p>
            ) : actionError ? (
              <p className="text-sm text-red-300">{actionError}</p>
            ) : (
              <p className="text-sm text-slate-400">
                Přidáním itemu se vytvoří položka se stockem 0 (dokud nepřidáš IN).
              </p>
            )}
          </div>

          <div className="md:col-span-1 flex items-end">
            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-900"
            >
              Add
            </button>
          </div>
        </form>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-300">
          Showing{" "}
          <span className="font-semibold text-slate-100">{rows.length}</span> of{" "}
          <span className="font-semibold text-slate-100">{counts.all}</span>{" "}
          items
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterPill active={filter === "ALL"} onClick={() => setFilter("ALL")}>
            All <span className="ml-1 text-slate-400">({counts.all})</span>
          </FilterPill>

          <FilterPill active={filter === "LOW"} onClick={() => setFilter("LOW")}>
            Low <span className="ml-1 text-slate-400">({counts.low})</span>
          </FilterPill>

          <FilterPill active={filter === "OUT"} onClick={() => setFilter("OUT")}>
            Out <span className="ml-1 text-slate-400">({counts.out})</span>
          </FilterPill>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/40 text-slate-300">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Min</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {rows.map((it) => (
              <tr key={it.id} className="hover:bg-slate-900/20">
                <td className="px-4 py-3">
                  <div className="font-medium">{it.name}</div>
                  <div className="text-xs text-slate-400">Unit: {it.unit}</div>
                </td>

                <td className="px-4 py-3 text-slate-200">{it.sku}</td>

                <td className="px-4 py-3">
                  <span className="font-semibold">{it.stock}</span>{" "}
                  <span className="text-slate-400">{it.unit}</span>
                </td>

                <td className="px-4 py-3 text-slate-200">{it.minStock}</td>

                <td className="px-4 py-3">
                  {it.isOut ? (
                    <Badge>Out of stock</Badge>
                  ) : it.isLow ? (
                    <Badge>Low stock</Badge>
                  ) : (
                    <span className="text-slate-300">OK</span>
                  )}
                </td>

                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onDeleteItem(it)}
                    className="rounded-lg border border-slate-800 bg-slate-900/20 px-3 py-1 text-xs text-slate-200 hover:bg-slate-900/40"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-slate-400" colSpan={6}>
                  No items match your search/filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
