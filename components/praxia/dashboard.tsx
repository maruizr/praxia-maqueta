"use client";
import {
  CalendarDays,
  Plus,
  ArrowUpRight,
  ArrowRight,
  ChevronRight,
  MapPin,
  Store,
  ClipboardCheck,
  Users,
  Clock3,
  Flag,
  UserRoundPlus,
  Layers,
  Sun,
  Video,
  ChartNoAxesCombined,
} from "lucide-react";
import {
  today,
  stores,
  dateText,
  status,
  type Visit,
  type Task,
  type Row,
} from "./data";
import { metrics } from "./records";
import { useSettings } from "./settings";
export function Spark({ i }: { i: number }) {
  return (
    <span className={"mini-bars tone" + i} aria-hidden>
      {[4, 6, 5, 8, 6, 9, 8, 11].map((h, j) => (
        <i key={j} style={{ height: h * 2 }} />
      ))}
    </span>
  );
}
export default function Dashboard({
  go,
  open,
  visit,
  visits,
  tasks,
  plan,
  first = "Camila",
}: {
  go: (s: string) => void;
  open: (s: string) => void;
  visit: () => void;
  visits: Visit[];
  tasks: Task[];
  plan: Row[];
  first?: string;
}) {
  const ctx = useSettings(),
    own = stores.filter((s) => ctx.owner(s.id) === "Camila Morales"),
    m = metrics(
      visits,
      own.map((s) => s.id),
    ),
    rows = plan.filter((p) => p.date === today),
    due = tasks.filter((t) => !t.closed && !t.cancelled && t.date <= today),
    red = own.filter(
      (s) => ctx.flags[s.id] || status(s, visits, tasks).p === 1,
    ).length,
    h = new Date().getHours();
  const stats = [
    [
      Store,
      "Cobertura de cartera",
      m.coverage + "%",
      `${m.covered} de ${own.length} farmacias`,
    ],
    [ClipboardCheck, "Gestiones del mes", m.count, "Gestiones registradas"],
    [Users, "Personas capacitadas", m.people, "Colaboradores este mes"],
    [
      Clock3,
      "Pendientes abiertos",
      tasks.filter((t) => !t.closed && !t.cancelled).length,
      `${due.length} requieren atención`,
    ],
  ] as const;
  return (
    <>
      <section className="hero">
        <div className="hero-art" />
        <div className="hero-copy">
          <div className="eyebrow hero-date">
            <Sun size={15} /> Tu jornada en terreno
          </div>
          <h1>
            {h < 12
              ? "Buenos días"
              : h < 20
                ? "Buenas tardes"
                : "Buenas noches"}
            , {first}
          </h1>
          <p>
            {new Date().toLocaleDateString("es-CL", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <button className="primary" onClick={visit}>
            <Plus size={17} /> Registrar gestión
          </button>
        </div>
      </section>
      <div className="section-title">
        <h2>Resumen del mes</h2>
        <span className="period">
          <CalendarDays size={14} />
          {new Date().toLocaleDateString("es-CL", {
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>
      <div className="metric-grid">
        {stats.map(([Icon, title, n, caption], i) => (
          <button
            key={title}
            className={"metric stat-" + i}
            onClick={() => go(i === 3 ? "Pendientes" : "Mi desempeño")}
          >
            <div className="metric-head">
              <i className={"tile c" + i}>
                <Icon size={18} />
              </i>
              <span>{title}</span>
            </div>
            <div className="metric-body">
              <strong>{n}</strong>
              {i === 0 ? (
                <span className="progress-rail">
                  <i style={{ width: m.coverage + "%" }} />
                </span>
              ) : null}
            </div>
            <small>{caption}</small>
          </button>
        ))}
      </div>
      <div className="dashboard-bottom">
        <section className="panel agenda">
          <div className="panel-heading">
            <div className="eyebrow">
              <span className="dot" /> Planificación
            </div>
            <div className="heading-line">
              <h2>
                Visitas de hoy <em>{rows.length}</em>
              </h2>
              <button className="text-btn" onClick={() => go("Plan del mes")}>
                Ver plan <ArrowRight size={14} />
              </button>
            </div>
          </div>
          {rows.map((r, i) => {
            const s = stores.find((s) => s.id === r.store)!;
            return (
              <button className="activity" key={i} onClick={() => open(s.id)}>
                <i className="activity-icon">
                  {r.mode === "Online" ? <Video /> : <Store />}
                </i>
                <div>
                  <small className="code">{s.id}</small>
                  <h3>{s.name}</h3>
                  <small className="location">
                    <MapPin size={12} />
                    {s.place}
                  </small>
                </div>
                <span
                  className={
                    "pill " + (r.mode === "Online" ? "violet" : "green")
                  }
                >
                  {r.mode}
                </span>
                <ChevronRight size={15} />
              </button>
            );
          })}
          {!rows.length && (
            <p className="empty">
              Sin visitas para hoy. Agrega una en el plan.
            </p>
          )}
        </section>
        <div className="right-stack">
          <section className="panel alerts">
            <div className="eyebrow">
              <span className="dot gold" /> Seguimiento
            </div>
            <h2>Requieren tu atención</h2>
            <button onClick={() => go("Pendientes")}>
              <i className="tile warm">
                <Clock3 size={18} />
              </i>
              <div>
                <strong>Pendientes por resolver</strong>
                <small>{due.length} vencidos o para hoy</small>
              </div>
              <ChevronRight size={16} />
            </button>
            <button onClick={() => go("Focos rojos")}>
              <i className="tile rose">
                <Flag size={18} />
              </i>
              <div>
                <strong>Farmacias en foco rojo</strong>
                <small>{red} necesitan una visita</small>
              </div>
              <ChevronRight size={16} />
            </button>
          </section>
          <button className="campaign" onClick={() => go("Campañas")}>
            <div className="campaign-lines" />
            <div className="eyebrow">
              <Layers size={14} /> Campaña vigente
            </div>
            <h2>
              Impulso G8 <ArrowUpRight size={18} />
            </h2>
            <p>Ver seguimiento de campaña</p>
          </button>
        </div>
      </div>
    </>
  );
}
