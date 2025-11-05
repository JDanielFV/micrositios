import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DesktopWarning from "../components/DesktopWarning/DesktopWarning";

/**
 * @file layout.tsx
 * @description Este archivo define el layout raíz de la aplicación Next.js.
 *              Actúa como un componente de alto nivel que envuelve todas las páginas,
 *              proporcionando una estructura consistente, importación de estilos globales,
 *              fuentes y metadatos.
 */

// Configuración de la fuente Geist Sans de Vercel.
// Se carga con la opción `variable` para poder usarla fácilmente con CSS variables.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Configuración de la fuente Geist Mono de Vercel.
// Similar a Geist Sans, se carga como variable CSS.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * @constant metadata
 * @description Objeto que define los metadatos de la página para SEO y la visualización en navegadores.
 *              Next.js utiliza esto para generar las etiquetas <title> y <meta name="description">.
 */
export const metadata = {
  title: "Notaría Pública 103",
  description: "Certeza y Seguridad Jurídica a su Alcance",
};

/**
 * @function RootLayout
 * @param {Readonly<{ children: React.ReactNode }>} props - Propiedades del componente, incluyendo `children`.
 * @returns {JSX.Element} El componente de layout raíz.
 * @description Este es el componente de layout raíz que envuelve toda la aplicación.
 *              Define la estructura HTML básica (<html>, <body>) y aplica estilos globales.
 *              También incluye el componente `DesktopWarning` y renderiza el contenido de las páginas (`children`).
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // La etiqueta <html> con el atributo `lang` para accesibilidad.
    <html lang="es">
      {/* El <body> aplica las clases de las fuentes Geist y una clase `antialiased` para suavizado de texto. */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Componente de advertencia para dispositivos de escritorio, visible solo en ciertos tamaños de pantalla. */}
        <DesktopWarning />
        {/* El contenido principal de la página se renderiza dentro de la etiqueta <main>. */}
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
