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
import {Onboarding} from './onboarding';
import {Reconciliation,VisitAudit} from './traceability';
import {Inventory,Satisfaction} from './commercial';
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
  demoPlans, team,
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
      ['Nuevos ingresos',UserRound],
      ["Ventas y concursos", Trophy],
      ["Inventario G8", Package],
      ["Encuesta de satisfacción", ListChecks],
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
    [taskRecords, T] = useState<Task[]>(seedTasks),
    [plans, setPlans] = useState(demoPlans),
    [selectedPlanner, selectPlanner] = useState(team[0]),
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
  const tasks=taskRecords.filter(t=>!visits.some(v=>v.voided&&t.id.startsWith(v.id+'-')));
  const who = names[roles.indexOf(role)],
    off = offline || !network,
    late = tasks.filter((t) => !t.closed && t.date < today).length,
    timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const planner = role === roles[0] ? who : selectedPlanner;
  const {rows:plan, published} = plans[planner];
  const L = (rows:Row[]) => setPlans(prev=>({...prev,[planner]:{...prev[planner],rows}}));
  const H = (published:boolean) => setPlans(prev=>({...prev,[planner]:{...prev[planner],published}}));
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
          id: v.id + "-" + i + "-" + (p.originalId||p.id),
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
    v.syncState=off?'Pendiente':'Sincronizado';
    try {
      {
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
      T(prev=>[...pend(v), ...prev]);
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
  const [scenario,setScenario]=useState('Normal'),[syncing,setSyncing]=useState(false);
  const queue=visits.filter(v=>v.queued&&v.author===who);
  async function updateQueue(rows:Visit[]){const db=await queueDB();try{await new Promise<void>((ok,no)=>{const tx=db.transaction('visitas','readwrite');for(const row of rows)tx.objectStore('visitas').put(row);tx.oncomplete=()=>ok();tx.onerror=()=>no(tx.error);tx.onabort=()=>no(tx.error)})}finally{db.close()}V(prev=>[...rows,...prev.filter(v=>!rows.some(r=>r.id===v.id))])}
  async function sync(){if(off||syncing)return;const pending=queue.filter(v=>v.syncState!=='Conflicto');if(!pending.length)return;setSyncing(true);try{V(prev=>prev.map(v=>pending.some(p=>p.id===v.id)?{...v,syncState:'Sincronizando'}:v));await new Promise(ok=>setTimeout(ok,450));await updateQueue(pending.map(v=>({...v,queued:scenario!=='Normal',syncState:scenario==='Normal'?'Sincronizado':scenario==='Error de conexión'?'Error':'Conflicto'})));notify(scenario==='Normal'?'Registros sincronizados en la maqueta.':'Registros conservados. Revisa la cola para continuar.');setScenario('Normal')}catch{V(prev=>prev.map(v=>pending.some(p=>p.id===v.id)?{...v,syncState:'Error'}:v));notify('No se pudo actualizar la cola. Tus registros se conservan.')}finally{setSyncing(false)}}
  async function resolve(v:Visit,remote:boolean){if(off)return;const remoteMode=v.mode==='Presencial'?'Online':'Presencial';try{await updateQueue([{...v,mode:remote?remoteMode:v.mode,queued:false,syncState:'Sincronizado',resolution:{device:v.mode,remote:remoteMode,choice:remote?'Servidor':'Dispositivo'}}]);notify('Conflicto resuelto. Ambas versiones de la modalidad quedan en el historial.')}catch{notify('No se pudo confirmar. El conflicto sigue abierto.')}}
  const importedVisits:Visit[]=[...settings.batches.filter(b=>b.source==='Histórico de visitas').flatMap(b=>b.rows.map(([store,date,mode,author],i)=>({id:'historico-'+i,store,date,mode,author,actions:[],other:'Histórico importado',queued:false})))];
  const history=[...visits,...importedVisits.filter(v=>!visits.some(x=>x.id===v.id))];
  const allVisits=history.filter(v=>!v.voided);
  async function revise(v:Visit,c:import('./traceability').Change){const admin=role==='Administrador';if(!c.reason||(!admin&&(who!==v.author||v.voided)))return;const next={...v};if(c.operation==='Corregir'){if(!c.date||c.date>today||(c.mode==='Otros'&&!c.other)){notify('Revisa la fecha y la descripción de la modalidad.');return}Object.assign(next,{date:c.date,mode:c.mode,other:c.other})}else next.voided=c.operation==='Anular';const describe=(r:Visit)=>[r.date,r.mode,r.other,r.voided?'Anulada':'Vigente'].filter(Boolean).join(' · ');next.audit=[...(v.audit||[]),{by:who,at:new Date().toISOString(),operation:c.operation,reason:c.reason,before:describe(v),after:describe(next)}];try{await updateQueue([next]);notify('Cambio registrado en el historial.')}catch{notify('No se guardó el cambio. Intenta nuevamente.')}}
  async function reconcile(p:import('./data').Person,target:{id:string;name:string;job:string},reason:string){if(role!=='Administrador'||!reason.trim())return;const revised=history.filter(v=>v.actions.some(a=>a.persons.some(x=>x.id===p.id))).map(v=>({...v,actions:v.actions.map(a=>({...a,persons:a.persons.map(x=>x.id===p.id?{...x,...target,provisional:false,originalId:x.id}:x)})),audit:[...(v.audit||[]),{by:who,at:new Date().toISOString(),reason,operation:'Conciliación',before:p.name+' · '+p.id,after:target.name+' · '+target.id}]}));try{await updateQueue(revised);const from=settings.students.find(x=>x.key===p.id),dest=settings.students.find(x=>x.key===target.id);if(from)settings.setStudents([...settings.students.filter(x=>x!==from&&x!==dest),{...(dest||from),key:target.id,name:target.name,events:[...(dest?.events||[]),...from.events],moves:[...(dest?.moves||[]),...from.moves]}]);T(prev=>prev.map(t=>t.id.endsWith('-'+p.id)?{...t,name:target.name}:t));notify('Identidad conciliada. Alcance recalculado.')}catch{notify('No se aplicó el vínculo. Intenta nuevamente.')}}
  const rows = useTeamSummary(allVisits, tasks, plans);
  const [adminTab, setAdminTab] = useState('Equipo');
  const homeLabel = role === roles[0] ? 'Inicio del día' : role === 'Administrador' ? 'Panel de administración' : 'Panel de jefatura';
  function manage(tab:string) { setAdminTab(tab); go('Administración'); }
  const count = queue.length;
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
          {role==='Administrador'&&<button className="nav-link" onClick={()=>go('Conciliación')}><UserRound size={18}/>Conciliación</button>}
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
                    {queue.length>0&&<><label>Respuesta de prueba<select value={scenario} disabled={syncing} onChange={e=>setScenario(e.target.value)}><option>Normal</option><option>Error de conexión</option><option>Conflicto de modalidad</option></select></label>{queue.map(v=><div key={v.id}><strong>{v.store} · {v.date}</strong><small>{v.syncState||'Pendiente'}</small>{v.syncState==='Conflicto'&&<><p>Selecciona la modalidad correcta. Se conservarán ambas versiones.</p><button className="secondary" disabled={off} onClick={()=>resolve(v,false)}>Dispositivo: {v.mode}</button><button className="secondary" disabled={off} onClick={()=>resolve(v,true)}>Servidor de prueba: {v.mode==='Presencial'?'Online':'Presencial'}</button></>}</div>)}<button className="primary" disabled={off||syncing||queue.every(v=>v.syncState==='Conflicto')} onClick={sync}>{syncing?'Sincronizando…':'Sincronizar maqueta'}</button></>}
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
              visits={allVisits.filter(v=>settings.owner(v.store)===who)}
              tasks={tasks.filter(t=>settings.owner(t.store)===who)}
              plan={plan}
            />
          ) : page === "Registrar visita" ? (
            <VisitForm owner={role === roles[0] ? who : undefined}
              initial={id}
              save={save}
              author={who}
              cancel={() => open(id)}
            />
          ) : ["Mi cartera", "Focos rojos"].includes(page) ? (
            <Portfolio owner={role === roles[0] ? who : undefined}
              key={page}
              visits={allVisits}
              tasks={tasks}
              red={page === "Focos rojos"}
              open={open}
            />
          ) : page === "Ficha de farmacia" ? (
            <Detail
              history={history} audit={v=><VisitAudit visit={v} admin={role==='Administrador'} who={who} apply={revise}/>}
              s={stores.find((s) => s.id === id)!}
              visits={allVisits}
              tasks={tasks}
              visit={newVisit}
            />
          ) : page === "Mis pendientes" ? (
            <Tasks
              tasks={tasks.filter(t=>role==='Administrador'||settings.owner(t.store)===who)}
              close={(id,closure) =>
                T(
                  taskRecords.map((t) =>
                    t.id === id ? { ...t, closed: !t.closed, closure } : t,
                  ),
                )
              }
              open={open}
            />
          ) : page === "Plan del mes" ? (
            <>{role !== roles[0] && <section className="panel form-panel"><label>Plan de la nutricionista<select value={planner} onChange={e=>selectPlanner(e.target.value)}>{team.map(name=><option key={name}>{name}</option>)}</select></label></section>}
            <Planning key={planner} planner={planner}
              plan={plan}
              setPlan={L}
              published={published}
              publish={H}
              notices={notices.filter((n) => n.to === "Todas" || n.to === planner)}
              visits={allVisits}
              tasks={tasks}
              open={open}
              notify={notify}
            /></>
          ) : page==='Nuevos ingresos'?<Onboarding who={who} admin={role==='Administrador'} visits={allVisits}/>:page==='Conciliación'&&role==='Administrador'?<Reconciliation visits={history} reconcile={reconcile}/>:page === 'Inventario G8' ? <Inventory/> : page === 'Encuesta de satisfacción' ? <Satisfaction who={who} management={role==='Administrador'}/> : page !== "Administración" ? (
            <Resources
              key={page}
              page={page}
              visits={role==='Administrador'?allVisits:allVisits.filter(v=>v.author===who)}
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
              plan={Object.values(plans).flatMap(p=>p.rows)}
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
