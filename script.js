const $ = (s)=>document.querySelector(s);const $$=(s)=>Array.from(document.querySelectorAll(s));
(function(){const saved=localStorage.getItem('apps_script_url');if(saved){window.APPS_SCRIPT_URL=saved;}})();
function sugerirTratamiento({dolor,sintomas=[],ultima_limpieza}){const d=parseInt(dolor||0,10);const set=new Set(sintomas);
 if(d>=7||set.has('dolor_masticar'))return'Posible Endodoncia';
 if(set.has('fractura'))return'Resina o Corona (según tamaño)';
 if(set.has('sangrado_encias')||set.has('mal_aliento'))return'Limpieza Dental y evaluación periodontal';
 if(ultima_limpieza==='mas_12'||ultima_limpieza==='nunca')return'Limpieza Dental';
 return'Evaluación general';}
const fechaInput=$('#fecha');const horaSelect=$('#hora');const sugerencia=$('#sugerencia');const respuesta=$('#respuesta');
async function cargarHorasDisponibles(fechaISO){if(!window.APPS_SCRIPT_URL){horaSelect.innerHTML='<option value="">Configura primero la URL del Apps Script</option>';return;}
 horaSelect.innerHTML='<option>Cargando horas...</option>';
 try{const url=new URL(window.APPS_SCRIPT_URL);url.searchParams.set('date',fechaISO);
     const res=await fetch(url.toString());const data=await res.json();const slots=data.slots||[];
     if(slots.length===0){horaSelect.innerHTML='<option value="">No hay horas disponibles</option>';return;}
     horaSelect.innerHTML='<option value="">Selecciona una hora...</option>'+slots.map(h=>`<option value="${h}">${h}</option>`).join('');
 }catch(err){console.error(err);horaSelect.innerHTML='<option value="">Error al cargar horas</option>'; } }
fechaInput?.addEventListener('change',(e)=>{const v=e.target.value;if(v)cargarHorasDisponibles(v);});
document.getElementById('form-cita')?.addEventListener('submit',async(e)=>{e.preventDefault();respuesta.textContent='';if(!window.APPS_SCRIPT_URL){respuesta.textContent='⚠️ Falta configurar la URL del Apps Script.';return;}
 const form=new FormData(e.target);const sintomas=$$('input[name="sintomas[]"]:checked').map(i=>i.value);
 const payload={nombre:form.get('nombre'),email:form.get('email'),telefono:form.get('telefono'),ultima_limpieza:form.get('ultima_limpieza'),dolor:form.get('dolor'),sintomas,descripcion:form.get('descripcion'),fecha:form.get('fecha'),hora:form.get('hora')};
 const sugerido=sugerirTratamiento(payload);sugerencia.textContent='Sugerencia del sistema: '+sugerido;
 try{const res=await fetch(window.APPS_SCRIPT_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,sugerido})});
     const text=await res.text();respuesta.textContent=text||'✅ Cita enviada.';
     const appts=JSON.parse(localStorage.getItem('appointments')||'[]');appts.push({...payload,createdAt:new Date().toISOString()});localStorage.setItem('appointments',JSON.stringify(appts));
 }catch(err){console.error(err);respuesta.textContent='❌ Error al enviar la cita.';} });
