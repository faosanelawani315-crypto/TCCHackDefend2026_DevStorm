# ✈️ AeroSafe AI — Frontend (Dossier `Hack`)

Plateforme web de supervision aéronautique et de prédiction de risques de vols, développée pour l'**ANAC Togo** (Agence Nationale de l'Aviation Civile). Interface 100 % HTML/CSS/JS, couplée à un backend Flask et une base de données MySQL.

> Projet réalisé dans le cadre d'un Hackathon — PFE.

---

## 🌐 Architecture complète

```
Utilisateur (navigateur)
        │
        ▼
  Frontend HTML/CSS/JS        ← Dossier Hack/
        │
        │  fetch() → REST API
        ▼
  Backend Flask (Python)      ← localhost:5000
        │
        ├── MySQL (base de données)   ← stockage vols, météo, utilisateurs
        ├── Modèle XGBoost (.pkl)     ← calcul du score de risque IA
        └── API IA → /api/predictions/calculer/{volId}
```

---

## 📁 Structure du dossier `fontend`

```
fontend/
├── hackAcceuil.html        → Page d'accueil — portail d'entrée (Passager / Pro)
├── hackConnection.html     → Authentification sécurisée (agents ANAC)
├── hackConnection.js       → Logique de login + gestion des rôles
├── hackConnection.css      → Styles de l'écran de connexion
│
├── hackaDash.html          → Dashboard superviseur (supervision globale des vols)
├── hackaDash.js            → Chargement des vols depuis l'API Flask (auto-refresh 30s)
├── hackaDash.css           → Styles du tableau de bord
│
├── HackMeteo.html          → Formulaire de saisie des relevés météo (agent météo)
├── hackMeteo.js            → Envoi météo → API Flask → résultat IA en retour
├── hackMeteo.css           → Styles de la station météo
│
├── hackComp.html           → Gestion logistique des vols (dispatcher)
├── hackComp.js             → Chargement + filtrage + ajustement de statut des vols
├── hackComp.css            → Styles de l'espace dispatcher
│
├── hackPassag.html         → Consultation publique — indice de risque d'un vol
├── hackPassag.js           → Recherche d'un vol par numéro + affichage résultat IA
└── hackPassag.css          → Styles de l'espace passager
```

---

## 🛠️ Technologies utilisées

### Frontend
| Technologie | Usage |
|-------------|-------|
| **HTML5** | Structure des 5 interfaces (accueil, login, dashboard, météo, passager) |
| **CSS3** | Design dark glassmorphism, variables CSS, animations, responsive grid |
| **JavaScript (ES6+)** | Logique métier, appels API, gestion des rôles, rendu dynamique du DOM |
| **Fetch API** | Communication asynchrone avec le backend Flask (`async/await`) |
| **localStorage** | Persistance de session (rôle, nom, userId) côté navigateur |

### Backend (Flask — `localhost:5000`)
| Technologie | Usage |
|-------------|-------|
| **Python / Flask** | Serveur REST API |
| **Flask-CORS** | Autorise les requêtes cross-origin depuis le frontend |
| **SQLAlchemy** | ORM — modélisation et requêtes vers MySQL |
| **XGBoost** | Modèle ML de prédiction du score de risque (chargé via `joblib`) |
| **Pandas / NumPy** | Préparation des features avant prédiction |

### Base de données
| Technologie | Usage |
|-------------|-------|
| **MySQL** | Stockage relationnel des vols, utilisateurs, données météo, prédictions |
| **SQLAlchemy ORM** | Mapping objet-relationnel côté Flask |

#### Schéma des tables principales

```
utilisateurs          vols                    donnees_meteo
─────────────         ──────────────────      ─────────────────────
id (PK)               id (PK)                 id (PK)
nom                   numeroVol               volId (FK → vols.id)
prenoms               compagnieId (FK)        visibilite
email                 destination             vitesseVent
motPasse              heureDépart             directionVent
role                  scoreRisque             precipitation
                      statut                  dateReleve

compagnies            predictions
──────────            ────────────────────────
id (PK)               id (PK)
nomCompagnie          volId (FK)
pays                  niveau (VERT/ORANGE/ROUGE)
                      score (0–100)
                      causes
```

