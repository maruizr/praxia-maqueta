"use client";
import { useState, useEffect } from "react";
import { useSettings, team } from "./settings";
import { stores, today, dateText, type Row } from "./data";
import type { Notice } from "./planning";
export default function Admin({
  role,
  plan,
  published,
  notices,
  setNotices,
  notify,
  permission,
  permit,
}: {
  role: string;
  plan: Row[];
  published: boolean;
  notices: Notice[];
  setNotices: (v: Notice[]) => void;
  notify: (s: string) => void;
  permission: boolean;
  permit: (v: boolean) => void;
}) {
  const [tab, T] = useState("Equipo"),
    [title, N] = useState(""),
    [date, D] = useState(today),
    [end, E] = useState("2026-12-07"),
    [to, U] = useState("Todas"),
    [hotel, H] = useState(""),
    [store, S] = useState(stores[0].id),
    [who, W] = useState("Francisca Díaz"),
    [records, R] = useState<
      { tab: string; text: string; store: string; date: string; end: string }[]
    >([]),
    [source, F] = useState("Dotación de personal"),
    [preview, P] = useState<string[]>([]),
    [reject, J] = useState(0),
    [info, A] = useState("Ventas"),
    [territory, Z] = useState("Oriente"),
    [upload, Q] = useState(false);
  function record(text: string) {
    R([...records, { tab, text, store, date, end }]);
    notify("Registro confirmado.");
  }
  useEffect(() => T("Equipo"), [role]);
  const settings = useSettings(),
    users = team;
  const load = (u: string, i: number) =>
    (i === 0 ? 0 : 50 + i) +
    stores.filter((s) => settings.owner(s.id) === u).length;
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
            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    {[
                      "Nutricionista",
                      "Cartera",
                      "Cobertura",
                      "Focos rojos",
                      "Plan mensual",
                    ].map((s) => (
                      <th key={s}>{s}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u}>
                      <td>{u}</td>
                      <td>{load(u, i)}</td>
                      <td>{[36, 62, 55][i % 3]} %</td>
                      <td>{[4, 3, 5][i % 3]}</td>
                      <td>{i || published ? "Publicado" : "Borrador"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
            <h2>Borrador de asignación quincenal</h2>
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
              {load(who, users.indexOf(who))} farmacias
            </p>
            <button
              className="primary"
              onClick={() => {
                if (
                  !date ||
                  !end ||
                  date > end ||
                  records.some(
                    (r) =>
                      r.tab === tab &&
                      r.store === store &&
                      r.date <= end &&
                      r.end >= date,
                  )
                )
                  return notify("Vigencia no válida o cobertura superpuesta.");
                settings.cover({ store, who, start: date, end });
                record(
                  `${store} → ${who} · ${dateText(date)} al ${dateText(end)}`,
                );
              }}
            >
              Confirmar vigencia
            </button>
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
          <>
            <h2>Cargas de datos externos</h2>
            <label>
              Fuente
              <select
                value={source}
                onChange={(e) => {
                  F(e.target.value);
                  P([]);
                }}
              >
                {[
                  "Dotación de personal",
                  "Inventario G8",
                  "Asistencia de Simi Escuela",
                  "Encuesta de satisfacción",
                  "Histórico de visitas",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Archivo CSV
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const lines = (await f.text()).trim().split(/\r?\n/).slice(1);
                  const valid = lines.filter(
                    (l) =>
                      stores.some((s) => s.id === l.split(/[,;]/)[0]) &&
                      l.split(/[,;]/)[1]?.trim(),
                  );
                  P(valid);
                  J(lines.length - valid.length);
                }}
              />
            </label>
            <small>
              Primera fila: encabezado. Columnas: código de farmacia y valor,
              separadas por coma o punto y coma.
            </small>
            <p>
              Vista previa · {preview.length} filas válidas · {reject}{" "}
              rechazadas
            </p>
            {preview.slice(0, 5).map((x, i) => (
              <small key={i}>{x}</small>
            ))}
            <button
              className="primary"
              disabled={!preview.length}
              onClick={() => {
                if (
                  source === "Histórico de visitas" &&
                  records.some((x) => x.text.startsWith(source))
                )
                  return notify("El histórico admite una sola carga.");
                record(
                  `${source}: ${preview.length} cargadas, ${reject} rechazadas`,
                );
                P([]);
                J(0);
              }}
            >
              Confirmar carga
            </button>
          </>
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
