<?php

namespace App\Controller;

use App\Entity\Alerte;
use App\Entity\PredictionIA;
use App\Entity\Vol;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * Controller qui orchestre l'appel au microservice Python Flask
 * et sauvegarde la prédiction + alerte en base de données.
 */
#[AsController]
class PredictionController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly HttpClientInterface $httpClient,
    ) {}

    #[Route('/api/vols/{id}/calculer-risque', name: 'calculer_risque', methods: ['POST'])]
    public function calculerRisque(int $id, Request $request): JsonResponse
    {
        // 1. Récupérer le vol
        $vol = $this->em->getRepository(Vol::class)->find($id);
        if (!$vol) {
            return $this->json(['erreur' => 'Vol non trouvé'], 404);
        }

        $data = json_decode($request->getContent(), true);

        // 2. Appeler le microservice Python Flask (port 5000)
        try {
            $response = $this->httpClient->request('POST', 'http://ia_service:5000/api/predict', [
                'json' => [
                    'visibilite'    => (float) ($data['visibilite'] ?? 10),
                    'vitesseVent'   => (float) ($data['vitesseVent'] ?? 0),
                    'precipitation' => (float) ($data['precipitation'] ?? 0),
                    'heure_vol'     => $vol->heureDépart?->format('c'),
                ],
                'timeout' => 5,
            ]);
            $resultat = $response->toArray();
        } catch (\Exception $e) {
            return $this->json(['erreur' => 'Microservice IA indisponible : ' . $e->getMessage()], 503);
        }

        // 3. Mettre à jour le score du vol
        $vol->scoreRisque = $resultat['score'];

        // 4. Créer ou mettre à jour la PredictionIA
        $prediction = $vol->getPrediction();
        if (!$prediction) {
            $prediction = new PredictionIA();
            $prediction->vol = $vol;
            $this->em->persist($prediction);
        }
        $prediction->scoreRetard  = $resultat['score'];
        $prediction->niveauAlerte = $resultat['niveau'];
        $prediction->causes       = $resultat['causes'];
        $prediction->datePrediction = new \DateTime();

        // 5. Générer une alerte si ORANGE ou ROUGE
        if (in_array($resultat['niveau'], ['ORANGE', 'ROUGE'], true)) {
            $alerte = new Alerte();
            $alerte->typeAlerte  = 'METEO';
            $alerte->niveau      = $resultat['niveau'];
            $alerte->message     = sprintf('Vol %s : %s', $vol->numeroVol, $resultat['causes']);
            $alerte->prediction  = $prediction;
            $this->em->persist($alerte);
        }

        $this->em->flush();

        return $this->json([
            'vol'        => $vol->numeroVol,
            'score'      => $resultat['score'],
            'niveau'     => $resultat['niveau'],
            'causes'     => $resultat['causes'],
            'statut'     => $vol->statut,
            'message'    => 'Prédiction calculée et sauvegardée',
        ]);
    }
}
