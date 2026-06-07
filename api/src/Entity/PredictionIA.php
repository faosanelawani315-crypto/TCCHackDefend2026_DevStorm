<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
    operations: [
        new GetCollection(normalizationContext: ['groups' => ['prediction:read']]),
        new Get(normalizationContext: ['groups' => ['prediction:read', 'prediction:detail']]),
        new Post(
            normalizationContext: ['groups' => ['prediction:read']],
            denormalizationContext: ['groups' => ['prediction:write']]
        ),
    ]
)]
#[ORM\Entity]
class PredictionIA
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['prediction:read', 'vol:detail'])]
    private ?int $id = null;

    /**
     * Score entre 0 et 100 — calculé par le microservice Python Flask
     */
    #[ORM\Column(type: 'decimal', precision: 5, scale: 2)]
    #[Assert\Range(min: 0, max: 100)]
    #[Groups(['prediction:read', 'prediction:write', 'vol:detail'])]
    public float $scoreRetard = 0.0;

    #[ORM\Column(length: 10)]
    #[Assert\Choice(choices: ['VERT', 'ORANGE', 'ROUGE'])]
    #[Groups(['prediction:read', 'prediction:write', 'vol:detail'])]
    public string $niveauAlerte = 'VERT';

    /**
     * Causes détaillées séparées par ' | '
     * ex: "Visibilité réduite | Vents violents (65 km/h)"
     */
    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['prediction:read', 'prediction:write', 'vol:detail'])]
    public ?string $causes = null;

    #[ORM\Column(type: 'datetime')]
    #[Groups(['prediction:read'])]
    public \DateTimeInterface $datePrediction;

    #[ORM\OneToOne(targetEntity: Vol::class, inversedBy: 'prediction')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['prediction:read', 'prediction:write'])]
    public ?Vol $vol = null;

    /** @var Collection<int, Alerte> */
    #[ORM\OneToMany(mappedBy: 'prediction', targetEntity: Alerte::class, cascade: ['persist', 'remove'])]
    #[Groups(['prediction:detail'])]
    private Collection $alertes;

    public function __construct()
    {
        $this->datePrediction = new \DateTime();
        $this->alertes = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }
    public function getAlertes(): Collection { return $this->alertes; }
}
