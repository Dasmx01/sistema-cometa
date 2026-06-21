"use client";

import { useMemo, useState } from "react";

type Material = {
  codigo: string;
  descripcion: string;
  fabricante: string;
  categoria: string;
  unidad: string;
  existencia: number;
  stockMinimo: number;
  medidaTecnica: number;
  unidadTecnica: string;
  ubicacion: string;
  costo: string;
  proveedor: string;
};

const categorias = [
  "Acero",
  "Resortes",
  "Herrajes",
  "Equipo de Andén",
  "Consumibles",
  "Puertas",
  "Cortinas",
  "Eléctrico",
  "Seguridad",
  "Otros",
];

const ubicaciones = [
  "Rack A1",
  "Rack A2",
  "Rack A3",
  "Rack B1",
  "Rack B2",
  "Rack B3",
  "Estante C1",
  "Estante C2",
  "Producción",
  "Patio",
  "Cuadrillas",
];

const materialesIniciales: Material[] = [
  {
    codigo: "TUB-0001",
    descripcion: 'Tubo 4" x 6 m',
    fabricante: "Genérico",
    categoria: "Acero",
    unidad: "Pieza",
    existencia: 15,
    stockMinimo: 5,
    medidaTecnica: 6,
    unidadTecnica: "Metro",
    ubicacion: "Rack A1",
    costo: "$1,250",
    proveedor: "Proveedor pendiente",
  },
  {
    codigo: "COL-0001",
    descripcion: 'Cold Rolled 1" x 3 m',
    fabricante: "Genérico",
    categoria: "Acero",
    unidad: "Pieza",
    existencia: 8,
    stockMinimo: 3,
    medidaTecnica: 3,
    unidadTecnica: "Metro",
    ubicacion: "Rack A2",
    costo: "$680",
    proveedor: "Proveedor pendiente",
  },
  {
    codigo: "RES-0001",
    descripcion: "Resorte para cortina enrollable",
    fabricante: "Genérico",
    categoria: "Resortes",
    unidad: "Pieza",
    existencia: 32,
    stockMinimo: 10,
    medidaTecnica: 0,
    unidadTecnica: "",
    ubicacion: "Estante C1",
    costo: "$420",
    proveedor: "Proveedor pendiente",
  },
];

