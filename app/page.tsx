const year = 2026;
const month = 5; // junio: enero=0, junio=5

export default function DashboardPage() 
{
  const tarjetas = [
    ["Materiales bajos", "12"],
    ["Actividades hoy", "18"],
    ["En proceso", "7"],
    ["Continuarán", "5"],
    ["Reprogramadas", "2"],
    ["Terminadas", "4"],
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

  return (
    <div className="h-full">
      <div className="mb-5">
        <h1 className="text-3xl font-semibold text-stone-800">Dashboard</h1>
        <p className="mt-1 text-sm text-stone-500">
          Resumen operativo del día.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(140px,1fr))]">
          {tarjetas.map(([titulo, valor]) => (
            <div
              key={titulo}
              className="rounded-xl border border-stone-200 bg-white px-3 py-2 shadow-sm"
            >
              <p className="text-xs text-stone-500">{titulo}</p>
              <p className="mt-0.5 text-xl font-semibold text-stone-800">
                {valor}
              </p>
            </div>
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
            {celdas.map((dia, index) =>
              dia === null ? (
                <div key={`empty-${index}`} />
              ) : (
                <button
                  key={dia}
                  className="min-h-[82px] overflow-hidden rounded-lg border border-stone-200 p-2 text-left transition hover:border-stone-400 hover:bg-stone-50"
                >
                  <div className="text-sm font-medium text-stone-700">
                    {dia}
                  </div>

                  <div className="mt-2 space-y-1 text-[10px] leading-tight text-stone-500">
                    {dia % 3 === 0 && (
                      <div className="truncate">3 actividades</div>
                    )}

                    {dia % 5 === 0 && (
                      <div className="truncate">Continuará</div>
                    )}
                  </div>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}