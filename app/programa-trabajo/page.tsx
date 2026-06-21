"use client";

import { useMemo, useState } from "react";

type EstatusTrabajo = "En Proceso" | "Continuará" | "Terminado" | "Reprogramar";

type TrabajoDia = {
  id: number;
  fecha: string;
  rs: string;
  ordenCompra: string;
  cliente: string;
  descripcionServicio: string;
  estatus: EstatusTrabajo;
  tecnico: string;
  ayudantes: string;
  radio: string;
  vehiculo: string;
  notas: string;
  personalTaller: string;
  incidencias: string;
};

const trabajosIniciales: TrabajoDia[] = [
  {
    id: 1,
    fecha: "2026-06-15",
    rs: "Cometa",
    ordenCompra: "85166",
    cliente: "Sunrise",
    descripcionServicio: "Puerta #1: Reparación",
    estatus: "Continuará",
    tecnico: "Javier",
    ayudantes: "Jesús",
    radio: "142-7301",
    vehiculo: "Hilux Gris",
    notas: "",
    personalTaller: "Víctor, Alberto",
    incidencias: "Jose Luis faltó Sergio llegó 1 hora tarde",
  },
];

function badgeEstatus(estatus: EstatusTrabajo) {
  if (estatus === "En Proceso")
    return "bg-yellow-50 text-yellow-700 border-yellow-200";

  if (estatus === "Continuará")
    return "bg-blue-50 text-blue-700 border-blue-200";

  if (estatus === "Reprogramar")
    return "bg-red-50 text-red-700 border-red-200";

  if (estatus === "Terminado")
    return "bg-green-50 text-green-700 border-green-200";

  return "bg-stone-50 text-stone-700 border-stone-200";
}

