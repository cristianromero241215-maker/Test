// GSA

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz1m7nlS6DmpIzXQnw2wZB6XL2A7_HKJw_hBbNlG1hH09GX5OOtUQjQWQj3LwXtOd73tg/exec";

// Elementos del DOM
const form = document.getElementById("formCita");
const fechaInput = document.getElementById("fecha");
const horaSelect = document.getElementById("hora");
const mensajeBox = document.getElementById("mensaje");
const btn = form ? form.querySelector("button") : null;

// Nuevos elementos del formulario
const esPrimerCitaSelect = document.getElementById("esPrimerCita");
const primerCitaCampos = document.getElementById("primerCitaCampos");
const citaSeguimientoCampos = document.getElementById("citaSeguimientoCampos");

// Lógica para el menú hamburguesa
const burger = document.querySelector(".burger");
const nav = document.querySelector(".main-nav");

if (burger && nav) {
  burger.addEventListener("click", () => {
    const isExpanded = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", String(!isExpanded));
    nav.classList.toggle("open");
  });
}

// Limitar la fecha mínima del input a hoy
if (fechaInput) {
  fechaInput.setAttribute("min", new Date().toISOString().split("T")[0]);
}

// Lógica condicional del formulario
if (esPrimerCitaSelect) {
  esPrimerCitaSelect.addEventListener("change", (e) => {
    if (e.target.value === "Si") {
      if (primerCitaCampos) {
        primerCitaCampos.classList.remove('hidden');
        primerCitaCampos.classList.add('visible');
        primerCitaCampos.style.display = "block";
      }
      if (citaSeguimientoCampos) {
        citaSeguimientoCampos.classList.remove('visible');
        citaSeguimientoCampos.classList.add('hidden');
        citaSeguimientoCampos.style.display = "none";
      }
      document.getElementById("motivo_sintomas").required = true;
      document.getElementById("tratamiento").required = false;
    } else if (e.target.value === "No") {
      if (primerCitaCampos) {
        primerCitaCampos.classList.remove('visible');
        primerCitaCampos.classList.add('hidden');
        primerCitaCampos.style.display = "none";
      }
      if (citaSeguimientoCampos) {
        citaSeguimientoCampos.classList.remove('hidden');
        citaSeguimientoCampos.classList.add('visible');
        citaSeguimientoCampos.style.display = "block";
      }
      document.getElementById("motivo_sintomas").required = false;
      document.getElementById("tratamiento").required = true;
    } else {
      if (primerCitaCampos) {
        primerCitaCampos.classList.remove('visible');
        primerCitaCampos.classList.add('hidden');
        primerCitaCampos.style.display = "none";
      }
      if (citaSeguimientoCampos) {
        citaSeguimientoCampos.classList.remove('visible');
        citaSeguimientoCampos.classList.add('hidden');
        citaSeguimientoCampos.style.display = "none";
      }
      document.getElementById("motivo_sintomas").required = false;
      document.getElementById("tratamiento").required = false;
    }
  });
}

// Cargar horas disponibles al cambiar la fecha
const cargarHorarios = async (dateStr) => {
  if (!horaSelect) return;
  horaSelect.innerHTML = '<option>Cargando...</option>';
  horaSelect.disabled = true;

  try {
    const url = `${APPS_SCRIPT_URL}?action=getHours&date=${encodeURIComponent(dateStr)}`;
    const res = await fetch(url, { redirect: 'follow' });

    // Algunas implementaciones de Apps Script devuelven 302 con una página intermedia.
    // Hacemos una lectura de texto y tratamos de parsear a JSON de forma segura.
    const text = await res.text();
    let data = {};
    try { data = JSON.parse(text); } catch (_) { data = {}; }

    // Normalizamos la posible forma de respuesta
    // - { hours: [...] }
    // - [...] (array directo)
    // - { ok:false, message:"..." }
    const parsedHours = Array.isArray(data?.hours)
      ? data.hours
      : (Array.isArray(data) ? data : []);

    if (data?.ok === false && data?.message) {
      console.warn('API getHours:', data.message);
    }

    if (parsedHours.length > 0) {
      horaSelect.innerHTML = '<option value="">-- Selecciona una hora --</option>';
      parsedHours.forEach((hour) => {
        const opt = document.createElement('option');
        opt.value = hour;
        opt.textContent = hour;
        horaSelect.appendChild(opt);
      });
    } else {
      horaSelect.innerHTML = '<option value="">No hay horarios disponibles</option>';
    }
  } catch (err) {
    console.error('Error al cargar horarios:', err);
    horaSelect.innerHTML = '<option value="">Error al cargar horarios</option>';
  } finally {
    horaSelect.disabled = false;
  }
};

