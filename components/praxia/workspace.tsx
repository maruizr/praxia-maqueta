"use client";
import { useEffect, useState, useRef, Component, type ReactNode } from "react";
import {
  LayoutDashboard,
  Store,
  CalendarDays,
  ListChecks,
  ClipboardPenLine,
  UserRoundPlus,
  Trophy,
  Megaphone,
  GraduationCap,
  ChartNoAxesColumnIncreasing,
  MessageSquareText,
  Settings,
  Bell,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  PanelLeft,
  ChevronsUpDown,
  BriefcaseBusiness,
  Users,
  Upload,
  ShieldCheck,
  Plane,
  Layers,
  BookUser,
  Check,
  WifiOff,
  Sun,
  LogOut,
  Download,
  House,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { SettingsProvider, useSettings } from "./settings";
import { useLocal, shifted } from "./local";
import Dashboard from "./dashboard";
import VisitForm from "./visit";
import VisitDetail from "./visit-detail";
import { Portfolio, Detail, Tasks } from "./portfolio";
import Planning, { type Notice } from "./planning";
import { Resources, type Session } from "./resources";
import { Training, Commercial, Intro, Table } from "./programs";
import { Operations } from "./operations";
import { examples, reconcileTasks, outstanding, metrics } from "./records";
import {
  stores,
  team,
  today,
  dateText,
  demoPlans,
  seedTasks,
  status,
  type Visit,
  type Task,
} from "./data";
const home = "Inicio diario";
type Group = [string, [string, LucideIcon][]];
const base: Group[] = [
  [
    "Espacio de trabajo",
    [
      [home, LayoutDashboard],
      ["Registrar gestión", ClipboardPenLine],
      ["Farmacias", Store],
      ["Pendientes", ListChecks],
      ["Plan del mes", CalendarDays],
    ],
  ],
  [
    "Formación y seguimiento",
    [
      ["Nuevos ingresos", UserRoundPlus],
      ["Concursos", Trophy],
      ["Campañas", Megaphone],
      ["Simi Escuela", GraduationCap],
    ],
  ],
  [
    "Resultados",
    [
      ["Mi desempeño", ChartNoAxesColumnIncreasing],
      ["Encuestas", MessageSquareText],
    ],
  ],
];
const admins: [string, LucideIcon][] = [
  ["Revisión del equipo", Users],
  ["Carteras", Layers],
  ["Dotación", BookUser],
  ["Cargas de archivos", Upload],
  ["Permisos designados", ShieldCheck],
  ["Indicadores", ChartNoAxesColumnIncreasing],
];
const readRoute = () => {
  const url = new URL(location.href);
  if (url.hash) {
    try {
      const [page, id] = url.hash.slice(1).split("/").map(decodeURIComponent);
      return { page: page || home, id: id || "" };
    } catch {
      // A malformed legacy bookmark should not prevent the workspace from opening.
    }
  }
  return { page: url.searchParams.get("pagina") || home, id: url.searchParams.get("registro") || "" };
};
function routeUrl(page: string, id: string) {
  const url = new URL(location.href);
  url.hash = "";
  url.searchParams.set("pagina", page);
  if (id) url.searchParams.set("registro", id);
  else url.searchParams.delete("registro");
  return url;
}
const emptyTasks = [
  ...seedTasks,
  { ...seedTasks[0], id: "seed-cancel", closed: true, cancelled: true },
];
class Recovery extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <section className="error-screen">
        <h1>No pudimos cargar tu espacio</h1>
        <p>Comprueba que el navegador permita guardar datos.</p>
        <button className="primary" onClick={() => location.reload()}>
          Reintentar
        </button>
      </section>
    ) : (
      this.props.children
    );
  }
}
export default function Praxia({ ingreso = false }: { ingreso?: boolean }) {
  const [ready, R] = useState(false);
  useEffect(() => {
    R(true);
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator)
      navigator.serviceWorker.register("/praxia-worker.js").catch(() => {});
  }, []);
  return ready ? (
    <Recovery>
      <SettingsProvider>
        <Workspace ingreso={ingreso} />
      </SettingsProvider>
    </Recovery>
  ) : (
    <div role="status" className="workspace-loading">
      Cargando Praxia…
    </div>
  );
}
function Workspace({ ingreso }: { ingreso: boolean }) {
  const ctx = useSettings(),
    [role, R] = useLocal("perfil", "Nutricionista"),
    admin = role === "Administradora",
    who = admin ? "Paula Fuentes" : team[0];
  const [route, G] = useState(readRoute),
    [menu, M] = useState(false),
    [picker, K] = useState(ingreso || !role),
    [online, N] = useState(navigator.onLine),
    [message, A] = useState(""),
    [dark, D] = useLocal("oscuro", false),
    [records, V] = useLocal<{ visits: Visit[]; tasks: Task[] }>("registros", {
      visits: examples,
      tasks: emptyTasks,
    }),
    [plans, P] = useLocal("planes", demoPlans),
    [planner, Y] = useState(team[0]),
    [sessions, U] = useLocal<Session[]>("jornadas", [
      { day: 5, title: "Productos naturales" },
      { day: 12, title: "Atención en farmacia" },
      { day: 19, title: "Vitamina C" },
      { day: 26, title: "Práctica en terreno" },
    ]),
    [notes, B] = useLocal<Notice[]>("avisos", [
      {
        title: "Nuevo ingreso en Farmacia Providencia",
        date: today,
        to: team[0],
        hotel: "",
      },
      {
        title: "Prioriza las farmacias en foco rojo esta semana.",
        date: today,
        to: "Todas",
        hotel: "plan",
      },
    ]),
    [seen, Z] = useLocal<string[]>("leidos:" + who, []),
    [install, I] = useState<any>(null),
    [help, H] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const blocked = () =>
      queueMicrotask(() =>
        notify("Sin conexión. No se guardaron los cambios."),
      );
    window.addEventListener("praxia-offline", blocked);
    const pop = () => {
        G(readRoute());
        M(false);
      },
      net = () => N(navigator.onLine),
      prompt = (e: Event) => {
        e.preventDefault();
        I(e);
      },
      key = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          M(false);
          if (role) K(false);
        }
      };
    if (location.hash) {
      const { page, id } = readRoute();
      history.replaceState(history.state, "", routeUrl(page, id));
    }
    window.addEventListener("popstate", pop);
    window.addEventListener("online", net);
    window.addEventListener("offline", net);
    window.addEventListener("beforeinstallprompt", prompt);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("praxia-offline", blocked);
      window.removeEventListener("popstate", pop);
      window.removeEventListener("online", net);
      window.removeEventListener("offline", net);
      window.removeEventListener("beforeinstallprompt", prompt);
      window.removeEventListener("keydown", key);
    };
  }, [role]);
  function notify(s: string) {
    A(s);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => A(""), 4500);
  }
  function go(s: string, id = "") {
    if (s === "Inicio del día") s = home;
    const url = routeUrl(s, id);
    if (url.href !== location.href) history.pushState(null, "", url);
    G({ page: s, id });
    M(false);
    window.scrollTo(0, 0);
  }
  function announce(title: string, to: string, hotel = "") {
    B((v) => [{ title, date: today, to, hotel }, ...v]);
  }
  const groups: Group[] = [
    ...base,
    ...(admin
      ? [
          [
            "Administración",
            admins.filter(
              ([s]) =>
                s !== "Permisos designados" ||
                ctx.permission(who, "Gestionar permisos"),
            ),
          ] as Group,
        ]
      : []),
  ];
  if (!admin && ctx.permission(who, "Gestionar permisos"))
    groups.push(["Permisos", [["Permisos designados", ShieldCheck]]]);
  if (!admin && ctx.permission(who, "Exportar datos"))
    groups.push(["Análisis", [["Indicadores", ChartNoAxesColumnIncreasing]]]);
  const { visits, tasks } = records;
  const owned = stores.filter(
      (s) =>
        ctx.owner(s.id) === who ||
        ctx.covers.some(
          (c) =>
            c.temporary &&
            c.store === s.id &&
            c.who === who &&
            c.start <= today &&
            c.end >= today,
        ),
    ),
    ownIds = owned.map((s) => s.id),
    myVisits = admin ? visits : visits.filter((v) => v.author === who),
    myTasks = admin ? tasks : tasks.filter((t) => ownIds.includes(t.store));
  const page = route.page,
    store = stores.find((s) => s.id === route.id),
    current = visits.find((v) => v.id === route.id),
    person = admin ? planner : who,
    plan = plans[person] ?? plans[team[0]];
  const open = (id: string) => go("Ficha de farmacia", id),
    view = (id: string) => go("Detalle de visita", id);
  const canOperate =
    admin ||
    page === "Viajes" ||
    (page === "Permisos designados" &&
      ctx.permission(who, "Gestionar permisos")) ||
    (page === "Indicadores" && ctx.permission(who, "Exportar datos"));
  const auto = Object.entries(plans).flatMap(([name, p]) =>
    p.rows
      .filter(
        (r) =>
          outstanding(r.date, r.store, visits) &&
          (name === who ||
            (admin &&
              status(stores.find((s) => s.id === r.store)!, visits, tasks).p <=
                2)),
      )
      .map((r) => ({
        title: "Por regularizar: " + r.store + " · " + dateText(r.date),
        date: r.date,
        to: name,
        hotel: "regularizar",
      })),
  );
  const importedNotices = ctx.batches
    .filter((b) => b.source === "Nuevos ingresos")
    .flatMap((b) =>
      b.rows
        .filter((r) => admin || ctx.owner(r[0]) === who)
        .map((r) => ({
          title: "Nuevo ingreso: " + r[2] + " · " + r[0],
          date: r[3],
          to: ctx.owner(r[0]),
          hotel: "",
        })),
    );
  const feed = [
      ...importedNotices,
      ...notes.filter((n) => admin || n.to === "Todas" || n.to === who),
      ...auto,
    ],
    unread = feed.filter((n) => !seen.includes(n.title)).length;
  function save(v: Visit, reason = "") {
    if (!online) return notify("Sin conexión. El borrador se conserva.");
    const old = visits.find((x) => x.id === v.id);
    if (old && old.author !== who && !admin) return;
    const next = {
      ...v,
      history: old
        ? [
            ...(old.history ?? []),
            {
              when: new Date().toLocaleString("es-CL"),
              who,
              reason,
              snapshot: JSON.stringify({ ...old, history: undefined }),
            },
          ]
        : [],
    };
    V({
      visits: [next, ...visits.filter((x) => x.id !== v.id)],
      tasks: reconcileTasks(tasks, next),
    });
    view(v.id);
    notify(
      v.annulled
        ? "Visita anulada"
        : old && page !== "Agregar gestión"
          ? "Visita actualizada"
          : v.attempt
            ? "Intento registrado"
            : "Gestión registrada",
    );
  }
  const performance = metrics(
    myVisits,
    admin ? stores.map((s) => s.id) : ownIds,
  );
  const choose = (r: string) => {
    R(r);
    K(false);
    go(home);
  };
  const nav = (s: string, Icon: LucideIcon) => (
    <button
      key={s}
      onClick={() => go(s)}
      className={
        "nav-link " +
        (page === s || (s === "Farmacias" && page === "Ficha de farmacia")
          ? "active"
          : "")
      }
      aria-current={page === s ? "page" : undefined}
    >
      <Icon size={17} />
      {s}
      {s === "Pendientes" && (
        <em>{myTasks.filter((t) => !t.closed && t.date <= today).length}</em>
      )}
    </button>
  );
  return (
    <div className={"shell " + (dark ? "dark-shell" : "")}>
      {menu && (
        <button
          className="scrim"
          aria-label="Cerrar menú"
          onClick={() => M(false)}
        />
      )}
      <aside className={"sidebar " + (menu ? "shown" : "")}>
        <div className="brand-block">
          <div className="brand">
            <span className="brand-symbol" aria-hidden>
              <i />
              <i />
              <i />
              <i />
            </span>
            <strong>Praxia</strong>
          </div>
          <p>Del conocimiento a la acción</p>
        </div>
        <nav aria-label="Navegación principal">
          {groups.map(([label, items]) => (
            <div className="nav-group" key={label}>
              <div className="nav-label">{label}</div>
              {items.map(([s, Icon]) => nav(s, Icon))}
            </div>
          ))}
        </nav>
        <div className="side-bottom">
          {nav("Configuración", Settings)}
          <button className="profile" onClick={() => K(true)}>
            <span className="avatar">{admin ? "PF" : "CM"}</span>
            <span>
              <strong>{who}</strong>
              <small>{role}</small>
            </span>
            <ChevronsUpDown size={16} />
          </button>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <button
            className="iconbtn menu-btn"
            aria-label="Abrir menú"
            onClick={() => M(true)}
          >
            <Menu size={20} />
          </button>
          <div className="crumb">
            <House size={15} />
            <span>Mi espacio</span>
            <ChevronRight size={13} />
            <b>{page}</b>
          </div>
          <div className="top-actions">
            <span className="online-badge">
              {online ? "En línea" : "Sin conexión"}
            </span>
            <span className="divider" />
            <button
              className="iconbtn bell"
              aria-label={"Avisos internos: " + unread + " sin leer"}
              onClick={() => go("Avisos internos")}
            >
              <Bell size={19} />
              {!!unread && <b className="counter">{unread}</b>}
            </button>
            <span className="divider" />
            <button
              className="top-role"
              onClick={() => K(true)}
              aria-label="Cambiar perfil"
            >
              <BriefcaseBusiness size={16} />
              <span>{role}</span>
              <ChevronDown size={13} />
            </button>
          </div>
        </header>
        <div className="content">
          {!online && (
            <p role="status" className="offline-note">
              Sin conexión. Lo que escribas queda en pantalla, pero no se guarda
              hasta que vuelva la señal.
            </p>
          )}
          {page === home && !admin ? (
            <Dashboard
              first={who.split(" ")[0]}
              visits={myVisits}
              tasks={myTasks}
              plan={plan.rows}
              open={open}
              go={go}
              visit={() => go("Registrar gestión")}
            />
          ) : (page === home && admin) ||
            admins.some(([s]) => s === page) ||
            page === "Viajes" ? (
            canOperate ? (
              <Operations
                key={page}
                page={page === home ? "Revisión del equipo" : page}
                who={who}
                admin={admin}
                visits={visits}
                tasks={tasks}
                plans={plans}
                consider={(n, t) => announce(t, n, "plan")}
                announce={announce}
              />
            ) : (
              <p>Esta sección no está disponible para tu perfil.</p>
            )
          ) : [
              "Registrar gestión",
              "Corregir visita",
              "Agregar gestión",
            ].includes(page) &&
            (page === "Registrar gestión" ||
              (current &&
                !current.annulled &&
                (admin || current.author === who))) ? (
            <VisitForm
              key={page + route.id + who}
              initial={store?.id ?? ""}
              author={who}
              original={page === "Registrar gestión" ? undefined : current}
              append={page === "Agregar gestión"}
              visits={visits}
              tasks={tasks}
              offline={!online}
              save={save}
              cancel={() =>
                current ? view(current.id) : store ? open(store.id) : go(home)
              }
            />
          ) : page === "Detalle de visita" && current ? (
            <VisitDetail
              key={current.id}
              v={current}
              author={who}
              admin={admin}
              edit={(append) =>
                go(append ? "Agregar gestión" : "Corregir visita", current.id)
              }
              save={save}
            />
          ) : page === "Ficha de farmacia" && store ? (
            <Detail
              s={store}
              tasks={tasks}
              visits={visits}
              visit={() => go("Registrar gestión", store.id)}
              view={view}
            />
          ) : ["Farmacias", "Focos rojos"].includes(page) ? (
            <Portfolio
              key={page}
              owner={admin ? undefined : who}
              red={page === "Focos rojos"}
              visits={visits}
              tasks={tasks}
              open={open}
            />
          ) : page === "Pendientes" ? (
            <Tasks
              tasks={myTasks}
              open={open}
              close={(id, closure) =>
                V({
                  ...records,
                  tasks: tasks.map((t) =>
                    t.id === id ? { ...t, closed: !t.closed, closure } : t,
                  ),
                })
              }
            />
          ) : page === "Plan del mes" ? (
            <>
              {admin && (
                <label>
                  Nutricionista
                  <select value={planner} onChange={(e) => Y(e.target.value)}>
                    {team.map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </label>
              )}
              <Planning
                planner={person}
                plan={plan.rows}
                setPlan={(rows) =>
                  P((p) => ({ ...p, [person]: { ...p[person], rows } }))
                }
                published={plan.published}
                publish={(published) =>
                  P((p) => ({ ...p, [person]: { ...p[person], published } }))
                }
                visits={visits}
                tasks={tasks}
                notices={notes.filter(
                  (n) =>
                    n.hotel === "plan" && (n.to === "Todas" || n.to === person),
                )}
                open={open}
                notify={notify}
              />
            </>
          ) : page === "Nuevos ingresos" ? (
            <Training who={who} admin={admin} announce={announce} />
          ) : ["Encuestas", "Concursos", "Campañas"].includes(page) ? (
            <Commercial key={page} page={page} who={who} admin={admin} />
          ) : page === "Simi Escuela" ? (
            <>
              <Resources
                who={who}
                management={admin}
                visits={visits}
                page={page}
                open={open}
                sessions={sessions}
                setSessions={U}
                edit={ctx.permission(who, "Habilitar Simi Escuela")}
              />
              <p className="note-box">
                Sin asistencia registrada: {stores[1].name}. Dato informativo,
                no genera una alerta.
              </p>
            </>
          ) : page === "Mi desempeño" ? (
            <>
              <Intro
                title={page}
                desc="Resultados de tu trabajo durante el mes actual."
              />
              <section className="panel form-panel">
                <h2>Indicadores del mes</h2>
                <Table
                  headers={["Indicador", "Resultado"]}
                  rows={[
                    ["Cobertura de cartera", performance.coverage + " %"],
                    ["Gestiones del mes", performance.count],
                    ["Personas capacitadas", performance.people],
                  ]}
                />
                <h3>Visitas registradas</h3>
                {myVisits.map((v) => (
                  <button
                    key={v.id}
                    className="simple-row"
                    onClick={() => view(v.id)}
                  >
                    <div>
                      <strong>
                        {v.store} · {dateText(v.date)}
                      </strong>
                      <small>
                        {v.attempt
                          ? "Intento"
                          : v.actions.map((a) => a.type).join(", ")}{" "}
                        · {v.annulled ? "Anulada" : "Vigente"}
                      </small>
                    </div>
                    <ChevronRight size={16} />
                  </button>
                ))}
              </section>
            </>
          ) : page === "Avisos internos" ? (
            <>
              <Intro
                title={page}
                desc="Nuevos ingresos, aprobaciones y actividades que requieren atención."
              />
              <section className="panel form-panel">
                <button
                  className="secondary"
                  disabled={!unread}
                  onClick={() => Z(feed.map((n) => n.title))}
                >
                  Marcar todos como leídos
                </button>
                {feed.map((n, i) => (
                  <button
                    className="simple-row"
                    key={i}
                    onClick={() => {
                      Z([...seen, n.title]);
                      if (n.hotel === "regularizar") Y(n.to);
                      go(
                        n.hotel === "plan" || n.hotel === "regularizar"
                          ? "Plan del mes"
                          : n.title.includes("viaje")
                            ? "Viajes"
                            : "Nuevos ingresos",
                      );
                    }}
                  >
                    <Bell size={17} />
                    <div>
                      <strong>{n.title}</strong>
                      <small>
                        {dateText(n.date)} ·{" "}
                        {seen.includes(n.title) ? "Leído" : "Nuevo"}
                      </small>
                    </div>
                    <ChevronRight size={15} />
                  </button>
                ))}
              </section>
            </>
          ) : page === "Configuración" ? (
            <>
              <Intro
                title={page}
                desc="Personaliza tu espacio de trabajo y administra tu perfil de demostración."
              />
              <section className="panel form-panel">
                <label>
                  Apariencia
                  <select
                    value={dark ? "Oscura" : "Clara"}
                    onChange={(e) => D(e.target.value === "Oscura")}
                  >
                    <option>Clara</option>
                    <option>Oscura</option>
                  </select>
                </label>
                <button className="simple-row" onClick={() => go("Viajes")}>
                  <Plane size={18} />
                  Solicitudes de viaje
                  <ChevronRight size={16} />
                </button>
                <button
                  className="simple-row"
                  onClick={async () => {
                    if (!install) return H(!help);
                    await install.prompt();
                    I(null);
                  }}
                >
                  <Download size={18} />
                  Instalar Praxia
                </button>
                {help && (
                  <p className="install-guide">
                    Abre Praxia en su propia pestaña. En el menú de tu navegador
                    elige «Instalar aplicación» o «Agregar a inicio». En Safari,
                    usa Compartir y «Agregar a inicio».
                  </p>
                )}
                <button className="simple-row" onClick={() => K(true)}>
                  <Users size={18} />
                  Cambiar perfil
                </button>
                <button
                  className="simple-row"
                  onClick={() => {
                    R("");
                    K(true);
                    go(home);
                  }}
                >
                  <LogOut size={18} />
                  Cerrar sesión
                </button>
              </section>
            </>
          ) : (
            <section className="panel form-panel">
              <h2>No se encontró la sección</h2>
              <button className="secondary" onClick={() => go(home)}>
                Volver al inicio
              </button>
            </section>
          )}
          <footer>
            <span className="footer-mark">Praxia</span>
            <i />
            Nutrición y Entrenamiento Comercial
          </footer>
        </div>
      </main>
      {picker && (
        <RolePicker choose={choose} close={role ? () => K(false) : undefined} />
      )}{" "}
      {message && (
        <div className="toast" role="status">
          <Check size={16} />
          {message}
        </div>
      )}
    </div>
  );
}
function RolePicker({
  choose,
  close,
}: {
  choose: (s: string) => void;
  close?: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      className="role-dialog"
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        close?.();
      }}
    >
      <div className="heading-line">
        <div className="eyebrow">Acceso de demostración</div>
        {close && (
          <button className="iconbtn" aria-label="Cerrar" onClick={close}>
            <X size={18} />
          </button>
        )}
      </div>
      <h2>Elige tu perfil</h2>
      <p>Recorre Praxia con datos ficticios guardados en este navegador.</p>
      {["Nutricionista", "Administradora"].map((r, i) => (
        <button className="simple-row" key={r} onClick={() => choose(r)}>
          <span className="avatar">{i ? "PF" : "CM"}</span>
          <div>
            <strong>{r}</strong>
            <small>
              {i
                ? "Paula Fuentes · Gestión del equipo"
                : "Camila Morales · Trabajo en terreno"}
            </small>
          </div>
          <ChevronRight size={16} />
        </button>
      ))}
    </dialog>
  );
}
