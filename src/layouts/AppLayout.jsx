import { NavLink, Outlet } from "react-router-dom";

const base =
  "rounded-xl px-3 py-2 text-sm transition border border-transparent";
const active = "bg-slate-800 text-slate-100 border-slate-700";
const inactive = "text-slate-300 hover:bg-slate-900 hover:text-slate-100";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="font-semibold tracking-tight">Inventory</div>

          <nav className="flex gap-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/items"
              className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
            >
              Items
            </NavLink>

            <NavLink
              to="/movements"
              className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
            >
              Movements
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
