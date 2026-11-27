import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./workspace.css";
export const metadata: Metadata = {
  title: "Praxia · Nutrición y Entrenamiento Comercial",
  icons: { icon: "/praxia-mark.svg", apple: "/praxia-192.png" },
  description:
    "Del conocimiento a la acción. Planificación, visitas y seguimiento para el equipo de entrenamiento comercial.",
};
export const viewport: Viewport = {
  themeColor: "#103e36",
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
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
