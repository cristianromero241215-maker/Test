// js/main.js

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyz8YnHU4fvqSXlbJmNarrbLj5TO5vMi4bjfFDMNeWjaMHXCl5DmuDyIVQc_KjFvKHB/exec";

// Elementos del DOM
const form = document.getElementById("formCita");
const fechaInput = document.getElementById("fecha");
const horaSelect = document.getElementById("hora");
const mensajeBox = document.getElementById("mensaje");
const btn = form ? form.querySelector("button") : null;

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

// Cargar horas disponibles al cambiar la fecha
const cargarHorarios = async (dateStr) => {
  if (!horaSelect) return;
  horaSelect.innerHTML = "<option>Cargando...</option>";
  horaSelect.disabled = true;

  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?date=${encodeURIComponent(dateStr)}`);
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

    if (horaSelect.value === "") {
        if (mensajeBox) {
            mensajeBox.textContent = "❌ Por favor, selecciona una hora para la cita.";
            mensajeBox.className = "mensaje error";
            mensajeBox.style.display = "block";
        }
        return;
    }

    if (mensajeBox) {
        mensajeBox.style.display = "none";
    }
    if (btn) {
        btn.classList.add("loading");
    }

    const payload = Object.fromEntries(new FormData(form).entries());

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
      if (horaSelect) {
        horaSelect.innerHTML = "<option>-- Selecciona una fecha primero --</option>";
      }
    } catch (err) {
      console.error(err);
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

// Lógica para el menú responsive.
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
