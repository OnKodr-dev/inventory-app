import { useMemo } from "react";
import { items, movements } from "../data/mockData.js";

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function Movements() {
  const itemById = useMemo(() => {
    const map = {};
    for (const it of items) map[it.id] = it;
    return map;
  }, []);

  const sorted = useMemo(() => {
    return [...movements].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Movements</h1>
        <p className="mt-1 text-slate-300">Historie skladových pohybů.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/40 text-slate-300">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Note</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {sorted.map((m) => (
              <tr key={m.id} className="hover:bg-slate-900/20">
                <td className="px-4 py-3 text-slate-300">
                  {formatDate(m.createdAt)}
                </td>

                <td className="px-4 py-3">
                  <div className="font-medium">
                    {itemById[m.itemId]?.name ?? "Unknown item"}
                  </div>
                  <div className="text-xs text-slate-400">
                    {itemById[m.itemId]?.sku ?? "-"}
                  </div>
                </td>

                <td className="px-4 py-3 font-medium">{m.type}</td>
                <td className="px-4 py-3">
                  <span className="font-semibold">{m.qty}</span>
                </td>
                <td className="px-4 py-3 text-slate-300">{m.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