function obtenerPrefijo(descripcion: string) {
  const texto = descripcion.trim().toUpperCase();

  if (texto.startsWith("TUBO")) return "TUB";
  if (texto.startsWith("COLD")) return "COL";
  if (texto.startsWith("RESORTE")) return "RES";
  if (texto.startsWith("BISAGRA")) return "BIS";
  if (texto.startsWith("FLECHA")) return "FLE";
  if (texto.startsWith("DUELA")) return "DUE";
  if (texto.startsWith("ESCUADRA")) return "ESC";
  if (texto.startsWith("CANAL")) return "CAN";
  if (texto.startsWith("ANCLA")) return "ANC";
  if (texto.startsWith("AMORTIGUADOR")) return "AMO";
  if (texto.startsWith("RODILLO")) return "ROD";
  if (texto.startsWith("TOPE")) return "TOP";

  return texto
    .replace(/[^A-Z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 1)
    .join("")
    .substring(0, 3)
    .padEnd(3, "X");
}

function generarCodigo(descripcion: string, materiales: Material[]) {
  const prefijo = obtenerPrefijo(descripcion);

  const numeros = materiales
    .filter((material) => material.codigo.startsWith(`${prefijo}-`))
    .map((material) => Number(material.codigo.split("-")[1]))
    .filter((numero) => !Number.isNaN(numero));

  const siguiente = numeros.length > 0 ? Math.max(...numeros) + 1 : 1;

  return `${prefijo}-${String(siguiente).padStart(4, "0")}`;
}

function ordenarMateriales(lista: Material[]) {
  return [...lista].sort((a, b) =>
    a.descripcion.localeCompare(b.descripcion, "es")
  );
}

export default function MaterialPage() {
  const [materiales, setMateriales] = useState<Material[]>(
    ordenarMateriales(materialesIniciales)
  );

  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [materialEditando, setMaterialEditando] = useState<Material | null>(
    null
  );
  const [materialSeleccionado, setMaterialSeleccionado] =
    useState<Material | null>(null);

  const [descripcion, setDescripcion] = useState("");
  const [fabricante, setFabricante] = useState("");
  const [categoria, setCategoria] = useState("");
  const [unidad, setUnidad] = useState("Pieza");
  const [existencia, setExistencia] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");
  const [medidaTecnica, setMedidaTecnica] = useState("");
  const [unidadTecnica, setUnidadTecnica] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [costo, setCosto] = useState("");
  const [proveedor, setProveedor] = useState("");

  const materialesFiltrados = useMemo(() => {
    return materiales.filter((material) => {
      const texto = `${material.codigo} ${material.descripcion} ${material.fabricante} ${material.categoria}`.toLowerCase();
      const coincideBusqueda = texto.includes(busqueda.toLowerCase());
      const coincideCategoria =
        !categoriaFiltro || material.categoria === categoriaFiltro;

      return coincideBusqueda && coincideCategoria;
    });
  }, [busqueda, categoriaFiltro, materiales]);

  function limpiarFormulario() {
    setDescripcion("");
    setFabricante("");
    setCategoria("");
    setUnidad("Pieza");
    setExistencia("");
    setStockMinimo("");
    setMedidaTecnica("");
    setUnidadTecnica("");
    setUbicacion("");
    setCosto("");
    setProveedor("");
    setMaterialEditando(null);
  }

  function abrirNuevoMaterial() {
    limpiarFormulario();
    setModalAbierto(true);
  }

  function abrirEditarMaterial(material: Material) {
    setMaterialEditando(material);
    setDescripcion(material.descripcion);
    setFabricante(material.fabricante);
    setCategoria(material.categoria);
    setUnidad(material.unidad);
    setExistencia(String(material.existencia));
    setStockMinimo(String(material.stockMinimo));
    setMedidaTecnica(
      material.medidaTecnica > 0 ? String(material.medidaTecnica) : ""
    );
    setUnidadTecnica(material.unidadTecnica);
    setUbicacion(material.ubicacion);
    setCosto(material.costo);
    setProveedor(material.proveedor);
    setModalAbierto(true);
  }

  function guardarMaterial() {
    if (!descripcion.trim()) {
      alert("La descripción es obligatoria.");
      return;
    }

    if (!categoria) {
      alert("Selecciona una categoría.");
      return;
    }

    if (!ubicacion) {
      alert("Selecciona una ubicación.");
      return;
    }

    if (materialEditando) {
      const materialActualizado: Material = {
        ...materialEditando,
        descripcion,
        fabricante: fabricante || "Sin fabricante",
        categoria,
        unidad,
        existencia: Number(existencia) || 0,
        stockMinimo: Number(stockMinimo) || 0,
        medidaTecnica: Number(medidaTecnica) || 0,
        unidadTecnica: unidadTecnica || "",
        ubicacion,
        costo: costo || "$0",
        proveedor: proveedor || "Sin proveedor",
      };

      setMateriales((actuales) =>
        ordenarMateriales(
          actuales.map((material) =>
            material.codigo === materialEditando.codigo
              ? materialActualizado
              : material
          )
        )
      );
    } else {
      const nuevoMaterial: Material = {
        codigo: generarCodigo(descripcion, materiales),
        descripcion,
        fabricante: fabricante || "Sin fabricante",
        categoria,
        unidad,
        existencia: Number(existencia) || 0,
        stockMinimo: Number(stockMinimo) || 0,
        medidaTecnica: Number(medidaTecnica) || 0,
        unidadTecnica: unidadTecnica || "",
        ubicacion,
        costo: costo || "$0",
        proveedor: proveedor || "Sin proveedor",
      };

      setMateriales((actuales) =>
        ordenarMateriales([...actuales, nuevoMaterial])
      );
    }

    limpiarFormulario();
    setModalAbierto(false);
  }

  function eliminarMaterial(material: Material) {
    const confirmar = confirm(
      `¿Eliminar material?\n\n${material.codigo}\n${material.descripcion}`
    );

    if (!confirmar) return;

    setMateriales((actuales) =>
      actuales.filter((item) => item.codigo !== material.codigo)
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-stone-800">Material</h1>
          <p className="mt-1 text-sm text-stone-500">
            Lista general de materiales, piezas, refacciones y productos.
          </p>
        </div>

        <button
          onClick={abrirNuevoMaterial}
          className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Nuevo Material
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar material..."
          className="w-full max-w-md rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 outline-none focus:border-slate-400"
        />

        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 outline-none focus:border-slate-400"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="min-w-[1200px] w-full border-collapse text-[10px] md:text-[11px]">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-left text-stone-500">
              <th className="px-3 py-2 font-medium md:px-4 md:py-3">Código</th>
              <th className="px-3 py-2 font-medium md:px-4 md:py-3">
                Descripción
              </th>
              <th className="px-3 py-2 font-medium md:px-4 md:py-3">
                Fabricante
              </th>
              <th className="px-3 py-2 font-medium md:px-4 md:py-3">
                Categoría
              </th>
              <th className="px-3 py-2 font-medium md:px-4 md:py-3">
                Existencia
              </th>
              <th className="px-3 py-2 font-medium md:px-4 md:py-3">
                Stock mínimo
              </th>
              <th className="px-3 py-2 font-medium md:px-4 md:py-3">
                Medida técnica
              </th>
              <th className="px-3 py-2 font-medium md:px-4 md:py-3">
                Ubicación
              </th>
              <th className="px-3 py-2 font-medium md:px-4 md:py-3">Costo</th>
              <th className="px-3 py-2 font-medium md:px-4 md:py-3">
                Proveedor
              </th>
              <th className="px-3 py-2 font-medium md:px-4 md:py-3">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {materialesFiltrados.map((material) => {
              const bajoStock = material.existencia <= material.stockMinimo;

              return (
                <tr
                  key={material.codigo}
                  onClick={() => setMaterialSeleccionado(material)}
                  className={`border-b border-stone-100 text-stone-700 last:border-0 ${
                    bajoStock ? "bg-red-50/60 hover:bg-red-50" : "hover:bg-stone-50"
                  }`}
                >
                <td className="px-3 py-2 font-medium text-stone-900 md:px-4 md:py-3">
                  <div className="flex items-center gap-2">
                    {bajoStock && (
                      <span
                        className="h-2 w-2 rounded-full bg-red-500"
                        title="Bajo stock"
                      />
                    )}

                    <span>{material.codigo}</span>
                  </div>
                </td>
                <td className="px-1 py-1 md:px-2 md:py-1.5">
                  {material.descripcion}
                </td>
                <td className="px-1 py-1 md:px-2 md:py-1.5">
                  {material.fabricante}
                </td>
                <td className="px-1 py-1 md:px-2 md:py-1.5">
                  {material.categoria}
                </td>
                <td className="px-1 py-1 md:px-2 md:py-1.5">
                  {material.existencia} {material.unidad}
                </td>
                <td className="px-1 py-1 md:px-2 md:py-1.5">
                  {material.stockMinimo} {material.unidad}
                </td>
                <td className="px-1 py-1 md:px-2 md:py-1.5">
                  {material.medidaTecnica > 0
                    ? `${material.medidaTecnica} ${material.unidadTecnica}`
                    : "N/A"}
                </td>
                <td className="px-1 py-1 md:px-2 md:py-1.5">
                  {material.ubicacion}
                </td>
                <td className="px-1 py-1 md:px-2 md:py-1.5">
                  {material.costo}
                </td>
                <td className="px-1 py-1 md:px-2 md:py-1.5">
                  {material.proveedor}
                </td>
                <td className="px-1 py-1 md:px-2 md:py-1.5">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        abrirEditarMaterial(material);
                      }}
                      className="rounded border border-stone-200 px-2 py-1 text-xs hover:bg-stone-50"
                    >
                      ✏️
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminarMaterial(material);
                      }}
                      className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {materialSeleccionado && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
    <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-stone-800">
            {materialSeleccionado.descripcion}
          </h2>

          <p className="mt-1 text-sm text-stone-500">
            {materialSeleccionado.codigo}
          </p>
        </div>

        <button
          onClick={() => setMaterialSeleccionado(null)}
          className="rounded-lg border border-stone-200 px-3 py-1 text-sm hover:bg-stone-50"
        >
          Cerrar
        </button>
      </div>

      <div className="mt-6 grid gap-3">
        <div>
          <p className="text-xs text-stone-500">Fabricante</p>
          <p>{materialSeleccionado.fabricante}</p>
        </div>

        <div>
          <p className="text-xs text-stone-500">Categoría</p>
          <p>{materialSeleccionado.categoria}</p>
        </div>

        <div>
          <p className="text-xs text-stone-500">Existencia</p>
          <p>
            {materialSeleccionado.existencia}{" "}
            {materialSeleccionado.unidad}
          </p>
        </div>

        <div>
          <p className="text-xs text-stone-500">Stock mínimo</p>
          <p>
            {materialSeleccionado.stockMinimo}{" "}
            {materialSeleccionado.unidad}
          </p>
        </div>

        <div>
          <p className="text-xs text-stone-500">Ubicación</p>
          <p>{materialSeleccionado.ubicacion}</p>
        </div>

        <div>
          <p className="text-xs text-stone-500">Costo</p>
          <p>{materialSeleccionado.costo}</p>
        </div>

        <div>
          <p className="text-xs text-stone-500">Proveedor</p>
          <p>{materialSeleccionado.proveedor}</p>
        </div>
      </div>
    </div>
  </div>
)}

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-stone-800">
              {materialEditando ? "Editar Material" : "Nuevo Material"}
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              {materialEditando
                ? `Editando ${materialEditando.codigo}`
                : "El código se generará automáticamente."}
            </p>

            <div className="mt-6 grid gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Descripción
                </label>

                <input
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                  placeholder='Ej. Tubo 4" x 6 m'
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Fabricante
                </label>

                <input
                  value={fabricante}
                  onChange={(e) => setFabricante(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                  placeholder="Ej. Clopay"
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
                  <option value="">Seleccionar categoría</option>

                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Unidad de inventario
                </label>

                <select
                  value={unidad}
                  onChange={(e) => setUnidad(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700"
                >
                  <option>Pieza</option>
                  <option>Metro</option>
                  <option>Kilogramo</option>
                  <option>Litro</option>
                  <option>Caja</option>
                  <option>Rollo</option>
                  <option>Par</option>
                  <option>Juego</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Existencia actual
                </label>

                <input
                  value={existencia}
                  onChange={(e) => setExistencia(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                  placeholder="Ej. 15"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Stock mínimo
                </label>

                <input
                  value={stockMinimo}
                  onChange={(e) => setStockMinimo(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                  placeholder="Ej. 5"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Medida técnica
                </label>

                <input
                  value={medidaTecnica}
                  onChange={(e) => setMedidaTecnica(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                  placeholder="Ej. 6"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Unidad técnica
                </label>

                <select
                  value={unidadTecnica}
                  onChange={(e) => setUnidadTecnica(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700"
                >
                  <option value="">Sin medida técnica</option>
                  <option>Metro</option>
                  <option>Centímetro</option>
                  <option>Milímetro</option>
                  <option>Kilogramo</option>
                  <option>Litro</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Ubicación
                </label>

                <select
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700"
                >
                  <option value="">Seleccionar ubicación</option>

                  {ubicaciones.map((ubic) => (
                    <option key={ubic} value={ubic}>
                      {ubic}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Costo
                </label>

                <input
                  value={costo}
                  onChange={(e) => setCosto(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                  placeholder="$0.00"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">
                  Proveedor habitual
                </label>

                <input
                  value={proveedor}
                  onChange={(e) => setProveedor(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm"
                  placeholder="Proveedor"
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
                onClick={guardarMaterial}
                className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                {materialEditando ? "Guardar cambios" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}