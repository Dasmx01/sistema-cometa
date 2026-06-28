"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Tecnico = {
  id: string;
  nombre: string;
  puesto: string;
  activo: boolean;
  telefono: string | null;
  notas: string | null;
  created_at: string | null;
};

function textoEstado(activo: boolean) {
  return activo ? "Activo" : "Inactivo";
}

export default function TecnicosPage() {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Activos");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [tecnicoSeleccionado, setTecnicoSeleccionado] =
    useState<Tecnico | null>(null);
  const [tecnicoEditando, setTecnicoEditando] =
    useState<Tecnico | null>(null);

  const [nombre, setNombre] = useState("");
  const [puesto, setPuesto] = useState("Técnico");
  const [activo, setActivo] = useState(true);
  const [telefono, setTelefono] = useState("");
  const [notas, setNotas] = useState("");

  async function cargarTecnicos() {
    setCargando(true);

    const { data, error } = await supabase
      .from("tecnicos")
      .select("*")
      .order("nombre", { ascending: true });

    if (error) {
      alert("Error al cargar técnicos: " + error.message);
      setCargando(false);
      return;
    }

    setTecnicos((data || []) as Tecnico[]);
    setCargando(false);
  }

  useEffect(() => {
    cargarTecnicos();
  }, []);

  const tecnicosFiltrados = useMemo(() => {
    return tecnicos
      .filter((tecnico) => {
        const texto = `${tecnico.nombre} ${tecnico.puesto} ${
          tecnico.telefono || ""
        }`.toLowerCase();

        const coincideBusqueda = texto.includes(busqueda.toLowerCase());

        const coincideEstado =
          filtroEstado === "Todos" ||
          (filtroEstado === "Activos" && tecnico.activo) ||
          (filtroEstado === "Inactivos" && !tecnico.activo);

        return coincideBusqueda && coincideEstado;
      })
      .sort((a, b) =>
        a.nombre.localeCompare(b.nombre, "es", {
          sensitivity: "base",
        })
      );
  }, [tecnicos, busqueda, filtroEstado]);

  function limpiarFormulario() {
    setNombre("");
    setPuesto("Técnico");
    setActivo(true);
    setTelefono("");
    setNotas("");
    setTecnicoEditando(null);
  }

  function abrirNuevoTecnico() {
    limpiarFormulario();
    setModalAbierto(true);
  }

  function abrirEditarTecnico(tecnico: Tecnico) {
    setTecnicoEditando(tecnico);
    setNombre(tecnico.nombre);
    setPuesto(tecnico.puesto);
    setActivo(tecnico.activo);
    setTelefono(tecnico.telefono || "");
    setNotas(tecnico.notas || "");
    setTecnicoSeleccionado(null);
    setModalAbierto(true);
  }

  async function guardarTecnico() {
    if (!nombre.trim()) {
      alert("El nombre del técnico es obligatorio.");
      return;
    }

    const datos = {
      nombre: nombre.trim(),
      puesto,
      activo,
      telefono: telefono.trim() || null,
      notas: notas.trim() || null,
    };

    if (tecnicoEditando) {
      const { error } = await supabase
        .from("tecnicos")
        .update(datos)
        .eq("id", tecnicoEditando.id);

      if (error) {
        alert("Error al actualizar técnico: " + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("tecnicos").insert(datos);

      if (error) {
        alert("Error al guardar técnico: " + error.message);
        return;
      }
    }

    limpiarFormulario();
    setModalAbierto(false);
    cargarTecnicos();
  }

  async function eliminarTecnico(id: string) {
    const confirmar = confirm("¿Seguro que deseas eliminar este técnico?");

    if (!confirmar) return;

    const { error } = await supabase
      .from("tecnicos")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error al eliminar técnico: " + error.message);
      return;
    }

    setTecnicoSeleccionado(null);
    cargarTecnicos();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-stone-800">
            Técnicos
          </h1>

          <p className="mt-1 text-sm text-stone-500">
            Personal operativo, ayudantes, cursos, herramientas y radios.
          </p>
        </div>

        <button
          onClick={abrirNuevoTecnico}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700"
        >
          + Nuevo Técnico
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar técnico o ayudante..."
          className="w-full max-w-md rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 outline-none focus:border-slate-400"
        />

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 outline-none focus:border-slate-400"
        >
          <option>Activos</option>
          <option>Inactivos</option>
          <option>Todos</option>
        </select>
      </div>

      {cargando ? (
        <p className="text-sm text-stone-500">Cargando técnicos...</p>
      ) : tecnicosFiltrados.length === 0 ? (
        <div className="rounded-lg border border-stone-200 bg-white p-4 text-sm text-stone-500">
          Todavía no hay técnicos registrados.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
          {tecnicosFiltrados.map((tecnico) => (
            <button
              key={tecnico.id}
              onClick={() => setTecnicoSeleccionado(tecnico)}
              className="rounded-lg border border-stone-200 bg-white p-3 text-left shadow-sm hover:bg-stone-50"
            >
              
              <h2 className="text-base font-semibold text-stone-800">
                {tecnico.nombre}
              </h2>

              <p className="mt-1 text-xs text-stone-500">
                {tecnico.puesto}
              </p>

              <p className="mt-2 text-xs text-stone-600">
                Estado:
                <span
                  className={`ml-1 font-medium ${
                    tecnico.activo ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {textoEstado(tecnico.activo)}
                </span>
              </p>

              <p className="mt-1 text-xs text-stone-600">
                Teléfono:
                <span className="ml-1 font-medium">
                  {tecnico.telefono || "Sin teléfono"}
                </span>
              </p>
            </button>
          ))}
        </div>
      )}

      {tecnicoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-stone-500">
                  {textoEstado(tecnicoSeleccionado.activo)}
                </p>

                <h2 className="text-xl font-semibold text-stone-800">
                  {tecnicoSeleccionado.nombre}
                </h2>

                <p className="mt-1 text-sm text-stone-500">
                  {tecnicoSeleccionado.puesto}
                </p>
              </div>

              <button
                onClick={() => setTecnicoSeleccionado(null)}
                className="rounded-lg border border-stone-200 px-3 py-1 text-sm text-stone-600 hover:bg-stone-50"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-6 grid gap-4 text-sm">
              <div>
                <p className="text-xs text-stone-500">Teléfono</p>
                <p className="text-stone-700">
                  {tecnicoSeleccionado.telefono || "Sin teléfono"}
                </p>
              </div>

              <div>
                <p className="text-xs text-stone-500">Cursos y DC-3</p>
                <div className="rounded-lg bg-stone-50 p-3 text-stone-500">
                  Pendiente de conectar cursos.
                </div>
              </div>

              <div>
                <p className="text-xs text-stone-500">Próximos cursos</p>
                <div className="rounded-lg bg-stone-50 p-3 text-stone-500">
                  Pendiente.
                </div>
              </div>

              <div>
                <p className="text-xs text-stone-500">
                  Herramientas prestadas
                </p>
                <div className="rounded-lg bg-stone-50 p-3 text-stone-500">
                  Pendiente.
                </div>
              </div>

              <div>
                <p className="text-xs text-stone-500">Radio asignado</p>
                <div className="rounded-lg bg-stone-50 p-3 text-stone-500">
                  Pendiente.
                </div>
              </div>

              <div>
                <p className="text-xs text-stone-500">Historial</p>
                <div className="rounded-lg bg-stone-50 p-3 text-stone-500">
                  Pendiente de historial automático.
                </div>
              </div>

              {tecnicoSeleccionado.notas && (
                <div>
                  <p className="text-xs text-stone-500">Notas</p>

                  <div className="rounded-lg bg-stone-50 p-3 text-stone-700">
                    {tecnicoSeleccionado.notas}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => eliminarTecnico(tecnicoSeleccionado.id)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Eliminar
              </button>

              <button
                onClick={() => abrirEditarTecnico(tecnicoSeleccionado)}
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
              {tecnicoEditando ? "Editar Técnico" : "Nuevo Técnico"}
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              {tecnicoEditando
                ? `Editando ${tecnicoEditando.nombre}`
                : "Agrega un técnico o ayudante."}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Nombre
                </label>

                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                  placeholder="Ej. Javier Hernández"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Puesto
                </label>

                <select
                  value={puesto}
                  onChange={(e) => setPuesto(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm"
                >
                  <option>Técnico</option>
                  <option>Ayudante</option>
                  <option>Técnico / Ayudante</option>
                  <option>Supervisor</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Estado
                </label>

                <select
                  value={activo ? "Activo" : "Inactivo"}
                  onChange={(e) => setActivo(e.target.value === "Activo")}
                  className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm"
                >
                  <option>Activo</option>
                  <option>Inactivo</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Teléfono
                </label>

                <input
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
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
                onClick={guardarTecnico}
                className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                {tecnicoEditando ? "Guardar cambios" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}