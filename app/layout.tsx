import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Praxia · Entrenamiento Comercial",
  description:
    "Del conocimiento a la acción. Planificación, visitas y seguimiento para el equipo de entrenamiento comercial.",
};
export const viewport: Viewport = {
  themeColor: "#103e36",
  colorScheme: "light",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-CL">
      <body>{children}</body>
    </html>
  );
}
