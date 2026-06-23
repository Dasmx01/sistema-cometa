"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Moneda = "MXN" | "USD";

type OrdenCompra = {
  id: string;
  fecha: string;
  cliente: string;
  planta: string;
  numeroOC: string;
  actividadPrincipal: string;
  monto: number;
  moneda: Moneda;
  estatus: string;
  comentarios: string;
  actividades: {
    id: string;
    descripcion: string;
    completada: boolean;
  }[];
};

function calcularProgreso(orden: OrdenCompra) {
  if (orden.actividades.length === 0) return 0;
  const terminadas = orden.actividades.filter((a) => a.completada).length;
  return Math.round((terminadas / orden.actividades.length) * 100);
}

function estatusAutomatico(orden: OrdenCompra) {
  if (orden.estatus === "Cancelada") return "Cancelada";

  const progreso = calcularProgreso(orden);

  if (progreso === 0) return "Abierta";
  if (progreso === 100) return "Terminada";

  return "En proceso";
}

function formatearMoneda(monto: number, moneda: Moneda) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: moneda,
  }).format(monto);
}

function formatearFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function OperacionesPage() {
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstatus, setFiltroEstatus] =
    useState("Todos");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] =
    useState<OrdenCompra | null>(null);
  const [ordenEditando, setOrdenEditando] =
    useState<OrdenCompra | null>(null);

  const [fecha, setFecha] = useState("");
  const [cliente, setCliente] = useState("");
  const [planta, setPlanta] = useState("");
  const [numeroOC, setNumeroOC] = useState("");
  const [actividadPrincipal, setActividadPrincipal] = useState("");
  const [monto, setMonto] = useState("");
  const [moneda, setMoneda] = useState<Moneda>("MXN");
  const [estatus, setEstatus] = useState("Abierta");
  const [comentarios, setComentarios] = useState("");
  const [actividadesTexto, setActividadesTexto] = useState("");

  async function cargarOrdenes() {
    const { data: ordenesData, error } = await supabase
      .from("ordenes_compra")
      .select("*")
      .order("fecha", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    const { data: actividadesData, error: actividadesError } =
      await supabase
        .from("ordenes_compra_actividades")
        .select("*");

    if (actividadesError) {
      alert(actividadesError.message);
      return;
    }

    const ordenesFormateadas: OrdenCompra[] = (ordenesData || []).map(
      (orden: any) => ({
        id: orden.id,
        fecha: orden.fecha,
        cliente: orden.cliente,
        planta: orden.planta || "",
        numeroOC: orden.numero_oc,
        actividadPrincipal: orden.actividad_principal,
        monto: Number(orden.monto) || 0,
        moneda: (orden.moneda || "MXN") as Moneda,
        estatus: orden.estatus || "Abierta",
        comentarios: orden.comentarios || "",
        actividades: (actividadesData || [])
          .filter(
            (actividad: any) =>
              actividad.orden_id === orden.id
          )
          .map((actividad: any) => ({
            id: actividad.id,
            descripcion: actividad.descripcion,
            completada: actividad.completada,
          })),
      })
    );

    setOrdenes(ordenesFormateadas);
  }

  useEffect(() => {
    cargarOrdenes();
  }, []);

  const ordenesFiltradas = useMemo(() => {
    return ordenes.filter((orden) => {
      const texto =
        `${orden.cliente} ${orden.planta} ${orden.numeroOC} ${orden.actividadPrincipal} ${estatusAutomatico(orden)}`.toLowerCase();

      const coincideBusqueda =
        texto.includes(busqueda.toLowerCase());

      const coincideEstatus =
        filtroEstatus === "Todos" ||
        estatusAutomatico(orden) === filtroEstatus;

      return coincideBusqueda && coincideEstatus;
    });
  }, [busqueda, ordenes, filtroEstatus]);

  function limpiarFormulario() {
    setFecha("");
    setCliente("");
    setPlanta("");
    setNumeroOC("");
    setActividadPrincipal("");
    setMonto("");
    setMoneda("MXN");
    setEstatus("Abierta");
    setComentarios("");
    setActividadesTexto("");
  }

  async function guardarOrden() {
    if (!cliente.trim() || !numeroOC.trim() || !actividadPrincipal.trim()) {
      alert("Cliente, número de OC y actividad principal son obligatorios.");
      return;
    }

    const datosOrden = {
      fecha: fecha || new Date().toISOString().slice(0, 10),
      cliente,
      planta: planta || null,
      numero_oc: numeroOC,
      actividad_principal: actividadPrincipal,
      monto: Number(monto) || 0,
      moneda,
      estatus,
      comentarios: comentarios || null,
    };

    if (ordenEditando) {
      const { error: errorActualizar } = await supabase
        .from("ordenes_compra")
        .update(datosOrden)
        .eq("id", ordenEditando.id);

      if (errorActualizar) {
        alert("Error al actualizar OC: " + errorActualizar.message);
        return;
      }

      await supabase
        .from("ordenes_compra_actividades")
        .delete()
        .eq("orden_id", ordenEditando.id);

      const actividades = actividadesTexto
        .split("\n")
        .map((linea) => linea.trim())
        .filter(Boolean)
        .map((descripcion) => ({
          orden_id: ordenEditando.id,
          descripcion,
          completada: false,
        }));

      if (actividades.length > 0) {
        const { error: errorActividades } = await supabase
          .from("ordenes_compra_actividades")
          .insert(actividades);

        if (errorActividades) {
          alert("La OC se actualizó, pero falló el checklist: " + errorActividades.message);
          return;
        }
      }
    } else {
      const { data: ordenGuardada, error: errorOrden } = await supabase
        .from("ordenes_compra")
        .insert(datosOrden)
        .select()
        .single();

      if (errorOrden) {
        alert("Error al guardar OC: " + errorOrden.message);
        return;
      }

      const actividades = actividadesTexto
        .split("\n")
        .map((linea) => linea.trim())
        .filter(Boolean)
        .map((descripcion) => ({
          orden_id: ordenGuardada.id,
          descripcion,
          completada: false,
        }));

      if (actividades.length > 0) {
        const { error: errorActividades } = await supabase
          .from("ordenes_compra_actividades")
          .insert(actividades);

        if (errorActividades) {
          alert("La OC se guardó, pero falló el checklist: " + errorActividades.message);
          return;
        }
      }
    }

    limpiarFormulario();
    setOrdenEditando(null);
    setOrdenSeleccionada(null);
    setModalAbierto(false);
    cargarOrdenes();
  }

  async function cambiarActividad(
    ordenId: string,
    actividadIndex: number
  ) {
    const orden = ordenes.find(
      (item) => item.id === ordenId
    );

    if (!orden) return;

    const actividad = orden.actividades[actividadIndex];

    if (!actividad) return;

    const nuevoValor = !actividad.completada;

    const { error } = await supabase
      .from("ordenes_compra_actividades")
      .update({
        completada: nuevoValor,
      })
      .eq("id", actividad.id);

    if (error) {
      alert(
        "Error al actualizar actividad: " +
          error.message
      );
      return;
    }

    setOrdenes((actuales) =>
      actuales.map((orden) => {
        if (orden.id !== ordenId) return orden;

        return {
          ...orden,
          actividades: orden.actividades.map(
            (actividad, index) =>
              index === actividadIndex
                ? {
                    ...actividad,
                    completada: nuevoValor,
                  }
                : actividad
          ),
        };
      })
    );

    setOrdenSeleccionada((actual) => {
      if (!actual || actual.id !== ordenId)
        return actual;

      return {
        ...actual,
        actividades: actual.actividades.map(
          (actividad, index) =>
            index === actividadIndex
              ? {
                  ...actividad,
                  completada: nuevoValor,
                }
              : actividad
        ),
      };
    });
  }

  async function eliminarOrden() {
    if (!ordenSeleccionada) return;

    const confirmar = confirm(
      `¿Eliminar la OC ${ordenSeleccionada.numeroOC}?`
    );

    if (!confirmar) return;

    await supabase
      .from("ordenes_compra_actividades")
      .delete()
      .eq("orden_id", ordenSeleccionada.id);

    const { error } = await supabase
      .from("ordenes_compra")
      .delete()
      .eq("id", ordenSeleccionada.id);

    if (error) {
      alert("Error al eliminar OC: " + error.message);
      return;
     }

     setOrdenSeleccionada(null);
    cargarOrdenes();
  }

  async function cancelarOrden() {
    if (!ordenSeleccionada) return;

    const confirmar = confirm(
      `¿Cancelar la OC ${ordenSeleccionada.numeroOC}?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("ordenes_compra")
      .update({ estatus: "Cancelada" })
      .eq("id", ordenSeleccionada.id);

    if (error) {
      alert("Error al cancelar OC: " + error.message);
      return;
    }

    setOrdenSeleccionada(null);
    cargarOrdenes();
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-stone-800">
            Operaciones
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Control de órdenes de compra, actividades y seguimiento de trabajos.
          </p>
        </div>

        <button
          onClick={() => setModalAbierto(true)}
          className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Nueva Orden
        </button>
      </div>

      <div className="mb-4 flex gap-3">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por cliente, planta, OC o actividad..."
          className="w-2/3 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 outline-none focus:border-slate-400"
        />

        <select
          value={filtroEstatus}
          onChange={(e) => setFiltroEstatus(e.target.value)}
          className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 outline-none focus:border-slate-400"
        >
          <option>Todos</option>
          <option>Abierta</option>
          <option>En proceso</option>
          <option>Terminada</option>
          <option>Cancelada</option>
        </select>
      </div>

      <div className="grid gap-4">
        {ordenesFiltradas.map((orden) => {
          const progreso = calcularProgreso(orden);

          return (
            <div
              key={orden.id}
              onClick={() => setOrdenSeleccionada(orden)}
              className="cursor-pointer rounded-xl border border-stone-200 bg-white p-5 shadow-sm hover:bg-stone-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-stone-800">
                      {orden.cliente}
                    </h2>

                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                      OC {orden.numeroOC}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-stone-500">
                    Planta: {orden.planta}
                  </p>

                  <p className="mt-1 text-sm text-stone-600">
                    {orden.actividadPrincipal}
                  </p>

                  <p className="mt-2 text-xs text-stone-400">
                    Fecha: {formatearFecha(orden.fecha)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-stone-700">
                    {formatearMoneda(orden.monto, orden.moneda)}
                  </p>

                  <span
                    className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      estatusAutomatico(orden) === "Abierta"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : estatusAutomatico(orden) === "En proceso"
                        ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                        : estatusAutomatico(orden) === "Terminada"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {estatusAutomatico(orden)}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs text-stone-500">
                  <span>Avance</span>
                  <span>{progreso}%</span>
                </div>

                <div className="h-2 rounded-full bg-stone-100">
                  <div
                    className="h-2 rounded-full bg-slate-500"
                    style={{ width: `${progreso}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {ordenSeleccionada && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
    <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-stone-800">
            {ordenSeleccionada.cliente}
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Planta: {ordenSeleccionada.planta} · OC {ordenSeleccionada.numeroOC}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setOrdenEditando(ordenSeleccionada);

              setFecha(ordenSeleccionada.fecha);
              setCliente(ordenSeleccionada.cliente);
              setPlanta(ordenSeleccionada.planta);
              setNumeroOC(ordenSeleccionada.numeroOC);
              setActividadPrincipal(
                ordenSeleccionada.actividadPrincipal
              );
              setMonto(String(ordenSeleccionada.monto));
              setMoneda(ordenSeleccionada.moneda);
              setComentarios(
                ordenSeleccionada.comentarios || ""
              );

              setActividadesTexto(
                ordenSeleccionada.actividades
                  .map((actividad) => actividad.descripcion)
                  .join("\n")
              );

              setModalAbierto(true);
            }}
            className="rounded-lg border border-stone-200 px-3 py-1 text-sm text-stone-600 hover:bg-blue-50 hover:text-blue-700"
          >
            Editar
          </button>

          <button
            onClick={cancelarOrden}
            className="rounded-lg border border-stone-200 px-3 py-1 text-sm text-stone-600 hover:bg-orange-50 hover:text-orange-700"
          >
            Cancelar
          </button>

          <button
            onClick={eliminarOrden}
            className="rounded-lg border border-stone-200 px-3 py-1 text-sm text-stone-600 hover:bg-red-50 hover:text-red-700"
          >
            Eliminar
          </button>

          <button
            onClick={() => setOrdenSeleccionada(null)}
            className="rounded-lg border border-stone-200 px-3 py-1 text-sm text-stone-600 hover:bg-stone-50"
          >
            Cerrar
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-lg bg-stone-50 p-4">
        <p className="text-sm font-medium text-stone-700">
          {ordenSeleccionada.actividadPrincipal}
        </p>
        <p className="mt-1 text-sm text-stone-500">
          {formatearMoneda(ordenSeleccionada.monto, ordenSeleccionada.moneda)} ·{" "}
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
              estatusAutomatico(ordenSeleccionada) === "Abierta"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : estatusAutomatico(ordenSeleccionada) === "En proceso"
                ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                : estatusAutomatico(ordenSeleccionada) === "Terminada"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {estatusAutomatico(ordenSeleccionada)}
          </span>
        </p>
      </div>

      <div className="mt-5">
        <p className="mb-3 text-sm font-medium text-stone-700">
          Actividades específicas
        </p>

        {ordenSeleccionada.actividades.length > 0 ? (
          <div className="grid gap-2">
            {ordenSeleccionada.actividades.map((actividad, index) => (
              <label
                key={`${ordenSeleccionada.id}-${index}`}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-stone-100 p-3 text-sm text-stone-700 hover:bg-stone-50"
              >
                <input
                  type="checkbox"
                  checked={actividad.completada}
                  onChange={() => cambiarActividad(ordenSeleccionada.id, index)}
                  className="h-4 w-4"
                />

                <span
                  className={
                    actividad.completada ? "text-stone-400 line-through" : ""
                  }
                >
                  {actividad.descripcion}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p className="rounded-lg bg-stone-50 p-3 text-sm text-stone-500">
            Esta orden no tiene actividades específicas capturadas.
          </p>
        )}
      </div>

      {ordenSeleccionada.comentarios && (
        <div className="mt-5">
          <p className="mb-2 text-sm font-medium text-stone-700">
            Comentarios
          </p>
          <p className="rounded-lg bg-stone-50 p-3 text-sm text-stone-600">
            {ordenSeleccionada.comentarios}
          </p>
        </div>
      )}
    </div>
  </div>
)}

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-stone-800">
              {ordenEditando ? "Editar Orden de Compra" : "Nueva Orden de Compra"}
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              La OC sirve para seguimiento operativo. No mueve inventario.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="rounded-lg border border-stone-200 px-4 py-2 text-sm"
              />

              <input
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="rounded-lg border border-stone-200 px-4 py-2 text-sm"
                placeholder="Cliente"
              />

              <input
                value={planta}
                onChange={(e) => setPlanta(e.target.value)}
                className="rounded-lg border border-stone-200 px-4 py-2 text-sm"
                placeholder="Planta"
              />

              <input
                value={numeroOC}
                onChange={(e) => setNumeroOC(e.target.value)}
                className="rounded-lg border border-stone-200 px-4 py-2 text-sm"
                placeholder="Número de OC"
              />

              <div className="flex gap-2">
                <input
                  type="number"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                  placeholder="Monto"
                />

                <select
                  value={moneda}
                  onChange={(e) => setMoneda(e.target.value as Moneda)}
                  className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700"
                >
                  <option value="MXN">MXN</option>
                  <option value="USD">USD</option>
                </select>
              </div>

              <input
                value={actividadPrincipal}
                onChange={(e) => setActividadPrincipal(e.target.value)}
                className="col-span-2 rounded-lg border border-stone-200 px-4 py-2 text-sm"
                placeholder="Actividad principal"
              />

              <select
                value={estatus}
                onChange={(e) => setEstatus(e.target.value)}
                className="col-span-2 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700"
              >
                <option>Abierta</option>
                <option>En proceso</option>
                <option>Terminada</option>
                <option>Reprogramada</option>
              </select>

              <textarea
                value={actividadesTexto}
                onChange={(e) => setActividadesTexto(e.target.value)}
                className="col-span-2 min-h-28 rounded-lg border border-stone-200 px-4 py-2 text-sm"
                placeholder={`Actividades específicas, una por línea:\nCortina #1 - Instalación\nRampa #2 - Instalación de topes\nSuministro de empaques`}
              />

              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                className="col-span-2 min-h-24 rounded-lg border border-stone-200 px-4 py-2 text-sm"
                placeholder="Comentarios / detalles específicos"
              />
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
                onClick={guardarOrden}
                className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                {ordenEditando ? "Guardar cambios" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}