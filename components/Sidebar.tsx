"use client";

import Link from "next/link";
import { useState } from "react";

export default function Sidebar() {
  const [inventarioOpen, setInventarioOpen] = useState(true);
  const [operacionesOpen, setOperacionesOpen] = useState(true);
  const [activosOpen, setActivosOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-8">
        Sistema Cometa
      </h1>

      <nav className="space-y-2">
        <Link
          href="/"
          className="block rounded px-3 py-2 hover:bg-stone-100"
        >
          📊 Dashboard
        </Link>

        {/* Inventario */}
        <button
          onClick={() => setInventarioOpen(!inventarioOpen)}
          className="w-full flex items-center justify-between rounded px-3 py-2 hover:bg-stone-100"
        >
          <span>📦 Inventario</span>
          <span>{inventarioOpen ? "▲" : "▼"}</span>
        </button>

        {inventarioOpen && (
          <div className="ml-4 space-y-1">
            <Link href="/material" className="block px-3 py-1 hover:text-slate-700">
              Material
            </Link>

            <Link href="/fabricacion" className="block px-3 py-1 hover:text-slate-700">
              Fabricación
            </Link>

            <Link href="/cuadrillas" className="block px-3 py-1 hover:text-slate-700">
              Cuadrillas
            </Link>

            <Link href="/suministro" className="block px-3 py-1 hover:text-slate-700">
              Suministro
            </Link>
          </div>
        )}

        {/* Operaciones */}
        <button
          onClick={() => setOperacionesOpen(!operacionesOpen)}
          className="w-full flex items-center justify-between rounded px-3 py-2 hover:bg-stone-100"
        >
          <span>🚚 Operaciones</span>
          <span>{operacionesOpen ? "▲" : "▼"}</span>
        </button>

        {operacionesOpen && (
          <div className="ml-4 space-y-1">
            <Link href="/operaciones" className="block px-3 py-1 hover:text-slate-700">
              Órdenes de Compra
            </Link>

            <Link href="/programa-trabajo" className="block px-3 py-1 hover:text-slate-700">
              Programa de Trabajo
            </Link>

            <Link href="/tecnicos" className="block px-3 py-1 hover:text-slate-700">
              Técnicos
            </Link>

            <Link href="/radios" className="block px-3 py-1 hover:text-slate-700">
              Radios
            </Link>

            <Link href="/historial" className="block px-3 py-1 hover:text-slate-700">
              Historial
            </Link>
          </div>
        )}

        {/* Activos */}
        <button
          onClick={() => setActivosOpen(!activosOpen)}
          className="w-full flex items-center justify-between rounded px-3 py-2 hover:bg-stone-100"
        >
          <span>🏗 Activos</span>
          <span>{activosOpen ? "▲" : "▼"}</span>
        </button>

        {activosOpen && (
          <div className="ml-4 space-y-1">
            <Link href="/activos" className="block px-3 py-1 hover:text-slate-700">
              Activos
            </Link>

            <Link href="/mantenimientos" className="block px-3 py-1 hover:text-slate-700">
              Mantenimientos
            </Link>
          </div>
        )}

        {/* Administración */}
        <button
          onClick={() => setAdminOpen(!adminOpen)}
          className="w-full flex items-center justify-between rounded px-3 py-2 hover:bg-stone-100"
        >
          <span>⚙️ Administración</span>
          <span>{adminOpen ? "▲" : "▼"}</span>
        </button>

        {adminOpen && (
          <div className="ml-4 space-y-1">
            <Link href="/usuarios" className="block px-3 py-1 hover:text-slate-700">
              Usuarios
            </Link>

            <Link href="/roles" className="block px-3 py-1 hover:text-slate-700">
              Roles
            </Link>

            <Link href="/configuracion" className="block px-3 py-1 hover:text-slate-700">
              Configuración
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
}