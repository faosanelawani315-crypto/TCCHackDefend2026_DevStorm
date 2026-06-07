<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
    operations: [
        new GetCollection(normalizationContext: ['groups' => ['utilisateur:read']]),
        new Get(normalizationContext: ['groups' => ['utilisateur:read']]),
        new Post(
            normalizationContext: ['groups' => ['utilisateur:read']],
            denormalizationContext: ['groups' => ['utilisateur:write']]
        ),
        new Put(
            normalizationContext: ['groups' => ['utilisateur:read']],
            denormalizationContext: ['groups' => ['utilisateur:write']]
        ),
    ]
)]
#[ORM\Entity]
#[ORM\InheritanceType('JOINED')]
#[ORM\DiscriminatorColumn(name: 'role', type: 'string')]
#[ORM\DiscriminatorMap([
    'superviseur'  => SuperviseurANAC::class,
    'dispatcher'   => Dispatcher::class,
    'agent_meteo'  => AgentMeteo::class,
])]
class Utilisateur implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['utilisateur:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank(message: 'Le nom est obligatoire')]
    #[Groups(['utilisateur:read', 'utilisateur:write'])]
    public string $nom = '';

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank(message: 'Les prénoms sont obligatoires')]
    #[Groups(['utilisateur:read', 'utilisateur:write'])]
    public string $prenoms = '';

    #[ORM\Column(length: 150, unique: true)]
    #[Assert\NotBlank]
    #[Assert\Email(message: 'Email invalide')]
    #[Groups(['utilisateur:read', 'utilisateur:write'])]
    public string $email = '';

    #[ORM\Column(length: 255)]
    #[Groups(['utilisateur:write'])]
    private string $motPasse = '';

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPassword(): string
    {
        return $this->motPasse;
    }

    public function setPassword(string $hashedPassword): static
    {
        $this->motPasse = $hashedPassword;
        return $this;
    }

    public function getUserIdentifier(): string
    {
        return $this->email;
    }

    public function getRoles(): array
    {
        return ['ROLE_USER'];
    }

    public function eraseCredentials(): void {}
}
