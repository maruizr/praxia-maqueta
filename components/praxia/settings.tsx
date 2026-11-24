"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { stores, today, employees, team, storeIndex } from "./data";
import {initialContests,type Contest} from './contests';
import type {Batch} from './import-data';
type Grant={who:string;info:string;territory:string;start:string;end:string};
export {team};
export type Cover = { store: string; who: string; start: string; end: string };
type Settings = {
  contests:Contest[];setContests:(c:Contest[])=>void;
  rejected:Record<string,string>; rejectSuggestion:(id:string,reason:string)=>void;
  batches:Batch[]; commitBatch:(b:Batch)=>void;
  roster:typeof employees; school:(id:string)=>string;
  approve:(g:Grant)=>void; allowed:(who:string,info:string,id:string)=>boolean;
  publicity:File|null; setPublicity:(f:File)=>void;
  frequency: Record<string, number>;
  setFreq: (id: string, n: number) => void;
  covers: Cover[];
  cover: (rows: Cover[]) => void;
  products: string[];
  toggle: (s: string) => void;
  permission: (who: string, perm: string) => boolean;
  grant: (who: string, perm: string, v: boolean) => void;
  owner: (id: string, date?: string) => string;
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
  const [contests,setContests]=useState(initialContests);
  const [rejected,setRejected]=useState<Record<string,string>>({});
  const [batches,setBatches]=useState<Batch[]>([]), [grants,setGrants]=useState<Grant[]>([]), [publicity,setPublicity]=useState<File|null>(null);
  function roster(id:string){const map=new Map(employees(id).map(p=>[p.id,p])); for(const b of batches) if(b.source==='Dotación de personal') for(const [store,num,name,job] of b.rows) if(store===id)map.set(`${id}-${num}`,{id:`${id}-${num}`,name,job});return Array.from(map.values())}
  const owner = (id: string, date = today) =>
    covers.find((r) => r.store === id && r.start <= date && r.end >= date)
      ?.who || stores[storeIndex.get(id)!]?.owner || '';
  return (
    <C.Provider
      value={{
        contests,setContests,rejected,rejectSuggestion:(id,reason)=>setRejected(prev=>({...prev,[id]:reason})),
        batches,commitBatch:b=>setBatches(prev=>b.source==='Histórico de visitas'&&prev.some(x=>x.source===b.source)?prev:[...prev,b]),roster,
        school:id=>[stores[storeIndex.get(id)!].school,...batches.filter(b=>b.source==='Asistencia de Simi Escuela').flatMap(b=>b.rows.filter(r=>r[0]===id).map(r=>r[1]))].sort().at(-1)!,
        approve:g=>setGrants(prev=>[...prev,g]),allowed:(who,info,id)=>owner(id)===who||grants.some(g=>g.who===who&&(g.info===info||(info==='Ventas'&&g.info==='Exportar ventas'))&&g.start<=today&&g.end>=today&&g.territory===stores.find(s=>s.id===id)?.zone),publicity,setPublicity,
        frequency,
        setFreq: (id, n) => {
          if (n >= 1 && n <= 4) F({ ...frequency, [id]: n });
        },
        covers,
        cover: (rows) => A(prev => [...prev, ...rows]),
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
