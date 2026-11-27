"use client";
import { useState } from "react";
import { dateText, stores, type Visit } from "./data";
export default function VisitDetail({
  v,
  author,
  admin,
  edit,
  save,
}: {
  v: Visit;
  author: string;
  admin: boolean;
  edit: (append: boolean) => void;
  save: (v: Visit, reason: string) => void;
}) {
  const [reason, R] = useState(""),
    [confirm, C] = useState(false);
  const can = admin || v.author === author;
  return (
    <div className="form-stack">
      <div className="page-intro">
        <div className="eyebrow">Historial de gestiones</div>
        <h1>Detalle de visita</h1>
        <p>
          {v.store} · {stores.find((s) => s.id === v.store)?.name}
        </p>
      </div>
      <section className="panel form-panel">
        <div className="heading-line">
          <h2>
            {dateText(v.date)} · {v.mode}
          </h2>
          <span className={"pill " + (v.annulled ? "red" : "green")}>
            {v.annulled ? "Anulada" : "Vigente"}
          </span>
        </div>
        <p>
          {v.author} · {v.minutes ?? 30} min{" "}
          {v.outside ? "· Fuera de cartera" : ""}{" "}
          {v.contingency ? "· Registro de contingencia" : ""}
        </p>
        {v.other && <p>{v.other}</p>}
        {v.attempt && <p>Intento: {v.attempt}</p>}
        {v.actions.map((a, i) => (
          <div key={i} className="person">
            <h3>{a.type}</h3>
            <p>{a.note}</p>
            {a.persons.map((p) => (
              <div key={p.id}>
                <b>{p.name}</b>
                {p.topics.map((t) => (
                  <p key={t}>
                    {t} · {p.evaluations?.[t]?.result ?? p.result}
                  </p>
                ))}
              </div>
            ))}
          </div>
        ))}
        {can && !v.annulled && (
          <div className="table-tools">
            {!v.attempt && (
              <button className="primary" onClick={() => edit(true)}>
                Registrar otra gestión aquí
              </button>
            )}
            <button className="secondary" onClick={() => edit(false)}>
              Corregir visita
            </button>
          </div>
        )}
        {can && (!v.annulled || admin) && (
          <button className="text-btn" onClick={() => C(true)}>
            {v.annulled ? "Restaurar visita" : "Anular visita"}
          </button>
        )}
        {confirm && (
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              if (reason.trim()) {
                save({ ...v, annulled: !v.annulled }, reason.trim());
                C(false);
                R("");
              }
            }}
          >
            <label>
              Motivo
              <textarea
                required
                value={reason}
                onChange={(e) => R(e.target.value)}
              />
            </label>
            <div className="actions">
              <button
                type="button"
                className="secondary"
                onClick={() => C(false)}
              >
                Cancelar
              </button>
              <button className="primary">
                Confirmar {v.annulled ? "restauración" : "anulación"}
              </button>
            </div>
          </form>
        )}
      </section>
      <section className="panel form-panel">
        <h2>Historial de versiones</h2>
        {v.history?.map((h, i) => (
          <details key={i}>
            <summary>
              {h.when} · {h.who} · {h.reason}
            </summary>
            <p>
              Versión anterior: {JSON.parse(h.snapshot).mode} ·{" "}
              {JSON.parse(h.snapshot).minutes} min ·{" "}
              {JSON.parse(h.snapshot).annulled ? "Anulada" : "Vigente"}
            </p>
            {JSON.parse(h.snapshot).actions.map((a: any, j: number) => (
              <p key={j}>
                {a.type}: {a.note}{" "}
                {a.persons
                  .map((p: any) => p.name + ": " + p.topics.join(", "))
                  .join("; ")}
              </p>
            ))}
          </details>
        ))}
        {!v.history?.length && (
          <small>Registro original, sin correcciones.</small>
        )}
      </section>
    </div>
  );
}
