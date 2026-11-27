"use client";
import {
  useSyncExternalStore,
  useMemo,
  useRef,
  type SetStateAction,
} from "react";
export function useLocal<T>(key: string, initial: T) {
  const base = useRef(initial);
  const name = "praxia.v4." + key;
  const subscribe = (cb: () => void) => {
    window.addEventListener("praxia", cb);
    window.addEventListener("storage", cb);
    return () => {
      window.removeEventListener("praxia", cb);
      window.removeEventListener("storage", cb);
    };
  };
  const raw = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(name),
    () => null,
  );
  const value = useMemo<T>(
    () => (raw === null ? base.current : JSON.parse(raw)),
    [raw],
  );
  function set(next: SetStateAction<T>) {
    if (
      !navigator.onLine &&
      !key.startsWith("borrador:") &&
      !["perfil", "oscuro"].includes(key)
    ) {
      window.dispatchEvent(new Event("praxia-offline"));
      return;
    }
    const previous = localStorage.getItem(name);
    const updated =
      typeof next === "function"
        ? (next as (p: T) => T)(
            previous === null ? base.current : JSON.parse(previous),
          )
        : next;
    localStorage.setItem(name, JSON.stringify(updated));
    window.dispatchEvent(new Event("praxia"));
  }
  return [value, set] as const;
}
export const permissions = [
  "Aprobar viajes",
  "Gestionar permisos",
  "Habilitar Simi Escuela",
  "Exportar datos",
  "Ver ventas nominativas",
  "Análisis y carga de nuevos ingresos",
  "Cierre mensual de nuevos ingresos",
  "Carga manual de encuestas de satisfacción",
];
export function useGrants() {
  return useLocal<Record<string, string[]>>("permisos", {
    "Paula Fuentes": permissions,
    "Camila Morales": [],
  });
}
export const dateISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export function shifted(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return dateISO(d);
}