if (fechaInput) {
  fechaInput.addEventListener("change", (e) => {
    if (e.target.value) {
      cargarHorarios(e.target.value);
    }
  });
}

function getEl(id) { return document.getElementById(id); }

function showFieldError(input, message) {
    const group = input.closest('.form-group');
    if (!group) return;
    let err = group.querySelector('.field-error');
    if (!err) {
        err = document.createElement('div');
        err.className = 'field-error';
        group.appendChild(err);
    }
    group.classList.add('has-error');
    input.setAttribute('aria-invalid', 'true');
    err.textContent = message;
}

function clearFieldError(input) {
    const group = input.closest('.form-group');
    if (!group) return;
    const err = group.querySelector('.field-error');
    if (err) err.textContent = '';
    group.classList.remove('has-error');
    input.removeAttribute('aria-invalid');
}

function validateField(input) {
    const id = input.id;
    const value = (input.value || '').trim();
    switch (id) {
        case 'nombre':
            if (value.length < 3) return 'Ingresa tu nombre (mín. 3 caracteres).';
            return '';
        case 'telefono':
            const digits = value.replace(/\D/g, '');
            if (digits.length !== 10) return 'Ingresa un teléfono de 10 dígitos.';
            return '';
        case 'email':
            if (!input.checkValidity()) return 'Ingresa un email válido.';
            return '';
        case 'fecha':
            if (!value) return 'Selecciona una fecha.';
            return '';
        case 'hora':
            if (!value) return 'Selecciona una hora.';
            return '';
        case 'esPrimerCita':
            if (!value) return 'Selecciona una opción.';
            return '';
        case 'motivo_sintomas':
            if (getEl('esPrimerCita')?.value === 'Si' && value.length < 5) return 'Describe tus síntomas.';
            return '';
        case 'tratamiento':
            if (getEl('esPrimerCita')?.value === 'No' && !value) return 'Selecciona un tratamiento.';
            return '';
        default:
            return '';
    }
}

function wireFieldValidation(ids) {
    ids.forEach((id) => {
        const el = getEl(id);
        if (!el) return;
        const handler = () => {
            const msg = validateField(el);
            if (msg) showFieldError(el, msg); else clearFieldError(el);
        };
        el.addEventListener('blur', handler);
        el.addEventListener('input', handler);
        el.addEventListener('change', handler);
    });
}

wireFieldValidation(['nombre','telefono','email','fecha','hora','esPrimerCita','motivo_sintomas','tratamiento']);

