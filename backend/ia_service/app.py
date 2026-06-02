"""
AeroSafe AI — Microservice Python Flask
Algorithme de calcul du score de risque météo pour les vols.
Ce service est appelé par le backend PHP via HTTP.
"""

from flask import Flask, request, jsonify
from datetime import datetime

app = Flask(__name__)


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

    # ──────────────────────────────────────────────
    # Règle 1 : Visibilité critique → ROUGE immédiat
    # En dessous de 2 km, aucun vol ne peut décoller
    # ──────────────────────────────────────────────
    if visibilite < 2:
        return {
            'score': 100,
            'niveau': 'ROUGE',
            'causes': 'Visibilité critique (< 2 km) — approche impossible'
        }

    # ──────────────────────────────────────────────
    # Règle 2 : Visibilité dégradée (progressive)
    # ──────────────────────────────────────────────
    if visibilite < 5:
        score += 40
        causes.append(f'Faible visibilité ({visibilite} km < 5 km)')
    elif visibilite < 10:
        score += 20
        causes.append(f'Visibilité réduite ({visibilite} km < 10 km)')

    # ──────────────────────────────────────────────
    # Règle 3 : Force du vent
    # ──────────────────────────────────────────────
    if vitesse_vent > 50:
        score += 35
        causes.append(f'Vents violents ({vitesse_vent} km/h) — risque de cisaillement')
    elif vitesse_vent > 30:
        score += 15
        causes.append(f'Vent modéré ({vitesse_vent} km/h)')

    # ──────────────────────────────────────────────
    # Règle 4 : Précipitations
    # ──────────────────────────────────────────────
    if precipitation > 10:
        score += 20
        causes.append(f'Fortes précipitations ({precipitation} mm)')
    elif precipitation > 5:
        score += 10
        causes.append(f'Précipitations modérées ({precipitation} mm)')

    # ──────────────────────────────────────────────
    # Règle 5 : Heure de pointe aérienne (17h–21h)
    # Congestion du trafic aérien
    # ──────────────────────────────────────────────
    if 17 <= heure_vol.hour <= 21:
        score += 10
        causes.append('Heure de pointe (17h-21h) — congestion trafic')

    # Plafonner à 100
    score = min(score, 100)

    # Déterminer le niveau d'alerte
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


@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Point d'entrée principal — appelé par le backend PHP.
    Body JSON attendu :
    {
        "visibilite": 4.5,
        "vitesseVent": 60,
        "precipitation": 12,
        "heure_vol": "2025-11-15T18:30:00+00:00"
    }
    """
    data = request.get_json()

    if not data:
        return jsonify({'erreur': 'Body JSON manquant'}), 400

    # Vérification des champs obligatoires
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
    """Endpoint de santé — vérifie que le service est vivant"""
    return jsonify({'status': 'ok', 'service': 'AeroSafe IA'}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
