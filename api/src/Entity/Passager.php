<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
    operations: [
        new GetCollection(normalizationContext: ['groups' => ['passager:read']]),
        new Get(normalizationContext: ['groups' => ['passager:read']]),
        new Post(
            normalizationContext: ['groups' => ['passager:read']],
            denormalizationContext: ['groups' => ['passager:write']]
        ),
    ]
)]
#[ApiFilter(SearchFilter::class, properties: ['numeroPasseport' => 'exact'])]
#[ORM\Entity]
class Passager
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['passager:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank(message: 'Le nom est obligatoire')]
    #[Groups(['passager:read', 'passager:write'])]
    public string $nom = '';

    #[ORM\Column(length: 20, unique: true)]
    #[Assert\NotBlank(message: 'Le numéro de passeport est obligatoire')]
    #[Groups(['passager:read', 'passager:write'])]
    public string $numeroPasseport = '';

    public function getId(): ?int { return $this->id; }
}
