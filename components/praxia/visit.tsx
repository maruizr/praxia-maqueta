"use client";
import { useState } from "react";
import { Plus, Store, Check, Copy, Save } from "lucide-react";
import { useLocal } from "./local";
import {
  stores,
  types,
  today,
  topics,
  outcomes,
  dateText,
  type Visit,
  type Action,
  type Person,
  type Task,
} from "./data";
import { useSettings } from "./settings";
import { pending, taskKinds } from "./records";
const blank = (): Action => ({
  uid: crypto.randomUUID(),
  type: "",
  persons: [],
  note: "",
  file: "",
});
const opts = (v: string[]) => v.map((x) => <option key={x}>{x}</option>);
const topicTypes = [
  "Producto",
  "Categoría",
  "Campaña",
  "Concurso",
  "Procedimiento",
  "Otro",
];
export default function VisitForm({
  initial,
  author,
  save,
  cancel,
  visits = [],
  tasks = [],
  original,
  append = false,
  offline = false,
}: {
  initial: string;
  author: string;
  owner?: string;
  save: (v: Visit, reason?: string) => void;
  cancel: () => void;
  visits?: Visit[];
  tasks?: Task[];
  original?: Visit;
  append?: boolean;
  offline?: boolean;
}) {
  const ctx = useSettings();
  const key =
    "borrador:" + author + ":" + (original?.id ?? initial) + ":" + append;
  const seed: Visit = original
    ? {
        ...original,
        actions: append ? [...original.actions, blank()] : original.actions,
      }
    : {
        id: "",
        store: initial,
        date: today,
        mode: "Presencial",
        other: "",
        author,
        minutes: 30,
        actions: [blank()],
        queued: false,
      };
  const [v, set] = useLocal<Visit>(key, seed),
    [idx, I] = useState(append ? seed.actions.length - 1 : 0),
    [reason, R] = useLocal(key + "-motivo", ""),
    [manual, M] = useState(false),
    [external, X] = useState(""),
    [error, E] = useState(false),
    [lookup, K] = useState("");
  const act = v.actions[idx] ?? blank(),
    attempt = v.attempt !== undefined;
  const patch = (p: Partial<Visit>) => set({ ...v, ...p });
  const change = (p: Partial<Action>) =>
    patch({
      actions: v.actions.map((a, i) => (i === idx ? { ...a, ...p } : a)),
    });
  const person = (id: string, p: Partial<Person>) =>
    change({
      persons: act.persons.map((a) => (a.id === id ? { ...a, ...p } : a)),
    });
  function add(p: ReturnType<typeof ctx.roster>[number]) {
    if (!act.persons.some((x) => x.id === p.id))
      change({
        persons: [
          ...act.persons,
          {
            ...p,
            topics: [],
            result: "",
            note: "",
            due: "",
            kind: taskKinds[0],
          },
        ],
      });
  }
  const makeEval = () => ({
    type: "Producto",
    result: "",
    date: "",
    kind: taskKinds[0],
  });
  const fields: Record<string, string> = {};
  if (!v.store) fields.store = "Selecciona una farmacia.";
  if (!v.date || v.date > today)
    fields.date = "Elige una fecha que no sea futura.";
  if (!v.minutes || !Number.isInteger(v.minutes) || v.minutes < 1)
    fields.minutes = "Indica la duración en minutos.";
  if (v.mode === "Otros" && !v.other.trim())
    fields.mode = "Describe la modalidad.";
  if (attempt && !v.attempt?.trim())
    fields.reason = "Escribe el motivo del intento.";
  if (original && !append && !reason.trim())
    fields.edit = "Indica el motivo de la corrección.";
  if (!attempt)
    v.actions.forEach((a, i) => {
      if (
        !a.type ||
        (a.type !== "Capacitación" && !a.note.trim()) ||
        (a.type === "Capacitación" &&
          (!a.persons.length ||
            a.persons.some(
              (p) =>
                !p.topics.length ||
                p.topics.some((t) => {
                  const e = p.evaluations?.[t];
                  const result = e?.result ?? p.result;
                  return (
                    !result ||
                    ([outcomes[1], outcomes[3]].includes(result) &&
                      (!(e?.date ?? p.due) || (e?.date ?? p.due) < v.date))
                  );
                }),
            ))) ||
        (a.follow && (!a.follow.date || a.follow.date < v.date))
      )
        fields["a" + i] =
          `Gestión ${i + 1}: completa el tipo, los campos de seguimiento y los resultados de cada tema.`;
    });
  const msg = (k: string) =>
    error && fields[k] ? (
      <small role="alert" className="field-error">
        {fields[k]}
      </small>
    ) : null;
  const latest = [
    stores.find((s) => s.id === v.store)?.last,
    ...visits
      .filter((x) => x.store === v.store && !x.annulled && !x.attempt)
      .map((x) => x.date),
  ]
    .filter(Boolean)
    .sort()
    .at(-1);
  function submit() {
    if (offline) return;
    E(true);
    if (Object.keys(fields).length) {
      const a = Object.keys(fields).find((k) => /^a\d/.test(k));
      if (a) I(Number(a.slice(1)));
      return;
    }
    save(
      {
        ...v,
        id: v.id || crypto.randomUUID(),
        actions: attempt ? [] : v.actions,
        outside: ctx.owner(v.store) !== v.author,
      },
      append ? "Gestión agregada" : reason,
    );
    localStorage.removeItem("praxia.v4." + key);
    localStorage.removeItem("praxia.v4." + key + "-motivo");
  }
  return (
    <div className="form-stack">
      <div className="page-intro">
        <div className="eyebrow">Trabajo en terreno</div>
        <h1>
          {original && !append
            ? "Corregir visita"
            : attempt
              ? "Registrar intento"
              : "Registrar gestión"}
        </h1>
        <p>
          El borrador queda en este navegador hasta que registres la visita.
        </p>
      </div>
      <section className="panel form-panel">
        <h2>
          <Store size={19} /> Datos de la visita
        </h2>
        <div className="form-grid">
          <label>
            Farmacia
            <select
              aria-invalid={error && !!fields.store}
              disabled={!!original || v.actions.some((a) => a.persons.length)}
              value={v.store}
              onChange={(e) => patch({ store: e.target.value })}
            >
              <option value="">Selecciona una farmacia</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} · {s.name}
                </option>
              ))}
            </select>
            {msg("store")}
          </label>
          <label>
            Fecha
            <input
              type="date"
              disabled={append}
              max={today}
              value={v.date}
              onChange={(e) => patch({ date: e.target.value })}
            />
            {msg("date")}
          </label>
          <label>
            Modalidad
            <select
              disabled={append}
              value={v.mode}
              onChange={(e) => patch({ mode: e.target.value })}
            >
              {opts(["Presencial", "Online", "Otros"])}
            </select>
          </label>
        </div>
        {v.store && (
          <small>
            Última visita: {latest ? dateText(latest) : "Sin registro"} ·{" "}
            {
              tasks.filter(
                (t) => t.store === v.store && !t.closed && !t.cancelled,
              ).length
            }{" "}
            pendientes abiertos{" "}
            {ctx.owner(v.store) !== author ? "· Fuera de cartera" : ""}
          </small>
        )}
        {v.mode === "Otros" && (
          <label>
            Nota de modalidad
            <input
              value={v.other}
              onChange={(e) => patch({ other: e.target.value })}
            />
            {msg("mode")}
          </label>
        )}
        <label>Duración de la visita</label>
        <div className="chip-row">
          {[15, 30, 45, 60, 90].map((n) => (
            <button
              key={n}
              aria-pressed={!manual && v.minutes === n}
              onClick={() => {
                M(false);
                patch({ minutes: n });
              }}
            >
              {n} min
            </button>
          ))}
          <button aria-pressed={manual} onClick={() => M(true)}>
            Otra
          </button>
        </div>
        {manual && (
          <label>
            Duración en minutos
            <input
              type="number"
              min="1"
              value={v.minutes ?? ""}
              onChange={(e) => patch({ minutes: Number(e.target.value) })}
            />
          </label>
        )}
        {msg("minutes")}
        <label>
          ¿Hubo atención?
          <select
            disabled={append}
            value={attempt ? "Intento" : "Hubo atención"}
            onChange={(e) =>
              patch({
                attempt: e.target.value === "Intento" ? "" : undefined,
                actions: v.actions.length ? v.actions : [blank()],
              })
            }
          >
            {opts(["Hubo atención", "Intento"])}
          </select>
        </label>
        {attempt && (
          <label>
            Motivo del intento
            <textarea
              value={v.attempt}
              onChange={(e) => patch({ attempt: e.target.value })}
            />
            {msg("reason")}
          </label>
        )}
        <label className="check">
          <input
            type="checkbox"
            checked={!!v.contingency}
            onChange={(e) => patch({ contingency: e.target.checked })}
          />
          Registro de contingencia
        </label>
      </section>
      {!attempt && (
        <section className="panel form-panel">
          <div className="tabs">
            {v.actions.map((_, i) => (
              <button
                disabled={append && i < (original?.actions.length ?? 0)}
                key={i}
                className={idx === i ? "selected" : ""}
                onClick={() => I(i)}
              >
                Gestión {i + 1}
              </button>
            ))}
            <button
              onClick={() => {
                patch({ actions: [...v.actions, blank()] });
                I(v.actions.length);
              }}
            >
              <Plus size={15} /> Otra gestión
            </button>
          </div>
          <label>
            Tipo de gestión
            <select
              value={act.type}
              onChange={(e) => change({ type: e.target.value })}
            >
              <option value="">Selecciona el tipo</option>
              {opts(types)}
            </select>
          </label>
          {act.type === "Capacitación" ? (
            <>
              <label>
                Colaborador de la farmacia
                <select
                  disabled={!v.store}
                  value=""
                  onChange={(e) => {
                    const p = ctx
                      .roster(v.store)
                      .find((x) => x.id === e.target.value);
                    if (p) add(p);
                  }}
                >
                  <option value="">Selecciona un colaborador</option>
                  {ctx
                    .roster(v.store)
                    .filter((p) => !act.persons.some((x) => x.id === p.id))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} · {p.job}
                      </option>
                    ))}
                </select>
              </label>
              <details>
                <summary>Agregar de otra farmacia</summary>
                <label>
                  Código de farmacia y número de empleado
                  <input
                    placeholder="CL0090-1000"
                    value={external}
                    onChange={(e) => X(e.target.value)}
                  />
                </label>
                <button
                  className="secondary"
                  onClick={() => {
                    const code = external.trim().toUpperCase(),
                      p = ctx
                        .roster(code.split("-")[0])
                        .find((p) => p.id === code);
                    if (p && stores.some((s) => s.id === code.split("-")[0])) {
                      add(p);
                      X("");
                      K("");
                    } else
                      K(
                        "No se encontró el colaborador. Revisa el código y su número.",
                      );
                  }}
                >
                  Agregar colaborador
                </button>
                {lookup && <p role="status">{lookup}</p>}
              </details>
              {act.persons.map((p) => (
                <fieldset key={p.id}>
                  <legend>{p.name}</legend>
                  <div className="form-stack">
                    <label>
                      Agregar tema
                      <select
                        value=""
                        onChange={(e) =>
                          person(p.id, {
                            topics: [...p.topics, e.target.value],
                            evaluations: {
                              ...p.evaluations,
                              [e.target.value]: makeEval(),
                            },
                          })
                        }
                      >
                        <option value="">Selecciona una referencia</option>
                        {opts(topics.filter((t) => !p.topics.includes(t)))}
                      </select>
                    </label>
                    {p.topics.map((t) => {
                      const ev = p.evaluations?.[t] ?? {
                        ...makeEval(),
                        result: p.result,
                      };
                      const update = (d: Partial<typeof ev>) =>
                        person(p.id, {
                          evaluations: {
                            ...p.evaluations,
                            [t]: { ...ev, ...d },
                          },
                          result: d.result ?? ev.result,
                        });
                      return (
                        <div className="person form-stack" key={t}>
                          <h3>{t}</h3>
                          <div className="form-grid">
                            <label>
                              Tipo de tema
                              <select
                                value={ev.type}
                                onChange={(e) =>
                                  update({ type: e.target.value })
                                }
                              >
                                {opts(topicTypes)}
                              </select>
                            </label>
                            <label>
                              Resultado
                              <select
                                value={ev.result}
                                onChange={(e) =>
                                  update({ result: e.target.value })
                                }
                              >
                                <option value="">
                                  Selecciona un resultado
                                </option>
                                {opts(outcomes)}
                              </select>
                            </label>
                          </div>
                          {[outcomes[1], outcomes[3]].includes(ev.result) && (
                            <div className="form-grid">
                              <label>
                                Fecha sugerida
                                <input
                                  type="date"
                                  min={v.date}
                                  value={ev.date}
                                  onChange={(e) =>
                                    update({ date: e.target.value })
                                  }
                                />
                              </label>
                              <label>
                                Tipo de pendiente
                                <select
                                  value={ev.kind}
                                  onChange={(e) =>
                                    update({ kind: e.target.value })
                                  }
                                >
                                  {opts(taskKinds)}
                                </select>
                              </label>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div className="table-tools">
                      {act.persons.length > 1 && (
                        <button
                          className="secondary"
                          onClick={() =>
                            change({
                              persons: act.persons.map((x) => ({
                                ...x,
                                topics: [...p.topics],
                                evaluations: Object.fromEntries(
                                  p.topics.map((t) => [
                                    t,
                                    x.evaluations?.[t] ?? {
                                      ...makeEval(),
                                      type:
                                        p.evaluations?.[t]?.type ?? "Producto",
                                    },
                                  ]),
                                ),
                              })),
                            })
                          }
                        >
                          <Copy size={14} />
                          Copiar temas a todos
                        </button>
                      )}
                      <button
                        className="text-btn"
                        onClick={() =>
                          change({
                            persons: act.persons.filter((x) => x.id !== p.id),
                          })
                        }
                      >
                        Quitar persona del borrador
                      </button>
                    </div>
                  </div>
                </fieldset>
              ))}
            </>
          ) : null}
          {act.type && (
            <>
              <label>
                {act.type === "Capacitación"
                  ? "Observaciones"
                  : "Descripción de la gestión"}
                <textarea
                  value={act.note}
                  onChange={(e) => change({ note: e.target.value })}
                />
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={!!act.follow}
                  onChange={(e) =>
                    change({
                      follow: e.target.checked
                        ? { date: "", kind: taskKinds[0] }
                        : undefined,
                    })
                  }
                />
                Esta gestión requiere seguimiento
              </label>
              {act.follow && (
                <div className="form-grid">
                  <label>
                    Tipo de pendiente
                    <select
                      value={act.follow.kind}
                      onChange={(e) =>
                        change({
                          follow: { ...act.follow!, kind: e.target.value },
                        })
                      }
                    >
                      {opts(taskKinds)}
                    </select>
                  </label>
                  <label>
                    Fecha sugerida
                    <input
                      type="date"
                      min={v.date}
                      value={act.follow.date}
                      onChange={(e) =>
                        change({
                          follow: { ...act.follow!, date: e.target.value },
                        })
                      }
                    />
                  </label>
                </div>
              )}
            </>
          )}
          {v.actions.length > 1 && (
            <button
              className="text-btn"
              onClick={() => {
                patch({ actions: v.actions.filter((_, i) => i !== idx) });
                I(0);
              }}
            >
              Quitar gestión del borrador
            </button>
          )}
          {msg("a" + idx)}
        </section>
      )}
      {original && !append && (
        <label>
          Motivo de la corrección
          <textarea value={reason} onChange={(e) => R(e.target.value)} />
          {msg("edit")}
        </label>
      )}
      <section className="panel form-panel">
        <h3>Pendientes que se crearán</h3>
        {pending(v).length ? (
          pending(v).map((p) => (
            <small key={p.id}>
              {p.name} · {p.kind} · {dateText(p.date)}
            </small>
          ))
        ) : (
          <small>No se crearán pendientes.</small>
        )}
      </section>
      {error && Object.keys(fields).length > 0 && (
        <div className="error" role="alert">
          Antes de guardar: {Object.values(fields).join(" ")}
        </div>
      )}
      <div className="actions">
        <button className="secondary" onClick={cancel}>
          Volver
        </button>
        <button className="primary" disabled={offline} onClick={submit}>
          <Save size={16} />
          {original && !append
            ? "Guardar corrección"
            : attempt
              ? "Registrar intento"
              : "Registrar gestión"}
        </button>
      </div>
    </div>
  );
}
