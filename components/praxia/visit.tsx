"use client";
import { useState } from "react";
import { useSettings } from "./settings";
import { Plus, Copy, Save, Trash2, Store as Shop } from "lucide-react";
import {
  stores,
  today,
  topics,
  types,
  outcomes,
  employees,
  type Visit,
  type Action,
  type Person,
} from "./data";
const blank = (): Action => ({
  type: types[0],
  persons: [],
  note: "",
  file: "",
});
export default function VisitForm({
  initial, owner,
  author,
  save,
  cancel,
}: {
  owner?:string;
  initial: string;
  author: string;
  save: (v: Visit) => void;
  cancel: () => void;
}) {
  const settings = useSettings();
  const cartera = stores.filter(s=>!owner || settings.owner(s.id)===owner);
  const [store, S] = useState(cartera.some(s=>s.id===initial)?initial:cartera[0]?.id ?? ''),
    [date, D] = useState(today),
    [mode, M] = useState("Presencial"),
    [other, O] = useState(""),
    [actions, A] = useState<Action[]>([blank()]),
    [idx, I] = useState(0),
    [err, E] = useState(""),
    [extra, X] = useState("");
  const employees = settings.roster,
    act = actions[idx];
  function patch(p: Partial<Action>) {
    A(actions.map((a, i) => (i === idx ? { ...a, ...p } : a)));
    E("");
  }
  function person(id: string, p: Partial<Person>) {
    patch({
      persons: act.persons.map((x) => (x.id === id ? { ...x, ...p } : x)),
    });
  }
  function add(e: ReturnType<typeof employees>[0]) {
    if (!act.persons.some((x) => x.id === e.id))
      patch({
        persons: [
          ...act.persons,
          {
            ...e,
            result: outcomes[0],
            topics: [],
            note: "",
            due: "2026-11-30",
            kind: "Seguimiento de capacitación",
          },
        ],
      });
  }
  function submit() {
    const bad = actions.findIndex(
      (a) =>
        (!a.persons.length && a.type !== "Reunión o coordinación") ||
        a.persons.some(
          (p) =>
            !p.topics.length ||
            (p.result === outcomes[3] && !p.kind.trim()) ||
            ((p.result === outcomes[3] || p.result === outcomes[1]) && (!p.due || p.due < date)),
        ),
    );
    if (!date || date > today || (mode === "Otros" && !other.trim()))
      return E("Revisa la fecha y completa la descripción de la modalidad.");
    if (bad !== -1) {
      I(bad);
      return E(
        "Cada gestión necesita participantes y temas. Para un seguimiento, indica el tipo y una fecha igual o posterior a la visita.",
      );
    }
    save({
      id: crypto.randomUUID(),
      store,
      date,
      mode,
      other,
      actions,
      author,
      queued: false,
    });
  }
  return (
    <div className="form-stack">
      <div className="page-intro">
        <div className="eyebrow">Trabajo en terreno</div>
        <h1>Registrar visita</h1>
        <p>Una visita, todas tus gestiones en un solo lugar.</p>
      </div>
      <section className="panel form-panel">
        <h2>
          <Shop size={20} /> Datos de la visita
        </h2>
        <div className="form-grid">
          <label>
            Farmacia
            <select
              value={store}
              disabled={actions.some((a) => a.persons.length > 0)}
              onChange={(e) => S(e.target.value)}
            >
              {cartera.map((s) => (
                <option value={s.id} key={s.id}>
                  {s.id} · {s.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Fecha
            <input
              type="date"
              max={today}
              value={date}
              onChange={(e) => D(e.target.value)}
            />
          </label>
          <label>
            Modalidad
            <select value={mode} onChange={(e) => M(e.target.value)}>
              {["Presencial", "Online", "Otros"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
        </div>
        {mode === "Otros" && (
          <label>
            Descripción
            <input value={other} onChange={(e) => O(e.target.value)} />
          </label>
        )}
      </section>
      <section className="panel form-panel">
        <div className="tabs">
          {actions.map((_, i) => (
            <button
              className={idx === i ? "selected" : ""}
              key={i}
              onClick={() => I(i)}
            >
              Gestión {i + 1}
            </button>
          ))}
          <button
            onClick={() => {
              A([...actions, blank()]);
              I(actions.length);
              E("");
            }}
          >
            <Plus size={14} /> Otra gestión
          </button>
        </div>
        {actions.length>1&&<button className="text-btn" onClick={()=>{A(actions.filter((_,i)=>i!==idx));I(Math.max(0,idx-1));E('')}}>Quitar gestión {idx+1}</button>}
        <label>
          Tipo de gestión
          <select
            value={act.type}
            onChange={(e) => patch({ type: e.target.value })}
          >
            {types.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <h3>Participantes y temas{act.type === "Reunión o coordinación" && <small> (opcional)</small>}</h3>
        <label>
          Agregar de la dotación
          <select
            value=""
            onChange={(e) => {
              const emp = employees(store).find((p) => p.id === e.target.value);
              if (emp) add(emp);
            }}
          >
            <option value="">Selecciona un colaborador</option>
            {employees(store)
              .filter((p) => !act.persons.some((x) => x.id === p.id))
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.job}
                </option>
              ))}
          </select>
        </label>
        <details>
          <summary>Agregar colaborador de otra farmacia</summary>
          <div className="inline">
            <label>
              Farmacia y número de empleado
              <input
                placeholder="Ej. CL2050-1012 o F1064-3"
                value={extra}
                onChange={(e) => X(e.target.value)}
              />
            </label>
            <button
              className="secondary"
              onClick={() => {
                const p = stores
                  .flatMap((s) => employees(s.id))
                  .find(
                    (p) =>
                      p.id === extra.trim().toUpperCase() ||
                      (!p.id.startsWith("F") &&
                        p.id.endsWith("-" + extra.trim())),
                  );
                if (!p) return E("No se encontró ese número de empleado.");
                add(p);
                X("");
              }}
            >
              Agregar
            </button>
          </div>
        </details>
        {act.persons.map((p, i) => (
          <div className="person" key={p.id}>
            <div className="heading-line">
              <h3>{p.name}</h3>
              <button
                className="iconbtn"
                aria-label={"Quitar a " + p.name}
                onClick={() =>
                  patch({ persons: act.persons.filter((x) => x.id !== p.id) })
                }
              >
                <Trash2 size={16} />
              </button>
            </div>
            <small>
              {p.id} · {p.job}
            </small>
            <label>Temas tratados</label>
            <small>
              Prioriza:{" "}
              {Array.from(
                new Set(["Concurso Impulso G8", ...settings.products]),
              ).join(" · ")}
            </small>
            <div className="chips">
              {topics.map((t) => (
                <button
                  key={t}
                  aria-pressed={p.topics.includes(t)}
                  className={p.topics.includes(t) ? "selected" : ""}
                  onClick={() =>
                    person(p.id, {
                      topics: p.topics.includes(t)
                        ? p.topics.filter((x) => x !== t)
                        : [...p.topics, t],
                    })
                  }
                >
                  {t}
                </button>
              ))}
            </div>
            {act.persons.length > 1 && (
              <button
                className="text-btn"
                onClick={() =>
                  patch({
                    persons: act.persons.map((x) => ({
                      ...x,
                      topics: [...p.topics],
                    })),
                  })
                }
              >
                <Copy size={14} />
                Copiar temas a todos
              </button>
            )}
            <div className="form-grid">
              <label>
                Resultado
                <select
                  value={p.result}
                  onChange={(e) => person(p.id, { result: e.target.value })}
                >
                  {outcomes.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
              <label>
                Observación
                <input
                  value={p.note}
                  onChange={(e) => person(p.id, { note: e.target.value })}
                />
              </label>
              {[outcomes[1], outcomes[3]].includes(p.result) && (
                <label>
                  Fecha sugerida
                  <input
                    type="date"
                    min={date} value={p.due}
                    onChange={(e) => person(p.id, { due: e.target.value })}
                  />
                </label>
              )}
              {p.result === outcomes[3] && (
                <label>
                  Tipo de seguimiento
                  <input
                    value={p.kind}
                    onChange={(e) => person(p.id, { kind: e.target.value })}
                  />
                </label>
              )}
            </div>
          </div>
        ))}
        <label>
          Comentario general
          <textarea
            value={act.note}
            onChange={(e) => patch({ note: e.target.value })}
          />
        </label>
        <label>
          Evidencia (foto o PDF)
          <input
            key={idx}
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (
                f &&
                ((!f.type.startsWith("image/") &&
                  f.type !== "application/pdf") ||
                  f.size > 10 * 1024 * 1024)
              ) {
                E("Selecciona una foto o PDF de hasta 10 MB.");
                return;
              }
              patch({ file: f?.name || "", attachment: f });
            }}
          />
          {act.file && <small>{act.file}</small>}
        </label>
      </section>
      {err && (
        <p role="alert" className="error">
          {err}
        </p>
      )}
      <div className="actions">
        <button className="secondary" onClick={cancel}>
          Cancelar
        </button>
        <button className="primary" onClick={submit}>
          <Save size={16} /> Guardar visita
        </button>
      </div>
    </div>
  );
}
