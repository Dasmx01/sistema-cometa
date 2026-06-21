import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema Cometa",
  description: "Control de Materiales, Operaciones y Activos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-gray-100">
        <div className="flex h-screen">
          <aside className="w-48 overflow-y-auto border-r border-gray-200 bg-white p-3">
            <h1 className="mb-6 text-lg font-semibold text-stone-800">
              Cometa
            </h1>

            <nav className="space-y-1 text-sm text-stone-700">
              <Link href="/" className="block rounded px-3 py-2 hover:bg-stone-100">
                Info Panel
              </Link>

              <details className="group">
                <summary className="list-none cursor-pointer rounded px-3 py-2 hover:bg-stone-100 [&::-webkit-details-marker]:hidden">
                  Inventario
                </summary>
                <div className="ml-3 mt-1 space-y-1">
                  <Link href="/material" className="block rounded px-3 py-1 hover:bg-stone-100">
                    - Material
                  </Link>
                  <Link href="/fabricacion" className="block rounded px-3 py-1 hover:bg-stone-100">
                    - Fabricación
                  </Link>
                  <Link href="/cuadrillas" className="block rounded px-3 py-1 hover:bg-stone-100">
                    - Cuadrillas
                  </Link>
                  <Link href="/suministro" className="block rounded px-3 py-1 hover:bg-stone-100">
                    - Suministro
                  </Link>
                </div>
              </details>

              <details className="group">
                <summary className="list-none cursor-pointer rounded px-3 py-2 hover:bg-stone-100 [&::-webkit-details-marker]:hidden">
                  Operaciones
                </summary>
                <div className="ml-3 mt-1 space-y-1">
                  <Link href="/operaciones" className="block rounded px-3 py-1 hover:bg-stone-100">
                    - Órdenes de Compra
                  </Link>
                  <Link href="/programa-trabajo" className="block rounded px-3 py-1 hover:bg-stone-100">
                    - Programa de Trabajo
                  </Link>
                  <Link href="/historial" className="block rounded px-3 py-1 hover:bg-stone-100">
                    - Historial
                  </Link>
                </div>
              </details>

              <details className="group">
                <summary className="list-none cursor-pointer rounded px-3 py-2 hover:bg-stone-100 [&::-webkit-details-marker]:hidden">
                  Activos
                </summary>
                <div className="ml-3 mt-1 space-y-1">
                  <Link href="/activos/fabricacion" className="block rounded px-3 py-1 hover:bg-stone-100">
                    - Equipo de Fabricación
                  </Link>
                  <Link href="/activos/vehiculos" className="block rounded px-3 py-1 hover:bg-stone-100">
                    - Vehículos
                  </Link>
                  <Link href="/activos/herramientas" className="block rounded px-3 py-1 hover:bg-stone-100">
                    - Herramientas y Equipos
                  </Link>
                  <Link href="/activos/oficina" className="block rounded px-3 py-1 hover:bg-stone-100">
                    - Equipo de Oficina
                  </Link>
                  <Link href="/activos/mantenimientos" className="block rounded px-3 py-1 hover:bg-stone-100">
                    - Mantenimientos
                  </Link>
                </div>
              </details>

              <details className="group">
                <summary className="list-none cursor-pointer rounded px-3 py-2 hover:bg-stone-100 [&::-webkit-details-marker]:hidden">
                  Administración
                </summary>
                <div className="ml-3 mt-1 space-y-1">
                  <Link href="/usuarios" className="block rounded px-3 py-1 hover:bg-stone-100">
                    - Usuarios
                  </Link>
                  <Link href="/roles" className="block rounded px-3 py-1 hover:bg-stone-100">
                    - Roles
                  </Link>
                  <Link href="/configuracion" className="block rounded px-3 py-1 hover:bg-stone-100">
                    - Configuración
                  </Link>
                </div>
              </details>
            </nav>
          </aside>

          <main className="flex-1 overflow-auto p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}