// src/firebase/auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // Redirigir al panel de administrador
    window.location.href = "/pages/admin-dashboard.html";
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    errorMsg.textContent = "Correo o contraseña incorrectos.";
  }
});

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyADnESASv56RskkEVgt-VxPxUu3IwIWVwQ",
  authDomain: "odontoles-d926a.firebaseapp.com",
  projectId: "odontoles-d926a",
  storageBucket: "odontoles-d926a.firebasestorage.app",
  messagingSenderId: "736431544596",
  appId: "1:736431544596:web:e466e5820ff23b772e8a01"
};

// =========================================
// 1. Lógica de Redireccionamiento y Configuración
// =========================================

if (localStorage.getItem('isAdminLoggedIn') === 'true') {
  window.location.href = 'dashboard.html';
}

// Lista de correos electrónicos de administradores permitidos
const allowedEmails = [
  "ylsel9998@gmail.com"
];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// =========================================
// 2. Lógica de Autenticación
// =========================================

const googleLoginBtn = document.getElementById('googleLogin');

googleLoginBtn?.addEventListener('click', async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const email = result.user.email;
    
    // Verifica si el email está en la lista de permitidos
    if (allowedEmails.includes(email)) {
      localStorage.setItem('isAdminLoggedIn', 'true');
      window.location.href = 'dashboard.html';
    } else {
      alert('❌ No tienes permisos para acceder a este portal.');
      await auth.signOut();
    }
  } catch (err) {
    console.error('Error de autenticación:', err.message);
    alert('❌ Error de autenticación. Por favor, inténtalo de nuevo.');
  }
});
