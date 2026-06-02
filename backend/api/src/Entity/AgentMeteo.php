<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource]
#[ORM\Entity]
class AgentMeteo extends Utilisateur
{
    #[ORM\Column(length: 100)]
    #[Assert\NotBlank]
    #[Groups(['utilisateur:read', 'utilisateur:write'])]
    public string $stationMeteo = '';

    public function getRoles(): array
    {
        return ['ROLE_AGENT_METEO', 'ROLE_USER'];
    }
}
