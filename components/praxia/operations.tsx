"use client";
import { useState } from "react";
import { useSettings } from "./settings";
import { useLocal, permissions, shifted } from "./local";
import {
  stores,
  team,
  today,
  status,
  type Visit,
  type Task,
  type MonthlyPlan,
} from "./data";
import { Intro, Table, storeOptions, teamOptions } from "./programs";
import { metrics } from "./records";
import { ImportPanel } from "./import-panel";
import { exportSheet } from "./sheets";
export function Operations({
  page,
  who,
  admin,
  visits,
  tasks,
  plans,
  consider,
  announce,
}: {
  page: string;
  who: string;
  admin: boolean;
  visits: Visit[];
  tasks: Task[];
  plans: Record<string, MonthlyPlan>;
  consider: (to: string, title: string) => void;
  announce: (text: string, to: string) => void;
}) {
  const ctx = useSettings(),
    [person, P] = useState(team[0]),
    [store, S] = useState(stores[0].id),
    [feedback, M] = useState(""),
    [temp, T] = useState(false),
    [trips, V] = useLocal("viajes", [
      {
        id: "viaje-demo",
        who: team[0],
        place: "Valparaíso",
        date: shifted(7),
        state: "Solicitada",
        reason: "",
      },
    ]);
  const idList = (name: string) =>
    stores.filter((s) => ctx.owner(s.id) === name).map((s) => s.id);
  const headers = [
    "Nutricionista",
    "Cartera",
    "Cobertura",
    "Focos rojos",
    "Plan",
  ];
  const teamRows = team.map((n) => {
    const ids = idList(n),
      v = visits.filter((x) => x.author === n),
      m = metrics(v, ids);
    return [
      n,
      ids.length,
      m.coverage + " %",
      ids.filter(
        (id) =>
          ctx.flags[id] ||
          status(stores.find((s) => s.id === id)!, v, tasks).p === 1,
      ).length,
      plans[n]?.published ? "Publicado" : "Borrador",
    ];
  });
  const title = page === "Viajes" ? "Solicitudes de viaje" : page;
  return (
    <div className="form-stack">
      <Intro
        label={admin ? "Administración" : "Mi espacio"}
        title={title}
        desc={
          page === "Revisión del equipo"
            ? "Revisa la cobertura y las prioridades de cada nutricionista."
            : "Consulta los registros y administra sus cambios."
        }
      />
      <section className="panel form-panel">
        {page === "Revisión del equipo" ? (
          <>
            <Table headers={headers} rows={teamRows} />
            <label>
              Detalle de la nutricionista
              <select value={person} onChange={(e) => P(e.target.value)}>
                {teamOptions}
              </select>
            </label>
            <p>
              {person} · {idList(person).length} farmacias ·{" "}
              {plans[person].rows.length} actividades en su plan
            </p>
            <details>
              <summary>Ver cartera y focos rojos</summary>
              {idList(person).map((id) => (
                <p key={id}>
                  {id} · {stores.find((s) => s.id === id)?.name} · P
                  {status(stores.find((s) => s.id === id)!, visits, tasks).p}
                </p>
              ))}
            </details>
            <form
              className="form-stack"
              onSubmit={(e) => {
                e.preventDefault();
                const t = String(
                  new FormData(e.currentTarget).get("note"),
                ).trim();
                if (t) {
                  consider(person, t);
                  M("Consideración agregada al plan.");
                  e.currentTarget.reset();
                }
              }}
            >
              <label>
                Consideración para el plan
                <textarea required name="note" />
              </label>
              <button className="primary">Dejar consideración</button>
            </form>
          </>
        ) : page === "Carteras" ? (
          <>
            <h2>Asignación y cobertura temporal</h2>
            <form
              className="form-stack"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget),
                  start = String(f.get("start")) + (temp ? "" : "-01"),
                  end = temp ? String(f.get("end")) : start.slice(0, 7) + "-31";
                if (end < start) return M("Revisa la fecha de término.");
                if (
                  temp &&
                  ctx.covers.some(
                    (c) =>
                      c.store === store &&
                      c.temporary &&
                      c.start <= end &&
                      c.end >= start,
                  )
                )
                  return M("Ya existe una cobertura en ese período.");
                ctx.cover([
                  {
                    store,
                    who: person,
                    start,
                    end,
                    reason: String(f.get("reason")),
                    temporary: temp,
                  },
                ]);
                M(
                  temp
                    ? "Cobertura temporal creada."
                    : "Asignación mensual actualizada.",
                );
              }}
            >
              <label>
                Farmacia
                <select value={store} onChange={(e) => S(e.target.value)}>
                  {storeOptions}
                </select>
              </label>
              <small>Encargada actual: {ctx.owner(store)}</small>
              <label>
                Operación
                <select
                  value={temp ? "Temporal" : "Asignación"}
                  onChange={(e) => T(e.target.value === "Temporal")}
                >
                  <option value="Asignación">
                    Asignar o traspasar cartera
                  </option>
                  <option value="Temporal">Cobertura temporal</option>
                </select>
              </label>
              <label>
                Nutricionista
                <select value={person} onChange={(e) => P(e.target.value)}>
                  {teamOptions}
                </select>
              </label>
              <label>
                {temp ? "Fecha de inicio" : "Mes de vigencia"}
                <input
                  key={String(temp)}
                  required
                  name="start"
                  type={temp ? "date" : "month"}
                  defaultValue={temp ? today : today.slice(0, 7)}
                />
              </label>
              {temp && (
                <label>
                  Fecha de término
                  <input required type="date" name="end" />
                </label>
              )}
              <label>
                Justificación
                <textarea required name="reason" />
              </label>
              <button className="primary">Confirmar asignación</button>
            </form>
            <h3>Historial</h3>
            <Table
              headers={[
                "Farmacia",
                "Responsable",
                "Inicio",
                "Término",
                "Justificación",
              ]}
              rows={ctx.covers.map((r) => [
                r.store,
                r.who,
                r.start,
                r.end,
                r.reason ?? "",
              ])}
            />
          </>
        ) : page === "Dotación" ? (
          <>
            <label>
              Farmacia
              <select value={store} onChange={(e) => S(e.target.value)}>
                {storeOptions}
              </select>
            </label>
            {ctx.allStaff(store).map((p) => (
              <details key={p.id}>
                <summary>
                  {p.name} ·{" "}
                  {p.provisional
                    ? "Provisorio"
                    : p.inactive
                      ? "Inactivo"
                      : "Activo"}
                </summary>
                <p>
                  {p.id} · {p.job} · {p.note}
                </p>
                {p.provisional && (
                  <button
                    className="secondary"
                    onClick={() =>
                      ctx.staffUpdate({ ...p, provisional: false })
                    }
                  >
                    Confirmar conciliación
                  </button>
                )}
                {!p.inactive && (
                  <form
                    className="form-stack"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      ctx.staffUpdate({
                        ...p,
                        inactive: String(f.get("date")),
                        note: String(f.get("note")),
                      });
                    }}
                  >
                    <label>
                      Fecha de baja
                      <input
                        type="date"
                        required
                        max={today}
                        defaultValue={today}
                        name="date"
                      />
                    </label>
                    <label>
                      Motivo de la baja
                      <input required name="note" />
                    </label>
                    <button className="secondary">Confirmar baja</button>
                  </form>
                )}
              </details>
            ))}
            <details>
              <summary>Agregar colaborador provisorio</summary>
              <form
                className="form-stack"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget),
                    id = store + "-" + String(f.get("n"));
                  if (ctx.allStaff(store).some((x) => x.id === id))
                    return M("El número de empleado ya existe.");
                  ctx.staffUpdate({
                    id,
                    name: String(f.get("name")),
                    job: String(f.get("job")),
                    provisional: true,
                  });
                  e.currentTarget.reset();
                  M("Colaborador provisorio agregado.");
                }}
              >
                <label>
                  Número de empleado
                  <input required pattern="[0-9]+" name="n" />
                </label>
                <label>
                  Nombre
                  <input required name="name" />
                </label>
                <label>
                  Cargo
                  <input required name="job" />
                </label>
                <button className="primary">Agregar colaborador</button>
              </form>
            </details>
          </>
        ) : page === "Permisos designados" ? (
          ctx.permission(who, "Gestionar permisos") && (
            <>
              <label>
                Persona
                <select value={person} onChange={(e) => P(e.target.value)}>
                  {teamOptions}
                </select>
              </label>
              {permissions.map((p) => (
                <label key={p} className="check">
                  <input
                    type="checkbox"
                    checked={ctx.permission(person, p)}
                    onChange={(e) => ctx.grant(person, p, e.target.checked)}
                  />
                  {p}
                </label>
              ))}
            </>
          )
        ) : page === "Cargas de archivos" ? (
          <ImportPanel
            sources={[
              "Carteras",
              "Dotación de personal",
              ...(ctx.permission(who, "Análisis y carga de nuevos ingresos")
                ? ["Nuevos ingresos" as const]
                : []),
              "Concursos",
              "Campañas",
            ]}
          />
        ) : page === "Viajes" ? (
          <>
            <form
              className="form-stack"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                V([
                  ...trips,
                  {
                    id: crypto.randomUUID(),
                    who,
                    date: String(f.get("date")),
                    place: String(f.get("place")),
                    state: "Solicitada",
                    reason: "",
                  },
                ]);
                e.currentTarget.reset();
                M("Solicitud registrada.");
              }}
            >
              <h2>Solicitar viaje</h2>
              <div className="form-grid">
                <label>
                  Destino
                  <input required name="place" />
                </label>
                <label>
                  Fecha del viaje
                  <input required type="date" min={today} name="date" />
                </label>
              </div>
              <button className="primary">Solicitar viaje</button>
            </form>
            {trips
              .filter(
                (t) =>
                  admin ||
                  ctx.permission(who, "Aprobar viajes") ||
                  t.who === who,
              )
              .map((t) => (
                <details key={t.id}>
                  <summary>
                    {t.place} · {t.date} · {t.state}
                  </summary>
                  <p>
                    {t.who} · {t.reason}
                  </p>
                  {ctx.permission(who, "Aprobar viajes") && (
                    <form
                      className="form-stack"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const f = new FormData(e.currentTarget),
                          state = String(f.get("state")),
                          reason = String(f.get("reason")).trim();
                        if (state === "Rechazada" && !reason)
                          return M("Indica el motivo del rechazo.");
                        V(
                          trips.map((r) =>
                            r.id === t.id ? { ...r, state, reason } : r,
                          ),
                        );
                        announce(
                          "Solicitud de viaje a " + t.place + ": " + state,
                          t.who,
                        );
                        M("Solicitud actualizada.");
                      }}
                    >
                      <label>
                        Estado
                        <select name="state" defaultValue={t.state}>
                          {[
                            "Solicitada",
                            "Por enviar",
                            "En revisión",
                            "Aprobada",
                            "Rechazada",
                          ].map((x) => (
                            <option key={x}>{x}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Motivo al rechazar
                        <input name="reason" />
                      </label>
                      <button className="secondary">Confirmar estado</button>
                    </form>
                  )}
                </details>
              ))}
          </>
        ) : (
          <>
            <h2>Cobertura por zona y región</h2>
            <Table
              headers={["Región", "Zona", "Farmacias", "Cobertura"]}
              rows={[...new Set(stores.map((s) => s.region))].flatMap(
                (region) =>
                  ["Centro", "Oriente", "Sur"].map((z) => {
                    const ids = stores
                      .filter((s) => s.zone === z && s.region === region)
                      .map((s) => s.id);
                    return [
                      region,
                      z,
                      ids.length,
                      metrics(visits, ids).coverage + " %",
                    ];
                  }),
              )}
            />
            <h3>Gestiones por tipo</h3>
            <Table
              headers={["Tipo de gestión", "Cantidad"]}
              rows={Object.entries(
                visits
                  .filter(
                    (v) => !v.annulled && v.date.startsWith(today.slice(0, 7)),
                  )
                  .flatMap((v) => v.actions)
                  .reduce<Record<string, number>>(
                    (a, x) => ({ ...a, [x.type]: (a[x.type] ?? 0) + 1 }),
                    {},
                  ),
              )}
            />
            <p>
              {
                metrics(
                  visits,
                  stores.map((s) => s.id),
                ).people
              }{" "}
              personas capacitadas en el mes
            </p>
            {ctx.permission(who, "Exportar datos") && (
              <button
                className="primary"
                onClick={() =>
                  exportSheet(
                    "Indicadores Praxia",
                    headers,
                    teamRows.map((r) => r.map(String)),
                  )
                }
              >
                Exportar indicadores
              </button>
            )}
          </>
        )}
        {feedback && (
          <p role="status" className="result-note">
            {feedback}
          </p>
        )}
      </section>
    </div>
  );
}
