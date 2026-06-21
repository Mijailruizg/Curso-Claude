import { auth, provider, db } from './firebase-config.js';
import { signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const btnLoginGoogle = document.getElementById('btn-login-google');
const loginError = document.getElementById('login-error');

// Redirect if already logged in
onAuthStateChanged(auth, (user) => {
    if (user && window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        window.location.href = 'dashboard.html';
    }
});

if (btnLoginGoogle) {
    btnLoginGoogle.addEventListener('click', async () => {
        try {
            loginError.classList.add('hidden');
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const userRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userRef);
            
            if (!docSnap.exists()) {
                // Initialize new user
                await setDoc(userRef, {
                    uid: user.uid,
                    name: user.displayName,
                    email: user.email,
                    progress: [],
                    joinedAt: new Date()
                });
            }
            
            window.location.href = 'dashboard.html';
            
        } catch (error) {
            console.error("Error signing in:", error);
            loginError.textContent = "Error: " + error.message;
            loginError.classList.remove('hidden');
        }
    });
}
