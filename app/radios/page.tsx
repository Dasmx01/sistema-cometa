"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Radio = {
  id: string;
  numero: string;
  activo: boolean;
  notas: string | null;
  created_at: string | null;
};

function textoEstado(activo: boolean) {
  return activo ? "Activo" : "Inactivo";
}

export default function RadiosPage() {
  const [radios, setRadios] = useState<Radio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Activos");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [radioSeleccionado, setRadioSeleccionado] =
    useState<Radio | null>(null);
  const [radioEditando, setRadioEditando] =
    useState<Radio | null>(null);

  const [numero, setNumero] = useState("");
  const [activo, setActivo] = useState(true);
  const [notas, setNotas] = useState("");

  async function cargarRadios() {
    setCargando(true);

    const { data, error } = await supabase
      .from("radios")
      .select("*")
      .order("numero", { ascending: true });

    if (error) {
      alert("Error al cargar radios: " + error.message);
      setCargando(false);
      return;
    }

    setRadios((data || []) as Radio[]);
    setCargando(false);
  }

  useEffect(() => {
    cargarRadios();
  }, []);

  const radiosFiltrados = useMemo(() => {
    return radios
      .filter((radio) => {
        const texto = `${radio.numero} ${radio.notas || ""}`.toLowerCase();

        const coincideBusqueda = texto.includes(busqueda.toLowerCase());

        const coincideEstado =
          filtroEstado === "Todos" ||
          (filtroEstado === "Activos" && radio.activo) ||
          (filtroEstado === "Inactivos" && !radio.activo);

        return coincideBusqueda && coincideEstado;
      })
      .sort((a, b) =>
        a.numero.localeCompare(b.numero, "es", {
          sensitivity: "base",
          numeric: true,
        })
      );
  }, [radios, busqueda, filtroEstado]);

  function limpiarFormulario() {
    setNumero("");
    setActivo(true);
    setNotas("");
    setRadioEditando(null);
  }

  function abrirNuevoRadio() {
    limpiarFormulario();
    setModalAbierto(true);
  }

  function abrirEditarRadio(radio: Radio) {
    setRadioEditando(radio);
    setNumero(radio.numero);
    setActivo(radio.activo);
    setNotas(radio.notas || "");
    setRadioSeleccionado(null);
    setModalAbierto(true);
  }

  async function guardarRadio() {
    if (!numero.trim()) {
      alert("El número/nombre del radio es obligatorio.");
      return;
    }

    const datos = {
      numero: numero.trim(),
      activo,
      notas: notas.trim() || null,
    };

    if (radioEditando) {
      const { error } = await supabase
        .from("radios")
        .update(datos)
        .eq("id", radioEditando.id);

      if (error) {
        alert("Error al actualizar radio: " + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("radios").insert(datos);

      if (error) {
        alert("Error al guardar radio: " + error.message);
        return;
      }
    }

    limpiarFormulario();
    setModalAbierto(false);
    cargarRadios();
  }

  async function eliminarRadio(id: string) {
    const confirmar = confirm("¿Seguro que deseas eliminar este radio?");

    if (!confirmar) return;

    const { error } = await supabase
      .from("radios")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error al eliminar radio: " + error.message);
      return;
    }

    setRadioSeleccionado(null);
    cargarRadios();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-stone-800">
            Radios
          </h1>

          <p className="mt-1 text-sm text-stone-500">
            Catálogo simple de radios para asignación diaria en Programa de Trabajo.
          </p>
        </div>

        <button
          onClick={abrirNuevoRadio}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700"
        >
          + Nuevo Radio
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar radio..."
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
        <p className="text-sm text-stone-500">Cargando radios...</p>
      ) : radiosFiltrados.length === 0 ? (
        <div className="rounded-lg border border-stone-200 bg-white p-4 text-sm text-stone-500">
          Todavía no hay radios registrados.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
          {radiosFiltrados.map((radio) => (
            <button
              key={radio.id}
              onClick={() => setRadioSeleccionado(radio)}
              className="rounded-lg border border-stone-200 bg-white p-3 text-left shadow-sm hover:bg-stone-50"
            >
              <h2 className="text-base font-semibold text-stone-800">
                {radio.numero}
              </h2>

              <p className="mt-2 text-xs text-stone-600">
                Estado:
                <span
                  className={`ml-1 font-medium ${
                    radio.activo ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {textoEstado(radio.activo)}
                </span>
              </p>

              <p className="mt-1 text-xs text-stone-600">
                Notas:
                <span className="ml-1 font-medium">
                  {radio.notas || "Sin notas"}
                </span>
              </p>
            </button>
          ))}
        </div>
      )}

      {radioSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-stone-500">
                  {textoEstado(radioSeleccionado.activo)}
                </p>

                <h2 className="text-xl font-semibold text-stone-800">
                  {radioSeleccionado.numero}
                </h2>

                <p className="mt-1 text-sm text-stone-500">
                  Catálogo de radio
                </p>
              </div>

              <button
                onClick={() => setRadioSeleccionado(null)}
                className="rounded-lg border border-stone-200 px-3 py-1 text-sm text-stone-600 hover:bg-stone-50"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-6 grid gap-4 text-sm">
              <div>
                <p className="text-xs text-stone-500">Estado</p>
                <p className="text-stone-700">
                  {textoEstado(radioSeleccionado.activo)}
                </p>
              </div>

              <div>
                <p className="text-xs text-stone-500">Notas</p>
                <div className="rounded-lg bg-stone-50 p-3 text-stone-700">
                  {radioSeleccionado.notas || "Sin notas"}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => eliminarRadio(radioSeleccionado.id)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Eliminar
              </button>

              <button
                onClick={() => abrirEditarRadio(radioSeleccionado)}
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
              {radioEditando ? "Editar Radio" : "Nuevo Radio"}
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              {radioEditando
                ? `Editando ${radioEditando.numero}`
                : "Agrega un radio al catálogo."}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Número / nombre del radio
                </label>

                <input
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                  placeholder="Ej. Radio 01"
                />
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
                  Notas
                </label>

                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="min-h-24 w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                  placeholder="Ej. Motorola, pila dañada, revisar antena..."
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
                onClick={guardarRadio}
                className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                {radioEditando ? "Guardar cambios" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}