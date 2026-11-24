"use client";
import { useState, useEffect } from "react";
import { useSettings, team } from "./settings";
import { stores, today, dateText, type Row } from "./data";
import { ImportPanel } from './import-panel';
import type { Notice } from "./planning";
import {TeamTable, type Summary} from './management-home';
export default function Admin({
  tab, T, rows, role,
  plan,
  published,
  notices,
  setNotices,
  notify,
  permission,
  permit,
}: {
  tab: string; T: (tab:string)=>void; rows: Summary;
  role: string;
  plan: Row[];
  published: boolean;
  notices: Notice[];
  setNotices: (v: Notice[]) => void;
  notify: (s: string) => void;
  permission: boolean;
  permit: (v: boolean) => void;
}) {
  const [title, N] = useState(""),
    [date, D] = useState(today),
    [end, E] = useState("2026-12-07"),
    [to, U] = useState("Todas"),
    [hotel, H] = useState(""),
    [store, S] = useState(stores[0].id),
    [who, W] = useState("Francisca Díaz"),
    [records, R] = useState<
      { tab: string; text: string; store: string; date: string; end: string }[]
    >([]),

    [info, A] = useState("Ventas"),
    [territory, Z] = useState("Oriente"),
    [query, setQuery] = useState(''),
[sub, B] = useState("Borrador quincenal"),
    [draft, X] = useState<Record<string, string>>({}),
    [from, Y] = useState("2026-12-01");
  function record(text: string) {
    R([...records, { tab, text, store, date, end }]);
    notify("Registro confirmado.");
  }
  const settings = useSettings(), users = team;
  const load = (u: string) => rows.find(r => r.name === u)?.total ?? 0;
  const [search, setSearch] = useState(''), [page, setPage] = useState(0);
  const matching = stores.filter(s => `${s.id} ${s.name} ${s.zone} ${settings.owner(s.id, from)}`.toLowerCase().includes(search.trim().toLowerCase()));
  const through = from ? new Date(Date.parse(`${from}T00:00:00Z`) + 14 * 86400000).toISOString().slice(0, 10) : '';
  const owner = (id:string) => draft[id] ?? settings.owner(id, from);
  const moved = stores.filter(s => owner(s.id) !== settings.owner(s.id, from));
  const overlaps = (id:string, start:string, finish:string) => settings.covers.some(c => c.store === id && c.start <= finish && c.end >= start);
  const conflict = moved.some(s => overlaps(s.id, from, through));
  const orphan = moved.filter(s => !users.includes(owner(s.id)));
  const affected = plan.filter(r => r.date >= from && r.date <= through && moved.some(s=>s.id===r.store)).length;
  return (
    <>
      <div className="page-intro">
        <div className="eyebrow">{role} · Entrenamiento comercial</div>
        <h1>Administración</h1>
        <p>Visión de equipo, planificación y control de cartera.</p>
      </div>
      <section className="panel form-panel">
        <div className="tabs">
          {[
            "Equipo",
            "Consideraciones",
            "Asignaciones",
            "Autorizaciones",
            ...(role === "Administrador"
              ? ["Cargas externas", "Permisos", "Catálogos"]
              : []),
          ].map((s) => (
            <button
              key={s}
              className={s === tab ? "selected" : ""}
              onClick={() => T(s)}
            >
              {s}
            </button>
          ))}
        </div>
        {tab === "Equipo" ? (
          <>
            <h2>Resumen del equipo</h2>
            <TeamTable rows={rows}/>
          </>
        ) : tab === "Consideraciones" ? (
          <>
            <h2>Consideraciones del mes</h2>
            <div className="form-grid">
              <label>
                Actividad
                <input
                  placeholder="Viaje, feriado, reunión o charla"
                  value={title}
                  onChange={(e) => N(e.target.value)}
                />
              </label>
              <label>
                Fecha
                <input
                  type="date"
                  value={date}
                  onChange={(e) => D(e.target.value)}
                />
              </label>
              <label>
                Destinataria
                <select value={to} onChange={(e) => U(e.target.value)}>
                  {["Todas", ...users].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                Solicitud de hospedaje (opcional)
                <input
                  type="date"
                  value={hotel}
                  onChange={(e) => H(e.target.value)}
                />
              </label>
            </div>
            <small>El hospedaje se gestiona por correo, fuera de Praxia.</small>
            <button
              className="primary"
              disabled={!title.trim() || !date}
              onClick={() => {
                setNotices([...notices, { date, title, to, hotel }]);
                N("");
                notify("Consideración publicada.");
              }}
            >
              Publicar consideración
            </button>
            {notices.map((n, i) => (
              <p key={i}>
                {dateText(n.date)} · {n.title} · {n.to}
              </p>
            ))}
          </>
        ) : tab === "Asignaciones" ? (
          <>
            <details><summary>Consultar carteras y responsables</summary><label>Buscar por farmacia, código o responsable<input value={query} onChange={e=>setQuery(e.target.value)}/></label>{stores.filter(s=>(s.name+s.id+settings.owner(s.id)).toLowerCase().includes(query.trim().toLowerCase())).map(s=><div className="simple-row" key={s.id}><div><strong>{s.name}</strong><small>{s.id} · {settings.owner(s.id)}</small></div></div>)}{!stores.some(s=>(s.name+s.id+settings.owner(s.id)).toLowerCase().includes(query.trim().toLowerCase()))&&<p>Sin coincidencias.</p>}</details>
            <div className="tabs">
              {["Borrador quincenal", "Cobertura temporal"].map((x) => (
                <button
                  key={x}
                  className={x === sub ? "selected" : ""}
                  onClick={() => B(x)}
                >
                  {x}
                </button>
              ))}
            </div>
            {sub === "Borrador quincenal" ? (
              <>
                <h2>Borrador de asignación quincenal</h2>
                <p>
                  Selecciona las farmacias que cambiarán de responsable durante 15 días. Al finalizar la quincena recuperan su asignación habitual.
                </p>
                <div className="form-grid">
                  {team.map((u) => (
                    <div key={u} className="simple-row">
                      <div>
                        <strong>{u}</strong>
                        <small>
                          {load(u)} → {stores.filter(s=>owner(s.id)===u).length} farmacias
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
                <label>Filtrar farmacias del borrador<input type="search" placeholder="Código, nombre, zona o responsable" value={search} onChange={e=>{setSearch(e.target.value);setPage(0)}} /></label>
                <div className="scroll">
                  <table>
                    <thead>
                      <tr>
                        {["Farmacia", "Zona", "Supervisor", "Responsable"].map(
                          (x) => (
                            <th key={x}>{x}</th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {matching.slice(page * 16, (page + 1) * 16).map((s) => (
                        <tr key={s.id}>
                          <td>
                            {s.id} · {s.name}
                          </td>
                          <td>{s.zone}</td>
                          <td>{s.supervisor}</td>
                          <td>
                            <select
                              aria-label={`Responsable de ${s.id}`}
                              value={owner(s.id)}
                              onChange={(e) =>
                                X({ ...draft, [s.id]: e.target.value })
                              }
                            >
                              {[...team, "Sin responsable"].map((x) => (
                                <option key={x}>{x}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="inline"><button className="secondary" disabled={!page} onClick={()=>setPage(page-1)}>Anterior</button><span aria-live="polite">{matching.length ? `Página ${page+1} de ${Math.ceil(matching.length/16)}` : 'Sin coincidencias'}</span><button className="secondary" disabled={(page+1)*16>=matching.length} onClick={()=>setPage(page+1)}>Siguiente</button></div>
                <label>
                  Vigente desde
                  <input
                    type="date"
                    min={today}
                    value={from}
                    onChange={(e) => Y(e.target.value)}
                  />
                </label>
                <p>
                  {moved.length} farmacias cambian de responsable · {affected}{" "}
                  visitas planificadas afectadas, que deberán reasignarse o
                  reprogramarse.
                </p>
                {orphan.length > 0 && (
                  <p role="alert" className="error">
                    {orphan.length} farmacias quedarían sin responsable.
                    Asígnalas antes de confirmar.
                  </p>
                )}
                {through && <p>Vigente hasta el {dateText(through)}, inclusive.</p>}
                {conflict && <p role="alert">Una farmacia modificada ya tiene una asignación en esas fechas. Cambia la fecha o retírala del borrador.</p>}
                <button
                  className="primary"
                  disabled={!moved.length || orphan.length > 0 || !from || from < today || conflict}
                  onClick={() => {
                    if (from < today)
                      return notify("La vigencia no puede ser anterior a hoy.");
                    settings.cover(moved.map(s=>({store:s.id,who:owner(s.id),start:from,end:through})));
                    record(
                      `Borrador quincenal confirmado: ${moved.length} farmacias desde el ${dateText(from)}`,
                    );
                    X({});
                  }}
                >
                  Confirmar vigencia
                </button>
              </>
            ) : (
              <>
                <h2>Cobertura temporal</h2>
            <label>
              Farmacia
              <select value={store} onChange={(e) => S(e.target.value)}>
                {stores.map((s) => (
                  <option value={s.id} key={s.id}>
                    {s.id} · {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Responsable temporal
              <select value={who} onChange={(e) => W(e.target.value)}>
                {users.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <div className="form-grid">
              <label>
                Desde
                <input
                  type="date"
                  value={date}
                  onChange={(e) => D(e.target.value)}
                />
              </label>
              <label>
                Hasta
                <input
                  type="date"
                  value={end}
                  onChange={(e) => E(e.target.value)}
                />
              </label>
            </div>
            <p>
              {
                plan.filter(
                  (r) => r.store === store && r.date >= date && r.date <= end,
                ).length
              }{" "}
              visitas futuras afectadas · Responsable: {who} · Cartera actual:{" "}
              {load(who)} farmacias
            </p>
            <button
              className="primary"
              onClick={() => {
                if (
                  !date ||
                  !end ||
                  date > end ||
                  overlaps(store, date, end)
                )
                  return notify("Vigencia no válida o cobertura superpuesta.");
                settings.cover([{ store, who, start: date, end }]);
                record(
                  `${store} → ${who} · ${dateText(date)} al ${dateText(end)}`,
                );
              }}
            >
              Confirmar vigencia
            </button>
              </>)}
            {settings.covers.length > 0 && <details><summary>Asignaciones confirmadas ({settings.covers.length})</summary>{settings.covers.map(c=><p key={c.store+c.start}>{c.store} · {c.who} · {dateText(c.start)} al {dateText(c.end)}</p>)}</details>}
          </>
        ) : tab === "Autorizaciones" ? (
          <>
            <h2>Autorización comercial excepcional</h2>
            <div className="form-grid">
              <label>
                Nutricionista
                <select value={who} onChange={(e) => W(e.target.value)}>
                  {users.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label>
                Información
                <select value={info} onChange={(e) => A(e.target.value)}>
                  {["Ventas", "Inventario", "Exportar ventas"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label>
                Territorio
                <select value={territory} onChange={(e) => Z(e.target.value)}>
                  {["Oriente", "Centro", "Sur"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label>
                Desde
                <input
                  type="date"
                  value={date}
                  onChange={(e) => D(e.target.value)}
                />
              </label>
              <label>
                Hasta
                <input
                  type="date"
                  value={end}
                  onChange={(e) => E(e.target.value)}
                />
              </label>
            </div>
            <button
              className="primary"
              onClick={() => {
                const days =
                  (Date.parse(end) - Date.parse(date)) / 86400000 + 1;
                if (!Number.isFinite(days) || days < 1 || days > 90)
                  return notify("La vigencia debe ser de 1 a 90 días.");
                settings.approve({who,info,territory,start:date,end});
                record(
                  `${who} · ${info} · ${territory} · ${dateText(date)} al ${dateText(end)}`,
                );
              }}
            >
              Aprobar autorización
            </button>
          </>
        ) : tab === "Permisos" ? (
          <>
            <h2>Permisos operativos</h2>
            <label>
              Usuaria
              <select value={who} onChange={(e) => W(e.target.value)}>
                {[...users, "Tomás Vidal"].map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={settings.permission(who, "escuela")}
                onChange={(e) =>
                  settings.grant(who, "escuela", e.target.checked)
                }
              />{" "}
              Editar calendario de Simi Escuela
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={settings.permission(who, "publicidad")}
                onChange={(e) =>
                  settings.grant(who, "publicidad", e.target.checked)
                }
              />{" "}
              Cargar publicidad del mes
            </label>
          </>
        ) : tab === "Catálogos" ? (
          <>
            <h2>Frecuencia de visitas</h2>
            <label>
              Farmacia
              <select value={store} onChange={(e) => S(e.target.value)}>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.id}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Visitas esperadas por mes
              <select
                value={settings.frequency[store] || 1}
                onChange={(e) => settings.setFreq(store, +e.target.value)}
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
            <h2>Productos prioritarios</h2>
            <p>Los productos del concurso vigente también tienen prioridad.</p>
            {["Vitamina C G8", "Magnesio G8", "Omega 3 G8"].map((t) => (
              <label className="check" key={t}>
                <input
                  type="checkbox"
                  checked={settings.products.includes(t)}
                  onChange={() => settings.toggle(t)}
                />
                {t}
              </label>
            ))}
          </>
        ) : (
          <ImportPanel />
        )}
        {records
          .filter((r) => r.tab === tab)
          .map((r, i) => (
            <div key={i} className="simple-row">
              {r.text}
            </div>
          ))}
      </section>
    </>
  );
}
