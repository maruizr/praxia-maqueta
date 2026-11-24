"use client";
import { useState } from "react";
import { useSettings } from "./settings";
import { today, type Visit, type Person } from "./data";
export type Change = {
  operation: string;
  reason: string;
  mode: string;
  date: string;
  other: string;
};
export function VisitAudit({
  visit: v,
  admin,
  who,
  apply,
}: {
  visit: Visit;
  admin: boolean;
  who: string;
  apply: (v: Visit, c: Change) => Promise<void>;
}) {
  const [op, O] = useState("Corregir"),
    [busy, B] = useState(false);
  return (
    <section>
      <strong>
        {v.voided ? "Anulada · excluida de indicadores" : "Registro vigente"}
      </strong>
      {(v.audit || []).map((r, i) => (
        <details key={i}>
          <summary>
            {r.operation} · {r.by} ·{" "}
            {new Date(r.at).toLocaleString("es-CL", {
              timeZone: "America/Santiago",
            })}
          </summary>
          <p>Motivo: {r.reason}</p>
          <p>Anterior: {r.before}</p>
          <p>Actualizado: {r.after}</p>
        </details>
      ))}
      {(admin || (!v.voided && who === v.author)) && (
        <details>
          <summary>Gestionar registro</summary>
          <form
            key={String(v.voided)}
            className="form-grid"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget,
                f = new FormData(form),
                get = (s: string) => String(f.get(s) || "").trim();
              if (!get("reason") || busy) return;
              B(true);
              try {
                await apply(v, {
                  operation: v.voided ? "Restaurar" : op,
                  reason: get("reason"),
                  mode: get("mode"),
                  date: get("date"),
                  other: get("other"),
                });
                form.reset();
                O("Corregir");
              } finally {
                B(false);
              }
            }}
          >
            <label>
              Operación
              <select
                disabled={v.voided}
                value={v.voided ? "Restaurar" : op}
                onChange={(e) => O(e.target.value)}
              >
                {(v.voided ? ["Restaurar"] : ["Corregir", "Anular"]).map(
                  (x) => (
                    <option key={x}>{x}</option>
                  ),
                )}
              </select>
            </label>
            {!v.voided && op === "Corregir" && (
              <>
                <label>
                  Fecha de visita
                  <input
                    type="date"
                    required
                    max={today}
                    name="date"
                    defaultValue={v.date}
                  />
                </label>
                <label>
                  Modalidad
                  <select name="mode" defaultValue={v.mode}>
                    {["Presencial", "Online", "Otros"].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Descripción de modalidad
                  <input name="other" defaultValue={v.other} maxLength={300} />
                </label>
              </>
            )}
            <label>
              Motivo obligatorio
              <input name="reason" required pattern=".*\S.*" maxLength={400} />
            </label>
            <button className="secondary" disabled={busy}>
              Confirmar{" "}
              {v.voided
                ? "restauración"
                : op === "Anular"
                  ? "anulación"
                  : "corrección"}
            </button>
          </form>
        </details>
      )}
    </section>
  );
}
export function Reconciliation({
  visits,
  reconcile,
}: {
  visits: Visit[];
  reconcile: (
    p: Person,
    target: { id: string; name: string; job: string },
    reason: string,
  ) => Promise<void>;
}) {
  const settings = useSettings(),
    [busy, B] = useState(false);
  const persons = Array.from(
    new Map(
      visits.flatMap((v) =>
        v.actions.flatMap((a) =>
          a.persons.filter((p) => p.provisional).map((p) => [p.id, p] as const),
        ),
      ),
    ).values(),
  );
  return (
    <>
      <div className="page-intro">
        <div className="eyebrow">Administración · Dotación</div>
        <h1>Conciliación de colaboradores</h1>
        <p>
          Vincula cada registro provisional con su identidad de dotación. Se
          conservan las gestiones anteriores.
        </p>
      </div>
      <section className="panel form-panel">
        <h2>Pendientes de validación ({persons.length})</h2>
        {!persons.length && (
          <p className="empty">
            No hay colaboradores provisionales por conciliar.
          </p>
        )}
        {persons.map((p) => (
          <form
            className="form-grid"
            key={p.id}
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const target = settings
                  .roster(p.home!)
                  .find((x) => x.id === f.get("dest")),
                reason = String(f.get("reason") || "").trim();
              if (!target || !reason || busy) return;
              B(true);
              try {
                await reconcile(p, target, reason);
              } finally {
                B(false);
              }
            }}
          >
            <h3>
              {p.name} · {p.home}
            </h3>
            <label>
              Identidad confirmada
              <select required name="dest" defaultValue="">
                <option value="">Seleccionar colaborador</option>
                {settings.roster(p.home!).map((x) => (
                  <option value={x.id} key={x.id}>
                    {x.name} · {x.id}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Motivo de vinculación
              <input required name="reason" maxLength={400} />
            </label>
            <button className="secondary" disabled={busy}>
              Confirmar vínculo
            </button>
          </form>
        ))}
      </section>
    </>
  );
}