---

## 🔑 Gestion des rôles et accès

L'authentification repose sur l'API Flask (`POST /api/auth/login`) et le rôle est stocké dans le `localStorage`. Chaque page vérifie le rôle au chargement et redirige si non autorisé.

| Rôle | Accès | Page |
|------|-------|------|
| `superviseur` | Dashboard global + lecture seule de tout | `hackaDash.html` |
| `agent_meteo` | Saisie des relevés météo | `HackMeteo.html` |
| `dispatcher` | Gestion + ajustement du statut des vols | `hackComp.html` |
| *(public)* | Consultation de l'indice de risque d'un vol | `hackPassag.html` |

**Comptes de test (mode démo sans Flask) :**
```
super.lome    → superviseur
meteo.lome    → agent_meteo
dispatch.lome → dispatcher
```

---

## 🔗 Endpoints API consommés

| Méthode | Route | Utilisé dans |
|---------|-------|--------------|
| `POST` | `/api/auth/login` | `hackConnection.js` |
| `GET` | `/api/vols/` | `hackaDash.js`, `hackComp.js` |
| `GET` | `/api/vols/recherche?numero=XX` | `hackPassag.js` |
| `PUT` | `/api/vols/{id}/statut` | `hackComp.js` |
| `POST` | `/api/predictions/calculer/{volId}` | `hackMeteo.js` |

---

## 🤖 Intégration du modèle IA

L'agent météo saisit un relevé (vent, visibilité, précipitations) → le frontend l'envoie au backend Flask → Flask prépare les features et interroge le modèle XGBoost → la réponse (niveau VERT/ORANGE/ROUGE + score 0–100 + causes) est affichée directement à l'agent.

En l'absence de connexion à l'API, un **calcul de secours local** (JavaScript) fournit une estimation immédiate.

---

## 🚀 Installation et lancement local

### Prérequis
- Navigateur moderne (Chrome, Firefox, Edge)
- Python 3.10+ avec Flask et dépendances backend
- MySQL (XAMPP, WAMP ou MySQL Server)
- VS Code (recommandé) avec l'extension **Live Server**

### Étape 1 — Base de données MySQL

```sql
CREATE DATABASE aerosafe_db CHARACTER SET utf8mb4;
USE aerosafe_db;
-- Importer le schéma SQL fourni avec le backend
```

### Étape 2 — Backend Flask

```bash
cd backend
pip install -r requirements.txt
# Configurer la connexion MySQL dans config.py ou .env :
# SQLALCHEMY_DATABASE_URI = "mysql+pymysql://root:@localhost/aerosafe_db"
uvicorn app:app --reload   # ou : flask run --port 5000
```

### Étape 3 — Frontend

Ouvrir le dossier `Hack/` dans VS Code, puis lancer **Live Server** sur `hackAcceuil.html`.

Ou via npm :

```bash
npx serve Hack/
# → ouvrir http://localhost:3000/hackAcceuil.html
```

> ⚠️ Le frontend pointe sur `http://localhost:5000`. Si le backend n'est pas lancé, l'application bascule automatiquement en **mode démo** avec des données locales.

---

## 🎨 Design

- Thème **dark glassmorphism** : fonds translucides, flou, bordures lumineuses
- Palette : bleu cyan `#38bdf8`, rouge alerte `#ef4444`, vert sécurité `#22c55e`, ambre vigilance `#f97316`
- Code couleur du risque appliqué sur tableaux, badges et barres de progression
- Mise en page responsive (CSS Grid + Flexbox)

---

## ✅ Statut du projet

| Composant | Statut |
|-----------|--------|
| Page d'accueil | ✅ Terminée |
| Authentification + rôles | ✅ Terminée |
| Dashboard superviseur | ✅ Terminé |
| Station météo (agent) | ✅ Terminée |
| Espace dispatcher | ✅ Terminé |
| Espace passager | ✅ Terminé |
| Connexion API Flask | ✅ Prête |
| Fallback mode hors-ligne | ✅ Intégré |
| Base de données MySQL | ✅ Schéma défini |

---

> **AeroSafe AI** — Projet Hackathon | ANAC Togo 🇹🇬