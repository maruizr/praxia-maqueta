"use client";
import { useState } from "react";
import { stores, today, dateText, employees, team } from "./data";
import { useLocal, shifted } from "./local";
import { useSettings } from "./settings";
import { ImportPanel } from "./import-panel";
import { Contests } from "./contests";
export function Intro({
  label = "Desarrollo del equipo",
  title,
  desc,
}: {
  label?: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="page-intro">
      <div className="eyebrow">{label}</div>
      <h1>{title}</h1>
      <p>{desc}</p>
    </div>
  );
}
export function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | number)[][];
}) {
  return rows.length ? (
    <div className="tabular">
      <table>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((v, j) => (
                <td key={j}>{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <p className="empty">
      Sin registros. Revisa los filtros o agrega el primer registro.
    </p>
  );
}
export const storeOptions = stores.map((s) => (
  <option key={s.id} value={s.id}>
    {s.id} · {s.name}
  </option>
));
export const teamOptions = team.map((s) => <option key={s}>{s}</option>);
export function Training({
  who,
  admin,
  announce,
}: {
  who: string;
  admin: boolean;
  announce: (text: string, to: string) => void;
}) {
  const ctx = useSettings();
  type Student = {
    id: string;
    name: string;
    store: string;
    date: string;
    courses: { name: string; date: string; result: string }[];
  };
  const [students, S] = useLocal<Student[]>(
      "alumnos",
      stores
        .slice(0, 4)
        .map((s, i) => ({
          id: employees(s.id)[0].id,
          name: employees(s.id)[0].name,
          store: s.id,
          date: shifted(-i * 6),
          courses: [],
        })),
    ),
    [closed, C] = useLocal<
      { month: string; total: number; complete: number }[]
    >("cierres", []),
    [q, Q] = useState(""),
    [enrol, E] = useState(false),
    [store, K] = useState(stores[0].id);
  const imported = ctx.batches
    .filter((b) => b.source === "Nuevos ingresos")
    .flatMap((b) =>
      b.rows.map(
        ([store, n, name, date]) =>
          ({ store, id: store + "-" + n, name, date, courses: [] }) as Student,
      ),
    );
  const all = Array.from(
    new Map([...imported, ...students].map((s) => [s.id, s])).values(),
  ).filter((s) => admin || ctx.owner(s.store) === who);
  const courses = ["Inducción comercial", "Productos y categorías"];
  const state = (s: Student) => {
    const until = new Date(s.date + "T12:00");
    until.setMonth(until.getMonth() + 4);
    return courses.every((c) =>
      s.courses.some((r) => r.name === c && r.result === "Aprobado"),
    )
      ? "Completado"
      : new Date(today + "T12:00") > until
        ? "Plazo cumplido"
        : "En formación";
  };
  return (
    <div className="form-stack">
      <Intro
        title="Nuevos ingresos"
        desc="Acompaña a cada colaborador desde su inscripción hasta el cierre de su formación."
      />
      <section className="panel form-panel">
        <div className="heading-line">
          <h2>Seguimiento de alumnos</h2>
          <button className="primary" onClick={() => E(!enrol)}>
            Inscribir colaborador
          </button>
        </div>
        {enrol && (
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget),
                id = String(f.get("person")),
                p = ctx.roster(store).find((p) => p.id === id);
              if (!p) return;
              S([
                ...students,
                {
                  id,
                  name: p.name,
                  store,
                  date: String(f.get("date")),
                  courses: [],
                },
              ]);
              announce(
                "Nuevo ingreso: " + p.name + " · " + store,
                ctx.owner(store),
              );
              E(false);
            }}
          >
            <label>
              Farmacia
              <select value={store} onChange={(e) => K(e.target.value)}>
                {stores
                  .filter((s) => admin || ctx.owner(s.id) === who)
                  .map((s) => (
                    <option value={s.id} key={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Colaborador
              <select required name="person">
                <option value="">Selecciona una persona</option>
                {ctx
                  .roster(store)
                  .filter((p) => !all.some((s) => s.id === p.id))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Fecha de ingreso
              <input
                name="date"
                required
                type="date"
                max={today}
                defaultValue={today}
              />
            </label>
            <button className="primary">Confirmar inscripción</button>
          </form>
        )}
        <label>
          Buscar por alumno
          <input
            value={q}
            onChange={(e) => Q(e.target.value)}
            placeholder="Nombre o número de empleado"
          />
        </label>
        {all
          .filter((s) =>
            (s.id + s.name).toLowerCase().includes(q.toLowerCase()),
          )
          .map((s) => (
            <details key={s.id}>
              <summary>
                {s.name} · {s.store} · {state(s)}
              </summary>
              <p>
                Ingreso: {dateText(s.date)} · {s.id}
              </p>
              <Table
                headers={["Curso", "Fecha", "Resultado"]}
                rows={s.courses.map((c) => [c.name, c.date, c.result])}
              />
              {state(s) === "En formación" && (
                <form
                  className="form-stack"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    S([
                      ...students.filter((x) => x.id !== s.id),
                      {
                        ...s,
                        courses: [
                          ...s.courses,
                          {
                            name: String(f.get("course")),
                            date: String(f.get("date")),
                            result: String(f.get("result")),
                          },
                        ],
                      },
                    ]);
                  }}
                >
                  <div className="form-grid">
                    <label>
                      Curso
                      <select name="course">
                        {courses.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Fecha
                      <input
                        required
                        type="date"
                        name="date"
                        min={s.date}
                        max={today}
                        defaultValue={today}
                      />
                    </label>
                    <label>
                      Resultado
                      <select required name="result">
                        <option value="">Selecciona</option>
                        <option>Aprobado</option>
                        <option>Requiere seguimiento</option>
                      </select>
                    </label>
                  </div>
                  <button className="secondary">Registrar capacitación</button>
                </form>
              )}
            </details>
          ))}
        {!all.some((s) =>
          (s.id + s.name).toLowerCase().includes(q.toLowerCase()),
        ) && <p className="empty">No hay alumnos que coincidan.</p>}
      </section>
      {ctx.permission(who, "Análisis y carga de nuevos ingresos") && (
        <section className="panel form-panel">
          <ImportPanel sources={["Nuevos ingresos"]} />
        </section>
      )}
      {ctx.permission(who, "Cierre mensual de nuevos ingresos") && (
        <section className="panel form-panel">
          <h2>Cierre mensual</h2>
          <small>
            {all.length} alumnos ·{" "}
            {all.filter((s) => state(s) === "Completado").length} completados ·{" "}
            {all.filter((s) => state(s) === "En formación").length} pendientes
          </small>
          <button
            className="secondary"
            disabled={closed.some((x) => x.month === today.slice(0, 7))}
            onClick={() =>
              C([
                ...closed,
                {
                  month: today.slice(0, 7),
                  total: all.length,
                  complete: all.filter((s) => state(s) === "Completado").length,
                },
              ])
            }
          >
            Confirmar cierre mensual
          </button>
          {closed.map((c) => (
            <p key={c.month}>
              {c.month} · Cobertura{" "}
              {Math.round((100 * c.complete) / (c.total || 1))}% ·{" "}
              {c.total - c.complete} sin completar
            </p>
          ))}
        </section>
      )}
    </div>
  );
}
export function Commercial({
  page,
  who,
  admin,
}: {
  page: string;
  who: string;
  admin: boolean;
}) {
  const ctx = useSettings();
  const [campaigns, C] = useLocal("campanas", [
      {
        name: "Impulso G8",
        sku: "G8001",
        product: "Vitamina C G8",
        start: shifted(-14),
        end: shifted(14),
      },
      {
        name: "Bienestar diario",
        sku: "G8002",
        product: "Magnesio G8",
        start: shifted(-60),
        end: shifted(-30),
      },
    ]),
    [sel, S] = useState(0),
    [q, Q] = useState("");
  const campaign = campaigns[sel] ?? campaigns[0];
  if (page === "Concursos")
    return (
      <>
        <Intro
          title={page}
          desc="Consulta las reglas, los resultados y el historial de cada concurso."
        />
        <Contests
          items={ctx.contests}
          set={ctx.setContests}
          admin={admin}
          who={who}
        />
        <section className="panel form-panel">
          <h2>Resultados por farmacia</h2>
          <Table
            headers={["Concurso", "Farmacia", "Fecha", "Resultado"]}
            rows={[
              [
                ctx.contests[0]?.name ?? "Impulso G8",
                stores[0].id,
                today,
                "24 %",
              ],
              ...ctx.batches
                .filter((b) => b.source === "Concursos")
                .flatMap((b) => b.rows),
            ]}
          />
        </section>
      </>
    );
  if (page === "Encuestas")
    return (
      <div className="form-stack">
        <Intro
          title="Encuestas de satisfacción"
          desc="Consulta los resultados que dejó el equipo después de sus capacitaciones."
        />
        <section className="panel form-panel">
          {ctx.permission(who, "Carga manual de encuestas de satisfacción") && (
            <details>
              <summary>Cargar resultado manual</summary>
              <form
                className="form-stack"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  ctx.commitBatch({
                    source: "Encuesta de satisfacción",
                    rows: [
                      ["who", "month", "score", "comment"].map((k) =>
                        String(f.get(k)),
                      ),
                    ],
                    errors: [],
                    filename: "Carga manual",
                  });
                  e.currentTarget.reset();
                }}
              >
                <label>
                  Nutricionista<select name="who">{teamOptions}</select>
                </label>
                <label>
                  Mes
                  <input
                    required
                    type="month"
                    name="month"
                    max={today.slice(0, 7)}
                    defaultValue={today.slice(0, 7)}
                  />
                </label>
                <label>
                  Puntaje (1 a 5)
                  <input required min="1" max="5" type="number" name="score" />
                </label>
                <label>
                  Comentario
                  <textarea required name="comment" />
                </label>
                <button className="primary">Guardar resultado</button>
              </form>
            </details>
          )}
          <Table
            headers={["Nutricionista", "Mes", "Puntaje", "Comentario"]}
            rows={[
              [
                team[0],
                today.slice(0, 7),
                "5",
                "Me sirvió practicar con ejemplos de la farmacia.",
              ],
              ...ctx.batches
                .filter((b) => b.source === "Encuesta de satisfacción")
                .flatMap((b) => b.rows),
            ].filter((r) => admin || r[0] === who)}
          />
        </section>
      </div>
    );
  const sales = [
    ...campaigns.slice(0, 2).flatMap((c, i) =>
      [
        [-70, 58],
        [-40, 91],
        [-18, 63],
        [-5, 103],
      ].map(([days, n]) => [
        c.sku,
        c.name,
        shifted(days),
        String(n + i * 5),
        String(n * 4800),
        String(n * 36000),
      ]),
    ),
    ...ctx.batches
      .filter((b) => b.source === "Campañas")
      .flatMap((b) => b.rows),
  ];
  return (
    <div className="form-stack">
      <Intro
        title="Seguimiento de campañas"
        desc="Compara las ventas por producto y período de activación."
      />
      <section className="panel form-panel">
        <label>
          Campaña
          <select value={sel} onChange={(e) => S(+e.target.value)}>
            {campaigns.map((c, i) => (
              <option key={i} value={i}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <h2>{campaign.name}</h2>
        <p>
          {campaign.product} · SKU {campaign.sku} · {dateText(campaign.start)}{" "}
          al {dateText(campaign.end)}
        </p>
        <Table
          headers={["Período", "Piezas", "Monto acumulado", "Participación"]}
          rows={["Antes", "Durante", "Después"].map((label, i) => {
            const r = sales.filter(
                (r) =>
                  campaign.sku
                    .split(",")
                    .map((x) => x.trim())
                    .includes(r[0]) &&
                  r[1].toLowerCase() === campaign.name.toLowerCase() &&
                  (r[2] < campaign.start ? 0 : r[2] > campaign.end ? 2 : 1) ===
                    i,
              ),
              sum = (j: number) => r.reduce((n, x) => n + Number(x[j]), 0);
            return [
              label,
              r.length ? sum(3) : "Sin datos",
              r.length
                ? new Intl.NumberFormat("es-CL", {
                    style: "currency",
                    currency: "CLP",
                  }).format(sum(4))
                : "—",
              sum(5) ? ((100 * sum(4)) / sum(5)).toFixed(1) + " %" : "—",
            ];
          })}
        />
        {ctx.permission(who, "Ver ventas nominativas") && (
          <details>
            <summary>Ver ventas nominativas · muestra ficticia</summary>
            <Table
              headers={["Colaborador", "Farmacia", "SKU", "Piezas"]}
              rows={employees(stores[0].id)
                .slice(0, 3)
                .map((p, i) => [p.name, stores[0].id, campaign.sku, 8 + i * 2])}
            />
          </details>
        )}
        <small>
          Comparación descriptiva. Las diferencias entre períodos no demuestran
          que la campaña haya causado el cambio.
        </small>
        {admin && (
          <details>
            <summary>Crear campaña</summary>
            <form
              className="form-stack"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget),
                  start = String(f.get("start")),
                  end = String(f.get("end"));
                if (end < start) {
                  Q("El término debe ser posterior al inicio.");
                  return;
                }
                C([
                  ...campaigns,
                  {
                    name: String(f.get("name")),
                    sku: String(f.get("sku")),
                    product: String(f.get("product")),
                    start,
                    end,
                  },
                ]);
                Q("Campaña creada.");
                S(campaigns.length);
              }}
            >
              {[
                ["name", "Nombre"],
                ["sku", "SKU (separados por coma)"],
                ["product", "Productos incluidos"],
                ["start", "Inicio"],
                ["end", "Término"],
              ].map(([k, l]) => (
                <label key={k}>
                  {l}
                  <input
                    required
                    name={k}
                    type={["start", "end"].includes(k) ? "date" : "text"}
                  />
                </label>
              ))}
              <button className="primary">Crear campaña</button>
              {q && <p role="status">{q}</p>}
            </form>
          </details>
        )}
      </section>
    </div>
  );
}
