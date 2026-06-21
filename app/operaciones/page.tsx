"use client";

import { useMemo, useState } from "react";

type Moneda = "MXN" | "USD";

type OrdenCompra = {
  id: number;
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
    descripcion: string;
    completada: boolean;
  }[];
};

const ordenesIniciales: OrdenCompra[] = [
  {
    id: 1,
    fecha: "2026-07-12",
    cliente: "Lear",
    planta: "Monarca",
    numeroOC: "MX928388",
    actividadPrincipal: "Reparación de Cortina Enrollable",
    monto: 123456,
    moneda: "MXN",
    estatus: "En proceso",
    comentarios: "Reemplazo de escuadra y 7 duelas.",
    actividades: [
      { descripcion: "Cortina #1 - Reemplazo de escuadra", completada: true },
      { descripcion: "Cortina #1 - Reemplazo de 7 duelas", completada: true },
      { descripcion: "Ajuste final de cortina", completada: false },
    ],
  },
];

function calcularProgreso(orden: OrdenCompra) {
  if (orden.actividades.length === 0) return 0;
  const terminadas = orden.actividades.filter((a) => a.completada).length;
  return Math.round((terminadas / orden.actividades.length) * 100);
}

function formatearMoneda(monto: number, moneda: Moneda) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: moneda,
  }).format(monto);
}

export default function OperacionesPage() {
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>(ordenesIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] =
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

  const ordenesFiltradas = useMemo(() => {
    return ordenes.filter((orden) => {
      const texto =
        `${orden.cliente} ${orden.planta} ${orden.numeroOC} ${orden.actividadPrincipal} ${orden.estatus}`.toLowerCase();

      return texto.includes(busqueda.toLowerCase());
    });
  }, [busqueda, ordenes]);

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

  function guardarOrden() {
    if (!cliente.trim() || !numeroOC.trim() || !actividadPrincipal.trim()) {
      alert("Cliente, número de OC y actividad principal son obligatorios.");
      return;
    }

    const actividades = actividadesTexto
      .split("\n")
      .map((linea) => linea.trim())
      .filter(Boolean)
      .map((descripcion) => ({
        descripcion,
        completada: false,
      }));

    const nuevaOrden: OrdenCompra = {
      id: Date.now(),
      fecha: fecha || new Date().toISOString().slice(0, 10),
      cliente,
      planta: planta || "Sin especificar",
      numeroOC,
      actividadPrincipal,
      monto: Number(monto) || 0,
      moneda,
      estatus,
      comentarios,
      actividades,
    };

    setOrdenes((actuales) =>
      [...actuales, nuevaOrden].sort((a, b) => a.fecha.localeCompare(b.fecha))
    );

    limpiarFormulario();
    setModalAbierto(false);
  }

  function cambiarActividad(ordenId: number, actividadIndex: number) {
    setOrdenes((actuales) =>
      actuales.map((orden) => {
        if (orden.id !== ordenId) return orden;

        return {
          ...orden,
          actividades: orden.actividades.map((actividad, index) =>
            index === actividadIndex
              ? { ...actividad, completada: !actividad.completada }
              : actividad
          ),
        };
      })
    );

    setOrdenSeleccionada((actual) => {
      if (!actual || actual.id !== ordenId) return actual;

      return {
        ...actual,
        actividades: actual.actividades.map((actividad, index) =>
          index === actividadIndex
            ? { ...actividad, completada: !actividad.completada }
            : actividad
        ),
      };
    });
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

        <select className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 outline-none focus:border-slate-400">
          <option>Todos los estatus</option>
          <option>Abierta</option>
          <option>En proceso</option>
          <option>Terminada</option>
          <option>Reprogramada</option>
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
                    Fecha: {orden.fecha}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-stone-700">
                    {formatearMoneda(orden.monto, orden.moneda)}
                  </p>

                  <p className="mt-1 text-xs text-stone-500">
                    {orden.estatus}
                  </p>
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

        <button
          onClick={() => setOrdenSeleccionada(null)}
          className="rounded-lg border border-stone-200 px-3 py-1 text-sm text-stone-600 hover:bg-stone-50"
        >
          Cerrar
        </button>
      </div>

      <div className="mt-5 rounded-lg bg-stone-50 p-4">
        <p className="text-sm font-medium text-stone-700">
          {ordenSeleccionada.actividadPrincipal}
        </p>
        <p className="mt-1 text-sm text-stone-500">
          {formatearMoneda(ordenSeleccionada.monto, ordenSeleccionada.moneda)} ·{" "}
          {ordenSeleccionada.estatus}
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
              Nueva Orden de Compra
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
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}