"use client";
import { useEffect, useState, useRef } from "react";
import { SettingsProvider, useSettings } from "./settings";
import {
  LayoutDashboard,
  CalendarDays,
  Store as Shop,
  ListChecks,
  ChartNoAxesColumnIncreasing,
  GraduationCap,
  Trophy,
  Package,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  CloudCheck,
  CloudOff,
  Bell,
  Menu,
  X,
  PanelLeft,
  MapPin,
  Route,
  ArrowRight,
  Check,
  Compass,
  Wifi,
  UserRound,
  LogOut,
} from "lucide-react";
import Dashboard from "./dashboard";
import VisitForm from "./visit";
import { Detail, Portfolio, Tasks } from "./portfolio";
import Planning, { type Notice } from "./planning";
import { Resources, type Session } from "./resources";
import Admin from "./admin";
import ManagementHome, {useTeamSummary} from './management-home';
import {
  today,
  roles,
  names,
  stores,
  initialPlan,
  seedTasks,
  type Visit,
  type Task,
  type Row,
} from "./data";
const groups = [
  {
    title: "Espacio de trabajo",
    items: [
      ["Inicio del día", LayoutDashboard],
      ["Plan del mes", CalendarDays],
      ["Mi cartera", Shop],
      ["Mis pendientes", ListChecks],
      ["Mi desempeño", ChartNoAxesColumnIncreasing],
    ],
  },
  {
    title: "Recursos comerciales",
    items: [
      ["Simi Escuela", GraduationCap],
      ["Ventas y concursos", Trophy],
      ["Inventario G8", Package],
    ],
  },
] as const;
function Brand() {
  return (
    <div className="brand">
      <svg viewBox="0 0 44 44" width="40" height="40" aria-hidden="true">
        <g fill="#b6d9ac">
          <path id="p" d="M21 21C10 22 3 17 4 7c10-1 18 4 17 14Z" />
          <use href="#p" transform="rotate(90 22 22)" />
          <use href="#p" transform="rotate(180 22 22)" />
          <use href="#p" transform="rotate(270 22 22)" />
        </g>
      </svg>
      <strong>Praxia</strong>
    </div>
  );
}
const queueDB = () =>
  new Promise<IDBDatabase>((res, rej) => {
    const r = indexedDB.open("praxia-cola-demo", 1);
    r.onupgradeneeded = () =>
      r.result.createObjectStore("visitas", { keyPath: "id" });
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
export default function Praxia({ ingreso = false }: { ingreso?: boolean }) {
  return (
    <SettingsProvider>
      <App ingreso={ingreso} />
    </SettingsProvider>
  );
}
function App({ ingreso }: { ingreso: boolean }) {
  const settings = useSettings();
  const [page, G] = useState("Inicio del día"),
    [role, R] = useState(roles[0]),
    [picker, K] = useState(ingreso),
    [mobile, M] = useState(false),
    [pop, P] = useState(""),
    [offline, O] = useState(false),
    [network, N] = useState(true),
    [id, S] = useState(stores[0].id),
    [visits, V] = useState<Visit[]>([]),
    [tasks, T] = useState<Task[]>(seedTasks),
    [plan, L] = useState<Row[]>(initialPlan),
    [published, H] = useState(false),
    [toast, A] = useState(""),
    [notices, B] = useState<Notice[]>([
      {
        title: "Simi Escuela: productos naturales",
        date: "2026-11-26",
        to: "Todas",
        hotel: "",
      },
      {
        title: "Reunión de cierre mensual",
        date: "2026-11-30",
        to: "Todas",
        hotel: "",
      },
    ]),
    [sessions, U] = useState<Session[]>(
      [5, 12, 19, 26].map((day, i) => ({
        day,
        title: [
          "Fármacos en terreno",
          "Vitamina C G8",
          "Invitada especial",
          "Productos naturales",
        ][i],
      })),
    ),
    [permission, Q] = useState(false);
  const who = names[roles.indexOf(role)],
    off = offline || !network,
    late = tasks.filter((t) => !t.closed && t.date < today).length,
    timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function notify(s: string) {
    A(s);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => A(""), 5000);
  }
  function go(s: string) {
    G(s);
    M(false);
    P("");
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function open(s: string) {
    S(s);
    go("Ficha de farmacia");
  }
  function newVisit() {
    if (page !== "Ficha de farmacia") S(stores[0].id);
    go("Registrar visita");
  }
  function pend(v: Visit) {
    return v.actions.flatMap((a, i) =>
      a.persons
        .filter((p) => p.result === "Requiere seguimiento")
        .map((p) => ({
          id: v.id + "-" + i + "-" + p.id,
          store: v.store,
          name: p.name,
          kind: p.kind,
          date: p.due,
          closed: false,
        })),
    );
  }
  useEffect(() => {
    const fn = () => N(navigator.onLine);
    fn();
    window.addEventListener("online", fn);
    window.addEventListener("offline", fn);
    queueDB()
      .then((db) => {
        const r = db.transaction("visitas").objectStore("visitas").getAll();
        r.onsuccess = () => {
          const rows = r.result as Visit[];
          V((prev) => [
            ...prev,
            ...rows.filter((r) => !prev.some((x) => x.id === r.id)),
          ]);
          T((prev) => [
            ...prev,
            ...rows
              .flatMap(pend)
              .filter((r) => !prev.some((x) => x.id === r.id)),
          ]);
          db.close();
        };
      })
      .catch(() => {});
    return () => {
      window.removeEventListener("online", fn);
      window.removeEventListener("offline", fn);
    };
  }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        P("");
        M(false);
        K(false);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  async function save(v: Visit) {
    v.queued = off;
    try {
      if (off) {
        const db = await queueDB();
        await new Promise((res, rej) => {
          const tx = db.transaction("visitas", "readwrite");
          tx.objectStore("visitas").put(v);
          tx.oncomplete = () => res(true);
          tx.onerror = () => rej(tx.error);
        });
        db.close();
      }
      V([v, ...visits]);
      T([...pend(v), ...tasks]);
      open(v.store);
      notify(
        off
          ? "Visita guardada en el dispositivo. Pendiente de sincronizar."
          : "Visita guardada. Ficha y pendientes actualizados.",
      );
    } catch {
      notify("No se pudo guardar la visita. Intenta nuevamente.");
    }
  }
  async function sync() {
    if (off) return;
    try {
      const db = await queueDB();
      const tx = db.transaction("visitas", "readwrite");
      tx.objectStore("visitas").clear();
      tx.oncomplete = () => {
        V(visits.map((v) => ({ ...v, queued: false })));
        db.close();
        notify("Cola sincronizada en esta demostración.");
      };
    } catch {
      notify("No se pudo procesar la cola.");
    }
  }
  const allVisits:Visit[]=[...visits,...settings.batches.filter(b=>b.source==='Histórico de visitas').flatMap(b=>b.rows.map(([store,date,mode,author],i)=>({id:'historico-'+i,store,date,mode,author,actions:[],other:'Histórico importado',queued:false})))];
  const rows = useTeamSummary(allVisits, tasks, plan, published);
  const [adminTab, setAdminTab] = useState('Equipo');
  const homeLabel = role === roles[0] ? 'Inicio del día' : role === 'Administrador' ? 'Panel de administración' : 'Panel de jefatura';
  function manage(tab:string) { setAdminTab(tab); go('Administración'); }
  const count = visits.filter((v) => v.queued).length;
  return (
    <div className="shell">
      {mobile && (
        <button
          className="scrim"
          aria-label="Cerrar menú"
          onClick={() => M(false)}
        />
      )}
      <aside className={mobile ? "sidebar shown" : "sidebar"}>
        <div className="brand-block">
          <Brand />
          <p>Del conocimiento a la acción</p>
        </div>
        <nav>
          {groups.map((g) => (
            <div className="nav-group" key={g.title}>
              <div className="nav-label">{g.title}</div>
              {g.items.map(([s, Icon]) => (
                <button
                  key={s}
                  onClick={() => go(s)}
                  className={
                    page === s ||
                    (s === "Mi cartera" &&
                      [
                        "Ficha de farmacia",
                        "Focos rojos",
                        "Registrar visita",
                      ].includes(page))
                      ? "nav-link active"
                      : "nav-link"
                  }
                >
                  <Icon size={18} />
                  {s === 'Inicio del día' ? homeLabel : s}
                  {s === "Mis pendientes" && late > 0 && <em>{late}</em>}
                </button>
              ))}
            </div>
          ))}
          {role !== roles[0] && (
            <button className="nav-link" onClick={() => go("Administración")}>
              <SlidersHorizontal size={18} />
              Administración
            </button>
          )}
        </nav>
        <div className="side-bottom">
          <div className="route-note">
            <i>
              <Route size={18} />
            </i>
            <div>
              <strong>Ruta 08</strong>
              <small>Región Metropolitana</small>
            </div>
          </div>
          <button
            className="profile"
            onClick={() => {
              K(true);
              M(false);
            }}
          >
            <span className="avatar">
              {who
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
            <span>
              <strong>{who}</strong>
              <small>{role}</small>
            </span>
            <ChevronsUpDown size={15} />
          </button>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <button
            className="iconbtn menu-btn"
            onClick={() => M(true)}
            aria-label="Abrir menú"
          >
            <Menu />
          </button>
          <div className="crumb">
            <PanelLeft size={16} />
            <span>Mi espacio</span>
            <ChevronRight size={13} />
            <b>{page === "Focos rojos" ? "Mi cartera" : page === 'Inicio del día' ? homeLabel : page}</b>
          </div>
          <div className="top-actions">
            <button
              className={"sync " + (off ? "off" : "")}
              onClick={() => P(pop === "sync" ? "" : "sync")}
            >
              {off ? <CloudOff size={15} /> : <CloudCheck size={15} />}{" "}
              {off
                ? "Sin conexión"
                : count
                  ? "Por sincronizar"
                  : "Sincronizado"}
            </button>
            <span className="divider" />
            <button
              className="bell iconbtn"
              aria-label="Ver alertas"
              onClick={() => P(pop === "alerts" ? "" : "alerts")}
            >
              <Bell size={19} />
              <i />
            </button>
          </div>
          {pop && (
            <>
              <button
                className="dismiss"
                onClick={() => P("")}
                aria-label="Cerrar panel"
              />
              <div className="popover">
                <h3>
                  {pop === "sync"
                    ? "Estado de sincronización"
                    : "Alertas de la jornada"}
                </h3>
                {pop === "sync" ? (
                  <>
                    <p>
                      {off
                        ? "Modo sin conexión activo."
                        : "Conexión disponible."}{" "}
                      {count} visitas en cola.
                    </p>
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={offline}
                        onChange={(e) => O(e.target.checked)}
                      />{" "}
                      Simular sin conexión
                    </label>
                    {count > 0 && (
                      <button className="primary" disabled={off} onClick={sync}>
                        Sincronizar maqueta
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button onClick={() => go("Focos rojos")}>
                      Revisar farmacias en foco rojo <ChevronRight size={15} />
                    </button>
                    <button onClick={() => go("Mis pendientes")}>
                      {late} seguimientos vencidos <ChevronRight size={15} />
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </header>
        <div className="content">
          {page === 'Inicio del día' && role !== roles[0] ? <ManagementHome role={role} rows={rows} go={go} manage={manage} late={late}/> : page === "Inicio del día" ? (
            <Dashboard
              first={who.split(" ")[0]}
              go={go}
              open={open}
              visit={newVisit}
              visits={allVisits}
              tasks={tasks}
              plan={plan}
            />
          ) : page === "Registrar visita" ? (
            <VisitForm
              initial={id}
              save={save}
              author={who}
              cancel={() => open(id)}
            />
          ) : ["Mi cartera", "Focos rojos"].includes(page) ? (
            <Portfolio
              key={page}
              visits={allVisits}
              tasks={tasks}
              red={page === "Focos rojos"}
              open={open}
            />
          ) : page === "Ficha de farmacia" ? (
            <Detail
              s={stores.find((s) => s.id === id)!}
              visits={allVisits}
              tasks={tasks}
              visit={newVisit}
            />
          ) : page === "Mis pendientes" ? (
            <Tasks
              tasks={tasks}
              close={(id) =>
                T(
                  tasks.map((t) =>
                    t.id === id ? { ...t, closed: !t.closed } : t,
                  ),
                )
              }
              open={open}
            />
          ) : page === "Plan del mes" ? (
            <Planning
              plan={plan}
              setPlan={L}
              published={published}
              publish={H}
              notices={notices.filter((n) => n.to === "Todas" || n.to === who)}
              visits={allVisits}
              tasks={tasks}
              open={open}
              notify={notify}
            />
          ) : page !== "Administración" ? (
            <Resources
              key={page}
              page={page}
              visits={allVisits}
              open={open}
              sessions={sessions}
              setSessions={U}
              who={who} management={role !== roles[0]}
              edit={settings.permission(who, "escuela")}
            />
          ) : null}
          <div hidden={page !== "Administración" || role === "Nutricionista"}>
            <Admin tab={adminTab} T={setAdminTab} rows={rows}
              role={role}
              plan={plan}
              published={published}
              notices={notices}
              setNotices={B}
              notify={notify}
              permission={permission}
              permit={Q}
            />
          </div>
          <footer>
            <span className="footer-mark">Praxia</span> Entrenamiento comercial{" "}
            <i /> Espacio de trabajo
          </footer>
        </div>
      </main>
      {picker && (
        <div className="overlay">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="access"
            className="dialog"
          >
            <div className="heading-line">
              <div className="eyebrow">Acceso de demostración</div>
              <button
                className="iconbtn"
                aria-label="Cerrar"
                onClick={() => K(false)}
              >
                <X size={18} />
              </button>
            </div>
            <h2 id="access">Ingresar a Praxia</h2>
            <p>
              Selecciona un perfil ficticio para recorrer su espacio de trabajo.
            </p>
            {roles.map((r, i) => (
              <button
                key={r}
                className="simple-row"
                onClick={() => {
                  R(r);
                  K(false);
                  setAdminTab('Equipo');
                  go('Inicio del día');
                }}
              >
                <span className="avatar">
                  {names[i]
                    .split(" ")
                    .map((s) => s[0])
                    .join("")}
                </span>
                <div>
                  <strong>{names[i]}</strong>
                  <small>{r}</small>
                </div>
                <ArrowRight size={16} />
              </button>
            ))}
          </section>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
          <button onClick={() => A("")} aria-label="Cerrar aviso">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
