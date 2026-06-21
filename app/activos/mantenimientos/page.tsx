"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Activo = {
  id: string;
  codigo_activo: string | null;
  nombre: string;
};

type Mantenimiento = {
  id: string;
  activo_id: string;
  fecha: string;
  proxima_fecha: string | null;
  tipo: string;
  responsable: string | null;
  costo: number | null;
  notas: string | null;
  activos_fabricacion?: Activo | null;
};

function formatearFecha(fecha: string | null) {
  if (!fecha) return "";

  return new Date(fecha).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatearCosto(costo: number | null) {
  if (!costo) return "$0";

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(costo);
}

export default function MantenimientosPage() {
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [activos, setActivos] = useState<Activo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [mantenimientoSeleccionado, setMantenimientoSeleccionado] =
    useState<Mantenimiento | null>(null);
  const [mantenimientoEditando, setMantenimientoEditando] =
    useState<Mantenimiento | null>(null);

  const [activoId, setActivoId] = useState("");
  const [fecha, setFecha] = useState("");
  const [proximaFecha, setProximaFecha] = useState("");
  const [tipo, setTipo] = useState("Preventivo");
  const [responsable, setResponsable] = useState("");
  const [costo, setCosto] = useState("");
  const [notas, setNotas] = useState("");

  async function cargarDatos() {
    setCargando(true);

    const { data: activosData } = await supabase
      .from("activos_fabricacion")
      .select("id, codigo_activo, nombre")
      .order("codigo_activo", { ascending: true });

    const { data: mantenimientosData, error } = await supabase
      .from("mantenimientos")
      .select(
        `
        *,
        activos_fabricacion (
          id,
          codigo_activo,
          nombre
        )
      `
      )
      .order("fecha", { ascending: true });

    if (error) {
      alert("Error al cargar mantenimientos: " + error.message);
      setCargando(false);
      return;
    }

    setActivos(activosData || []);
    setMantenimientos(mantenimientosData || []);
    setCargando(false);
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  const mantenimientosFiltrados = useMemo(() => {
    return mantenimientos.filter((mantenimiento) => {
      const activo = mantenimiento.activos_fabricacion;

      const texto = `${activo?.codigo_activo || ""} ${activo?.nombre || ""} ${
        mantenimiento.tipo
      } ${mantenimiento.responsable || ""} ${
        mantenimiento.notas || ""
      }`.toLowerCase();

      return texto.includes(busqueda.toLowerCase());
    });
  }, [mantenimientos, busqueda]);

  function limpiarFormulario() {
    setActivoId("");
    setFecha("");
    setProximaFecha("");
    setTipo("Preventivo");
    setResponsable("");
    setCosto("");
    setNotas("");
    setMantenimientoEditando(null);
  }

  function abrirNuevoMantenimiento() {
    limpiarFormulario();
    setModalAbierto(true);
  }

  function abrirEditarMantenimiento(mantenimiento: Mantenimiento) {
    setMantenimientoEditando(mantenimiento);
    setActivoId(mantenimiento.activo_id);
    setFecha(mantenimiento.fecha);
    setProximaFecha(mantenimiento.proxima_fecha || "");
    setTipo(mantenimiento.tipo);
    setResponsable(mantenimiento.responsable || "");
    setCosto(mantenimiento.costo ? String(mantenimiento.costo) : "");
    setNotas(mantenimiento.notas || "");
    setMantenimientoSeleccionado(null);
    setModalAbierto(true);
  }

  async function guardarMantenimiento() {
    if (!activoId) {
      alert("Selecciona un activo.");
      return;
    }

    if (!fecha) {
      alert("La fecha es obligatoria.");
      return;
    }

    if (!tipo.trim()) {
      alert("El tipo de mantenimiento es obligatorio.");
      return;
    }

    const datos = {
      activo_id: activoId,
      fecha,
      proxima_fecha: proximaFecha || null,
      tipo,
      responsable: responsable || null,
      costo: Number(costo) || null,
      notas: notas || null,
    };

    if (mantenimientoEditando) {
      const { error } = await supabase
        .from("mantenimientos")
        .update(datos)
        .eq("id", mantenimientoEditando.id);

      if (error) {
        alert("Error al actualizar mantenimiento: " + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("mantenimientos").insert(datos);

      if (error) {
        alert("Error al guardar mantenimiento: " + error.message);
        return;
      }
    }

    limpiarFormulario();
    setModalAbierto(false);
    cargarDatos();
  }

  async function eliminarMantenimiento(mantenimiento: Mantenimiento) {
    const activo = mantenimiento.activos_fabricacion;

    const confirmar = confirm(
      `¿Eliminar mantenimiento?\n\n${activo?.codigo_activo || ""} ${
        activo?.nombre || ""
      }\n${formatearFecha(mantenimiento.fecha)}`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("mantenimientos")
      .delete()
      .eq("id", mantenimiento.id);

    if (error) {
      alert("Error al eliminar mantenimiento: " + error.message);
      return;
    }

    setMantenimientoSeleccionado(null);
    cargarDatos();
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-stone-800">
            Mantenimientos
          </h1>

          <p className="mt-1 text-sm text-stone-500">
            Control de mantenimientos preventivos y correctivos.
          </p>
        </div>

        <button
          onClick={abrirNuevoMantenimiento}
          className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Nuevo Mantenimiento
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por activo, tipo, responsable o notas..."
          className="w-full max-w-md rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 outline-none focus:border-slate-400"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full min-w-[1000px] table-auto border-collapse text-[10px] md:text-[11px]">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-left text-stone-500">
              <th className="px-1 py-1 font-medium md:px-2 md:py-1.5">
                Código
              </th>
              <th className="px-1 py-1 font-medium md:px-2 md:py-1.5">
                Activo
              </th>
              <th className="px-1 py-1 font-medium md:px-2 md:py-1.5">
                Fecha
              </th>
              <th className="px-1 py-1 font-medium md:px-2 md:py-1.5">
                Próxima Fecha
              </th>
              <th className="px-1 py-1 font-medium md:px-2 md:py-1.5">
                Tipo
              </th>
              <th className="px-1 py-1 font-medium md:px-2 md:py-1.5">
                Responsable
              </th>
              <th className="px-1 py-1 font-medium md:px-2 md:py-1.5">
                Costo
              </th>
              <th className="px-1 py-1 font-medium md:px-2 md:py-1.5">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {cargando ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-2 py-4 text-center text-stone-500"
                >
                  Cargando mantenimientos...
                </td>
              </tr>
            ) : mantenimientosFiltrados.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-2 py-4 text-center text-stone-500"
                >
                  No hay mantenimientos registrados.
                </td>
              </tr>
            ) : (
              mantenimientosFiltrados.map((mantenimiento) => {
                const activo = mantenimiento.activos_fabricacion;

                return (
                  <tr
                    key={mantenimiento.id}
                    onClick={() => setMantenimientoSeleccionado(mantenimiento)}
                    className="cursor-pointer border-b border-stone-100 text-stone-700 last:border-0 hover:bg-stone-50"
                  >
                    <td className="whitespace-nowrap px-1 py-1 font-medium text-stone-900 md:px-2 md:py-1.5">
                      {activo?.codigo_activo || "Sin código"}
                    </td>

                    <td className="whitespace-nowrap px-1 py-1 md:px-2 md:py-1.5">
                      {activo?.nombre || "Sin activo"}
                    </td>

                    <td className="whitespace-nowrap px-1 py-1 md:px-2 md:py-1.5">
                      {formatearFecha(mantenimiento.fecha)}
                    </td>

                    <td className="whitespace-nowrap px-1 py-1 md:px-2 md:py-1.5">
                      {formatearFecha(mantenimiento.proxima_fecha) || ""}
                    </td>

                    <td className="whitespace-nowrap px-1 py-1 md:px-2 md:py-1.5">
                      {mantenimiento.tipo}
                    </td>

                    <td className="whitespace-nowrap px-1 py-1 md:px-2 md:py-1.5">
                      {mantenimiento.responsable || ""}
                    </td>

                    <td className="whitespace-nowrap px-1 py-1 md:px-2 md:py-1.5">
                      {formatearCosto(mantenimiento.costo)}
                    </td>

                    <td className="whitespace-nowrap px-1 py-1 md:px-2 md:py-1.5">
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            abrirEditarMantenimiento(mantenimiento);
                          }}
                          className="rounded border border-stone-200 px-2 py-1 text-[10px] hover:bg-stone-50"
                        >
                          ✏️
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            eliminarMantenimiento(mantenimiento);
                          }}
                          className="rounded border border-red-200 px-2 py-1 text-[10px] text-red-600 hover:bg-red-50"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {mantenimientoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-stone-500">
                  {mantenimientoSeleccionado.activos_fabricacion
                    ?.codigo_activo || "Sin código"}
                </p>

                <h2 className="text-xl font-semibold text-stone-800">
                  {mantenimientoSeleccionado.activos_fabricacion?.nombre ||
                    "Sin activo"}
                </h2>

                <p className="mt-1 text-sm text-stone-500">
                  {mantenimientoSeleccionado.tipo}
                </p>
              </div>

              <button
                onClick={() => setMantenimientoSeleccionado(null)}
                className="rounded-lg border border-stone-200 px-3 py-1 text-sm text-stone-600 hover:bg-stone-50"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-6 grid gap-3 text-sm">
              <div>
                <p className="text-xs text-stone-500">Fecha</p>
                <p className="text-stone-700">
                  {formatearFecha(mantenimientoSeleccionado.fecha)}
                </p>
              </div>

              <div>
                <p className="text-xs text-stone-500">Próxima Fecha</p>
                <p className="text-stone-700">
                  {formatearFecha(mantenimientoSeleccionado.proxima_fecha) ||
                    "Sin próxima fecha"}
                </p>
              </div>

              <div>
                <p className="text-xs text-stone-500">Responsable</p>
                <p className="text-stone-700">
                  {mantenimientoSeleccionado.responsable || "Sin responsable"}
                </p>
              </div>

              <div>
                <p className="text-xs text-stone-500">Costo</p>
                <p className="text-stone-700">
                  {formatearCosto(mantenimientoSeleccionado.costo)}
                </p>
              </div>

              {mantenimientoSeleccionado.notas && (
                <div>
                  <p className="text-xs text-stone-500">Notas</p>
                  <p className="rounded-lg bg-stone-50 p-3 text-stone-700">
                    {mantenimientoSeleccionado.notas}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() =>
                  eliminarMantenimiento(mantenimientoSeleccionado)
                }
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Eliminar
              </button>

              <button
                onClick={() =>
                  abrirEditarMantenimiento(mantenimientoSeleccionado)
                }
                className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[80vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-stone-800">
              {mantenimientoEditando
                ? "Editar mantenimiento"
                : "Nuevo mantenimiento"}
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              {mantenimientoEditando
                ? "Modifica el mantenimiento seleccionado."
                : "Captura el mantenimiento realizado o programado."}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Activo
                </label>

                <select
                  value={activoId}
                  onChange={(e) => setActivoId(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700"
                >
                  <option value="">Seleccionar activo</option>

                  {activos.map((activo) => (
                    <option key={activo.id} value={activo.id}>
                      {activo.codigo_activo || "Sin código"} - {activo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Fecha
                </label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Próxima Fecha
                </label>
                <input
                  type="date"
                  value={proximaFecha}
                  onChange={(e) => setProximaFecha(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Tipo
                </label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700"
                >
                  <option>Preventivo</option>
                  <option>Correctivo</option>
                  <option>Inspección</option>
                  <option>Lubricación</option>
                  <option>Cambio de pieza</option>
                  <option>Otro</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Responsable
                </label>
                <input
                  value={responsable}
                  onChange={(e) => setResponsable(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                  placeholder="Ej. Daniel"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Costo
                </label>
                <input
                  value={costo}
                  onChange={(e) => setCosto(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                  placeholder="Ej. 1500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Notas
                </label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="min-h-24 w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                  placeholder="Observaciones del mantenimiento"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  limpiarFormulario();
                  setModalAbierto(false);
                }}
                className="rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
              >
                Cancelar
              </button>

              <button
                onClick={guardarMantenimiento}
                className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                {mantenimientoEditando ? "Guardar cambios" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}