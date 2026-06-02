<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
    operations: [
        new GetCollection(),
        new Get(),
        new Post(),
        new Put(),
    ],
    normalizationContext: ['groups' => ['compagnie:read']],
    denormalizationContext: ['groups' => ['compagnie:write']],
)]
#[ORM\Entity]
class CompagnieAerienne
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['compagnie:read', 'vol:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank(message: 'Le nom de la compagnie est obligatoire')]
    #[Groups(['compagnie:read', 'compagnie:write', 'vol:read'])]
    public string $nomCompagnie = '';

    #[ORM\Column(length: 80)]
    #[Assert\NotBlank]
    #[Groups(['compagnie:read', 'compagnie:write'])]
    public string $pays = '';

    /** @var Collection<int, Vol> */
    #[ORM\OneToMany(mappedBy: 'compagnie', targetEntity: Vol::class)]
    #[Groups(['compagnie:read'])]
    private Collection $vols;

    public function __construct()
    {
        $this->vols = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getVols(): Collection { return $this->vols; }
}
