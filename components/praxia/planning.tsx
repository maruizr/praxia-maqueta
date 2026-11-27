"use client";
import { useState } from "react";
import { Plus, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import {
  today,
  stores,
  dateText,
  type Visit,
  type Task,
  type Row,
} from "./data";
import { useSettings } from "./settings";
import { dateISO, useLocal } from "./local";
export type Notice = { date: string; title: string; to: string; hotel: string };
export default function Planning({
  plan,
  planner,
  setPlan,
  published,
  publish,
  visits,
  notices,
  open,
  notify,
}: {
  planner: string;
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
  const ctx = useSettings(),
    [week, W] = useState(false),
    [selected, S] = useState(today),
    [form, F] = useState(false);
  const [states, setStates] = useLocal<Record<string, boolean>>(
    "publicacion:" + planner,
    {},
  );
  const month = selected.slice(0, 7),
    isPublished = states[month] ?? (month === today.slice(0, 7) && published);
  const setPublished = (value: boolean) => {
    setStates({ ...states, [month]: value });
    if (month === today.slice(0, 7)) publish(value);
  };
  const d = new Date(selected + "T12:00:00"),
    first = new Date(d.getFullYear(), d.getMonth(), 1),
    start = new Date(week ? d : first);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const dates = Array.from(
      {
        length: week
          ? 7
          : Math.ceil(
              (((first.getDay() + 6) % 7) +
                new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()) /
                7,
            ) * 7,
      },
      (_, i) => {
        const x = new Date(start);
        x.setDate(x.getDate() + i);
        return dateISO(x);
      },
    ),
    owned = stores.filter((s) => ctx.owner(s.id) === planner);
  function shift(n: number) {
    const dt = new Date(d);
    if (week) dt.setDate(dt.getDate() + 7 * n);
    else {
      dt.setDate(1);
      dt.setMonth(dt.getMonth() + n);
    }
    S(dateISO(dt));
  }
  const done = (r: Row) =>
    visits.some(
      (v) =>
        !v.annulled && !v.attempt && v.store === r.store && v.date === r.date,
    );
  const monthRows = plan.filter((r) => r.date.startsWith(selected.slice(0, 7)));
  return (
    <div className="form-stack">
      <div className="page-intro">
        <div className="eyebrow">Planificación · {planner}</div>
        <h1>Plan del mes</h1>
        <p>Organiza tus visitas y revisa las actividades por regularizar.</p>
      </div>
      <section className="panel form-panel">
        <div className="heading-line">
          <h2>
            <CalendarDays size={20} />
            {d.toLocaleDateString("es-CL", { month: "long", year: "numeric" })}
          </h2>
          <span className="pill green">
            {isPublished ? "Publicado" : "Borrador"}
          </span>
        </div>
        <div className="heading-line">
          <div className="tabs">
            {["Mensual", "Semanal"].map((x, i) => (
              <button
                key={x}
                className={Number(week) === i ? "selected" : ""}
                onClick={() => W(!!i)}
              >
                {x}
              </button>
            ))}
          </div>
          <div className="table-tools">
            <button
              aria-label="Período anterior"
              className="iconbtn"
              onClick={() => shift(-1)}
            >
              <ChevronLeft />
            </button>
            <button className="text-btn" onClick={() => S(today)}>
              Hoy
            </button>
            <button
              aria-label="Período siguiente"
              className="iconbtn"
              onClick={() => shift(1)}
            >
              <ChevronRight />
            </button>
          </div>
        </div>
        <div className="calendar">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((x) => (
            <b key={x}>{x}</b>
          ))}
          {dates.map((x) => (
            <button
              className={selected === x ? "with-session" : ""}
              key={x}
              onClick={() => S(x)}
            >
              {Number(x.slice(-2))}
              <small>
                {plan.filter((r) => r.date === x).length || ""}{" "}
                {plan.some((r) => r.date === x) ? "activ." : ""}
              </small>
            </button>
          ))}
        </div>
        <small>
          {monthRows.filter(done).length} cumplidas de {monthRows.length}{" "}
          planificadas este mes
        </small>
        <div className="heading-line">
          <h3>{dateText(selected)}</h3>
          <button className="secondary" onClick={() => F(!form)}>
            <Plus size={15} /> Actividad
          </button>
        </div>
        {form && (
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget),
                r = {
                  store: String(f.get("store")),
                  date: selected,
                  mode: String(f.get("mode")),
                  type: String(f.get("type")),
                };
              if (
                plan.some(
                  (x) =>
                    x.store === r.store &&
                    x.date === r.date &&
                    x.type === r.type,
                )
              )
                return notify("Esta actividad ya está planificada.");
              setPlan([...plan, r]);
              setPublished(false);
              F(false);
              notify("Actividad agregada al borrador.");
            }}
          >
            <label>
              Actividad
              <select name="type">
                <option>Visita general</option>
                <option>Trabajo administrativo</option>
                <option>Capacitación</option>
              </select>
            </label>
            <label>
              Farmacia
              <select required name="store">
                {owned.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} · {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Modalidad
              <select name="mode">
                <option>Presencial</option>
                <option>Online</option>
              </select>
            </label>
            <button className="primary">Guardar actividad</button>
          </form>
        )}
        {plan
          .filter((r) => r.date === selected)
          .map((r, i) => (
            <button
              className="simple-row"
              onClick={() => open(r.store)}
              key={i}
            >
              <div>
                <strong>{stores.find((s) => s.id === r.store)?.name}</strong>
                <small>
                  {r.type} · {r.mode}
                </small>
              </div>
              <span className="pill green">
                {done(r)
                  ? "Cumplida"
                  : r.date < today
                    ? "Por regularizar"
                    : "Planificada"}
              </span>
            </button>
          ))}
        {!plan.some((r) => r.date === selected) && (
          <p className="empty">
            No hay actividades para este día. Agrega una actividad.
          </p>
        )}
        {!isPublished && (
          <button
            className="primary"
            onClick={() => {
              setPublished(true);
              notify("Plan publicado.");
            }}
          >
            Publicar plan
          </button>
        )}
      </section>
      <section className="panel form-panel">
        <h2>Consideraciones de jefatura</h2>
        {notices.length ? (
          notices.map((n, i) => (
            <p key={i}>
              {n.title} · {dateText(n.date)}
            </p>
          ))
        ) : (
          <small>No hay consideraciones para este plan.</small>
        )}
      </section>
    </div>
  );
}
