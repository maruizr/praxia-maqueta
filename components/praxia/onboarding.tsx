"use client";
import { useState } from "react";
import { stores, employees, today, dateText, type Visit } from "./data";
import { useSettings } from "./settings";
import { exportSheet } from "./sheets";
export const stages = [
  "Sesión intensiva",
  "Sesión presencial",
  "Sesión 1",
  "Sesión 2",
  "Sesión 3",
  "Sesión 4",
  "Sesión 5",
  "Evaluación final",
];
type Event = {
  stage: string;
  date: string;
  result: string;
  note: string;
  author: string;
};
export type Enrollment = {
  key: string;
  name: string;
  store: string;
  version: string;
  program: string[];
  events: Event[];
  moves: string[];
};
export const initialStudents: Enrollment[] = stores
  .filter((_, i) => i % 56 < 2)
  .map((s) => ({
    key: employees(s.id)[4].id,
    name: employees(s.id)[4].name,
    store: s.id,
    version: "NI · noviembre 2026",
    program: [...stages],
    events: [],
    moves: [],
  }));
export function Onboarding({
  who,
  admin,
  visits,
}: {
  who: string;
  admin: boolean;
  visits: Visit[];
}) {
  const settings = useSettings();
  const { students, setStudents } = settings;
  const [query, Q] = useState(""),
    [selected, S] = useState(""),
    [enroll, E] = useState(false),
    [store, F] = useState(""),
    [message, M] = useState("");
  const pharmacies = stores.filter(
    (s) => admin || settings.owner(s.id) === who,
  );
  const farm = store || pharmacies[0]?.id || "";
  const pending = visits.flatMap((v) =>
    v.actions.flatMap((a) =>
      a.persons.filter((p) => p.provisional && p.home === farm),
    ),
  );
  const candidates = [
    ...new Map(
      [...settings.roster(farm), ...pending].map((p) => [p.id, p]),
    ).values(),
  ].filter((p) => !students.some((s) => s.key === p.id));
  const scoped = students.filter(
    (s) => admin || settings.owner(s.store) === who,
  );
  const filtered = scoped.filter((s) =>
    (s.name + " " + s.key + " " + s.store)
      .toLocaleLowerCase("es-CL")
      .includes(query.toLocaleLowerCase("es-CL")),
  );
  const student = scoped.find((s) => s.key === selected);
  const progress = (s: Enrollment) =>
    s.program.filter((stage) =>
      s.events.some((e) => e.stage === stage && e.result === "Completada"),
    ).length;
  const done = (s: Enrollment) => progress(s) === s.program.length;
  const imported = settings.batches
    .filter((b) => b.source === "Cierre mensual de nuevos ingresos")
    .flatMap((b) => b.rows);
  const update = (s: Enrollment) =>
    setStudents(students.map((x) => (x.key === s.key ? s : x)));
  return (
    <>
      <div className="page-intro">
        <div className="eyebrow">Simi Escuela · Formación inicial</div>
        <h1>Nuevos ingresos</h1>
        <p>
          La inscripción abre el seguimiento. El programa se completa al aprobar
          sus ocho etapas.
        </p>
      </div>
      <section className="panel form-panel">
        <div className="heading-line">
          <h2>Seguimiento del programa</h2>
          <button className="primary" onClick={() => E(!enroll)}>
            {enroll ? "Cerrar inscripción" : "Inscribir colaborador"}
          </button>
        </div>
        <p>
          {scoped.length} inscritos · {scoped.filter(done).length} completos ·{" "}
          {scoped.filter((s) => !done(s)).length} en seguimiento
        </p>
        {enroll && (
          <form
            className="form-grid"
            onSubmit={(e) => {
              e.preventDefault();
              const p = candidates.find(
                (p) => p.id === new FormData(e.currentTarget).get("persona"),
              );
              if (!p) return;
              setStudents([
                ...students,
                {
                  key: p.id,
                  name: p.name,
                  store: farm,
                  version: "NI · noviembre 2026",
                  program: [...stages],
                  events: [],
                  moves: [],
                },
              ]);
              S(p.id);
              E(false);
              M("Inscripción registrada. El seguimiento está abierto.");
            }}
          >
            <label>
              Farmacia de inscripción
              <select value={farm} onChange={(e) => F(e.target.value)}>
                {pharmacies.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} · {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Colaborador
              <select name="persona" required key={farm}>
                <option value="">Selecciona un colaborador</option>
                {candidates.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.id}
                  </option>
                ))}
              </select>
            </label>
            <button className="secondary" disabled={!candidates.length}>
              Confirmar inscripción
            </button>
          </form>
        )}
        <label>
          Buscar alumno
          <input
            type="search"
            value={query}
            onChange={(e) => Q(e.target.value)}
            placeholder="Nombre, número o farmacia"
          />
        </label>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                {["Alumno", "Farmacia", "Etapas", "Estado"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.key}>
                  <td>
                    <button
                      className="text-btn"
                      onClick={() => {
                        S(s.key);
                        M("");
                      }}
                    >
                      {s.name}
                    </button>
                    <small>
                      {s.key.startsWith("prov:")
                        ? "Provisional · pendiente de validación"
                        : s.key}
                    </small>
                  </td>
                  <td>{s.store}</td>
                  <td>
                    {progress(s)} / {s.program.length}
                  </td>
                  <td>{done(s) ? "Completo" : "En seguimiento"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <p className="empty">Sin alumnos para esta búsqueda.</p>
          )}
        </div>
        <button
          className="secondary"
          disabled={!filtered.length}
          onClick={() =>
            exportSheet(
              "nuevos-ingresos",
              ["Alumno", "Farmacia", "Etapas", "Estado"],
              filtered.map((s) => [
                s.name,
                s.store,
                String(progress(s)),
                done(s) ? "Completo" : "En seguimiento",
              ]),
            )
          }
        >
          Exportar lista filtrada
        </button>
      </section>
      {student && (
        <section className="panel form-panel" key={student.key}>
          <div className="eyebrow">{student.version}</div>
          <h2>{student.name}</h2>
          <p>
            {student.store} · Responsable: {settings.owner(student.store)}
          </p>
          {!done(student) && (
            <form
              className="form-grid"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget),
                  get = (k: string) => String(f.get(k) || "").trim();
                if (
                  !student.program.includes(get("etapa")) ||
                  !get("fecha") ||
                  get("fecha") > today
                )
                  return;
                update({
                  ...student,
                  events: [
                    ...student.events,
                    {
                      stage: get("etapa"),
                      date: get("fecha"),
                      result: get("resultado"),
                      note: get("nota"),
                      author: who,
                    },
                  ],
                });
                M("Capacitación registrada. Se actualizó el avance.");
              }}
            >
              <label>
                Etapa
                <select name="etapa">
                  {student.program
                    .filter(
                      (stage) =>
                        !student.events.some(
                          (e) => e.stage === stage && e.result === "Completada",
                        ),
                    )
                    .map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                </select>
              </label>
              <label>
                Fecha de capacitación
                <input
                  required
                  type="date"
                  max={today}
                  defaultValue={today}
                  name="fecha"
                />
              </label>
              <label>
                Resultado
                <select name="resultado">
                  <option>Completada</option>
                  <option>Requiere refuerzo</option>
                  <option>No asistió</option>
                </select>
              </label>
              <label>
                Comentario
                <input name="nota" maxLength={400} />
              </label>
              <button className="primary">Registrar etapa</button>
            </form>
          )}
          {student.events.map((e, i) => (
            <p key={i}>
              {dateText(e.date)} · {e.stage} · {e.result} · {e.author}
              {e.note && " · " + e.note}
            </p>
          ))}
          {admin && (
            <details>
              <summary>Trasladar seguimiento</summary>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const dest = String(
                    new FormData(e.currentTarget).get("dest"),
                  );
                  if (dest !== student.store) {
                    update({
                      ...student,
                      store: dest,
                      moves: [
                        ...student.moves,
                        `${today} · ${student.store} → ${dest} · ${who}`,
                      ],
                    });
                    M("Traslado registrado sin perder el historial.");
                  }
                }}
              >
                <label>
                  Nueva farmacia
                  <select name="dest">
                    {stores
                      .filter((s) => s.id !== student.store)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.id} · {s.name}
                        </option>
                      ))}
                  </select>
                </label>
                <button className="secondary">Confirmar traslado</button>
              </form>
            </details>
          )}
          {student.moves.map((m, i) => (
            <small key={i}>{m}</small>
          ))}
        </section>
      )}
      {admin && (
        <section className="panel form-panel">
          <h2>Cierres mensuales importados</h2>
          <p>
            Fuente externa de contraste. Una carga no aprueba etapas
            individuales.
          </p>
          {imported
            .filter((r) =>
              r.join(" ").toLowerCase().includes(query.toLowerCase()),
            )
            .map((r, i) => (
              <p key={i}>{r.join(" · ")}</p>
            ))}
          {!imported.length && (
            <p className="empty">
              Sin cierres cargados. Usa Administración → Cargas externas.
            </p>
          )}
        </section>
      )}
      {message && <p role="status">{message}</p>}
    </>
  );
}
