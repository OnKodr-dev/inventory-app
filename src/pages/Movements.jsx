import { useMemo, useState } from "react";
import { useInventory } from "../context/useInventory.js";

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

export default function Movements() {
  const { items, movements, addMovement } = useInventory();

  const [itemId, setItemId] = useState(items[0]?.id ?? "");
  const [type, setType] = useState("IN");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  const itemById = useMemo(() => {
    const map = {};
    for (const it of items) map[it.id] = it;
    return map;
  }, [items]);

  const sorted = useMemo(() => {
    return [...movements].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [movements]);

  function onSubmit(e) {
    e.preventDefault();

    const numQty = Number(qty);

    if (!itemId) return;
    if (!Number.isFinite(numQty) || numQty <= 0) return;

    addMovement({
      itemId,
      type,
      qty: numQty,
      note,
    });

    setType("IN");
    setQty(1);
    setNote("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Movements</h1>
        <p className="mt-1 text-slate-300">Přidávej a sleduj skladové pohyby.</p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-4">
        <h2 className="font-semibold">Add movement</h2>

        <form onSubmit={onSubmit} className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="text-xs text-slate-400">Item</label>
            <select
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-slate-600"
            >
              {items.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.name} ({it.sku})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-slate-600"
            >
              <option value="IN">IN</option>
              <option value="OUT">OUT</option>
              <option value="ADJUST">ADJUST</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400">Qty</label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              min="1"
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-slate-600"
            />
          </div>

          <div className="md:col-span-3">
            <label className="text-xs text-slate-400">Note</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-slate-600"
              placeholder="e.g. supplier delivery, issued to team..."
            />
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
