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
  const { items, movements } = useInventory();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL"); // ALL | LOW | OUT

  const stockById = useMemo(
    () => computeStockByItemId(movements),
    [movements]
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();

    const enriched = items
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

    if (filter === "LOW") return enriched.filter((it) => it.isLow);
    if (filter === "OUT") return enriched.filter((it) => it.isOut);
    return enriched;
  }, [query, stockById, items, filter]);

  const counts = useMemo(() => {
    const q = query.trim().toLowerCase();

    const base = items
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

    const all = base.length;
    const low = base.filter((it) => it.isLow).length;
    const out = base.filter((it) => it.isOut).length;

    return { all, low, out };
  }, [items, stockById, query]);

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
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-slate-400" colSpan={5}>
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
