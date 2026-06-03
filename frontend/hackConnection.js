document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const errorZone = document.getElementById("login-error");

    if (!loginForm) {
        console.error("Erreur : Le formulaire avec l'ID 'login-form' est introuvable dans le HTML.");
        return;
    }

    loginForm.addEventListener("submit", (e) => {
        // 1. IMPORTANT : Empêche la page de se recharger et d'annuler la redirection
        e.preventDefault(); 

        // 2. Récupérer les valeurs saisies
        const username = document.getElementById("login-id").value.trim().toLowerCase();
        
        console.log("Tentative de connexion pour l'identifiant :", username);

        // Nettoyage des anciennes sessions
        localStorage.clear();

        // 3. Vérification des comptes de test et REDIRECTION DIRECTE
        if (username === "super.lome") {
            localStorage.setItem("userRole", "superviseur");
            localStorage.setItem("userName", "Superviseur ANAC");
            console.log("Redirection vers la page Superviseur...");
            window.location.href = "hackaDash.html"; // Mène directement à superviseur.html
        } 
        else if (username === "meteo.lome") {
            localStorage.setItem("userRole", "meteo");
            localStorage.setItem("userName", "Agent Météo - Lomé");
            console.log("Redirection vers la page Météo...");
            window.location.href = "hackMétéo.html"; // Mène directement à meteo.html
        } 
        else if (username === "dispatch.lome") {
            localStorage.setItem("userRole", "dispatcher");
            localStorage.setItem("userName", "Régulateur Vol - ASKY");
            console.log("Redirection vers la page Dispatcher...");
            window.location.href = "hackComp.html"; // Mène directement à dispatcher.html
        } 
        else {
            // Affichage de l'erreur si l'identifiant n'est pas bon
            if (errorZone) {
                errorZone.classList.remove("hidden");
                errorZone.innerText = "❌ Identifiant inconnu. Utilisez : super.lome, meteo.lome ou dispatch.lome";
            } else {
                alert("❌ Identifiant inconnu.");
            }
        }
    });
});

// --- GESTION DE LA DÉCONNEXION ---
document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout-btn");
    
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            // Empêche le comportement par défaut du lien (#)
            e.preventDefault(); 
            
            // 1. Vide la session (supprime le rôle et le nom de l'agent)
            localStorage.clear(); 
            
            console.log("Session effacée. Redirection vers l'écran de connexion...");
            
            // 2. Renvoie directement à la page de connexion dans le même dossier
            window.location.href = "hackAcceuil.html"; 
        });
    }
});