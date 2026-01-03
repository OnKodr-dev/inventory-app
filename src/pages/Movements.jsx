import { useMemo, useState } from "react";
import { useInventory } from "../context/useInventory.js";
import { computeStockByItemId } from "../utils/stock.js";

function formatDate(iso) {
  return new Date(iso).toLocaleString();
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

export default function Movements() {
  const { items, movements, addMovement, resetMovements } = useInventory();

  const [itemId, setItemId] = useState(items[0]?.id ?? "");
  const [type, setType] = useState("IN");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  // filtr tabulky
  const [filter, setFilter] = useState("ALL"); // ALL | IN | OUT | ADJUST

  const itemById = useMemo(() => {
    const map = {};
    for (const it of items) map[it.id] = it;
    return map;
  }, [items]);

  const stockById = useMemo(() => computeStockByItemId(movements), [movements]);
  const currentStock = stockById[itemId] ?? 0;
  const currentItem = itemById[itemId];

  const sorted = useMemo(() => {
    return [...movements].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [movements]);

  // odfiltrované řádky do tabulky
  const filtered = useMemo(() => {
    if (filter === "ALL") return sorted;
    return sorted.filter((m) => m.type === filter);
  }, [sorted, filter]);

  // UX validace pro disabled button (vypočítá se průběžně)
  const { isValid, errorMsg } = useMemo(() => {
    if (!itemId) return { isValid: false, errorMsg: "Vyber item." };

    const numQty = Number(qty);
    if (!Number.isFinite(numQty)) {
      return { isValid: false, errorMsg: "Qty musí být číslo." };
    }

    if (type === "IN" || type === "OUT") {
      if (numQty <= 0) {
        return { isValid: false, errorMsg: "IN/OUT: qty musí být kladné." };
      }
      if (type === "OUT" && numQty > currentStock) {
        return {
          isValid: false,
          errorMsg: `Nedostatek na skladě. Aktuálně: ${currentStock} ${
            currentItem?.unit ?? ""
          }`,
        };
      }
    }

    if (type === "ADJUST") {
      if (numQty === 0) {
        return { isValid: false, errorMsg: "ADJUST: 0 nedává smysl." };
      }
    }

    return { isValid: true, errorMsg: "" };
  }, [itemId, qty, type, currentStock, currentItem]);

  function onSubmit(e) {
    e.preventDefault();

    // pojistka – kdyby někdo obešel disabled (např. Enter / devtools)
    if (!isValid) {
      setError(errorMsg || "Formulář není validní.");
      return;
    }

    setError("");

    const numQty = Number(qty);

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
      <button
        type="button"
        onClick={() => {
        const ok = window.confirm("Opravdu chceš resetnout data na původní seed?");
        if (!ok) return;

        resetMovements();
        setError("");
        setType("IN");
        setQty(1);
        setNote("");
        }}
        className="rounded-xl border border-slate-800 bg-slate-900/20 px-4 py-2 text-sm text-slate-200 hover:bg-slate-900/40"
    >
        Reset data
    </button>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-4">
        <h2 className="font-semibold">Add movement</h2>

        <form onSubmit={onSubmit} className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="text-xs text-slate-400">Item</label>
            <select
              value={itemId}
              onChange={(e) => {
                setItemId(e.target.value);
                setError("");
              }}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-slate-600"
            >
              {items.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.name} ({it.sku})
                </option>
              ))}
            </select>

            <p className="mt-1 text-xs text-slate-400">
              Current stock:{" "}
              <span className="text-slate-200 font-medium">{currentStock}</span>{" "}
              {currentItem?.unit ?? ""}
            </p>
          </div>

          <div>
            <label className="text-xs text-slate-400">Type</label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setError("");
              }}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-slate-600"
            >
              <option value="IN">IN</option>
              <option value="OUT">OUT</option>
              <option value="ADJUST">ADJUST</option>
            </select>

            <p className="mt-1 text-xs text-slate-400">
              {type === "ADJUST"
                ? "ADJUST = korekce (+/-), např. -2 když chybí kusy."
                : "IN/OUT = příjem / výdej (qty musí být kladné)."}
            </p>
          </div>

          <div>
            <label className="text-xs text-slate-400">Qty</label>
            <input
              type="number"
              value={qty}
              onChange={(e) => {
                setQty(e.target.value);
                setError("");
              }}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-slate-600"
            />

            {/* průběžná validace (když uživatel píše) */}
            {!isValid && !error ? (
              <p className="mt-1 text-xs text-slate-400">{errorMsg}</p>
            ) : null}

            {/* “tvrdá” chyba po submitu */}
            {error ? <p className="mt-1 text-xs text-red-300">{error}</p> : null}
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
              disabled={!isValid}
              className={[
                "w-full rounded-xl px-4 py-2 text-sm font-medium",
                isValid
                  ? "bg-emerald-500 text-slate-900"
                  : "bg-slate-700 text-slate-300 opacity-60 cursor-not-allowed",
              ].join(" ")}
              title={!isValid ? errorMsg : "Add movement"}
            >
              Add
            </button>
          </div>
        </form>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-300">
          Showing <span className="font-semibold text-slate-100">{filtered.length}</span>{" "}
          of <span className="font-semibold text-slate-100">{sorted.length}</span> movements
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterPill active={filter === "ALL"} onClick={() => setFilter("ALL")}>
            All
          </FilterPill>
          <FilterPill active={filter === "IN"} onClick={() => setFilter("IN")}>
            IN
          </FilterPill>
          <FilterPill active={filter === "OUT"} onClick={() => setFilter("OUT")}>
            OUT
          </FilterPill>
          <FilterPill
            active={filter === "ADJUST"}
            onClick={() => setFilter("ADJUST")}
          >
            ADJUST
          </FilterPill>
        </div>
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
            {filtered.map((m) => (
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
                  <span className="font-semibold">
                    {m.type === "IN" ? "+" : m.type === "OUT" ? "-" : ""}
                    {m.qty}
                  </span>
                </td>

                <td className="px-4 py-3 text-slate-300">{m.note}</td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-slate-400" colSpan={5}>
                  Žádné pohyby pro filtr: <span className="font-semibold">{filter}</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
