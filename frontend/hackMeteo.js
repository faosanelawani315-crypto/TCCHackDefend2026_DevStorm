// ============================================================
// hackMeteo.js — Agent Météo
// Connecté au backend Flask via POST /api/predict
// ============================================================

// URL de base du microservice IA (à modifier si le backend tourne sur un autre port/host)
const API_BASE = "http://localhost:5000";

// Vérification d'accès : seul l'agent météo peut accéder à cette page
(function verifierAcces() {
    const role = localStorage.getItem("userRole");
    if (!role || role !== "meteo") {
        alert("Accès restreint. Identification Agent Météo requise.");
        window.location.href = "hackConnection.html";
    }
})();

// Récupère les éléments d'interface
const form = document.getElementById("meteo-form");
const feedbackZone = document.getElementById("form-feedback");
const resultZone = document.getElementById("result-zone");

// Soumission du formulaire — envoi réel vers Flask
form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Lecture des valeurs du formulaire
    const visibilite    = parseFloat(document.getElementById("visibilite").value);
    const vitesseVent   = parseFloat(document.getElementById("vitesse-vent").value);
    const precipitation = parseFloat(document.getElementById("precipitation").value);
    const heureVolRaw   = document.getElementById("heure-vol").value; // format : "YYYY-MM-DDTHH:MM"
    const numVol        = document.getElementById("num-vol").value.trim().toUpperCase();

    // Conversion en ISO 8601 avec fuseau UTC
    const heure_vol = heureVolRaw + ":00+00:00";

    // Affichage d'un état de chargement
    feedbackZone.className = "form-feedback";
    feedbackZone.innerText = "⏳ Analyse en cours...";
    feedbackZone.classList.remove("hidden");
    if (resultZone) resultZone.classList.add("hidden");

    try {
        const response = await fetch(`${API_BASE}/api/predict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ visibilite, vitesseVent, precipitation, heure_vol })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.erreur || `Erreur HTTP ${response.status}`);
        }

        const data = await response.json();
        afficherResultatMeteo(data, numVol);

    } catch (error) {
        feedbackZone.className = "form-feedback";
        feedbackZone.style.background = "rgba(239, 68, 68, 0.08)";
        feedbackZone.style.color = "var(--red)";
        feedbackZone.style.border = "1px solid rgba(239, 68, 68, 0.2)";
        feedbackZone.innerText = `❌ Erreur de connexion au service IA : ${error.message}`;
    }
});

/**
 * Affiche le résultat de l'analyse de risque retourné par l'API Flask.
 * @param {Object} data - { score, niveau, causes }
 * @param {string} numVol - numéro de vol saisi par l'agent
 */
function afficherResultatMeteo(data, numVol) {
    const { score, niveau, causes } = data;

    // Mise à jour du feedback textuel
    feedbackZone.className = "form-feedback success";
    feedbackZone.style = ""; // Reset des styles inline d'erreur
    feedbackZone.innerText = `✅ Analyse transmise pour le vol ${numVol || "—"}. Score IA : ${score}% (${niveau})`;

    // Si une zone de résultat existe dans le HTML, la remplir
    if (resultZone) {
        resultZone.classList.remove("hidden");

        const scoreEl = document.getElementById("result-score");
        const niveauEl = document.getElementById("result-niveau");
        const causesEl = document.getElementById("result-causes");

        if (scoreEl) scoreEl.innerText = score + "%";
        if (causesEl) causesEl.innerText = causes;

        if (niveauEl) {
            niveauEl.innerText = niveau;
            niveauEl.className = "status-badge " + (
                niveau === "VERT"   ? "badge-green" :
                niveau === "ORANGE" ? "badge-amber"  : "badge-red"
            );
        }
    }
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
