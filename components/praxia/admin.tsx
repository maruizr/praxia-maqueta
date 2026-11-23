"use client";
import { useState } from "react";
import { stores, today, dateText, team, type Row } from "./data";

const specs: Record<string, { cols: string[]; store: boolean }> = {
  "Dotación de personal": {
    cols: ["ID farmacia", "Nombre farmacia", "N° empleado", "Nombre", "Cargo"],
    store: true,
  },
  "Inventario G8": {
    cols: ["ID farmacia", "CveProducto", "Producto", "Unidades"],
    store: true,
  },
  "Asistencia de Simi Escuela": {
    cols: ["ID farmacia", "N° empleado", "Nombre", "Sesión", "Asistencia"],
    store: true,
  },
  "Encuesta de satisfacción": {
    cols: [
      "Marca temporal",
      "Nutricionista",
      "Tipo de capacitación",
      "Valoración general",
      "Comentario",
    ],
    store: false,
  },
  "Histórico de visitas": {
    cols: [
      "Fecha",
      "# Farmacia",
      "Nombre farmacia",
      "¿Quién visitó?",
      "Modalidad",
      "Persona, N° empleado y temas (hasta 4)",
      "Observaciones",
    ],
    store: false,
  },
};
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
    [upload, Q] = useState(false),
    [sub, B] = useState("Borrador quincenal"),
    [draft, X] = useState<Record<string, string>>({}),
    [from, Y] = useState("2026-12-01"),
    [simulated, M] = useState(false),
    [grants, G] = useState<Record<string, boolean>>({});
  function record(text: string) {
    R([...records, { tab, text, store, date, end }]);
    notify("Registro confirmado.");
  }
  const users = team;
  const owner = (id: string) => draft[id] ?? team[0];
  const moved = stores.filter((s) => owner(s.id) !== team[0]);
  const orphan = moved.filter((s) => owner(s.id) === "Sin responsable");
  const load = team.map(
    (u, i) =>
      [56, 62, 58][i] +
      (i === 0 ? -moved.length : moved.filter((s) => owner(s.id) === u).length),
  );
  const affected = plan.filter(
    (r) => r.date >= from && moved.some((s) => s.id === r.store),
  ).length;
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
              ? ["Cargas externas", "Permisos"]
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
                      <td>{[56, 62, 58][i]}</td>
                      <td>{[36, 62, 55][i]} %</td>
                      <td>{[4, 3, 5][i]}</td>
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
                  Cartera de {team[0]} · Ruta 08. Cambia la responsable de las
                  farmacias que se redistribuyen.
                </p>
                <div className="form-grid">
                  {team.map((u, i) => (
                    <div key={u} className="simple-row">
                      <div>
                        <strong>{u}</strong>
                        <small>
                          {[56, 62, 58][i]} → {load[i]} farmacias
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
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
                      {stores.slice(0, 16).map((s) => (
                        <tr key={s.id}>
                          <td>
                            {s.id} · {s.name}
                          </td>
                          <td>{s.zone}</td>
                          <td>{s.supervisor}</td>
                          <td>
                            <select
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
                <button
                  className="primary"
                  disabled={!moved.length || orphan.length > 0 || !from}
                  onClick={() => {
                    if (from < today)
                      return notify("La vigencia no puede ser anterior a hoy.");
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
                      (r) =>
                        r.store === store && r.date >= date && r.date <= end,
                    ).length
                  }{" "}
                  visitas futuras afectadas · Responsable: {who}
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
                      return notify(
                        "Vigencia no válida o cobertura superpuesta.",
                      );
                    record(
                      `${store} → ${who} · ${dateText(date)} al ${dateText(end)}`,
                    );
                  }}
                >
                  Confirmar cobertura
                </button>
              </>
            )}
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
            <p>
              Los asigna el encargado del alta administrativa y pueden cambiar
              en cualquier momento.
            </p>
            {team.map((u) => (
              <div className="simple-row" key={u}>
                <div>
                  <strong>{u}</strong>
                  <small>Nutricionista</small>
                </div>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={u === team[0] ? permission : !!grants[u + "cal"]}
                    onChange={(e) =>
                      u === team[0]
                        ? permit(e.target.checked)
                        : G({ ...grants, [u + "cal"]: e.target.checked })
                    }
                  />{" "}
                  Editar calendario de Simi Escuela
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={u === team[0] ? upload : !!grants[u + "pub"]}
                    onChange={(e) =>
                      u === team[0]
                        ? Q(e.target.checked)
                        : G({ ...grants, [u + "pub"]: e.target.checked })
                    }
                  />{" "}
                  Cargar publicidad del mes
                </label>
              </div>
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
                  J(0);
                  M(false);
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
              Archivo Excel o CSV
              <input
                type="file"
                accept=".xlsx,.xls,.csv,text/csv"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const spec = specs[source];
                  if (!f.name.toLowerCase().endsWith(".csv")) {
                    // La maqueta no lee Excel: simula la validación.
                    const n = Math.max(12, Math.round(f.size / 180));
                    const bad = Math.round(n * 0.03);
                    P(
                      Array.from(
                        { length: n - bad },
                        (_, i) => `Fila ${i + 2} · ${spec.cols.join(" · ")}`,
                      ),
                    );
                    J(bad);
                    M(true);
                    return;
                  }
                  const lines = (await f.text()).trim().split(/\r?\n/).slice(1);
                  const valid = lines.filter((l) => {
                    const c = l.split(/[,;]/);
                    return (
                      c.length >= spec.cols.length - 1 &&
                      c[0]?.trim() &&
                      (!spec.store || stores.some((s) => s.id === c[0].trim()))
                    );
                  });
                  P(valid);
                  J(lines.length - valid.length);
                  M(false);
                }}
              />
            </label>
            <small>
              Columnas esperadas: {specs[source].cols.join(" · ")}.
              {specs[source].store &&
                " Las filas con un código de farmacia que no existe se rechazan."}
            </small>
            <p>
              Vista previa{simulated ? " simulada" : ""} · {preview.length}{" "}
              filas válidas · {reject} rechazadas
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
