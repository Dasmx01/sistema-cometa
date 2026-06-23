"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Activo = {
  id: string;
  estado: string;
  codigo_activo: string | null;
  nombre: string;
};

type Mantenimiento = {
  id: string;
  activo_id: string;
  proxima_fecha: string | null;
  tipo: string;
};

type Trabajo = {
  id: string;
  fecha: string;
  orden_compra: string | null;
  cliente: string | null;
};

type OrdenCompra = {
  id: string;
  estatus: string | null;
};

export default function DashboardPage() {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
  const [ordenesCompra, setOrdenesCompra] = useState<OrdenCompra[]>([]);
  const [cargando, setCargando] = useState(true);

  const fechaActual = new Date();
  const year = fechaActual.getFullYear();
  const month = fechaActual.getMonth();

  async function cargarDatos() {
    setCargando(true);

    const { data: activosData, error: activosError } = await supabase
      .from("activos_fabricacion")
      .select("id, estado, codigo_activo, nombre");

    if (activosError) {
      alert("Error al cargar activos: " + activosError.message);
      setCargando(false);
      return;
    }

    const { data: mantenimientosData, error: mantenimientosError } =
      await supabase
        .from("mantenimientos")
        .select("id, activo_id, proxima_fecha, tipo");

    if (mantenimientosError) {
      alert("Error al cargar mantenimientos: " + mantenimientosError.message);
      setCargando(false);
      return;
    }

    const { data: trabajosData, error: trabajosError } = await supabase
      .from("programa_trabajo")
      .select("id, fecha, orden_compra, cliente");

    if (trabajosError) {
      alert("Error al cargar programa de trabajo: " + trabajosError.message);
      setCargando(false);
      return;
    }

    const { data: ordenesData, error: ordenesError } = await supabase
      .from("ordenes_compra")
      .select("id, estatus");

    if (ordenesError) {
      alert("Error al cargar órdenes de compra: " + ordenesError.message);
      setCargando(false);
      return;
    }

    setActivos((activosData || []) as Activo[]);
    setMantenimientos((mantenimientosData || []) as Mantenimiento[]);
    setTrabajos((trabajosData || []) as Trabajo[]);
    setOrdenesCompra((ordenesData || []) as OrdenCompra[]);
    setCargando(false);
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const en30Dias = new Date(hoy);
  en30Dias.setDate(en30Dias.getDate() + 30);

  const mantenimientosConFecha = mantenimientos.filter(
    (mantenimiento) => mantenimiento.proxima_fecha
  );

  const proximos30 = mantenimientosConFecha.filter((mantenimiento) => {
    const fecha = new Date(mantenimiento.proxima_fecha!);
    fecha.setHours(0, 0, 0, 0);
    return fecha >= hoy && fecha <= en30Dias;
  });

  const trabajosHoy = trabajos.filter((trabajo) => {
    const fecha = new Date(trabajo.fecha);
    fecha.setHours(0, 0, 0, 0);
    return fecha.getTime() === hoy.getTime();
  });

  const ocAbiertas = ordenesCompra.filter(
    (orden) =>
      orden.estatus === "Abierta" ||
      orden.estatus === "En proceso"
  );

  const ocTerminadas = ordenesCompra.filter(
    (orden) => orden.estatus === "Terminada"
  );

  const tarjetas = [
    {
      titulo: "Materiales bajos",
      valor: "0",
      href: "/material",
    },
    {
      titulo: "Actividades de hoy",
      valor: String(trabajosHoy.length),
      href: "/programa-trabajo",
    },
    {
      titulo: "OC abiertas",
      valor: String(ocAbiertas.length),
      href: "/operaciones",
    },
    {
      titulo: "OC terminadas",
      valor: String(ocTerminadas.length),
      href: "/operaciones",
    },
    {
      titulo: "Mantenimientos próximos",
      valor: String(proximos30.length),
      href: "/activos/mantenimientos",
    },
  ];

  const nombreMes = new Date(year, month).toLocaleDateString("es-MX", {
    month: "long",
  });

  const diasDelMes = new Date(year, month + 1, 0).getDate();
  const primerDia = new Date(year, month, 1).getDay();
  const espaciosAntes = primerDia === 0 ? 6 : primerDia - 1;

  const celdas = [
    ...Array.from({ length: espaciosAntes }, () => null),
    ...Array.from({ length: diasDelMes }, (_, i) => i + 1),
  ];

  function obtenerActivo(activoId: string) {
    return activos.find((activo) => activo.id === activoId);
  }

  function mantenimientosDelDia(dia: number) {
    return mantenimientosConFecha.filter((mantenimiento) => {
      const fecha = new Date(mantenimiento.proxima_fecha!);

      return (
        fecha.getFullYear() === year &&
        fecha.getMonth() === month &&
        fecha.getDate() === dia
      );
    });
  }

  function trabajosDelDia(dia: number) {
    return trabajos.filter((trabajo) => {
      const fecha = new Date(trabajo.fecha);

      return (
        fecha.getFullYear() === year &&
        fecha.getMonth() === month &&
        fecha.getDate() === dia
      );
    });
  }

  function textoTrabajo(trabajo: Trabajo) {
    if (trabajo.orden_compra && trabajo.cliente) {
      return `${trabajo.orden_compra} - ${trabajo.cliente}`;
    }

    if (trabajo.orden_compra) {
      return trabajo.orden_compra;
    }

    return trabajo.cliente || "Actividad";
  }

  return (
    <div className="h-full">
      <div className="mb-5">
        <h1 className="text-3xl font-semibold text-stone-800">Info Panel</h1>

        <p className="mt-1 text-sm text-stone-500">
          Resumen general de operaciones.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(140px,1fr))]">
          {tarjetas.map((tarjeta) => (
            <Link
              key={tarjeta.titulo}
              href={tarjeta.href}
              className="rounded-xl border border-stone-200 bg-white px-3 py-2 shadow-sm transition hover:border-stone-400 hover:bg-stone-50"
            >
              <p className="text-xs text-stone-500">{tarjeta.titulo}</p>

              <p className="mt-0.5 text-xl font-semibold text-stone-800">
                {cargando ? "..." : tarjeta.valor}
              </p>
            </Link>
          ))}
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="capitalize text-xl font-semibold text-stone-800">
              {nombreMes}
            </h2>

            <span className="text-xs text-stone-500">
              Calendario Operativo
            </span>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-2 text-center text-xs font-medium text-stone-500">
            <div>Lun</div>
            <div>Mar</div>
            <div>Mié</div>
            <div>Jue</div>
            <div>Vie</div>
            <div>Sáb</div>
            <div>Dom</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {celdas.map((dia, index) => {
              if (dia === null) {
                return <div key={`empty-${index}`} />;
              }

              const mantenimientosEventos = mantenimientosDelDia(dia);
              const trabajosEventos = trabajosDelDia(dia);

              const totalEventos =
                mantenimientosEventos.length + trabajosEventos.length;

              return (
                <div key={dia} className="group relative">
                  <button className="min-h-[82px] w-full overflow-hidden rounded-lg border border-stone-200 px-1.5 pt-0.5 pb-2 text-left transition hover:border-stone-400 hover:bg-stone-50">
                    <div className="flex items-start justify-start">
                      <span className="text-sm font-medium leading-none text-stone-700">
                        {dia}
                      </span>
                    </div>

                    <div className="mt-2 space-y-1 text-[10px] leading-tight text-stone-500">
                      {mantenimientosEventos.slice(0, 2).map((evento) => {
                        const activo = obtenerActivo(evento.activo_id);

                        return (
                          <div key={evento.id} className="truncate">
                            {activo?.codigo_activo || ""} {evento.tipo}
                          </div>
                        );
                      })}

                      {trabajosEventos
                        .slice(0, Math.max(0, 2 - mantenimientosEventos.length))
                        .map((trabajo) => (
                          <div key={trabajo.id} className="truncate">
                            {textoTrabajo(trabajo)}
                          </div>
                        ))}

                      {totalEventos > 2 && (
                        <div className="truncate text-stone-400">
                          +{totalEventos - 2} más
                        </div>
                      )}
                    </div>
                  </button>

                  {totalEventos > 0 && (
                    <div className="absolute left-0 top-full z-50 mt-2 hidden w-64 rounded-xl border border-stone-200 bg-white p-3 text-left shadow-lg group-hover:block">
                      <p className="mb-2 text-xs font-semibold text-stone-700">
                        Día {dia} · {totalEventos} actividad{totalEventos === 1 ? "" : "es"}
                      </p>

                      {trabajosEventos.length > 0 && (
                       <div className="mb-3">
                          <Link
                            href="/programa-trabajo"
                            className="mb-1 block text-[11px] font-medium text-blue-600 hover:underline"
                          >
                            Programa de trabajo →
                          </Link>

                          <div className="space-y-1">
                            {trabajosEventos.slice(0, 6).map((trabajo) => (
                              <div
                                key={trabajo.id}
                                className="rounded-lg bg-stone-50 px-2 py-1 text-[11px] text-stone-700"
                              >
                                {textoTrabajo(trabajo)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {mantenimientosEventos.length > 0 && (
                        <div>
                          <Link
                            href="/activos/mantenimientos"
                            className="mb-1 block text-[11px] font-medium text-blue-600 hover:underline"
                          >
                            Mantenimientos →
                          </Link>

                          <div className="space-y-1">
                            {mantenimientosEventos.slice(0, 6).map((evento) => {
                              const activo = obtenerActivo(evento.activo_id);

                              return (
                                <div
                                  key={evento.id}
                                  className="rounded-lg bg-stone-50 px-2 py-1 text-[11px] text-stone-700"
                                >
                                  {activo?.codigo_activo || "Activo"} {evento.tipo}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {totalEventos > 6 && (
                        <p className="mt-2 text-[11px] text-stone-400">
                          +{totalEventos - 6} más
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}