// Enviar el formulario
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (mensajeBox) {
        mensajeBox.style.display = "none";
    }

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    payload.nombre = (payload.nombre || "").trim();
    payload.telefono = (payload.telefono || "").replace(/\D/g, "");
    payload.email = (payload.email || "").trim();



    // Validación inline completa antes de continuar
    const inputsToCheck = ['nombre','telefono','email','fecha','hora','esPrimerCita','motivo_sintomas','tratamiento']
      .map(getEl)
      .filter(Boolean);
    let firstInvalid = null;
    inputsToCheck.forEach((input) => {
      const msg = validateField(input);
      if (msg) {
        showFieldError(input, msg);
        if (!firstInvalid) firstInvalid = input;
      } else {
        clearFieldError(input);
      }
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    if (btn) {
      btn.classList.add("loading");
    }

    // Validaciones específicas adicionales (redundantes pero seguras)
    if (payload.esPrimerCita === 'Si' && !(payload.motivo_sintomas || '').trim()) {
      showError("Por favor, describe tus síntomas o motivo de la consulta.");
      if (btn) btn.classList.remove("loading");
      return;
    }
    if (payload.esPrimerCita === 'No' && !payload.tratamiento) {
      showError("Por favor, selecciona un tratamiento.");
      if (btn) btn.classList.remove("loading");
      return;
    }

    payload.action = 'create';
    payload.estado = 'Pendiente';

    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        redirect: 'follow'
      });
      const raw = await res.text();
      let data;
      try { data = JSON.parse(raw); } catch (_) { data = { ok: false, message: 'Respuesta no válida del servidor.' }; }

      if (!data.ok) {
        throw new Error(data.message || "No se pudo registrar la cita.");
      }

      if (mensajeBox) {
        mensajeBox.textContent = "✅ Cita registrada con éxito!";
        mensajeBox.className = "mensaje exito";
      }
      form.reset();
      if (primerCitaCampos) primerCitaCampos.style.display = "none";
      if (citaSeguimientoCampos) citaSeguimientoCampos.style.display = "none";
      if (esPrimerCitaSelect) esPrimerCitaSelect.value = "";
      if (horaSelect) {
        horaSelect.innerHTML = "<option>-- Selecciona una fecha primero --</option>";
      }
    } catch (err) {
      if (mensajeBox) {
        mensajeBox.textContent = `❌ ${err.message}`;
        mensajeBox.className = "mensaje error";
      }
    } finally {
      if (mensajeBox) {
        mensajeBox.style.display = "block";
        mensajeBox.style.opacity = "1";
      }
      if (btn) {
        btn.classList.remove("loading");
      }
    }
  });
}

function showError(message) {
    if (mensajeBox) {
        mensajeBox.textContent = `❌ ${message}`;
        mensajeBox.className = "mensaje error";
        mensajeBox.style.display = "block";
        mensajeBox.style.opacity = "1";
    }
}

document.querySelectorAll('.main-nav a, .logo, .footer-nav a').forEach(link => {
    link.addEventListener('click', () => {
        if (nav) {
            nav.classList.remove('open');
        }
        if (burger) {
            burger.setAttribute('aria-expanded', 'false');
        }
    });
});

// Ripple coords for button
if (btn) {
  btn.addEventListener('pointerdown', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    btn.style.setProperty('--x', x + '%');
    btn.style.setProperty('--y', y + '%');
  });
}

// Input mask para teléfono (formatea como (###) ### #### mientras escribe)
const telefonoInput = document.getElementById('telefono');
if (telefonoInput) {
  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    const p1 = digits.slice(0, 3);
    const p2 = digits.slice(3, 6);
    const p3 = digits.slice(6, 10);
    if (digits.length > 6) return `(${p1}) ${p2} ${p3}`;
    if (digits.length > 3) return `(${p1}) ${p2}`;
    if (digits.length > 0) return `(${p1}`;
    return '';
  };
  telefonoInput.addEventListener('input', () => {
    const start = telefonoInput.selectionStart;
    const before = telefonoInput.value;
    telefonoInput.value = formatPhone(before);
  });
}

// Normalización de fecha (solo si el navegador no soporta bien input date)
const fechaInputEl = document.getElementById('fecha');
if (fechaInputEl) {
  fechaInputEl.addEventListener('blur', () => {
    const v = (fechaInputEl.value || '').trim();
    // Acepta YYYY/MM/DD o YYYY.MM.DD y normaliza a YYYY-MM-DD
    if (/^\d{4}[\/.]\d{2}[\/.]\d{2}$/.test(v)) {
      fechaInputEl.value = v.replace(/[\/.]/g, '-');
    }
  });
}
