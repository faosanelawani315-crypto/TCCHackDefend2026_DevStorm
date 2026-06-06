// ============================================================
// hackaDash.js — Dashboard Superviseur ANAC
// Connecté au backend Flask via GET /api/vols
// ============================================================

// URL de base du microservice IA
const API_BASE = "http://localhost:5000";

// Vérification d'accès
(function verifierAcces() {
    const role = localStorage.getItem("userRole");
    if (!role || role !== "superviseur") {
        alert("Accès restreint. Identification Superviseur ANAC requise.");
        window.location.href = "hackConnection.html";
    }
})();

// Chargement des vols au démarrage de la page
document.addEventListener("DOMContentLoaded", () => {
    chargerVols();
});

/**
 * Récupère les vols depuis l'API Flask et met à jour le tableau.
 */
async function chargerVols() {
    const tbody = document.getElementById("vols-tbody");
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:30px;">⏳ Chargement des données...</td></tr>`;

    try {
        const response = await fetch(`${API_BASE}/api/vols`);

        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
        }

        const vols = await response.json();
        genererTableauVols(vols);

    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--red); padding:30px;">
            ❌ Impossible de contacter le service IA.<br>
            <small style="color:var(--text-muted);">Vérifiez que le backend Flask tourne sur ${API_BASE}</small>
        </td></tr>`;
        console.error("Erreur chargement vols :", error);
    }
}

/**
 * Génère les lignes du tableau à partir des données retournées par l'API.
 * @param {Array} vols - tableau d'objets { numVol, compagnie, destination, heure, risque, statut }
 */
function genererTableauVols(vols) {
    const tbody = document.getElementById("vols-tbody");
    tbody.innerHTML = "";

    let alerteRougeCount = 0;
    let volVertCount = 0;

    vols.forEach(vol => {
        let statutClass = "";
        let risqueClass = "";

        if (vol.risque < 30) {
            statutClass = "badge-green";
            risqueClass = "text-green";
            volVertCount++;
        } else if (vol.risque <= 60) {
            statutClass = "badge-amber";
            risqueClass = "text-amber";
        } else {
            statutClass = "badge-red";
            risqueClass = "text-red";
            alerteRougeCount++;
        }

        const row = document.createElement("tr");
        row.innerHTML = `
            <td style="font-family: monospace; font-weight: bold; color: #fff;">${vol.numVol}</td>
            <td>${vol.compagnie}</td>
            <td>${vol.destination}</td>
            <td style="color: var(--text-muted);">${vol.heure}</td>
            <td>
                <div class="progress-container">
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill ${vol.risque < 30 ? 'bg-green' : vol.risque <= 60 ? 'bg-amber' : 'bg-red'}" style="width: ${vol.risque}%"></div>
                    </div>
                    <span class="${risqueClass}">${vol.risque}%</span>
                </div>
            </td>
            <td><span class="status-badge ${statutClass}">${vol.statut}</span></td>
        `;
        tbody.appendChild(row);
    });

    // Mise à jour des compteurs KPI
    document.getElementById("total-vols").innerText = vols.length;
    document.getElementById("total-alertes-rouges").innerText = alerteRougeCount;
    document.getElementById("total-vols-verts").innerText = volVertCount;
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
