// admin/auth.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyADnESASv56RskkEVgt-VxPxUu3IwIWVwQ",
  authDomain: "Odontoles-d926a.firebaseapp.com",
  projectId: "odontoles-d926a",
  storageBucket: "odontoles-d926a.firebasestorage.app",
  messagingSenderId: "736431544596",
  appId: "1:736431544596:web:70333f4f830582fa2e8a01"
};

// =========================================
// 1. Lógica de Redireccionamiento y Configuración
// =========================================

if (localStorage.getItem('isAdminLoggedIn') === 'true') {
  window.location.href = 'dashboard.html';
}

// Lista de correos electrónicos de administradores permitidos
const allowedEmails = [
  "ylsel9998@gmail.com",
  "cristianromero241215@gmail.com"
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
