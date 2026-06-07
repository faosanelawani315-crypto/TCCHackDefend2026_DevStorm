--  AeroSafe AI — Script de création de la BDD

create database AeroSafeAI ;
USE AeroSafeAI ; 

-- 1. TABLE UTILISATEUR (classe parent)
CREATE TABLE Utilisateur (
    IdUtilisateur INT AUTO_INCREMENT PRIMARY KEY,
    Nom           VARCHAR(100) NOT NULL,
    Prenoms       VARCHAR(100) NOT NULL,
    Email         VARCHAR(150) NOT NULL UNIQUE,
    MotPasse      VARCHAR(255) NOT NULL,  -- stocker un hash bcrypt, jamais en clair !
    role          ENUM('superviseur', 'dispatcher', 'agent_meteo') NOT NULL
);

-- 2. TABLE SUPERVISEUR ANAC (hérite de Utilisateur)
CREATE TABLE SuperviseurANAC (
    IdUtilisateur INT PRIMARY KEY,
    matricule     VARCHAR(50) NOT NULL UNIQUE,
    niveauAcces   ENUM('standard', 'admin') DEFAULT 'standard',
    FOREIGN KEY (IdUtilisateur) REFERENCES Utilisateur(IdUtilisateur) ON DELETE CASCADE
);

-- 3. TABLE DISPATCHER (hérite de Utilisateur)
CREATE TABLE Dispatcher (
    IdUtilisateur INT PRIMARY KEY,
    compagnie     VARCHAR(100) NOT NULL,
    FOREIGN KEY (IdUtilisateur) REFERENCES Utilisateur(IdUtilisateur) ON DELETE CASCADE
);

-- 4. TABLE AGENT METEO (hérite de Utilisateur)
CREATE TABLE AgentMeteo (
    IdUtilisateur INT PRIMARY KEY,
    stationMeteo  VARCHAR(100) NOT NULL,
    FOREIGN KEY (IdUtilisateur) REFERENCES Utilisateur(IdUtilisateur) ON DELETE CASCADE
);

-- 5. TABLE PASSAGER (entité indépendante)
CREATE TABLE Passager (
    idPassager      INT AUTO_INCREMENT PRIMARY KEY,
    nom             VARCHAR(100) NOT NULL,
    numeroPasseport VARCHAR(20)  NOT NULL UNIQUE
);

-- 6. TABLE COMPAGNIE AERIENNE
CREATE TABLE CompagnieAerienne (
    idCompagnie  INT AUTO_INCREMENT PRIMARY KEY,
    nomCompagnie VARCHAR(100) NOT NULL,
    pays         VARCHAR(80)  NOT NULL
);

-- 7. TABLE VOL (entité centrale — lie tout)
-- Relation : CompagnieAerienne 1 → 1..* Vol
CREATE TABLE Vol (
    idVol        INT AUTO_INCREMENT PRIMARY KEY,
    numeroVol    VARCHAR(15)  NOT NULL UNIQUE,
    destination  VARCHAR(100) NOT NULL,
    provenance   VARCHAR(100) NOT NULL,
    heureDépart  DATETIME     NOT NULL,
    heureArrivee DATETIME     NOT NULL,
    statut       ENUM('A_lheure', 'Retarde', 'Annule', 'En_attente') DEFAULT 'A_lheure',
    scoreRisque  DECIMAL(5,2) DEFAULT 0.00,
    idCompagnie  INT NOT NULL,
    FOREIGN KEY (idCompagnie) REFERENCES CompagnieAerienne(idCompagnie)
);

-- 8. TABLE DONNEE METEO
-- Relation : Vol 1..* ↔ 1..* DonneeMeteo (table de liaison)
CREATE TABLE DonneeMeteo (
    idMeteo        INT AUTO_INCREMENT PRIMARY KEY,
    vitesseVent    DECIMAL(6,2) NOT NULL COMMENT 'en km/h',
    directionVent  VARCHAR(10)  NOT NULL COMMENT 'ex: NE, SO...',
    visibilite     DECIMAL(6,2) NOT NULL COMMENT 'en km',
    precipitation  DECIMAL(6,2) DEFAULT 0.00 COMMENT 'en mm',
    dateMesure     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table de liaison Vol <-> DonneeMeteo (relation 1..* ↔ 1..*)
CREATE TABLE Vol_Meteo (
    idVol   INT NOT NULL,
    idMeteo INT NOT NULL,
    PRIMARY KEY (idVol, idMeteo),
    FOREIGN KEY (idVol)   REFERENCES Vol(idVol)           ON DELETE CASCADE,
    FOREIGN KEY (idMeteo) REFERENCES DonneeMeteo(idMeteo) ON DELETE CASCADE
);

-- 9. TABLE PREDICTION IA
-- Relation : Vol 1 → 1 PredictionIA
CREATE TABLE PredictionIA (
    idPrediction   INT AUTO_INCREMENT PRIMARY KEY,
    scoreRetard    DECIMAL(5,2) NOT NULL COMMENT 'score entre 0 et 100',
    niveauAlerte   ENUM('VERT', 'ORANGE', 'ROUGE') NOT NULL,
    causes         TEXT,
    datePrediction DATETIME DEFAULT CURRENT_TIMESTAMP,
    idVol          INT NOT NULL UNIQUE,  -- UNIQUE car 1 vol = 1 prédiction active
    FOREIGN KEY (idVol) REFERENCES Vol(idVol) ON DELETE CASCADE
);

-- 10. TABLE ALERTE
-- Relation : PredictionIA 1 → 1..* Alerte
CREATE TABLE Alerte (
    idAlerte    INT AUTO_INCREMENT PRIMARY KEY,
    typeAlerte  VARCHAR(50)  NOT NULL COMMENT 'ex: VISIBILITE, VENT, HEURE_POINTE',
    niveau      ENUM('ORANGE', 'ROUGE') NOT NULL,
    message     TEXT         NOT NULL,
    dateAlerte  DATETIME     DEFAULT CURRENT_TIMESTAMP,
    idPrediction INT NOT NULL,
    FOREIGN KEY (idPrediction) REFERENCES PredictionIA(idPrediction) ON DELETE CASCADE
);

-- Données de test
INSERT INTO CompagnieAerienne (nomCompagnie, pays) VALUES ('ASKY Airlines', 'Togo'), ('Air Côte d\'Ivoire', 'Côte d\'Ivoire');

INSERT INTO Utilisateur (Nom, Prenoms, Email, MotPasse, role) VALUES
('Kofi', 'Ama', 'ama.kofi@anac.tg', '$2b$12$...hash...', 'superviseur'),
('Mensah', 'Kojo', 'kojo@asky.tg',    '$2b$12$...hash...', 'dispatcher'),
('Agbeko', 'Sena', 'sena@meteo.tg',   '$2b$12$...hash...', 'agent_meteo');

INSERT INTO SuperviseurANAC (IdUtilisateur, matricule, niveauAcces) VALUES (1, 'ANAC-001', 'admin');
INSERT INTO Dispatcher (IdUtilisateur, compagnie) VALUES (2, 'ASKY Airlines');
INSERT INTO AgentMeteo (IdUtilisateur, stationMeteo) VALUES (3, 'Aéroport Gnassingbé Eyadéma');

INSERT INTO Vol (numeroVol, destination, provenance, heureDépart, heureArrivee, idCompagnie)
VALUES ('KP101', 'Accra', 'Lomé', '2025-11-15 08:00:00', '2025-11-15 09:30:00', 1);