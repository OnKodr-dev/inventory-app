import { useMemo } from "react";
import { useInventory } from "../context/useInventory.js";
import { computeStockByItemId } from "../utils/stock.js";

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

function Badge({ children }) {
  return (
    <span className="rounded-full border border-slate-700 bg-slate-900/40 px-2 py-0.5 text-xs text-slate-200">
      {children}
    </span>
  );
}

export default function Dashboard() {
  const { items, movements } = useInventory();

  const itemById = useMemo(() => {
    const map = {};
    for (const it of items) map[it.id] = it;
    return map;
  }, [items]);

  const stockById = useMemo(() => computeStockByItemId(movements), [movements]);

  const lowStockItems = useMemo(() => {
    return items
      .map((it) => {
        const stock = stockById[it.id] ?? 0;
        const isLow = stock < it.minStock;
        return { ...it, stock, isLow };
      })
      .filter((it) => it.isLow)
      .sort((a, b) => a.stock - b.stock);
  }, [items, stockById]);

  const recentMovements = useMemo(() => {
    return [...movements]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);
  }, [movements]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-slate-300">Low stock + poslední pohyby.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Low stock */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Low stock</h2>
            <Badge>{lowStockItems.length} items</Badge>
          </div>

          <div className="mt-4 space-y-3">
            {lowStockItems.slice(0, 6).map((it) => (
              <div
                key={it.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-2"
              >
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-xs text-slate-400">
                    {it.sku} • min {it.minStock} {it.unit}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold">
                    {it.stock} <span className="text-slate-400">{it.unit}</span>
                  </div>
                  <div className="text-xs text-slate-400">below min</div>
                </div>
              </div>
            ))}

            {lowStockItems.length === 0 && (
              <div className="text-sm text-slate-400">
                Všechno OK — žádné položky pod minimem.
              </div>
            )}
          </div>
        </div>

        {/* Recent movements */}
        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <div className="bg-slate-900/40 px-4 py-3">
            <h2 className="font-semibold">Recent movements</h2>
          </div>

          <div className="divide-y divide-slate-800">
            {recentMovements.map((m) => {
              const it = itemById[m.itemId];
              const name = it?.name ?? "Unknown item";
              const sku = it?.sku ?? "-";

              return (
                <div key={m.id} className="px-4 py-3 hover:bg-slate-900/20">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{name}</div>
                      <div className="text-xs text-slate-400">
                        {sku} • {formatDate(m.createdAt)}
                      </div>
                      {m.note ? (
                        <div className="mt-1 text-sm text-slate-300">{m.note}</div>
                      ) : null}
                    </div>

                    <div className="text-right">
                      <div className="font-medium">{m.type}</div>
                      <div className="text-sm text-slate-200">
                        <span className="font-semibold">{m.qty}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {recentMovements.length === 0 && (
              <div className="px-4 py-6 text-sm text-slate-400">
                Zatím žádné pohyby.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
