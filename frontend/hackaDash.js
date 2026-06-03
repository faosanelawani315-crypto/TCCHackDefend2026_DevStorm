(function verifierAcces() {
    const role = localStorage.getItem("userRole");
    if (!role || role !== "superviseur") {
        alert("Accès restreint. Identification Superviseur ANAC requise.");
        window.location.href = "login.html";
    }
})();

// Données simulées en attendant le fetch() de l'API Flask
const volsData = [
    { numVol: "KP 023", compagnie: "ASKY", destination: "Abidjan (ABJ)", heure: "15:45", risque: 12, statut: "A l'heure" },
    { numVol: "AF 858", compagnie: "Air France", destination: "Paris (CDG)", heure: "20:15", risque: 78, statut: "Alerte Météo" },
    { numVol: "ET 901", compagnie: "Ethiopian", destination: "Addis-Abeba", heure: "18:30", risque: 45, statut: "Vigilance" },
    { numVol: "KP 110", compagnie: "ASKY", destination: "Dakar (DSS)", heure: "11:20", risque: 5, statut: "Sécurisé" }
];

document.addEventListener("DOMContentLoaded", () => {
    genererTableauVols(volsData);
});

function genererTableauVols(vols) {
    const tbody = document.getElementById("vols-tbody");
    tbody.innerHTML = ""; // Vide le tableau d'éventuelles anciennes données

    let alerteRougeCount = 0;
    let volVertCount = 0;

    vols.forEach(vol => {
        let statutClass = "";
        let risqueClass = "";
        
        // Logique de couleur selon les règles de seuil
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

        // Création de la ligne de tableau
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

    // Remplissage dynamique des compteurs en haut de la page
    document.getElementById("total-vols").innerText = vols.length;
    document.getElementById("total-alertes-rouges").innerText = alerteRougeCount;
    document.getElementById("total-vols-verts").innerText = volVertCount;
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