import { ArrowUpRight, CalendarDays, ClipboardList, FileInput, Flag, Layers, MapPin, ShieldCheck, Store, Users } from 'lucide-react';
import { stores, status, today, type Task, type Visit, type Row } from './data';
import { team, useSettings } from './settings';

export function useTeamSummary(visits: Visit[], tasks: Task[], plan: Row[], published: boolean) {
  const settings = useSettings();
  return team.map(name => {
    const owned = stores.filter(s => settings.owner(s.id) === name);
    const states = owned.map(s => status({...s, school: settings.school(s.id), freq: settings.frequency[s.id] ?? s.freq}, visits, tasks));
    const planned = plan.filter(r => owned.some(s => s.id === r.store)).length;
    return {name, total: owned.length, covered: states.filter(s => s.count > 0).length, red: states.filter(s => s.p === 1).length, planned, planState: planned ? published ? 'Publicado' : 'Borrador' : 'Sin actividades'};
  });
}
export type Summary = ReturnType<typeof useTeamSummary>;
export function TeamTable({rows}: {rows: Summary}) {
  return <div className="scroll"><table aria-label="Indicadores por nutricionista"><thead><tr>{['Nutricionista','Cartera','Cobertura','Focos rojos','Plan mensual'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{rows.map(r => <tr key={r.name}><th scope="row">{r.name}</th><td>{r.total}</td><td>{r.total ? `${Math.round(100*r.covered/r.total)} %` : 'Sin cartera'}</td><td>{r.red}</td><td>{r.planState}</td></tr>)}</tbody></table></div>;
}
export default function ManagementHome({role, rows, go, manage, late}: {role:string; rows:Summary; go:(s:string)=>void; manage:(tab:string)=>void; late:number}) {
  const settings = useSettings();
  const admin = role === 'Administrador';
  const covered = rows.reduce((n,r)=>n+r.covered,0);
  const metrics = admin ? [
    ['Equipo',team.length,'nutricionistas registrados',Users,()=>manage('Equipo')],
    ['Asignaciones',settings.covers.filter(r=>r.start<=today && today<=r.end).length,'reemplazos vigentes',MapPin,()=>manage('Asignaciones')],
    ['Cargas externas',settings.batches.length,'archivos confirmados',FileInput,()=>manage('Cargas externas')],
    ['Catálogo',settings.products.length,'productos seleccionados',Layers,()=>manage('Catálogos')],
  ] as const : [
    ['Cartera',stores.length,'farmacias del equipo',Store,()=>manage('Equipo')],
    ['Cobertura',`${Math.round(100*covered/stores.length)} %`,`${covered} farmacias visitadas este mes`,MapPin,()=>manage('Equipo')],
    ['Focos rojos',rows.reduce((n,r)=>n+r.red,0),'farmacias prioritarias',Flag,()=>go('Focos rojos')],
    ['Plan mensual',rows.reduce((n,r)=>n+r.planned,0),'actividades planificadas',CalendarDays,()=>go('Plan del mes')],
  ] as const;
  const actions = admin ? ['Asignaciones','Permisos','Autorizaciones','Catálogos','Cargas externas'] : ['Equipo','Consideraciones','Asignaciones','Autorizaciones'];
  return <><section className="hero"><div className="hero-art"/><div className="hero-copy"><div className="eyebrow hero-date">{admin ? <ShieldCheck size={15}/> : <Users size={15}/>} Espacio de {role}</div><h1>{admin ? 'Panel de administración' : 'Panel de jefatura'}</h1><p>{admin ? 'Controla los accesos, la cartera y las fuentes de datos del equipo.' : 'Revisa la cobertura, prioriza farmacias y coordina el plan del mes.'}</p><button className="primary" onClick={()=>admin ? manage('Cargas externas') : go('Plan del mes')}>{admin ? 'Gestionar cargas' : 'Revisar plan mensual'} <ArrowUpRight size={16}/></button></div></section>
  <div className="section-title"><h2>{admin ? 'Estado de la operación' : 'Resultados del equipo'}</h2><span className="period"><CalendarDays size={14}/>Noviembre 2026</span></div><div className="metric-grid">{metrics.map(([label,value,detail,Icon,act],i)=><button key={label} className="metric" onClick={act}><span className="metric-head"><i className={'tile c'+i}><Icon size={18}/></i>{label}</span><span className="metric-body"><strong>{value}</strong></span><small>{detail}</small></button>)}</div>
  <div className="dashboard-bottom"><section className="panel agenda"><div className="panel-heading"><div className="eyebrow"><span className="dot"/>{admin ? 'Integración de datos' : 'Seguimiento territorial'}</div><h2>{admin ? 'Últimas cargas' : 'Carteras asignadas'}</h2></div>{admin ? <div className="panel-heading">{settings.batches.length ? settings.batches.slice(-5).reverse().map((b,i)=><p key={i}><strong>{b.source}</strong> · {b.filename} · {b.rows.length} filas</p>) : <><FileInput size={22}/><h3>Aún no hay cargas confirmadas</h3><p>Al confirmar un archivo aparecerán aquí su origen y las filas aceptadas.</p></>}</div> : <TeamTable rows={rows.filter(r=>r.total)}/>}</section><section className="panel agenda"><div className="panel-heading"><div className="eyebrow">Accesos directos</div><h2>{admin ? 'Gestionar el sistema' : 'Coordinar al equipo'}</h2></div>{actions.map(label=><button className="simple-row" key={label} onClick={()=>manage(label)}><strong>{label}</strong><ArrowUpRight size={15}/></button>)}{!admin && <button className="simple-row" onClick={()=>go('Mis pendientes')}><ClipboardList size={16}/>{late} seguimientos vencidos<ArrowUpRight size={15}/></button>}</section></div></>;
}
