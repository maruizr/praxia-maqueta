const relative = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export const today = relative(0);
export const dateText = (d: string) =>
  new Date(d + "T12:00:00").toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
  });
export const roles = ["Nutricionista", "Administrador"];
export const names = ["Camila Morales", "Paula Fuentes"];
export const topics = [
  "Vitamina C G8",
  "Magnesio G8",
  "Omega 3 G8",
  "Concurso Impulso G8",
  "Campaña Bienestar",
  "Productos naturales",
  "Nuevas inclusiones",
  "Novedades",
  "Portal",
  "Concursos activos",
  "Productos de baja rotación o baja venta",
  "PPT del mes",
  "Líneas y packs",
  "Otro",
];
export const types = [
  "Capacitación",
  "Estrategia comercial",
  "Lanzamiento o producto",
  "Seguimiento",
  "Reunión o coordinación",
  "Otro",
];
export const outcomes = [
  "Capacitado",
  "Reservada para una fecha",
  "Se negó a capacitarse",
  "Requiere seguimiento",
];
export const activities = [
  "Visita general",
  "Trabajo administrativo",
  "Capacitaciones NI",
  "Capacitaciones",
  "Visitas online y capacitaciones",
  "Otros",
];
const places = [
  "Providencia",
  "Ñuñoa Centro",
  "Las Condes",
  "La Florida",
  "Macul",
  "Santiago Centro",
  "La Reina",
  "Quilicura",
  "Peñalolén",
  "Recoleta",
  "Maipú",
  "San Miguel",
  "Vitacura",
  "Independencia",
  "Estación Central",
  "Conchalí",
];
export const team = [
  "Camila Morales",
  "Francisca Díaz",
  "Paula Fuentes",
  "Josefa Ruiz",
  "Isidora Tapia",
  "Daniela Araya",
  "Fernanda Vega",
  "Carolina Leiva",
  "Martina Pino",
  "Constanza León",
  "Javiera Bravo",
  "Catalina Paz",
];
export const stores = Array.from({ length: team.length * 56 }, (_, index) => {
  const route = Math.floor(index / 56),
    i = index % 56;
  const activityIndex = (i + route * 3) % 56;
  const zone = i % 3 === 0 ? "Oriente" : i % 3 === 1 ? "Centro" : "Sur";
  return {
    owner: team[route],
    id:
      index === 0
        ? "CL0090"
        : index === 1
          ? "F0373"
          : index === 2
            ? "CL0214"
            : i % 3 === 1
              ? "F" + (1063 + index)
              : "CL" + (2048 + index),
    name:
      "Farmacia " +
      places[i % 16] +
      ["", " Norte", " Sur", " Plaza"][Math.floor(i / 16)] +
      (route ? ` · Sector ${route + 1}` : ""),
    place: places[i % 16],
    zone,
    region: ["Metropolitana", "Valparaíso", "Biobío"][route % 3],
    supervisor: i % 2 ? "Luis Tapia" : "Daniela Rojas",
    boss: "Rodrigo Lagos",
    address: [
      "Av. Providencia 1842",
      "Av. Irarrázaval 3480",
      "Av. Apoquindo 5210",
    ][i % 3],
    last: relative(
      activityIndex < 4 + (route % 3)
        ? -95
        : activityIndex < 36 - route
          ? -38
          : -5,
    ),
    training: relative(activityIndex < 4 + (route % 3) ? -90 : -10),
    school: relative(-18),
    freq: 1,
  };
});
export type Store = (typeof stores)[number];
const firstNames = [
  "Valentina",
  "Felipe",
  "Antonia",
  "Diego",
  "Josefina",
  "Matías",
  "Catalina",
  "Benjamín",
  "Fernanda",
  "Ignacio",
  "Constanza",
  "Tomás",
  "Daniela",
  "Joaquín",
  "Camila",
  "Sebastián",
  "Martina",
  "Vicente",
  "Isidora",
  "Cristóbal",
];
const lastNames = [
  "Soto",
  "Muñoz",
  "Reyes",
  "Silva",
  "Díaz",
  "Rojas",
  "Contreras",
  "Fuentes",
  "Araya",
  "Espinoza",
  "Castillo",
  "Pizarro",
  "Vergara",
  "Navarro",
  "Carrasco",
  "Sepúlveda",
  "Morales",
  "Tapia",
  "Gallardo",
  "Henríquez",
];
const jobs = [
  "Química farmacéutica",
  "Auxiliar de farmacia",
  "Encargada",
  "Auxiliar de farmacia",
  "Auxiliar de farmacia",
];
// En franquicias el número de empleado es correlativo dentro de cada farmacia;
// por eso el colaborador se identifica por farmacia + número.
export const employees = (id: string) => {
  const k = Math.max(0, storeIndex.get(id) ?? 0);
  return jobs.map((job, i) => ({
    name:
      firstNames[(k * 3 + i * 7) % 20] + " " + lastNames[(k * 5 + i * 3) % 20],
    id: id + "-" + (id.startsWith("F") ? i + 1 : 1000 + k * 5 + i),
    job,
  }));
};
export type Person = {
  id: string;
  name: string;
  job: string;
  topics: string[];
  evaluations?: Record<
    string,
    { type: string; result: string; date: string; kind: string }
  >;
  result: string;
  note: string;
  due: string;
  kind: string;
};
export type Action = {
  uid?: string;
  type: string;
  persons: Person[];
  note: string;
  file: string;
  attachment?: File;
  follow?: { kind: string; date: string };
};
export type Visit = {
  id: string;
  store: string;
  date: string;
  mode: string;
  other: string;
  actions: Action[];
  author: string;
  queued: boolean;
  syncState?:
    | "Pendiente"
    | "Sincronizando"
    | "Sincronizado"
    | "Error"
    | "Conflicto";
  resolution?: { device: string; remote: string; choice: string };
  attempt?: string;
  contingency?: boolean;
  planned?: boolean;
  minutes?: number;
  annulled?: boolean;
  outside?: boolean;
  history?: { when: string; who: string; reason: string; snapshot: string }[];
};
export type Task = {
  id: string;
  store: string;
  name: string;
  kind: string;
  date: string;
  closed: boolean;
  cancelled?: boolean;
  visitId?: string;
  closure?: { action: string; result: string };
};
export type Row = { store: string; date: string; mode: string; type: string };
export const initialPlan: Row[] = stores.slice(0, 12).map((s, i) => ({
  store: s.id,
  date: i < 3 ? today : relative(i === 3 ? -1 : 1 + Math.floor((i - 4) / 2)),
  mode: i % 3 === 2 ? "Online" : "Presencial",
  type: activities[[0, 3, 4][i % 3]],
}));
export const storeIndex = new Map(stores.map((s, i) => [s.id, i]));
export type MonthlyPlan = { rows: Row[]; published: boolean };
export const demoPlans: Record<string, MonthlyPlan> = Object.fromEntries(
  team.map((name, route) => [
    name,
    {
      published: route % 3 !== 0,
      rows: initialPlan
        .slice(0, 12 - (route % 4))
        .map((r, i) => ({ ...r, store: stores[route * 56 + i].id })),
    },
  ]),
);
export const seedTasks: Task[] = stores
  .filter((_, i) => [0, 1, 37, 3, 4].includes(i))
  .sort(
    (a, b) =>
      [0, 1, 37, 3, 4].indexOf(storeIndex.get(a.id)!) -
      [0, 1, 37, 3, 4].indexOf(storeIndex.get(b.id)!),
  )
  .map((s, i) => ({
    id: "seed" + i,
    store: s.id,
    name: employees(s.id)[0].name,
    kind: i % 2 ? "Revisar producto" : "Nueva capacitación",
    date: relative([-2, 0, 3, 10, -1][i]),
    closed: i === 4,
  }));
export function status(s: Store, v: Visit[], tasks: Task[]) {
  const vs = v.filter((x) => x.store === s.id && !x.attempt && !x.annulled);
  const last = [
    s.last,
    ...vs.filter((x) => x.mode === "Presencial").map((x) => x.date),
  ]
    .sort()
    .at(-1)!;
  const train = [
    s.training,
    ...vs
      .filter((x) =>
        x.actions.some(
          (a) =>
            a.type === "Capacitación" &&
            a.persons.some((p) => p.result === "Capacitado"),
        ),
      )
      .map((x) => x.date),
  ]
    .sort()
    .at(-1)!;
  const own = tasks.filter((t) => t.store === s.id && !t.closed);
  const count =
    vs.filter((x) => x.date.startsWith(today.slice(0, 7))).length +
    Number(s.last.startsWith(today.slice(0, 7)));
  return {
    last,
    train,
    count,
    p:
      last < relative(-60) || train < relative(-60)
        ? 1
        : count < s.freq || own.some((t) => t.date < today)
          ? 2
          : own.length
            ? 3
            : 4,
  };
}
