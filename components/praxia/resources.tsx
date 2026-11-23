"use client";
import { useState } from "react";
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
  edit,
}: {
  page: string;
  visits: Visit[];
  open: (id: string) => void;
  sessions: Session[];
  setSessions: (s: Session[]) => void;
  edit: boolean;
}) {
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
            .filter((s) => s.last.startsWith("2026-11"))
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
      ["Días en terreno", 12, 18, 11],
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
  const inv = page === "Inventario G8";
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
      {!inv && (
        <section className="campaign large">
          <div className="eyebrow">
            Concurso vigente · Hasta el 30 de noviembre
          </div>
          <h2>Impulso G8</h2>
          <p>
            Meta de campaña: alcanzar un 25 % de participación en productos G8.
          </p>
        </section>
      )}
      <section className="panel form-panel">
        <div className="heading-line">
          <h2>{inv ? "Alertas de inventario" : "Ventas por farmacia"}</h2>
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
              {stores.slice(0, inv ? 12 : 56).map((s, i) => {
                const state = i % 3 ? "Stock bajo" : "Quiebre";
                if (inv && filter !== "Todos" && filter !== state) return null;
                return (
                  <tr key={s.id}>
                    <td>
                      <button className="text-btn" onClick={() => open(s.id)}>
                        {s.name}
                      </button>
                      <small>{s.id}</small>
                    </td>
                    <td>
                      {inv
                        ? ["Vitamina C G8", "Magnesio G8", "Omega 3 G8"][i % 3]
                        : "$" + (1890000 + i * 32789).toLocaleString("es-CL")}
                    </td>
                    <td>{inv ? i % 3 : 65 + (i % 22) + " %"}</td>
                    <td>
                      <span
                        className={
                          "pill " + (inv && i % 3 === 0 ? "red" : "green")
                        }
                      >
                        {inv ? state : 19 + (i % 9) + " %"}
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
