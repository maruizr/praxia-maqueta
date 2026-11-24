import { stores, today } from './data';
export const columns = {
  'Dotación de personal': ['farmacia','numero','nombre','cargo'],
  'Inventario G8': ['farmacia','producto','unidades'],
  'Asistencia de Simi Escuela': ['farmacia','fecha'],
  'Encuesta de satisfacción': ['farmacia','puntaje'],
  'Histórico de visitas': ['farmacia','fecha','modalidad','autora'],
};
export type Source = keyof typeof columns;
export type Batch = {source:Source; rows:string[][]; errors:string[]; filename:string};
function fields(line:string, sep:string){
  const out:string[]=[]; let value='', quoted=false;
  for(let i=0;i<line.length;i++){const c=line[i]; if(c==='"'){if(quoted && line[i+1]==='"'){value+='"';i++}else quoted=!quoted} else if(!quoted && c===sep){out.push(value.trim());value=''}else value+=c}
  if(quoted) throw Error('Comillas sin cerrar'); return [...out,value.trim()];
}
export function parseBatch(text:string, source:Source, filename:string):Batch {
  const lines=text.replace(/^\uFEFF/,'').trim().split(/\r?\n/), header=lines.shift()||'', sep=header.includes(';')?';':',';
  const batch:Batch={source,filename,rows:[],errors:[]}, seen=new Set<string>();
  if(fields(header,sep).map(x=>x.toLowerCase()).join(';')!==columns[source].join(';')) throw Error('El encabezado no coincide con las columnas indicadas.');
  lines.forEach((line,i)=>{if(!line.trim())return; try{const r=fields(line,sep); r[0]=r[0].toUpperCase();
    if(r.length!==columns[source].length || r.some(x=>!x || x.length>180))throw Error('Columnas incompletas o demasiado largas');
    if(!stores.some(s=>s.id===r[0]))throw Error('Código de farmacia desconocido');
    if(source==='Dotación de personal' && !/^\d{1,12}$/.test(r[1]))throw Error('Número de empleado no válido');
    if(source==='Inventario G8' && (!['Vitamina C G8','Magnesio G8','Omega 3 G8'].includes(r[1]) || !/^\d{1,7}$/.test(r[2])))throw Error('Producto o unidades no válidos');
    if(source==='Encuesta de satisfacción' && !/^[1-5]$/.test(r[1]))throw Error('El puntaje debe ser de 1 a 5');
    if(['Histórico de visitas','Asistencia de Simi Escuela'].includes(source) && (!/^\d{4}-\d{2}-\d{2}$/.test(r[1]) || !Number.isFinite(Date.parse(r[1])) || new Date(r[1]).toISOString().slice(0,10)!==r[1] || r[1]>today))throw Error('Fecha no válida o futura');
    if(source==='Histórico de visitas' && !['Presencial','Online','Otros'].includes(r[2]))throw Error('Modalidad desconocida');
    const key=(source==='Dotación de personal'||source==='Inventario G8'?r.slice(0,2):r).join(';'); if(seen.has(key)&&source!=='Encuesta de satisfacción')throw Error('Fila duplicada');seen.add(key);batch.rows.push(r);
  }catch(e){batch.errors.push(`Fila ${i+2}: ${(e as Error).message}`)}});return batch;
}
