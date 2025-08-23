// GSA

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwgqdBf_7riK9KS_qF3RDqKKJwG2SMMDUDoTGIiB_Xvpzikeh1xxELjC3liBwZ2FDEjkA/exec";

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
  horaSelect.innerHTML = "<option>Cargando...</option>";
  horaSelect.disabled = true;

  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=getHours&date=${encodeURIComponent(dateStr)}`);
    const data = await res.json();
    
    if (!Array.isArray(data.hours)) {
      throw new Error("Respuesta inválida del servidor.");
    }

    if (data.hours.length > 0) {
      horaSelect.innerHTML = '<option value="">-- Selecciona una hora --</option>';
      data.hours.forEach(h => {
        const opt = document.createElement('option');
        opt.value = h;
        opt.textContent = h;
        horaSelect.appendChild(opt);
      });
    } else {
      horaSelect.innerHTML = '<option value="">No hay horarios disponibles</option>';
    }
  } catch (err) {
    console.error(err);
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

    if (!payload.nombre || payload.nombre.length < 3) {
      showError("Por favor, ingresa tu nombre completo.");
      return;
    }
    if (!payload.telefono || payload.telefono.length !== 10) {
      showError("Por favor, ingresa un teléfono válido de 10 dígitos.");
      return;
    }
    if (!payload.fecha) {
      showError("Por favor, selecciona una fecha.");
      return;
    }
    if (!payload.hora) {
      showError("Por favor, selecciona una hora para la cita.");
      return;
    }
    if (payload.esPrimerCita === 'Si' && !(payload.motivo_sintomas || '').trim()) {
      showError("Por favor, describe tus síntomas o motivo de la consulta.");
      return;
    }
    if (payload.esPrimerCita === 'No' && !payload.tratamiento) {
      showError("Por favor, selecciona un tratamiento.");
      return;
    }

    payload.action = 'create';
    payload.estado = 'Pendiente';

    if (btn) {
      btn.classList.add("loading");
    }

    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.message || "No se pudo registrar la cita.");
      }

      if (mensajeBox) {
        mensajeBox.textContent = "✅ Cita registrada con éxito!";
        mensajeBox.className = "mensaje exito";
      }
      form.reset();
      primerCitaCampos.style.display = "none";
      citaSeguimientoCampos.style.display = "none";
      esPrimerCitaSelect.value = "";
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
