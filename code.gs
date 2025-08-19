/** Google Apps Script – API para agenda con Google Calendar */
const CALENDAR_ID='TU_CALENDAR_ID@gmail.com'; // Reemplaza
const HORARIOS={0:[],1:['10:00','11:00','12:00','13:00','16:00','17:00','18:00','19:00'],2:['10:00','11:00','12:00','13:00','16:00','17:00','18:00','19:00'],3:['10:00','11:00','12:00','13:00','16:00','17:00','18:00','19:00'],4:['10:00','11:00','12:00','13:00','16:00','17:00','18:00','19:00'],5:['10:00','11:00','12:00','13:00','16:00','17:00','18:00','19:00'],6:['10:00','11:00','12:00','13:00']};
const DURACION_MINUTOS=60;
function doGet(e){const p=e&&e.parameter||{};if(p.date){const slots=obtenerSlotsDisponibles(p.date);return json(slots?{slots}: {slots:[]});}return json({ok:true,msg:'API de Agenda activa'});}
function doPost(e){const b=JSON.parse(e.postData.contents||'{}');const{nombre,email,telefono,ultima_limpieza,dolor,sintomas,descripcion,fecha,hora,sugerido}=b;
 if(!nombre||!fecha||!hora){return text('Faltan datos obligatorios.');}
 const cal=CalendarApp.getCalendarById(CALENDAR_ID);if(!cal){return text('No se encontró el calendario. Revisa CALENDAR_ID.');}
 const start=parseDateTime(fecha,hora);const end=new Date(start.getTime()+DURACION_MINUTOS*60000);const evs=cal.getEvents(start,end);if(evs.length>0){return text('❌ Ese horario ya está ocupado. Elige otro.');}
 const desc=['Paciente: '+nombre,'Email: '+(email||'-'),'Teléfono: '+(telefono||'-'),'Sugerencia del sistema: '+(sugerido||'-'),'Dolor (0-10): '+(dolor||'-'),'Última limpieza: '+(ultima_limpieza||'-'),'Síntomas: '+(Array.isArray(sintomas)?sintomas.join(', '):sintomas||'-'),'Descripción: '+(descripcion||'-')].join('\n');
 cal.createEvent('Cita: '+nombre,start,end,{description:desc,location:'Consultorio Dra. Lesly Vázquez'});return text('✅ Cita agendada correctamente para '+fecha+' '+hora+'.');}
function obtenerSlotsDisponibles(fechaISO){const cal=CalendarApp.getCalendarById(CALENDAR_ID);if(!cal)return null;const fecha=new Date(fechaISO+'T00:00:00');const dow=fecha.getDay();const posibles=HORARIOS[dow]||[];const libres=[];posibles.forEach(h=>{const ini=parseDateTime(fechaISO,h);const fin=new Date(ini.getTime()+DURACION_MINUTOS*60000);const evs=cal.getEvents(ini,fin);if(evs.length===0){libres.push(h);}});return libres;}
function parseDateTime(fechaISO,hhmm){const [H,M]=hhmm.split(':').map(x=>parseInt(x,10));const d=new Date(fechaISO+'T00:00:00');d.setHours(H);d.setMinutes(M);d.setSeconds(0);d.setMilliseconds(0);return d;}
function json(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)}
function text(t){return ContentService.createTextOutput(t).setMimeType(ContentService.MimeType.TEXT)}
