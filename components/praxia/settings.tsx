"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { stores, today } from "./data";
export const team = [
  "Camila Morales",
  "Francisca Díaz",
  "Paula Fuentes",
  "Josefa Ruiz",
  "Isidora Tapia",
  "Daniela Araya",
  "Fernanda Vega",
  "Carolina Leiva",
  "Martina Pino",
  "Constanza León",
  "Javiera Bravo",
  "Catalina Paz",
];
export type Cover = { store: string; who: string; start: string; end: string };
type Settings = {
  frequency: Record<string, number>;
  setFreq: (id: string, n: number) => void;
  covers: Cover[];
  cover: (r: Cover) => void;
  products: string[];
  toggle: (s: string) => void;
  permission: (who: string, perm: string) => boolean;
  grant: (who: string, perm: string, v: boolean) => void;
  owner: (id: string) => string;
};
const C = createContext<Settings | null>(null);
export const useSettings = () => useContext(C)!;
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [frequency, F] = useState<Record<string, number>>({}),
    [covers, A] = useState<Cover[]>([]),
    [products, P] = useState(["Vitamina C G8"]),
    [permissions, G] = useState<Record<string, boolean>>({
      "Paula Fuentes:escuela": true,
      "Tomás Vidal:escuela": true,
    });
  const owner = (id: string) =>
    covers.find((r) => r.store === id && r.start <= today && r.end >= today)
      ?.who || team[0];
  return (
    <C.Provider
      value={{
        frequency,
        setFreq: (id, n) => {
          if (n >= 1 && n <= 4) F({ ...frequency, [id]: n });
        },
        covers,
        cover: (r) => A([...covers, r]),
        products,
        toggle: (s) =>
          P(
            products.includes(s)
              ? products.filter((x) => x !== s)
              : [...products, s],
          ),
        permission: (w, p) => !!permissions[w + ":" + p],
        grant: (w, p, v) => G({ ...permissions, [w + ":" + p]: v }),
        owner,
      }}
    >
      {children}
    </C.Provider>
  );
}
