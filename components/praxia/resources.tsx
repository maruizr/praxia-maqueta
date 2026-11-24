"use client";
import { useState } from "react";
import { useSettings } from './settings';
import { download } from './downloads';
import {Contests} from './contests';
import {exportSheet} from './sheets';
import { exportCalendar } from "./export-calendar";
import { Download, BookOpen, Plus } from "lucide-react";
import { stores, status, seedTasks, dateText, type Visit } from "./data";
export type Session = { day: number; title: string };
export function Resources({
  page,
  visits,
  open,
  sessions,
  setSessions,
  edit, who, management,
}: {
  who:string; management:boolean;
  page: string;
  visits: Visit[];
  open: (id: string) => void;
  sessions: Session[];
  setSessions: (s: Session[]) => void;
  edit: boolean;
}) {
  const settings=useSettings();
  const [notice,showNotice]=useState('');
  const [tab, T] = useState("Calendario"),
    [d, D] = useState(26),
    [title, N] = useState(""),
    [show, F] = useState(false),
    [filter, Q] = useState("Todos");
  if (page === "Simi Escuela")
    return (
      <>
        <div className="page-intro">
          <div className="eyebrow">Formación continua</div>
          <h1>Simi Escuela</h1>
          <p>
            Encuentros online de los jueves y recursos para preparar tus
            visitas.
          </p>
        </div>
        <section className="panel form-panel">
          <div className="tabs">
            {["Calendario", "Material de apoyo"].map((s) => (
              <button
                className={tab === s ? "selected" : ""}
                key={s}
                onClick={() => T(s)}
              >
                {s}
              </button>
            ))}
          </div>
          {tab === "Calendario" ? (
            <>
              <div className="heading-line">
                <h2>Noviembre 2026</h2>
                <div className="inline">
                  <button
                    className="secondary"
                    onClick={() => exportCalendar(sessions)}
                  >
                    <Download size={15} /> Imagen
                  </button>
                  <button className="secondary" onClick={() => window.print()}>
                    <Download size={15} /> PDF
                  </button>
                </div>
              </div>
              <div className="calendar">
                {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((x) => (
                  <b key={x}>{x}</b>
                ))}
                {Array.from({ length: 36 }, (_, i) => {
                  const day = i - 5,
                    s = sessions.find((x) => x.day === day);
                  return day < 1 ? (
                    <div key={i} />
                  ) : (
                    <button
                      key={i}
                      className={s ? "with-session" : ""}
                      onClick={() => {
                        D(day);
                        N(s?.title || "");
                        F(true);
                      }}
                    >
                      {day}
                      {s && <small>{s.title}</small>}
                    </button>
                  );
                })}
              </div>
              {show && (
                <div className="person">
                  <h3>{d} de noviembre</h3>
                  <p>
                    {sessions.find((s) => s.day === d)?.title ||
                      "No hay sesión programada."}
                  </p>
                  {edit && d % 7 === 5 && (
                    <div className="inline">
                      <label>
                        Nombre de la sesión
                        <input
                          value={title}
                          onChange={(e) => N(e.target.value)}
                        />
                      </label>
                      <button
                        disabled={!title.trim()}
                        className="primary"
                        onClick={() => {
                          setSessions([
                            ...sessions.filter((s) => s.day !== d),
                            { day: d, title: title.trim() },
                          ]);
                          F(false);
                        }}
                      >
                        Guardar sesión
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <h3>Publicidad del mes</h3>
              {settings.publicity ? <button className="secondary" onClick={()=>download(settings.publicity!,settings.publicity!.name)}>Descargar · {settings.publicity.name}</button> : <small>Aún no hay publicidad para noviembre.</small>}
              {settings.permission(who,'publicidad') && <label>Cargar publicidad (imagen o PDF, hasta 10 MB)<input type="file" accept="image/*,application/pdf" onChange={e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>10485760||(!f.type.startsWith('image/')&&f.type!=='application/pdf'))return showNotice('Selecciona una imagen o PDF de hasta 10 MB.');settings.setPublicity(f);showNotice('Publicidad disponible para el equipo.')}}/></label>}{notice&&<p role="status">{notice}</p>}
              {[
                "Guía de productos G8",
                "Ficha de capacitación en terreno",
                "Pauta de seguimiento",
              ].map((x, i) => (
                <details key={x}>
                  <summary>
                    <BookOpen size={16} /> {x}
                  </summary>
                  <p>
                    {
                      [
                        "Consulta las categorías de vitamina C, magnesio y omega 3. Prioriza los productos del concurso vigente.",
                        "Selecciona la dotación, registra los temas tratados y confirma el resultado individual.",
                        "Revisa los compromisos vencidos, conversa con el colaborador y actualiza su resultado.",
                      ][i]
                    }
                  </p>
                </details>
              ))}
            </>
          )}
        </section>
      </>
    );
  if (page === "Mi desempeño") {
    visits=visits.filter(v=>v.author===who&&v.date.startsWith('2026-11'));
    const metrics = [
      [
        "Gestiones",
        32 + visits.reduce((n, v) => n + v.actions.length, 0),
        45,
        30,
      ],
      [
        "Farmacias visitadas",
        new Set([
          ...stores
            .filter((s) => settings.owner(s.id) === who && s.last.startsWith("2026-11"))
            .map((s) => s.id),
          ...visits
            .filter((v) => v.date.startsWith("2026-11"))
            .map((v) => v.store),
        ]).size,
        35,
        22,
      ],
      [
        "Capacitaciones",
        24 +
          visits
            .flatMap((v) => v.actions)
            .filter((a) => a.type === "Capacitación").length,
        35,
        21,
      ],
      [
        "Personas alcanzadas",
        86 +
          new Set(
            visits.flatMap((v) =>
              v.actions.flatMap((a) => a.persons.map((p) => p.id)),
            ),
          ).size,
        120,
        80,
      ],
      [
        "Seguimientos",
        6 +
          visits
            .flatMap((v) => v.actions)
            .filter((a) => a.type === "Seguimiento").length,
        10,
        5,
      ],
      [
        "Puntos críticos resueltos",
        3 +
          stores.filter(
            (s) =>
              status(s, [], seedTasks).p === 1 &&
              status(s, visits, seedTasks).p !== 1,
          ).length,
        5,
        2,
      ],
      ["Días en terreno", new Set(['02','03','04','05','06','09','10','11','12','13','16','17'].map(d=>'2026-11-'+d).concat(visits.filter(v=>v.mode==='Presencial').map(v=>v.date))).size, 18, 11],
    ];
    return (
      <>
        <div className="page-intro">
          <div className="eyebrow">Noviembre 2026</div>
          <h1>Mi desempeño</h1>
          <p>Tu avance mensual frente a la meta y al promedio del equipo.</p>
        </div>
        <div className="resource-grid">
          {metrics.map(([name, n, goal, avg]) => (
            <div className="panel form-panel" key={name}>
              <h3>{name}</h3>
              <div className="big-number">
                {n}
                <small> / {goal}</small>
              </div>
              <progress value={+n} max={+goal} />
              <small>Promedio del equipo: {avg}</small>
            </div>
          ))}
        </div>
      </>
    );
  }
  const inv = page === 'Inventario G8';
  const sales=stores.map((s,i)=>({s,amount:1890000+i*32789,goal:65+i%22,g8:19+i%9})).filter(({s})=>management||settings.allowed(who,'Ventas',s.id));
  const exportable=sales.filter(({s})=>management||settings.allowed(who,'Exportar ventas',s.id));
  const stock=new Map<string,{id:string;product:string;units:number}>();
  function item(id:string,product:string,units:number){stock.set(id+':'+product,{id,product,units})}
  stores.slice(0,12).forEach((s,i)=>item(s.id,['Vitamina C G8','Magnesio G8','Omega 3 G8'][i%3],i%3));
  for(const b of settings.batches)if(b.source==='Inventario G8')for(const [id,product,n] of b.rows)item(id,product,+n);
  const stockRows=Array.from(stock.values()).filter(r=>r.units<5&&(management||settings.allowed(who,'Inventario',r.id))&&(filter==='Todos'||(r.units===0?'Quiebre':'Stock bajo')===filter));
  const rows=inv?stockRows.map(r=>({s:stores.find(s=>s.id===r.id)!,a:r.product,b:String(r.units),c:r.units?'Stock bajo':'Quiebre'})):sales.map(r=>({s:r.s,a:'$'+r.amount.toLocaleString('es-CL'),b:r.goal+' %',c:r.g8+' %'}));
  return (
    <>
      <div className="page-intro">
        <div className="eyebrow">Inteligencia comercial</div>
        <h1>{page}</h1>
        <p>
          {inv
            ? "Disponibilidad de productos prioritarios en tu cartera."
            : "Avance de ventas y concursos vigentes de noviembre."}
        </p>
      </div>
      <Contests items={settings.contests} set={settings.setContests} admin={management} who={who}/>
      <p>Fuente comercial desactualizada. Último corte válido: 20 de noviembre de 2026.</p>
      <section className="panel form-panel">
        <div className="heading-line">
          <h2>{inv ? "Alertas de inventario" : "Ventas por farmacia"}</h2>
          {!inv && exportable.length>0 && <button className="secondary" onClick={()=>exportSheet('ventas-autorizadas',['Farmacia','Nombre','Venta mensual','Avance (%)','G8 (%)','Corte'],exportable.map(r=>[r.s.id,r.s.name,String(r.amount),String(r.goal),String(r.g8),'2026-11-20']))}><Download size={15}/>Exportar ventas ({exportable.length})</button>}
          {inv && (
            <select
              aria-label="Filtrar por stock"
              value={filter}
              onChange={(e) => Q(e.target.value)}
            >
              {["Todos", "Quiebre", "Stock bajo"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          )}
        </div>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                {(inv
                  ? ["Farmacia", "Producto prioritario", "Unidades", "Estado"]
                  : [
                      "Farmacia",
                      "Venta mensual",
                      "Avance de meta",
                      "Participación G8",
                    ]
                ).map((s) => (
                  <th key={s}>{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!rows.length&&<tr><td colSpan={4}>No hay registros para este filtro y alcance.</td></tr>}
              {rows.map(({s,a,b,c}) => {
                return (
                  <tr key={s.id+':'+a}>
                    <td>
                      {management||settings.owner(s.id)===who?<button className="text-btn" onClick={() => open(s.id)}>{s.name}</button>:<strong>{s.name}</strong>}
                      <small>{s.id}</small>
                    </td>
                    <td>
                      {a}
                    </td>
                    <td>{b}</td>
                    <td>
                      <span
                        className={
                          "pill " + (c === 'Quiebre' ? "red" : "green")
                        }
                      >
                        {c}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
