"""
AeroSafe AI — Microservice Python Flask
Algorithme de calcul du score de risque météo pour les vols.
Ce service est appelé directement par le frontend via HTTP.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)

# Autoriser les requêtes depuis le frontend (fichiers HTML ouverts en local ou serveur)
CORS(app, origins="*")


def calculer_score_risque(
    visibilite: float,
    vitesse_vent: float,
    precipitation: float,
    heure_vol: datetime
) -> dict:
    """
    Calcule le score de risque d'un vol en fonction des conditions météo.

    Paramètres :
        visibilite    (float) : visibilité en km
        vitesse_vent  (float) : vitesse du vent en km/h
        precipitation (float) : précipitations en mm
        heure_vol  (datetime) : heure de départ du vol

    Retourne :
        dict avec score (0-100), niveau (VERT/ORANGE/ROUGE) et causes
    """
    score = 0
    causes = []

    # Règle 1 : Visibilité critique → ROUGE immédiat
    if visibilite < 2:
        return {
            'score': 100,
            'niveau': 'ROUGE',
            'causes': 'Visibilité critique (< 2 km) — approche impossible'
        }

    # Règle 2 : Visibilité dégradée (progressive)
    if visibilite < 5:
        score += 40
        causes.append(f'Faible visibilité ({visibilite} km < 5 km)')
    elif visibilite < 10:
        score += 20
        causes.append(f'Visibilité réduite ({visibilite} km < 10 km)')

    # Règle 3 : Force du vent
    if vitesse_vent > 50:
        score += 35
        causes.append(f'Vents violents ({vitesse_vent} km/h) — risque de cisaillement')
    elif vitesse_vent > 30:
        score += 15
        causes.append(f'Vent modéré ({vitesse_vent} km/h)')

    # Règle 4 : Précipitations
    if precipitation > 10:
        score += 20
        causes.append(f'Fortes précipitations ({precipitation} mm)')
    elif precipitation > 5:
        score += 10
        causes.append(f'Précipitations modérées ({precipitation} mm)')

    # Règle 5 : Heure de pointe aérienne (17h–21h)
    if 17 <= heure_vol.hour <= 21:
        score += 10
        causes.append('Heure de pointe (17h-21h) — congestion trafic')

    score = min(score, 100)

    if score >= 60:
        niveau = 'ROUGE'
    elif score >= 30:
        niveau = 'ORANGE'
    else:
        niveau = 'VERT'

    return {
        'score': score,
        'niveau': niveau,
        'causes': ' | '.join(causes) if causes else 'Conditions météo normales'
    }


# ---------------------------------------------------------------------------
# Données de référence des vols (remplace la base MySQL pour le prototype)
# En production, ces données viendraient d'une vraie requête SQL.
# ---------------------------------------------------------------------------
VOLS_BASE = [
    {
        "numVol": "KP023",
        "compagnie": "ASKY",
        "destination": "Abidjan (ABJ)",
        "heure": "15:45",
        "visibilite": 15.0,
        "vitesseVent": 10.0,
        "precipitation": 0.0,
        "heure_vol": "2025-11-15T15:45:00+00:00"
    },
    {
        "numVol": "AF858",
        "compagnie": "Air France",
        "destination": "Paris (CDG)",
        "heure": "20:15",
        "visibilite": 3.0,
        "vitesseVent": 65.0,
        "precipitation": 15.0,
        "heure_vol": "2025-11-15T20:15:00+00:00"
    },
    {
        "numVol": "ET901",
        "compagnie": "Ethiopian",
        "destination": "Addis-Abeba (ADD)",
        "heure": "18:30",
        "visibilite": 7.0,
        "vitesseVent": 32.0,
        "precipitation": 6.0,
        "heure_vol": "2025-11-15T18:30:00+00:00"
    },
    {
        "numVol": "KP110",
        "compagnie": "ASKY",
        "destination": "Dakar (DSS)",
        "heure": "11:20",
        "visibilite": 20.0,
        "vitesseVent": 8.0,
        "precipitation": 0.0,
        "heure_vol": "2025-11-15T11:20:00+00:00"
    }
]


@app.route('/api/vols', methods=['GET'])
def get_vols():
    """
    Retourne tous les vols avec leur score de risque calculé par l'IA.
    Appelé par hackaDash.js et hackPassag.js.
    """
    resultats = []
    for vol in VOLS_BASE:
        heure_vol = datetime.fromisoformat(vol['heure_vol'])
        risque_data = calculer_score_risque(
            visibilite=vol['visibilite'],
            vitesse_vent=vol['vitesseVent'],
            precipitation=vol['precipitation'],
            heure_vol=heure_vol
        )

        score = risque_data['score']
        niveau = risque_data['niveau']

        if score < 30:
            statut = "Sécurisé"
        elif score <= 60:
            statut = "Vigilance"
        else:
            statut = "Alerte Critique"

        resultats.append({
            "numVol": vol['numVol'],
            "compagnie": vol['compagnie'],
            "destination": vol['destination'],
            "heure": vol['heure'],
            "risque": score,
            "niveau": niveau,
            "statut": statut,
            "causes": risque_data['causes']
        })

    return jsonify(resultats), 200


@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Calcule le score de risque pour des données météo fournies par le formulaire Agent Météo.
    Body JSON attendu :
    {
        "visibilite": 4.5,
        "vitesseVent": 60,
        "precipitation": 12,
        "heure_vol": "2025-11-15T18:30:00+00:00"
    }
    Appelé par hackMeteo.js.
    """
    data = request.get_json()

    if not data:
        return jsonify({'erreur': 'Body JSON manquant'}), 400

    required = ['visibilite', 'vitesseVent', 'precipitation', 'heure_vol']
    for field in required:
        if field not in data:
            return jsonify({'erreur': f'Champ manquant : {field}'}), 400

    try:
        heure_vol = datetime.fromisoformat(data['heure_vol'])
    except ValueError:
        return jsonify({'erreur': 'Format de date invalide. Attendu : ISO 8601'}), 400

    resultat = calculer_score_risque(
        visibilite=float(data['visibilite']),
        vitesse_vent=float(data['vitesseVent']),
        precipitation=float(data['precipitation']),
        heure_vol=heure_vol
    )

    return jsonify(resultat), 200


@app.route('/health', methods=['GET'])
def health():
    """Endpoint de santé"""
    return jsonify({'status': 'ok', 'service': 'AeroSafe IA'}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
