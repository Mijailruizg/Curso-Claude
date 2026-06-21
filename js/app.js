import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, addDoc, collection } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// DOM Elements
const userGreeting = document.getElementById('user-greeting');
const btnLogout = document.getElementById('btn-logout');
const videoGrid = document.getElementById('video-grid');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const playerSection = document.getElementById('player-section');
const mainVideoPlayer = document.getElementById('main-video-player');
const currentVideoTitle = document.getElementById('current-video-title');
const btnClosePlayer = document.getElementById('btn-close-player');
const btnMarkCompleted = document.getElementById('btn-mark-completed');
const certificateSection = document.getElementById('certificate-section');
const certificateForm = document.getElementById('certificate-form');
const certSuccessMsg = document.getElementById('cert-success-msg');

const TOTAL_VIDEOS = 8;
let currentUserDoc = null;
let currentPlayingVideoId = null;

// The 8 Videos Data
const videosData = [
    { id: 1, title: 'Introducción a la Inteligencia Artificial', file: '1-Clase.mp4' },
    { id: 2, title: 'Machine Learning Básico', file: '2-Clase.mp4' },
    { id: 3, title: 'Redes Neuronales', file: '3-clase.mp4' },
    { id: 4, title: 'Procesamiento de Lenguaje Natural', file: '4-clase.mp4' },
    { id: 5, title: 'Modelos Generativos (LLMs)', file: '5-clase.mp4' },
    { id: 6, title: 'Ingeniería de Prompts', file: '6-Clase.mp4' },
    { id: 7, title: 'Aplicaciones Prácticas', file: '7-Clase.mp4' },
    { id: 8, title: 'El Futuro de la IA y Ética', file: '8-Clase.mp4' }
];

// Auth Check
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    // Load user data
    userGreeting.textContent = `Hola, ${user.displayName}`;
    
    try {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
            currentUserDoc = docSnap.data();
        } else {
            // Create user doc if it doesn't exist (in case they bypassed the login button)
            const newUserData = {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                progress: [],
                joinedAt: new Date()
            };
            await setDoc(userRef, newUserData);
            currentUserDoc = newUserData;
        }
        
        renderVideos();
        updateProgressUI();
    } catch (error) {
        console.error("Error fetching user data:", error);
        videoGrid.innerHTML = `<div style="color:red; padding: 20px; font-weight:bold;">Error de Base de Datos: ${error.message} <br><br> Por favor revisa si la base de datos Firestore está activada en modo prueba.</div>`;
    }
});

// Logout
btnLogout.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = 'index.html';
    });
});

// Render Video Grid
function renderVideos() {
    videoGrid.innerHTML = '';
    
    videosData.forEach(video => {
        const isCompleted = currentUserDoc.progress.includes(video.id);
        
        const card = document.createElement('div');
        card.className = `video-card ${isCompleted ? 'completed' : ''}`;
        card.innerHTML = `
            <div>
                <h3>${video.id}. ${video.title}</h3>
                <span class="video-status ${isCompleted ? 'status-completed' : ''}">
                    ${isCompleted ? '✅ Completado' : '▶️ Pendiente'}
                </span>
            </div>
        `;
        
        card.addEventListener('click', () => openPlayer(video));
        videoGrid.appendChild(card);
    });
}

// Update Progress UI
function updateProgressUI() {
    const completedCount = currentUserDoc.progress.length;
    const percentage = (completedCount / TOTAL_VIDEOS) * 100;
    
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${completedCount}/${TOTAL_VIDEOS} Videos Completados`;
    
    if (completedCount === TOTAL_VIDEOS) {
        certificateSection.classList.remove('hidden');
        // Pre-fill email and name
        document.getElementById('cert-name').value = currentUserDoc.name;
        document.getElementById('cert-email').value = currentUserDoc.email;
    }
}

// Open Player
function openPlayer(video) {
    currentPlayingVideoId = video.id;
    currentVideoTitle.textContent = `${video.id}. ${video.title}`;
    
    // Check if running on local file protocol or a server
    // For local files, this relies on the 'videos' folder being present
    mainVideoPlayer.src = `videos/${video.file}`;
    
    // Check if already completed
    if (currentUserDoc.progress.includes(video.id)) {
        btnMarkCompleted.textContent = '✅ Ya completado';
        btnMarkCompleted.disabled = true;
        btnMarkCompleted.classList.replace('btn-primary', 'btn-outline');
    } else {
        btnMarkCompleted.textContent = 'Marcar como Completado';
        btnMarkCompleted.disabled = false;
        btnMarkCompleted.classList.replace('btn-outline', 'btn-primary');
    }
    
    playerSection.classList.remove('hidden');
    // Scroll to player smooth
    playerSection.scrollIntoView({ behavior: 'smooth' });
    mainVideoPlayer.play().catch(e => console.log("Autoplay prevented"));
}

// Close Player
btnClosePlayer.addEventListener('click', () => {
    mainVideoPlayer.pause();
    playerSection.classList.add('hidden');
});

// Mark Completed
btnMarkCompleted.addEventListener('click', async () => {
    if (!currentPlayingVideoId || currentUserDoc.progress.includes(currentPlayingVideoId)) return;
    
    const user = auth.currentUser;
    if (!user) return;
    
    try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
            progress: arrayUnion(currentPlayingVideoId)
        });
        
        // Update local state
        currentUserDoc.progress.push(currentPlayingVideoId);
        
        // Update UI
        renderVideos();
        updateProgressUI();
        
        // Update button
        btnMarkCompleted.textContent = '✅ Completado';
        btnMarkCompleted.disabled = true;
        btnMarkCompleted.classList.replace('btn-primary', 'btn-outline');
        
    } catch (error) {
        console.error("Error updating progress:", error);
        alert("Hubo un error al guardar tu progreso.");
    }
});

// Certificate Form Submission
certificateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('cert-name').value;
    const email = document.getElementById('cert-email').value;
    const participants = document.getElementById('cert-participants').value;
    
    try {
        // Guardar solicitud en la base de datos
        await addDoc(collection(db, "certificates"), {
            uid: auth.currentUser.uid,
            name,
            email,
            participants,
            course: "Curso Claude - IA Avanzada",
            dateRequested: new Date()
        });
        
        certificateForm.reset();
        certificateForm.classList.add('hidden');
        certSuccessMsg.classList.remove('hidden');
        
    } catch (error) {
        console.error("Error requesting certificate:", error);
        alert("Hubo un error al enviar la solicitud.");
    }
});
