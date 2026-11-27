import {
  stores,
  employees,
  team,
  today,
  types,
  outcomes,
  type Visit,
  type Task,
} from "./data";
import { shifted } from "./local";
export const taskKinds = [
  "Nueva capacitación",
  "Enviar material",
  "Revisar producto",
  "Apoyo comercial",
  "Coordinar con supervisor",
  "Otro",
];
export const examples: Visit[] = team.flatMap((who, n) =>
  Array.from({ length: 32 - n }, (_, i) => {
    const store = stores[n * 56 + ((i + 7) % 56)].id;
    const ps = employees(store).slice(0, (i % 3) + 1);
    return {
      id: `demo-${n}-${i}`,
      store,
      date: shifted(-Math.min((i % 16) + 1, Number(today.slice(-2)) - 1)),
      mode: i % 5 ? "Presencial" : "Online",
      other: "",
      author: who,
      minutes: 30,
      queued: false,
      contingency: i === 4,
      annulled: i === 5,
      attempt: i === 6 ? "Farmacia cerrada" : undefined,
      actions:
        i === 6
          ? []
          : [
              {
                type: types[i % 3],
                note: "Revisión de materiales y orientación al equipo.",
                file: "",
                persons: ps.map((p) => ({
                  ...p,
                  topics: ["Vitamina C"],
                  result: "Capacitado",
                  note: "",
                  due: "",
                  kind: "",
                })),
              },
            ],
    };
  }),
);
examples.push({
  ...examples[0],
  id: "demo-externa",
  store: stores[80].id,
  outside: true,
});
export function pending(v: Visit): Task[] {
  const tasks: Task[] = [];
  if (v.annulled || v.attempt) return [];
  v.actions.forEach((a, i) => {
    const add = (key: string, name: string, kind: string, date: string) =>
      tasks.push({
        id: `${v.id}:${a.uid ?? i}:${key}`,
        visitId: v.id,
        store: v.store,
        name,
        kind,
        date,
        closed: false,
      });
    if (a.follow) add("gestion", a.type, a.follow.kind, a.follow.date);
    a.persons.forEach((p) =>
      p.topics.forEach((t) => {
        const ev = p.evaluations?.[t];
        if ([outcomes[1], outcomes[3]].includes(ev?.result ?? p.result))
          add(p.id + t, p.name, ev?.kind ?? p.kind, ev?.date ?? p.due);
      }),
    );
  });
  return tasks;
}
export function reconcileTasks(tasks: Task[], v: Visit) {
  const added = pending(v);
  return [
    ...tasks.map((t) =>
      t.visitId !== v.id || (t.closed && !t.cancelled)
        ? t
        : (added.find((a) => a.id === t.id) ?? {
            ...t,
            cancelled: true,
            closed: true,
          }),
    ),
    ...added.filter((t) => !tasks.some((x) => x.id === t.id)),
  ];
}
export function outstanding(date: string, store: string, visits: Visit[]) {
  return (
    date < today &&
    !visits.some(
      (v) => !v.annulled && !v.attempt && v.store === store && v.date === date,
    )
  );
}
export function metrics(vs: Visit[], ids: string[]) {
  const current = vs.filter(
    (v) => !v.annulled && !v.attempt && v.date.startsWith(today.slice(0, 7)),
  );
  const covered = new Set(
    current.filter((v) => ids.includes(v.store)).map((v) => v.store),
  ).size;
  return {
    coverage: Math.round((covered * 100) / (ids.length || 1)),
    covered,
    count: current.reduce((n, v) => n + v.actions.length, 0),
    people: new Set(
      current.flatMap((v) =>
        v.actions
          .filter((a) => a.type === "Capacitación")
          .flatMap((a) =>
            a.persons
              .filter(
                (p) =>
                  p.result === "Capacitado" ||
                  Object.values(p.evaluations ?? {}).some(
                    (t) => t.result === "Capacitado",
                  ),
              )
              .map((p) => p.id),
          ),
      ),
    ).size,
  };
}
