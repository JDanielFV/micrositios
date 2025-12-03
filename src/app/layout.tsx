import { Inter } from 'next/font/google';
import "./globals.css";
import VisitTracker from '@/components/VisitTracker';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: "Notaría Pública 178",
  description: "Certeza y Seguridad Jurídica a su Alcance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <VisitTracker />
        {children}
      </body>
    </html>
  );
}
