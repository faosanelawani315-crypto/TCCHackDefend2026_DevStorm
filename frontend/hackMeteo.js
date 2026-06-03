// --- SÉCURISATION ET CONTRÔLE D'ACCÈS ---
(function verifierAcces() {
    const role = localStorage.getItem("userRole");
    
    // Si aucun utilisateur n'est connecté OU si ce n'est pas l'agent météo (ni le superviseur qui a tous les droits)
    if (!role || (role !== "meteo" && role !== "superviseur")) {
        alert("Accès refusé. Vous devez vous authentifier en tant qu'Agent Météo.");
        window.location.href = "login.html";
    }
})();

// --- LOGIQUE DE LA PAGE ---
document.addEventListener("DOMContentLoaded", () => {
    // Optionnel : Vous pouvez afficher dynamiquement le vrai nom stocké
    const userRoleText = document.querySelector(".user-role");
    if (userRoleText && localStorage.getItem("userName")) {
        userRoleText.innerText = localStorage.getItem("userName");
    }

    const form = document.getElementById("meteo-form");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const donneesMeteo = {
            vitesseVent: parseFloat(document.getElementById("vent-vitesse").value),
            directionVent: document.getElementById("vent-direction").value,
            visibilite: parseFloat(document.getElementById("visibilite").value),
            precipitations: parseFloat(document.getElementById("precipitations").value),
            agent: localStorage.getItem("userName"), // On sait quel agent a saisi la donnée
            dateSaisie: new Date().toISOString()
        };

        transmettreDonnees(donneesMeteo);
    });
});

function transmettreDonnees(data) {
    const feedback = document.getElementById("form-feedback");
    feedback.classList.remove("hidden");
    feedback.className = "form-feedback success";
    feedback.innerText = "⚡ Données climatiques transmises avec succès au Noyau IA.";

    console.log("Données enregistrées sous la session :", data);

    setTimeout(() => {
        document.getElementById("meteo-form").reset();
        feedback.classList.add("hidden");
    }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("meteo-form");
    
    form.addEventListener("submit", (e) => {
        // Empêche le rechargement de la page
        e.preventDefault();

        // Récupération des données saisies par l'agent
        const donneesMeteo = {
            vitesseVent: parseFloat(document.getElementById("vent-vitesse").value),
            directionVent: document.getElementById("vent-direction").value,
            visibilite: parseFloat(document.getElementById("visibilite").value),
            precipitations: parseFloat(document.getElementById("precipitations").value),
            dateSaisie: new Date().toISOString()
        };

        // Simulation de traitement (En attente de connexion avec l'API Flask/FastAPI)
        transmettreDonnees(donneesMeteo);
    });
});

function transmettreDonnees(data) {
    const feedback = document.getElementById("form-feedback");
    
    // On affiche un retour visuel positif à l'agent météo
    feedback.classList.remove("hidden");
    feedback.className = "form-feedback success";
    feedback.innerText = "⚡ Données climatiques transmises avec succès. Calcul des indices de risques IA en cours...";

    console.log("Données prêtes à être envoyées en POST JSON :", data);

    // Optionnel : Réinitialiser le formulaire après 2 secondes
    setTimeout(() => {
        document.getElementById("meteo-form").reset();
        feedback.classList.add("hidden");
    }, 3000);
}

const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.clear(); // Efface les jetons de session
        window.location.href = "login.html"; // Renvoie au login
    });
}

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