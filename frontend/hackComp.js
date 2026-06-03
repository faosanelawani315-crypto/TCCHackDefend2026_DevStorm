(function verifierAcces() {
    const role = localStorage.getItem("userRole");
    if (!role || (role !== "dispatcher" && role !== "superviseur")) {
        alert("Accès refusé. Réservé aux dispatchers de compagnies.");
        window.location.href = "login.html";
    }
})();

// Base de données partagée simulée locale
let volsListe = [
    { id: 1, numVol: "KP 023", compagnie: "ASKY", destination: "Abidjan (ABJ)", heure: "15:45", risque: 12, statut: "A l'heure" },
    { id: 2, numVol: "AF 858", compagnie: "Air France", destination: "Paris (CDG)", heure: "20:15", risque: 78, statut: "Alerte Météo" },
    { id: 3, numVol: "ET 901", compagnie: "Ethiopian", destination: "Addis-Abeba", heure: "18:30", risque: 45, statut: "Vigilance" },
    { id: 4, numVol: "KP 110", compagnie: "ASKY", destination: "Dakar (DSS)", heure: "11:20", risque: 5, statut: "Sécurisé" }
];

document.addEventListener("DOMContentLoaded", () => {
    const filterSelect = document.getElementById("compagnie-filter");
    
    // Charger tous les vols au démarrage
    afficherVolsDispatcher(volsListe);

    // Écouter les changements du filtre de sélection
    filterSelect.addEventListener("change", (e) => {
        const compagnieSelectionnee = e.target.value;
        if (compagnieSelectionnee === "TOUS") {
            afficherVolsDispatcher(volsListe);
        } else {
            const volsFiltres = volsListe.filter(v => v.compagnie === compagnieSelectionnee);
            afficherVolsDispatcher(volsFiltres);
        }
    });
});

function afficherVolsDispatcher(vols) {
    const tbody = document.getElementById("dispatcher-tbody");
    tbody.innerHTML = "";

    if (vols.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">Aucun vol trouvé pour cette compagnie.</td></tr>`;
        return;
    }

    vols.forEach(vol => {
        let statutClass = "";
        let risqueClass = "";
        
        if (vol.risque < 30) {
            statutClass = "badge-green";
            risqueClass = "text-green";
        } else if (vol.risque <= 60) {
            statutClass = "badge-amber";
            risqueClass = "text-amber";
        } else {
            statutClass = "badge-red";
            risqueClass = "text-red";
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
            <td><span class="status-badge ${statutClass}" id="status-tag-${vol.id}">${vol.statut}</span></td>
            <td>
                <button class="btn-table btn-action" onclick="ajusterStatutVol(${vol.id})">Ajuster</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Fonction de modification de statut déclenchée par le bouton
function ajusterStatutVol(id) {
    const vol = volsListe.find(v => v.id === id);
    const feedback = document.getElementById("action-feedback");
    
    if (vol) {
        // Logique de simulation : si le vol est en alerte, on le reporte par sécurité
        if (vol.risque > 60) {
            vol.statut = "Reporté (Sécurité)";
        } else {
            vol.statut = "Créneau Ajusté";
        }

        // Notification visuelle de succès
        feedback.classList.remove("hidden");
        feedback.innerText = `⚙️ Action Dispatcher : Le statut du vol ${vol.numVol} a été réorganisé sur "${vol.statut}".`;

        // Recharger le tableau mis à jour
        const filtreActuel = document.getElementById("compagnie-filter").value;
        if (filtreActuel === "TOUS") {
            afficherVolsDispatcher(volsListe);
        } else {
            afficherVolsDispatcher(volsListe.filter(v => v.compagnie === filtreActuel));
        }

        // masquer la notification après 4 secondes
        setTimeout(() => {
            feedback.classList.add("hidden");
        }, 4000);
    }
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