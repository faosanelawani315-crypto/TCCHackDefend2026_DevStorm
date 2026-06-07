# AeroSafe AI

Système intelligent de prédiction des risques météo pour les vols aériens.

## Architecture

```
aerosafe_ai/
├── api/                  # Backend PHP — API Platform (Symfony)
│   └── src/Entity/       # Vol, DonneeMeteo, PredictionIA, Alerte...
├── pwa/                  # Frontend Next.js — Dashboard superviseur
├── ia_service/           # Microservice Python Flask — Algorithme IA
└── compose.yaml          # Lance tout en une commande
```

## Démarrage rapide

```bash
# Construire et lancer tous les services
docker compose build --no-cache
docker compose up

# Premier lancement : créer les tables
docker compose exec php bin/console doctrine:migrations:migrate
```

| Service | URL |
|---|---|
| Dashboard | https://localhost |
| API Swagger | https://localhost/api |
| Microservice IA | http://localhost:5000/health |

## Tests

```bash
# Tests automatisés
docker compose exec php bin/phpunit

# Test manuel microservice IA (résultat attendu : ROUGE)
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"visibilite":1.5,"vitesseVent":65,"precipitation":12,"heure_vol":"2025-11-15T18:30:00+00:00"}'
```

## Algorithme IA — Règles de scoring

| Condition | Points |
|---|---|
| Visibilité < 2 km | ROUGE immédiat |
| Visibilité < 5 km | +40 pts |
| Vent > 50 km/h | +35 pts |
| Précipitations > 10 mm | +20 pts |
| Heure de pointe 17h-21h | +10 pts |

VERT (0-29) · ORANGE (30-59) · ROUGE (60-100)
