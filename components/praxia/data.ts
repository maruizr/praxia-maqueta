export const today = "2026-11-23";
export const dateText = (d: string) =>
  new Date(d + "T12:00:00").toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
  });
export const roles = ["Nutricionista", "Jefatura", "Administrador"];
export const names = ["Camila Morales", "Paula Fuentes", "Tomás Vidal"];
export const topics = [
  "Vitamina C G8",
  "Magnesio G8",
  "Omega 3 G8",
  "Concurso Impulso G8",
  "Campaña Bienestar",
  "Productos naturales",
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
  "Se negó",
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
export const team = ['Camila Morales','Francisca Díaz','Paula Fuentes','Josefa Ruiz','Isidora Tapia','Daniela Araya','Fernanda Vega','Carolina Leiva','Martina Pino','Constanza León','Javiera Bravo','Catalina Paz'];
export const stores = Array.from({ length: team.length * 56 }, (_, index) => {
  const route = Math.floor(index / 56), i = index % 56;
  const activityIndex = (i + route * 3) % 56;
  const zone = i % 3 === 0 ? "Oriente" : i % 3 === 1 ? "Centro" : "Sur";
  return {
    owner: team[route],
    id: i % 3 === 1 ? "F" + (1063 + index) : "CL" + (2048 + index),
    name:
      "Farmacia " +
      places[i % 16] +
      ["", " Norte", " Sur", " Plaza"][Math.floor(i / 16)] + (route ? ` · Sector ${route + 1}` : ''),
    place: places[i % 16],
    zone,
    region: "Metropolitana",
    supervisor: i % 2 ? "Luis Tapia" : "Daniela Rojas",
    boss: "Rodrigo Lagos",
    address: [
      "Av. Providencia 1842",
      "Av. Irarrázaval 3480",
      "Av. Apoquindo 5210",
    ][i % 3],
    last: activityIndex < 4 + route % 3 ? "2026-08-18" : activityIndex < 36 - route ? "2026-10-22" : "2026-11-17",
    training: activityIndex < 4 + route % 3 ? "2026-08-20" : "2026-11-10",
    school: "2026-11-05",
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
  const k = Math.max(
    0,
    storeIndex.get(id) ?? 0,
  );
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
  result: string;
  note: string;
  due: string;
  kind: string;
};
export type Action = {
  type: string;
  persons: Person[];
  note: string;
  file: string;
  attachment?: File;
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
};
export type Task = {
  id: string;
  store: string;
  name: string;
  kind: string;
  date: string;
  closed: boolean;
};
export type Row = { store: string; date: string; mode: string; type: string };
export const initialPlan: Row[] = stores
  .slice(0, 12)
  .map((s, i) => ({
    store: s.id,
    date: i < 3 ? today : "2026-11-" + (24 + Math.floor((i - 3) / 2)),
    mode: i % 3 === 2 ? "Online" : "Presencial",
    type: activities[[0, 3, 4][i % 3]],
  }));
export const storeIndex = new Map(stores.map((s,i)=>[s.id,i]));
export type MonthlyPlan = {rows:Row[]; published:boolean};
export const demoPlans:Record<string,MonthlyPlan> = Object.fromEntries(team.map((name,route)=>[name,{published:route % 3 !== 0, rows:initialPlan.slice(0,12-route%4).map((r,i)=>({...r,store:stores[route*56+i].id}))}]));
export const seedTasks: Task[] = stores
  .slice(0, 5)
  .map((s, i) => ({
    id: "seed" + i,
    store: s.id,
    name: employees(s.id)[0].name,
    kind: i % 2 ? "Revisión de producto" : "Seguimiento de capacitación",
    date: [
      "2026-11-19",
      "2026-11-20",
      "2026-11-22",
      "2026-11-25",
      "2026-11-26",
    ][i],
    closed: false,
  }));
export function status(s: Store, v: Visit[], tasks: Task[]) {
  const vs = v.filter((x) => x.store === s.id);
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
    vs.filter((x) => x.date.startsWith("2026-11")).length +
    Number(s.last.startsWith("2026-11"));
  return {
    last,
    train,
    count,
    p:
      last < "2026-09-23" || train < "2026-09-23" || s.school < "2026-07-23"
        ? 1
        : count < s.freq || own.some((t) => t.date < today)
          ? 2
          : own.length
            ? 3
            : 4,
  };
}
