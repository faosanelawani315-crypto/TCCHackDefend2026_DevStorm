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
        new GetCollection(normalizationContext: ['groups' => ['alerte:read']]),
        new Get(normalizationContext: ['groups' => ['alerte:read']]),
        new Post(
            normalizationContext: ['groups' => ['alerte:read']],
            denormalizationContext: ['groups' => ['alerte:write']]
        ),
    ]
)]
#[ORM\Entity]
class Alerte
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['alerte:read', 'prediction:detail'])]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    #[Assert\NotBlank]
    #[Groups(['alerte:read', 'alerte:write', 'prediction:detail'])]
    public string $typeAlerte = ''; // METEO, VENT, VISIBILITE, HEURE_POINTE

    #[ORM\Column(length: 10)]
    #[Assert\Choice(choices: ['ORANGE', 'ROUGE'])]
    #[Groups(['alerte:read', 'alerte:write', 'prediction:detail'])]
    public string $niveau = 'ORANGE';

    #[ORM\Column(type: 'text')]
    #[Assert\NotBlank]
    #[Groups(['alerte:read', 'alerte:write', 'prediction:detail'])]
    public string $message = '';

    #[ORM\Column(type: 'datetime')]
    #[Groups(['alerte:read'])]
    public \DateTimeInterface $dateAlerte;

    #[ORM\ManyToOne(targetEntity: PredictionIA::class, inversedBy: 'alertes')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['alerte:read', 'alerte:write'])]
    public ?PredictionIA $prediction = null;

    public function __construct()
    {
        $this->dateAlerte = new \DateTime();
    }

    public function getId(): ?int { return $this->id; }
}
