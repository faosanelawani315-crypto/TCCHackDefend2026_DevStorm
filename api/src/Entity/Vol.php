<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
    operations: [
        new GetCollection(normalizationContext: ['groups' => ['vol:read']]),
        new Get(normalizationContext: ['groups' => ['vol:read', 'vol:detail']]),
        new Post(
            normalizationContext: ['groups' => ['vol:read']],
            denormalizationContext: ['groups' => ['vol:write']]
        ),
        new Put(
            normalizationContext: ['groups' => ['vol:read']],
            denormalizationContext: ['groups' => ['vol:write']]
        ),
    ]
)]
#[ApiFilter(SearchFilter::class, properties: [
    'numeroVol'   => 'exact',
    'statut'      => 'exact',
    'destination' => 'partial',
    'provenance'  => 'partial',
])]
#[ApiFilter(OrderFilter::class, properties: ['heureDépart', 'scoreRisque'])]
#[ORM\Entity]
class Vol
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['vol:read', 'compagnie:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 15, unique: true)]
    #[Assert\NotBlank(message: 'Le numéro de vol est obligatoire')]
    #[Groups(['vol:read', 'vol:write', 'compagnie:read'])]
    public string $numeroVol = '';

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank]
    #[Groups(['vol:read', 'vol:write'])]
    public string $destination = '';

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank]
    #[Groups(['vol:read', 'vol:write'])]
    public string $provenance = '';

    #[ORM\Column(type: 'datetime')]
    #[Assert\NotNull]
    #[Groups(['vol:read', 'vol:write'])]
    public ?\DateTimeInterface $heureDépart = null;

    #[ORM\Column(type: 'datetime')]
    #[Assert\NotNull]
    #[Groups(['vol:read', 'vol:write'])]
    public ?\DateTimeInterface $heureArrivee = null;

    #[ORM\Column(length: 20)]
    #[Assert\Choice(choices: ['A_lheure', 'Retarde', 'Annule', 'En_attente'])]
    #[Groups(['vol:read', 'vol:write'])]
    public string $statut = 'A_lheure';

    /**
     * Score de risque calculé par l'algorithme IA (0 à 100)
     */
    #[ORM\Column(type: 'decimal', precision: 5, scale: 2)]
    #[Groups(['vol:read'])]
    public float $scoreRisque = 0.0;

    #[ORM\ManyToOne(targetEntity: CompagnieAerienne::class, inversedBy: 'vols')]
    #[ORM\JoinColumn(nullable: false)]
    #[Assert\NotNull]
    #[Groups(['vol:read', 'vol:write', 'vol:detail'])]
    public ?CompagnieAerienne $compagnie = null;

    /** @var Collection<int, DonneeMeteo> */
    #[ORM\ManyToMany(targetEntity: DonneeMeteo::class)]
    #[Groups(['vol:detail'])]
    private Collection $donneesMeteo;

    #[ORM\OneToOne(mappedBy: 'vol', targetEntity: PredictionIA::class, cascade: ['persist', 'remove'])]
    #[Groups(['vol:detail'])]
    private ?PredictionIA $prediction = null;

    public function __construct()
    {
        $this->donneesMeteo = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }
    public function getPrediction(): ?PredictionIA { return $this->prediction; }
    public function getDonneesMeteo(): Collection { return $this->donneesMeteo; }

    public function addDonneeMeteo(DonneeMeteo $meteo): static
    {
        if (!$this->donneesMeteo->contains($meteo)) {
            $this->donneesMeteo->add($meteo);
        }
        return $this;
    }
}
