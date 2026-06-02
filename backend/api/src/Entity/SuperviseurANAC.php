<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource]
#[ORM\Entity]
class SuperviseurANAC extends Utilisateur
{
    #[ORM\Column(length: 50, unique: true)]
    #[Assert\NotBlank]
    #[Groups(['utilisateur:read', 'utilisateur:write'])]
    public string $matricule = '';

    #[ORM\Column(length: 20)]
    #[Groups(['utilisateur:read', 'utilisateur:write'])]
    public string $niveauAcces = 'standard'; // standard | admin

    /**
     * Retourne les rôles Symfony pour le système de sécurité
     */
    public function getRoles(): array
    {
        return ['ROLE_SUPERVISEUR', 'ROLE_USER'];
    }
}
