<?php

namespace App\Tests\Api;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;

/**
 * Tests complets de l'API AeroSafe AI.
 * Exécuter avec : docker compose exec php bin/phpunit
 */
class AeroSafeTest extends ApiTestCase
{
    // ─────────────────────────────────────────────
    // TESTS COMPAGNIES AÉRIENNES
    // ─────────────────────────────────────────────

    public function testCreerCompagnie(): void
    {
        static::createClient()->request('POST', '/api/compagnie_aeriennes', [
            'json' => [
                'nomCompagnie' => 'ASKY Airlines',
                'pays'         => 'Togo',
            ],
            'headers' => ['Content-Type' => 'application/ld+json'],
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertJsonContains([
            '@type'        => 'CompagnieAerienne',
            'nomCompagnie' => 'ASKY Airlines',
            'pays'         => 'Togo',
        ]);
    }

    public function testListerCompagnies(): void
    {
        static::createClient()->request('GET', '/api/compagnie_aeriennes');

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');
    }

    // ─────────────────────────────────────────────
    // TESTS VOLS
    // ─────────────────────────────────────────────

    public function testListerVols(): void
    {
        static::createClient()->request('GET', '/api/vols');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains(['@type' => 'hydra:Collection']);
    }

    public function testRechercheVolParNumero(): void
    {
        static::createClient()->request('GET', '/api/vols?numeroVol=KP101');

        $this->assertResponseIsSuccessful();
    }

    public function testRechercheVolParStatut(): void
    {
        static::createClient()->request('GET', '/api/vols?statut=Retarde');

        $this->assertResponseIsSuccessful();
    }

    // ─────────────────────────────────────────────
    // TESTS DONNÉES MÉTÉO
    // ─────────────────────────────────────────────

    public function testSaisirDonneesMeteo(): void
    {
        static::createClient()->request('POST', '/api/donnee_meteos', [
            'json' => [
                'vitesseVent'   => 45.5,
                'directionVent' => 'NE',
                'visibilite'    => 8.0,
                'precipitation' => 2.5,
            ],
            'headers' => ['Content-Type' => 'application/ld+json'],
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertJsonContains([
            '@type'       => 'DonneeMeteo',
            'visibilite'  => '8',
            'vitesseVent' => '45.5',
        ]);
    }

    public function testSaisirMeteoSansVisibiliteFail(): void
    {
        static::createClient()->request('POST', '/api/donnee_meteos', [
            'json' => [
                'vitesseVent'   => 45.5,
                'directionVent' => 'NE',
                // visibilite manquant → doit échouer
            ],
            'headers' => ['Content-Type' => 'application/ld+json'],
        ]);

        $this->assertResponseStatusCodeSame(422); // Unprocessable Entity
    }

    // ─────────────────────────────────────────────
    // TESTS PRÉDICTIONS IA
    // ─────────────────────────────────────────────

    public function testListerPredictions(): void
    {
        static::createClient()->request('GET', '/api/prediction_i_as');

        $this->assertResponseIsSuccessful();
    }

    // ─────────────────────────────────────────────
    // TESTS ALERTES
    // ─────────────────────────────────────────────

    public function testListerAlertes(): void
    {
        static::createClient()->request('GET', '/api/alertes');

        $this->assertResponseIsSuccessful();
    }

    // ─────────────────────────────────────────────
    // TESTS PASSAGERS
    // ─────────────────────────────────────────────

    public function testCreerPassager(): void
    {
        static::createClient()->request('POST', '/api/passagers', [
            'json' => [
                'nom'             => 'Kofi Ama',
                'numeroPasseport' => 'TG123456',
            ],
            'headers' => ['Content-Type' => 'application/ld+json'],
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertJsonContains([
            '@type'           => 'Passager',
            'nom'             => 'Kofi Ama',
            'numeroPasseport' => 'TG123456',
        ]);
    }

    public function testPassagerDoublonFail(): void
    {
        $client = static::createClient();

        // Premier enregistrement
        $client->request('POST', '/api/passagers', [
            'json' => ['nom' => 'Test Doublon', 'numeroPasseport' => 'XX999999'],
            'headers' => ['Content-Type' => 'application/ld+json'],
        ]);

        // Deuxième avec le même passeport → doit échouer
        $client->request('POST', '/api/passagers', [
            'json' => ['nom' => 'Autre Nom', 'numeroPasseport' => 'XX999999'],
            'headers' => ['Content-Type' => 'application/ld+json'],
        ]);

        $this->assertResponseStatusCodeSame(422);
    }
}