export default function ProgramaTrabajoPage() {
  const [trabajos, setTrabajos] = useState<TrabajoDia[]>(trabajosIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [estatusFiltro, setEstatusFiltro] = useState("Todos");
  const [fechaFiltro, setFechaFiltro] = useState("2026-06-15");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [trabajoEditando, setTrabajoEditando] = useState<TrabajoDia | null>(
    null
  );

  const [fecha, setFecha] = useState("2026-06-15");
  const [rs, setRs] = useState("Cometa");
  const [ordenCompra, setOrdenCompra] = useState("");
  const [cliente, setCliente] = useState("");
  const [descripcionServicio, setDescripcionServicio] = useState("");
  const [estatus, setEstatus] = useState<EstatusTrabajo>("En Proceso");
  const [tecnico, setTecnico] = useState("");
  const [ayudantes, setAyudantes] = useState("");
  const [radio, setRadio] = useState("");
  const [vehiculo, setVehiculo] = useState("");
  const [notas, setNotas] = useState("");
  const [personalTaller, setPersonalTaller] = useState("");
  const [incidencias, setIncidencias] = useState("");

  const trabajosFiltrados = useMemo(() => {
    return trabajos.filter((trabajo) => {
      const texto =
        `${trabajo.ordenCompra} ${trabajo.cliente} ${trabajo.descripcionServicio} ${trabajo.tecnico} ${trabajo.ayudantes} ${trabajo.vehiculo} ${trabajo.personalTaller} ${trabajo.incidencias}`.toLowerCase();

      const coincideBusqueda = texto.includes(busqueda.toLowerCase());

      const coincideFecha =
        !fechaFiltro || trabajo.fecha === fechaFiltro;

      const coincideEstatus =
        estatusFiltro === "Todos" ||
        trabajo.estatus === estatusFiltro;

      return (
        coincideBusqueda &&
        coincideFecha &&
        coincideEstatus
      );
    });
  }, [trabajos, busqueda, fechaFiltro, estatusFiltro]);

  const personalTallerDelDia = trabajosFiltrados
    .map((trabajo) => trabajo.personalTaller.trim())
    .filter(Boolean)
    .join("\n");

  const incidenciasDelDia = trabajosFiltrados
    .map((trabajo) => trabajo.incidencias.trim())
    .filter(Boolean)
    .join("\n");

  function limpiarFormulario() {
    setFecha(fechaFiltro || "");
    setRs("Cometa");
    setOrdenCompra("");
    setCliente("");
    setDescripcionServicio("");
    setEstatus("En Proceso");
    setTecnico("");
    setAyudantes("");
    setRadio("");
    setVehiculo("");
    setNotas("");
    setPersonalTaller("");
    setIncidencias("");
    setTrabajoEditando(null);
  }

  function abrirNuevoTrabajo() {
    limpiarFormulario();
    setModalAbierto(true);
  }

  function abrirEditarTrabajo(trabajo: TrabajoDia) {
    setTrabajoEditando(trabajo);
    setFecha(trabajo.fecha);
    setRs(trabajo.rs);
    setOrdenCompra(trabajo.ordenCompra);
    setCliente(trabajo.cliente);
    setDescripcionServicio(trabajo.descripcionServicio);
    setEstatus(trabajo.estatus);
    setTecnico(trabajo.tecnico);
    setAyudantes(trabajo.ayudantes);
    setRadio(trabajo.radio);
    setVehiculo(trabajo.vehiculo);
    setNotas(trabajo.notas);
    setPersonalTaller(trabajo.personalTaller);
    setIncidencias(trabajo.incidencias);
    setModalAbierto(true);
  }

  function guardarTrabajo() {
    if (!fecha || !descripcionServicio.trim()) {
      alert("Fecha y descripción del servicio son obligatorios.");
      return;
    }

    const trabajoGuardado: TrabajoDia = {
      id: trabajoEditando ? trabajoEditando.id : Date.now(),
      fecha,
      rs,
      ordenCompra,
      cliente,
      descripcionServicio,
      estatus,
      tecnico,
      ayudantes,
      radio,
      vehiculo,
      notas,
      personalTaller,
      incidencias,
    };

    if (trabajoEditando) {
      setTrabajos((actuales) =>
        actuales.map((trabajo) =>
          trabajo.id === trabajoEditando.id ? trabajoGuardado : trabajo
        )
      );
    } else {
      setTrabajos((actuales) =>
        [...actuales, trabajoGuardado].sort((a, b) =>
          a.cliente.localeCompare(b.cliente, "es")
        )
      );
    }

    limpiarFormulario();
    setModalAbierto(false);
  }

  function eliminarTrabajo(trabajo: TrabajoDia) {
    const confirmar = confirm(
        `¿Eliminar esta actividad?\n\n${trabajo.cliente || "Sin cliente"}\n${
          trabajo.descripcionServicio
        }`
    );

    if (!confirmar) return;

    setTrabajos((actuales) =>
      actuales.filter((item) => item.id !== trabajo.id)
    );
  }

  function cambiarEstatusDirecto(id: number, nuevoEstatus: EstatusTrabajo) {
    setTrabajos((actuales) =>
      actuales.map((trabajo) =>
        trabajo.id === id ? { ...trabajo, estatus: nuevoEstatus } : trabajo
      )
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-stone-800">
            Programa de Trabajo
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Actividades diarias de cuadrillas, vehículos y servicios programados.
          </p>
        </div>

        <button
          onClick={abrirNuevoTrabajo}
          className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Agregar actividad
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por cliente, OC, servicio, técnico o vehículo..."
          className="w-full max-w-md rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 outline-none focus:border-slate-400"
        />

        <input
          type="date"
          value={fechaFiltro}
          onChange={(e) => setFechaFiltro(e.target.value)}
          className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700"
        />

        <select
          value={estatusFiltro}
          onChange={(e) => setEstatusFiltro(e.target.value)}
          className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700"
        >
          <option>Todos</option>
          <option>En Proceso</option>
          <option>Continuará</option>
          <option>Reprogramar</option>
          <option>Terminado</option>
        </select>

      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full table-auto border-collapse text-[10px] md:text-[11px]">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-left text-stone-500">
              <th className="px-1 py-1 font-medium md:px-2 md:py-1.5">R/S</th>
              <th className="px-1 py-1 font-medium md:px-2 md:py-1.5">OC</th>
              <th className="px-1 py-1 font-medium md:px-2 md:py-1.5">
                Cliente
              </th>
              <th className="w-[420px] px-1 py-1 font-medium md:px-2 md:py-1.5">
                Descripción
              </th>
              <th className="px-1 py-1 font-medium md:px-2 md:py-1.5">
                Estatus
              </th>
              <th className="px-1 py-1 font-medium md:px-2 md:py-1.5">
                Técnico
              </th>
              <th className="px-1 py-1 font-medium md:px-2 md:py-1.5">
                Ayudantes
              </th>
              <th className="px-1 py-1 font-medium md:px-2 md:py-1.5">
                Radio
              </th>
              <th className="px-1 py-1 font-medium md:px-2 md:py-1.5">
                Vehículo
              </th>
              <th className="px-1 py-1 font-medium md:px-2 md:py-1.5">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {trabajosFiltrados.map((trabajo) => (
              <tr
                key={trabajo.id}
                className="border-b border-stone-100 text-stone-700 last:border-0 hover:bg-stone-50"
              >
                <td className="whitespace-nowrap px-1 py-1 md:px-2 md:py-1.5">
                  {trabajo.rs}
                </td>

                <td className="whitespace-nowrap px-1 py-1 font-medium text-stone-900 md:px-2 md:py-1.5">
                  {trabajo.ordenCompra}
                </td>

                <td className="whitespace-nowrap px-1 py-1 md:px-2 md:py-1.5">
                  {trabajo.cliente}
                </td>

                <td className="px-1 py-1 md:px-2 md:py-1.5">
                  <div className="max-w-[420px] whitespace-normal break-words leading-tight">
                    {trabajo.descripcionServicio}
                  </div>
                </td>

                <td className="whitespace-nowrap px-1 py-1 md:px-2 md:py-1.5">
                  <select
                    value={trabajo.estatus}
                    onChange={(e) =>
                      cambiarEstatusDirecto(
                        trabajo.id,
                        e.target.value as EstatusTrabajo
                      )
                    }
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium outline-none ${badgeEstatus(
                      trabajo.estatus
                    )}`}
                  >
                    <option>En Proceso</option>
                    <option>Continuará</option>
                    <option>Terminado</option>
                    <option>Reprogramar</option>
                  </select>
                </td>

                <td className="whitespace-nowrap px-1 py-1 md:px-2 md:py-1.5">
                  {trabajo.tecnico}
                </td>

                <td className="whitespace-nowrap px-1 py-1 md:px-2 md:py-1.5">
                  {trabajo.ayudantes}
                </td>

                <td className="whitespace-nowrap px-1 py-1 md:px-2 md:py-1.5">
                  {trabajo.radio}
                </td>

                <td className="whitespace-nowrap px-1 py-1 md:px-2 md:py-1.5">
                  {trabajo.vehiculo}
                </td>

                <td className="whitespace-nowrap px-1 py-1 md:px-2 md:py-1.5">
                  <div className="flex gap-1">
                    <button
                      onClick={() => abrirEditarTrabajo(trabajo)}
                      className="rounded border border-stone-200 px-2 py-1 text-[10px] hover:bg-stone-50"
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() => eliminarTrabajo(trabajo)}
                      className="rounded border border-red-200 px-2 py-1 text-[10px] text-red-600 hover:bg-red-50"
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {personalTallerDelDia && (
              <tr className="border-b border-stone-100 text-stone-600 last:border-0 hover:bg-stone-50">
                <td className="px-1 py-1 md:px-2 md:py-1.5" />
                <td className="px-1 py-1 md:px-2 md:py-1.5" />
                <td className="px-1 py-1 md:px-2 md:py-1.5" />
                <td className="px-1 py-1 md:px-2 md:py-1.5">
                  <div className="max-w-[420px] whitespace-pre-line break-words leading-tight text-stone-500">
                    Taller: {personalTallerDelDia}
                  </div>
                </td>
                <td colSpan={6} />
              </tr>
            )}

            {incidenciasDelDia && (
              <tr className="border-b border-stone-100 last:border-0 hover:bg-red-50/40">
                <td className="px-1 py-1 md:px-2 md:py-1.5" />
                <td className="px-1 py-1 md:px-2 md:py-1.5" />
                <td className="px-1 py-1 md:px-2 md:py-1.5" />
                <td className="px-1 py-1 md:px-2 md:py-1.5">
                  <div className="max-w-[420px] whitespace-pre-line break-words leading-tight font-medium text-red-600">
                    {incidenciasDelDia}
                  </div>
                </td>
                <td colSpan={6} />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[80vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-stone-800">
              {trabajoEditando ? "Editar actividad" : "Agregar actividad"}
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              {trabajoEditando
                ? "Modifica la actividad seleccionada."
                : "Captura lo que se hará en el día seleccionado."}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
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
                  R/S
                </label>
                <input
                  value={rs}
                  onChange={(e) => setRs(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                  placeholder="Cometa"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Orden de compra
                </label>
                <input
                  value={ordenCompra}
                  onChange={(e) => setOrdenCompra(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                  placeholder="Ej. MX2525249"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Cliente
                </label>
                <input
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                  placeholder="Ej. Lear"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Descripción del servicio
                </label>
                <input
                  value={descripcionServicio}
                  onChange={(e) => setDescripcionServicio(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                  placeholder="Ej. Monarca: Retorque cortinas #2 a #8"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Estatus
                </label>
                <select
                  value={estatus}
                  onChange={(e) =>
                    setEstatus(e.target.value as EstatusTrabajo)
                  }
                  className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700"
                >
                  <option>En Proceso</option>
                  <option>Continuará</option>
                  <option>Terminado</option>
                  <option>Reprogramar</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Vehículo
                </label>
                <input
                  value={vehiculo}
                  onChange={(e) => setVehiculo(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                  placeholder="Ej. Hilux Gris"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Técnico
                </label>
                <input
                  value={tecnico}
                  onChange={(e) => setTecnico(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                  placeholder="Ej. Javier"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Ayudantes
                </label>
                <input
                  value={ayudantes}
                  onChange={(e) => setAyudantes(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                  placeholder="Ej. Jesús, Kevin, Luis"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Radio
                </label>
                <input
                  value={radio}
                  onChange={(e) => setRadio(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                  placeholder="Ej. 142-7301"
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
                  placeholder="Observaciones adicionales"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Personal en Taller
                </label>
                <textarea
                  value={personalTaller}
                  onChange={(e) => setPersonalTaller(e.target.value)}
                  className="min-h-20 w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                  placeholder="Ej. Victor, Alberto"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Incidencias del Día
                </label>
                <textarea
                  value={incidencias}
                  onChange={(e) => setIncidencias(e.target.value)}
                  className="min-h-20 w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                  placeholder="Ej. Sergio faltó&#10;Mario llegó 2 hrs tarde"
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
                onClick={guardarTrabajo}
                className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                {trabajoEditando ? "Guardar cambios" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}