import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DesktopWarning from "../components/DesktopWarning/DesktopWarning";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Notaría Pública 103",
  description: "Certeza y Seguridad Jurídica a su Alcance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DesktopWarning />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
