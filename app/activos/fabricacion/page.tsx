"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type EstadoActivo = "Operativa" | "Requiere atención" | "Fuera de servicio";

type ActivoFabricacion = {
  id: string;
  codigo_activo: string | null;
  nombre: string;
  categoria: string;
  marca: string | null;
  modelo: string | null;
  serie: string | null;
  ubicacion: string | null;
  estado: EstadoActivo;
  ultimo_mantenimiento: string | null;
  proximo_mantenimiento: string | null;
  proxima_fecha?: string | null;
  notas: string | null;
};

function textoMantenimiento(fecha: string | null) {
  if (!fecha) return "Sin programar";

  return new Date(fecha).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function EquipoFabricacionPage() {
  const [activos, setActivos] = useState<ActivoFabricacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [activoSeleccionado, setActivoSeleccionado] =
    useState<ActivoFabricacion | null>(null);
  const [activoEditando, setActivoEditando] =
    useState<ActivoFabricacion | null>(null);

  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("Roladora");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [serie, setSerie] = useState("");
  const [ubicacion, setUbicacion] = useState("Producción");
  const [estado, setEstado] = useState<EstadoActivo>("Operativa");
  const [notas, setNotas] = useState("");

  async function cargarActivos() {
    setCargando(true);

    const { data: activosData, error } = await supabase
      .from("activos_fabricacion")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert("Error al cargar activos: " + error.message);
      setCargando(false);
      return;
    }

    const { data: mantenimientosData } = await supabase
      .from("mantenimientos")
      .select("activo_id, proxima_fecha");

    const activosConFechas = (activosData || []).map((activo) => {
      const proximos = (mantenimientosData || [])
        .filter((mantenimiento) => {
          return (
            mantenimiento.activo_id === activo.id &&
            mantenimiento.proxima_fecha
          );
        })
        .sort((a, b) => {
          return (
            new Date(a.proxima_fecha!).getTime() -
            new Date(b.proxima_fecha!).getTime()
          );
        });

      return {
        ...activo,
        proxima_fecha:
          proximos.length > 0 ? proximos[0].proxima_fecha : null,
      };
    });

    setActivos(activosConFechas);
    setCargando(false);
  }

  useEffect(() => {
    cargarActivos();
  }, []);

  function generarCodigoActivo() {
    const numeros = activos
      .map((activo) => activo.codigo_activo)
      .filter(Boolean)
      .filter((codigo) => codigo!.startsWith("FAB-"))
      .map((codigo) => Number(codigo!.split("-")[1]))
      .filter((numero) => !Number.isNaN(numero));

    const siguiente = numeros.length > 0 ? Math.max(...numeros) + 1 : 1;

    return `FAB-${String(siguiente).padStart(4, "0")}`;
  }

  function limpiarFormulario() {
    setNombre("");
    setCategoria("Roladora");
    setMarca("");
    setModelo("");
    setSerie("");
    setUbicacion("Producción");
    setEstado("Operativa");
    setNotas("");
    setActivoEditando(null);
  }

  function abrirNuevoActivo() {
    limpiarFormulario();
    setModalAbierto(true);
  }

  function abrirEditarActivo(activo: ActivoFabricacion) {
    setActivoEditando(activo);
    setNombre(activo.nombre);
    setCategoria(activo.categoria);
    setMarca(activo.marca || "");
    setModelo(activo.modelo || "");
    setSerie(activo.serie || "");
    setUbicacion(activo.ubicacion || "");
    setEstado(activo.estado);
    setNotas(activo.notas || "");
    setActivoSeleccionado(null);
    setModalAbierto(true);
  }

  async function eliminarActivo(id: string) {
    const confirmar = confirm(
      "¿Seguro que deseas eliminar este activo?"
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("activos_fabricacion")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error al eliminar: " + error.message);
      return;
    }

    setActivoSeleccionado(null);
    cargarActivos();
  }

  async function guardarActivo() {
    if (!nombre.trim()) {
      alert("El nombre del activo es obligatorio.");
      return;
    }

    if (activoEditando) {
      const { error } = await supabase
        .from("activos_fabricacion")
        .update({
          nombre,
          categoria,
          marca: marca || null,
          modelo: modelo || null,
          serie: serie || null,
          ubicacion: ubicacion || null,
          estado,
          notas: notas || null,
        })
        .eq("id", activoEditando.id);

      if (error) {
        alert("Error al actualizar activo: " + error.message);
        return;
      }
    } else {
      const codigoGenerado = generarCodigoActivo();

      const { error } = await supabase.from("activos_fabricacion").insert({
        codigo_activo: codigoGenerado,
        nombre,
        categoria,
        marca: marca || null,
        modelo: modelo || null,
        serie: serie || null,
        ubicacion: ubicacion || null,
        estado,
        notas: notas || null,
      });

      if (error) {
        alert("Error al guardar activo: " + error.message);
        return;
      }
    }

    limpiarFormulario();
    setModalAbierto(false);
    cargarActivos();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-stone-800">
            Equipo de Fabricación
          </h1>

          <p className="mt-1 text-sm text-stone-500">
            Roladoras, soldadoras, compresores y equipo productivo.
          </p>
        </div>

        <button
          onClick={abrirNuevoActivo}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700"
        >
          + Nuevo Activo
        </button>
      </div>

      {cargando ? (
        <p className="text-sm text-stone-500">Cargando activos...</p>
      ) : activos.length === 0 ? (
        <div className="rounded-lg border border-stone-200 bg-white p-4 text-sm text-stone-500">
          Todavía no hay activos registrados.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
          {activos.map((activo) => (
            <button
              key={activo.id}
              onClick={() => setActivoSeleccionado(activo)}
              className="rounded-lg border border-stone-200 bg-white p-3 text-left shadow-sm hover:bg-stone-50"
            >
              <p className="text-[11px] font-medium text-stone-500">
                {activo.codigo_activo || "Sin código"}
              </p>

              <h2 className="text-base font-semibold text-stone-800">
                {activo.nombre}
              </h2>

              <p className="mt-1 text-xs text-stone-500">{activo.categoria}</p>

              <p className="mt-2 text-xs text-stone-600">
                Estado:
                <span className="ml-1 font-medium">{activo.estado}</span>
              </p>

              <p className="mt-1 text-xs text-stone-600">
                Ubicación:
                <span className="ml-1 font-medium">
                  {activo.ubicacion || "Sin ubicación"}
                </span>
              </p>

              <p className="mt-1 text-xs text-stone-600">
                Próximo mantenimiento:
                <span
                  className={`ml-1 font-medium ${
                    !activo.proxima_fecha
                      ? "text-stone-500"
                      : new Date(activo.proxima_fecha) < new Date()
                      ? "text-red-600"
                      : new Date(activo.proxima_fecha).getTime() <
                        Date.now() + 1000 * 60 * 60 * 24 * 30
                      ? "text-amber-600"
                      : "text-green-600"
                  }`}
                >
                  {textoMantenimiento(activo.proxima_fecha || null)}
                </span>
              </p>
            </button>
          ))}
        </div>
      )}

      {activoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-stone-500">
                  {activoSeleccionado.codigo_activo || "Sin código"}
                </p>

                <h2 className="text-xl font-semibold text-stone-800">
                  {activoSeleccionado.nombre}
                </h2>

                <p className="mt-1 text-sm text-stone-500">
                  {activoSeleccionado.categoria}
                </p>
              </div>

              <button
                onClick={() => setActivoSeleccionado(null)}
                className="rounded-lg border border-stone-200 px-3 py-1 text-sm text-stone-600 hover:bg-stone-50"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-6 grid gap-3 text-sm">
              <div>
                <p className="text-xs text-stone-500">Estado</p>
                <p className="text-stone-700">{activoSeleccionado.estado}</p>
              </div>

              <div>
                <p className="text-xs text-stone-500">Marca</p>
                <p className="text-stone-700">
                  {activoSeleccionado.marca || "Sin marca"}
                </p>
              </div>

              <div>
                <p className="text-xs text-stone-500">Modelo</p>
                <p className="text-stone-700">
                  {activoSeleccionado.modelo || "Sin modelo"}
                </p>
              </div>

              <div>
                <p className="text-xs text-stone-500">Número de serie</p>
                <p className="text-stone-700">
                  {activoSeleccionado.serie || "Sin serie"}
                </p>
              </div>

              <div>
                <p className="text-xs text-stone-500">Ubicación</p>
                <p className="text-stone-700">
                  {activoSeleccionado.ubicacion || "Sin ubicación"}
                </p>
              </div>

              <div>
                <p className="text-xs text-stone-500">Próximo mantenimiento</p>
                <p className="text-stone-700">
                  {textoMantenimiento(activoSeleccionado.proxima_fecha || null)}
                </p>
              </div>

              {activoSeleccionado.notas && (
                <div>
                  <p className="text-xs text-stone-500">Notas</p>
                  <p className="rounded-lg bg-stone-50 p-3 text-stone-700">
                    {activoSeleccionado.notas}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => eliminarActivo(activoSeleccionado.id)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Eliminar
              </button>

              <button
                onClick={() => abrirEditarActivo(activoSeleccionado)}
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
              {activoEditando ? "Editar Activo" : "Nuevo Activo"}
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              {activoEditando
                ? `Editando ${activoEditando.codigo_activo || "sin código"}`
                : "El código se generará automáticamente."}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Nombre del activo
                </label>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                  placeholder="Ej. Soldadora Miller #1"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Categoría
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700"
                >
                  <option>Roladora</option>
                  <option>Soldadora</option>
                  <option>Compresor</option>
                  <option>Prensa</option>
                  <option>Pintura</option>
                  <option>Otro</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Estado
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as EstadoActivo)}
                  className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700"
                >
                  <option>Operativa</option>
                  <option>Requiere atención</option>
                  <option>Fuera de servicio</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Marca
                </label>
                <input
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                  placeholder="Ej. Miller"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Modelo
                </label>
                <input
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                  placeholder="Ej. Millermatic 252"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Número de serie
                </label>
                <input
                  value={serie}
                  onChange={(e) => setSerie(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                  placeholder="Serie"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Ubicación
                </label>
                <input
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                  placeholder="Ej. Producción"
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
                  placeholder="Observaciones del activo"
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
                onClick={guardarActivo}
                className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                {activoEditando ? "Guardar cambios" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}