"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { stores, storeIndex, today, employees, team } from "./data";
import { initialContests } from "./contests";
import { useLocal, useGrants } from "./local";
import type { Batch } from "./import-data";
export { team };
export type Cover = {
  store: string;
  who: string;
  start: string;
  end: string;
  reason?: string;
  temporary?: boolean;
};
type Grant = {
  who: string;
  info: string;
  territory: string;
  start: string;
  end: string;
};
type Staff = {
  id: string;
  name: string;
  job: string;
  inactive?: string;
  note?: string;
  provisional?: boolean;
};
function useModel() {
  const [contests, setContests] = useLocal("concursos", initialContests),
    [batches, B] = useLocal<Batch[]>("cargas", []),
    [covers, C] = useLocal<Cover[]>("asignaciones", []),
    [frequency, F] = useLocal<Record<string, number>>("frecuencias", {}),
    [products, P] = useLocal("productos", ["Vitamina C G8"]),
    [rejected, R] = useLocal<Record<string, string>>("sugerencias", {}),
    [access, A] = useGrants(),
    [grants, G] = useLocal<Grant[]>("accesos", []),
    [publicity, setPublicity] = useState<File | null>(null),
    [staff, U] = useLocal<Staff[]>("dotacion", [
      {
        ...employees(stores[0].id)[4],
        inactive: today,
        note: "Término de contrato",
      },
      {
        id: stores[1].id + "-98",
        name: "Luisa Prado",
        job: "Auxiliar de farmacia",
        provisional: true,
      },
    ]);
  const [flags, flag] = useLocal<Record<string, string>>("alertas-farmacia", {
    [stores[1].id]: "Ventas bajas",
    [stores[2].id]: "Nuevos ingresos sin capacitar",
  });
  const owner = (id: string, date = today) =>
    [...covers]
      .reverse()
      .find(
        (c) =>
          !c.temporary &&
          c.store === id &&
          c.start.slice(0, 7) <= date.slice(0, 7) &&
          c.end >= date,
      )?.who ??
    batches
      .filter((b) => b.source === "Carteras")
      .flatMap((b) => b.rows)
      .reverse()
      .find((r) => r[0] === id && r[2] === date.slice(0, 7))?.[1] ??
    stores[storeIndex.get(id)!]?.owner ??
    "";
  function allStaff(id: string) {
    const map = new Map<string, Staff>(employees(id).map((p) => [p.id, p]));
    batches
      .filter((b) => b.source === "Dotación de personal")
      .forEach((b) =>
        b.rows
          .filter((r) => r[0] === id)
          .forEach((r) =>
            map.set(id + "-" + r[1], {
              id: id + "-" + r[1],
              name: r[2],
              job: r[3],
            }),
          ),
      );
    staff
      .filter((p) => p.id.startsWith(id + "-"))
      .forEach((p) => map.set(p.id, p));
    return [...map.values()];
  }
  return {
    flags,
    flagStore: (id: string, reason: string) => flag({ ...flags, [id]: reason }),
    contests,
    setContests,
    batches,
    commitBatch: (b: Batch) => B((v) => [...v, b]),
    covers,
    cover: (c: Cover[]) => C((v) => [...v, ...c]),
    owner,
    allStaff,
    roster: (id: string) => allStaff(id).filter((p) => !p.inactive),
    staffUpdate: (p: Staff) => U((v) => [...v.filter((x) => x.id !== p.id), p]),
    school: (id: string) => stores[storeIndex.get(id)!]?.school ?? today,
    frequency,
    setFreq: (id: string, n: number) => F({ ...frequency, [id]: n }),
    products,
    toggle: (s: string) =>
      P(
        products.includes(s)
          ? products.filter((x) => x !== s)
          : [...products, s],
      ),
    rejected,
    rejectSuggestion: (id: string, reason: string) =>
      R({ ...rejected, [id]: reason }),
    permission: (who: string, p: string) =>
      (access[who] ?? []).includes(
        p === "escuela" ? "Habilitar Simi Escuela" : p,
      ),
    grant: (w: string, p: string, on: boolean) =>
      A({
        ...access,
        [w]: [...(access[w] ?? []).filter((x) => x !== p), ...(on ? [p] : [])],
      }),
    allowed: (who: string, info: string, id: string) =>
      owner(id) === who ||
      grants.some(
        (g) =>
          g.who === who &&
          g.info === info &&
          g.start <= today &&
          g.end >= today,
      ),
    approve: (g: Grant) => G([...grants, g]),
    publicity,
    setPublicity,
  };
}
const Context = createContext<ReturnType<typeof useModel> | null>(null);
export const useSettings = () => useContext(Context)!;
export function SettingsProvider({ children }: { children: ReactNode }) {
  const settings = useModel();
  return <Context.Provider value={settings}>{children}</Context.Provider>;
}
