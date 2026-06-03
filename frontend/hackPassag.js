// Données de simulation locales (Simule le dictionnaire de la base MySQL)
const baseVols = [
    { num: "KP023", dest: "Abidjan (ABJ)", risque: 12, statut: "Sécurisé", desc: "Le noyau d'IA confirme des conditions météorologiques optimales à Lomé et sur la trajectoire. Vol validé." },
    { num: "AF858", dest: "Paris (CDG)", risque: 78, statut: "Alerte Critique", desc: "Avis de tempête ou vents violents en altitude détectés. Le superviseur recommande un ajustement de trajectoire ou un report." },
    { num: "ET901", dest: "Addis-Abeba (ADD)", risque: 45, statut: "Vigilance", desc: "Couverture nuageuse dense et légères précipitations signalées par la station météo. Risque modéré." }
];

document.getElementById("search-flight-form").addEventListener("submit", function(e) {
    e.preventDefault();
    
    // Nettoie l'entrée utilisateur (enlève les espaces et force les majuscules)
    const input = document.getElementById("flight-number").value.toUpperCase().replace(/\s/g, '');
    
    // Recherche de correspondance
    const volTrouve = baseVols.find(v => v.num === input);

    if (volTrouve) {
        afficherResultatPassager(volTrouve);
    } else {
        alert("Numéro de vol inconnu.\nPour le test du prototype, utilisez : KP023, AF858 ou ET901");
    }
});

function afficherResultatPassager(vol) {
    const resZone = document.getElementById("flight-result");
    
    // 1. Rendre le composant visible en retirant la classe 'hidden'
    resZone.classList.remove("hidden");

    // 2. Injecter dynamiquement les textes correspondants
    document.getElementById("res-flight-id").innerText = "ANALYSE DU VOL " + vol.num;
    document.getElementById("res-dest").innerText = "Destination : " + vol.dest;
    document.getElementById("res-risk").innerText = vol.risque + "%";
    document.getElementById("res-desc").innerText = vol.desc;

    // 3. Récupérer les éléments graphiques à colorer
    const badge = document.getElementById("res-badge");
    const card = document.getElementById("card-color-output");
    const riskText = document.getElementById("res-risk");

    badge.innerText = vol.statut.toUpperCase();
    
    // 4. Application stricte du code couleur pour le passager
    if (vol.risque < 30) {
        badge.className = "status-badge badge-green";
        riskText.className = "kpi-value text-green";
        card.style.borderColor = "var(--green)";
    } else if (vol.risque <= 60) {
        badge.className = "status-badge badge-amber";
        riskText.className = "kpi-value text-amber";
        card.style.borderColor = "var(--amber)";
    } else {
        badge.className = "status-badge badge-red";
        riskText.className = "kpi-value text-red";
        card.style.borderColor = "var(--red)";
    }

    // 5. CORRECTION DU RENDU : Forcer l'écran à descendre automatiquement sur le résultat
    setTimeout(() => {
        resZone.scrollIntoView({ 
            behavior: 'smooth', // Déplacement fluide et animé
            block: 'end'        // S'aligne parfaitement pour afficher toute la carte à l'écran
        });
    }, 50); // Petit délai de 50ms pour laisser le navigateur intégrer l'affichage de la boîte
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