"use client";
import { useState } from "react";
import {
  Plus,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  activities,
  status,
  today,
  stores,
  dateText,
  type Row,
  type Visit,
  type Task,
} from "./data";
export type Notice = { date: string; title: string; to: string; hotel: string };
export default function Planning({
  plan,
  setPlan,
  published,
  publish,
  visits,
  tasks,
  notices,
  open,
  notify,
}: {
  plan: Row[];
  setPlan: (r: Row[]) => void;
  published: boolean;
  publish: (v: boolean) => void;
  visits: Visit[];
  tasks: Task[];
  notices: Notice[];
  open: (id: string) => void;
  notify: (s: string) => void;
}) {
  const [week, W] = useState(false),
    [start, B] = useState(23),
    [tab, T] = useState("Actividades"),
    [add, A] = useState(false),
    [date, D] = useState(today),
    [store, S] = useState(stores[0].id),
    [mode, M] = useState("Presencial"),
    [type, Y] = useState(activities[0]),
    [rejected, J] = useState<string[]>([]),
    [reason, R] = useState("");
  const rows = plan.filter(
    (r) =>
      !week || (+r.date.slice(-2) >= start && +r.date.slice(-2) < start + 7),
  );
  const [editing, setEditing] = useState<Row | null>(null);
  function showForm(row: Row | null, suggestedStore = stores[0].id) {
    setEditing(row);
    D(row?.date ?? (suggestedStore === stores[0].id ? today : "2026-11-30"));
    S(row?.store ?? suggestedStore);
    M(row?.mode ?? "Presencial");
    Y(row?.type ?? activities[0]);
    T("Actividades");
    A(true);
    requestAnimationFrame(() => document.getElementById("plan-date")?.focus());
  }
  function save() {
    if (!date.startsWith("2026-11"))
      return notify("Selecciona una fecha de noviembre.");
    const remaining = plan.filter((r) => !editing || r.store !== editing.store || r.date !== editing.date);
    if (remaining.some((r) => r.store === store && r.date === date))
      return notify("Esta farmacia ya está planificada para esa fecha.");
    setPlan(
      [...remaining, { store, date, mode, type }].sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
    );
    publish(false);
    A(false);
    notify(editing ? "Actividad actualizada en el borrador." : "Actividad agregada al borrador.");
    setEditing(null);
  }
  return (
    <>
      <div className="page-intro">
        <div className="eyebrow">Mi planificación · Ruta 08</div>
        <div className="heading-line">
          <h1>Plan del mes</h1>
          <span className="pill green">
            {published ? "Publicado" : "Borrador"}
          </span>
        </div>
        <p>Noviembre 2026 · Campaña Impulso G8</p>
      </div>
      <section className="panel form-panel">
        <div className="heading-line">
          <h2>
            <CalendarDays size={20} /> Noviembre 2026
          </h2>
          <button className="primary" onClick={() => showForm(null)}>
            <Plus size={15} /> Actividad
          </button>
        </div>
        <p>
          {
            new Set(
              plan.filter((r) => r.mode === "Presencial").map((r) => r.store),
            ).size
          }{" "}
          farmacias presenciales ·{" "}
          {
            new Set(plan.filter((r) => r.mode === "Online").map((r) => r.store))
              .size
          }{" "}
          online
        </p>
        {add && (
          <div className="person form-stack">
            <h3>{editing ? "Editar actividad" : "Nueva actividad"}</h3>
            <div className="form-grid">
              <label>
                Fecha tentativa
                <input
                  id="plan-date"
                  type="date"
                  min="2026-11-01"
                  max="2026-11-30"
                  value={date}
                  onChange={(e) => D(e.target.value)}
                />
              </label>
              <label>
                Farmacia
                <select value={store} onChange={(e) => S(e.target.value)}>
                  {stores.map((s) => (
                    <option value={s.id} key={s.id}>
                      {s.name} · {s.id}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Modalidad
                <select value={mode} onChange={(e) => M(e.target.value)}>
                  <option>Presencial</option>
                  <option>Online</option>
                  <option>Otros</option>
                </select>
              </label>
              <label>
                Actividad
                <select value={type} onChange={(e) => Y(e.target.value)}>
                  {activities.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="actions">
              <button className="secondary" onClick={() => A(false)}>Cancelar</button>
              <button className="primary" onClick={save}>
                {editing ? "Guardar cambios" : "Guardar actividad"}
              </button>
            </div>
          </div>
        )}
        <div className="tabs">
          {["Actividades", "Sugerencias", "Consideraciones"].map((x) => (
            <button
              className={tab === x ? "selected" : ""}
              key={x}
              onClick={() => T(x)}
            >
              {x}
            </button>
          ))}
        </div>
        {tab === "Actividades" ? (
          <>
            <div className="inline">
              <button className="secondary" onClick={() => W(!week)}>
                {week ? "Ver mes completo" : "Ver semana"}
              </button>
              {week && (
                <>
                  <button
                    className="iconbtn"
                    disabled={start <= 2}
                    onClick={() => B(start - 7)}
                    aria-label="Semana anterior"
                  >
                    <ChevronLeft />
                  </button>
                  <small>
                    {start}–{Math.min(start + 6, 30)} nov.
                  </small>
                  <button
                    className="iconbtn"
                    disabled={start >= 30}
                    onClick={() => B(start + 7)}
                    aria-label="Semana siguiente"
                  >
                    <ChevronRight />
                  </button>
                </>
              )}
            </div>
            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    {[
                      "Fecha tentativa",
                      "Farmacia",
                      "Actividad",
                      "Modalidad",
                      "Supervisor / jefatura",
                      "Fecha real",
                      "Acción",
                    ].map((x) => (
                      <th key={x}>{x}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const s = stores.find((s) => s.id === r.store)!;
                    const v = visits.find(
                      (v) => v.store === s.id && v.date === r.date,
                    );
                    return (
                      <tr key={i}>
                        <td>{dateText(r.date)}</td>
                        <td>
                          <button
                            className="text-btn"
                            onClick={() => open(s.id)}
                          >
                            {s.name}
                          </button>
                          <small>{s.id}</small>
                        </td>
                        <td>{r.type}</td>
                        <td>{r.mode}</td>
                        <td>
                          {s.supervisor}
                          <small>{s.boss}</small>
                        </td>
                        <td>{v ? dateText(v.date) : "Sin registrar"}</td>
                        <td>{v ? "Registrada" : <button className="text-btn" aria-label={`Editar actividad de ${s.name} del ${dateText(r.date)}`} onClick={() => showForm(r)}>Editar</button>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {!rows.length && (
              <p className="empty">Sin actividades esta semana.</p>
            )}
            <div className="actions">
              <button
                className="secondary"
                onClick={() => {
                  publish(false);
                  notify("Plan guardado como borrador.");
                }}
              >
                Guardar borrador
              </button>
              <button
                className="primary"
                disabled={published}
                onClick={() => {
                  publish(true);
                  notify("Plan publicado para jefatura.");
                }}
              >
                <Check size={15} /> Publicar plan
              </button>
            </div>
          </>
        ) : tab === "Consideraciones" ? (
          notices.map((n, i) => (
            <div className="simple-row" key={i}>
              <div>
                <strong>{n.title}</strong>
                <small>
                  {dateText(n.date)} · {n.to}
                  {n.hotel
                    ? " · Hospedaje solicitado el " + dateText(n.hotel)
                    : ""}
                </small>
              </div>
            </div>
          ))
        ) : (
          <>
            <p>
              Sugerencias sin visita en los últimos 14 días, ordenadas por
              prioridad. Tú decides cuáles incorporar.
            </p>
            <label>
              Motivo para rechazar
              <input
                value={reason}
                onChange={(e) => R(e.target.value)}
                placeholder="Indica un motivo antes de rechazar"
              />
            </label>
            {stores
              .filter(
                (s) =>
                  [
                    s.last,
                    ...visits
                      .filter((v) => v.store === s.id)
                      .map((v) => v.date),
                  ]
                    .sort()
                    .at(-1)! < "2026-11-10" &&
                  !rejected.includes(s.id) &&
                  !plan.some((r) => r.store === s.id && r.date > today),
              )
              .sort(
                (a, b) =>
                  status(a, visits, tasks).p - status(b, visits, tasks).p,
              )
              .map((s) => (
                <div className="simple-row" key={s.id}>
                  <div>
                    <strong>{s.name}</strong>
                    <small>
                      P{status(s, visits, tasks).p} · {s.id}
                    </small>
                  </div>
                  <button
                    className="secondary"
                    onClick={() => {
                      if (!reason.trim())
                        return notify("Escribe el motivo del rechazo.");
                      J([...rejected, s.id]);
                      R("");
                    }}
                  >
                    Rechazar
                  </button>
                  <button
                    className="primary"
                    onClick={() => {
                      showForm(null, s.id);
                    }}
                  >
                    Aceptar
                  </button>
                </div>
              ))}
          </>
        )}
      </section>
    </>
  );
}
