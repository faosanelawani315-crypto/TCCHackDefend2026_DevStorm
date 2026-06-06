// ============================================================
// hackPassag.js — Interface Passager
// Connecté au backend Flask via GET /api/vols
// ============================================================

// URL de base du microservice IA
const API_BASE = "http://localhost:5000";

// Cache local des vols chargés depuis l'API
let volsCache = [];

// Au chargement de la page, on récupère tous les vols depuis le backend
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch(`${API_BASE}/api/vols`);
        if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
        volsCache = await response.json();
    } catch (error) {
        console.warn("Service IA inaccessible. Mode hors-ligne activé.", error);
        // Données de secours si le backend ne répond pas
        volsCache = [
            { numVol: "KP023", destination: "Abidjan (ABJ)", risque: 12, statut: "Sécurisé",      causes: "Conditions météo normales" },
            { numVol: "AF858", destination: "Paris (CDG)",   risque: 78, statut: "Alerte Critique", causes: "Vents violents | Fortes précipitations" },
            { numVol: "ET901", destination: "Addis-Abeba (ADD)", risque: 45, statut: "Vigilance", causes: "Vent modéré | Précipitations modérées" }
        ];
    }
});

// Soumission du formulaire de recherche par numéro de vol
document.getElementById("search-flight-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const input = document.getElementById("flight-number").value.toUpperCase().replace(/\s/g, '');

    // Recherche dans le cache (numéros normalisés sans espaces)
    const volTrouve = volsCache.find(v => v.numVol.replace(/\s/g, '') === input);

    if (volTrouve) {
        afficherResultatPassager(volTrouve);
    } else {
        const numsDispo = volsCache.map(v => v.numVol.replace(/\s/g, '')).join(", ");
        alert(`Numéro de vol inconnu.\nVols disponibles : ${numsDispo}`);
    }
});

/**
 * Affiche la carte de résultat pour un vol donné.
 * @param {Object} vol - { numVol, destination, risque, statut, causes }
 */
function afficherResultatPassager(vol) {
    const resZone = document.getElementById("flight-result");
    resZone.classList.remove("hidden");

    document.getElementById("res-flight-id").innerText = "ANALYSE DU VOL " + vol.numVol;
    document.getElementById("res-dest").innerText = "Destination : " + vol.destination;
    document.getElementById("res-risk").innerText = vol.risque + "%";
    document.getElementById("res-desc").innerText = vol.causes;

    const badge   = document.getElementById("res-badge");
    const card    = document.getElementById("card-color-output");
    const riskText = document.getElementById("res-risk");

    badge.innerText = vol.statut.toUpperCase();

    if (vol.risque < 30) {
        badge.className    = "status-badge badge-green";
        riskText.className = "kpi-value text-green";
        card.style.borderColor = "var(--green)";
    } else if (vol.risque <= 60) {
        badge.className    = "status-badge badge-amber";
        riskText.className = "kpi-value text-amber";
        card.style.borderColor = "var(--amber)";
    } else {
        badge.className    = "status-badge badge-red";
        riskText.className = "kpi-value text-red";
        card.style.borderColor = "var(--red)";
    }

    setTimeout(() => {
        resZone.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 50);
}

// Gestion de la déconnexion
document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = "hackAcceuil.html";
        });
    }
});
