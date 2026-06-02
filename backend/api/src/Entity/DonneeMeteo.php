<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
    operations: [
        new GetCollection(normalizationContext: ['groups' => ['meteo:read']]),
        new Get(normalizationContext: ['groups' => ['meteo:read']]),
        new Post(
            normalizationContext: ['groups' => ['meteo:read']],
            denormalizationContext: ['groups' => ['meteo:write']]
        ),
    ]
)]
#[ORM\Entity]
class DonneeMeteo
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['meteo:read', 'vol:detail'])]
    private ?int $id = null;

    #[ORM\Column(type: 'decimal', precision: 6, scale: 2)]
    #[Assert\NotBlank]
    #[Assert\PositiveOrZero]
    #[Groups(['meteo:read', 'meteo:write', 'vol:detail'])]
    public float $vitesseVent = 0.0;

    #[ORM\Column(length: 10)]
    #[Assert\NotBlank]
    #[Groups(['meteo:read', 'meteo:write', 'vol:detail'])]
    public string $directionVent = ''; // ex: N, NE, SO...

    /**
     * Visibilité en km — valeur critique pour l'algorithme IA
     */
    #[ORM\Column(type: 'decimal', precision: 6, scale: 2)]
    #[Assert\NotBlank]
    #[Assert\PositiveOrZero]
    #[Groups(['meteo:read', 'meteo:write', 'vol:detail'])]
    public float $visibilite = 0.0;

    #[ORM\Column(type: 'decimal', precision: 6, scale: 2)]
    #[Groups(['meteo:read', 'meteo:write', 'vol:detail'])]
    public float $precipitation = 0.0;

    #[ORM\Column(type: 'datetime')]
    #[Groups(['meteo:read', 'vol:detail'])]
    public \DateTimeInterface $dateMesure;

    public function __construct()
    {
        $this->dateMesure = new \DateTime();
    }

    public function getId(): ?int { return $this->id; }
}
