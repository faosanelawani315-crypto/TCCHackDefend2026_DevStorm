import os

OUTPUT_FILE = "contenu_total.txt"
# On garde l'exclusion du .venv et .git pour t'éviter un fichier de 5 Go de bibliothèques
IGNORED_DIRS = {'.venv', '.git', '__pycache__', '.pytest_cache', '.idea', '.vscode'}

def generer_arborescence(txt_file):
    """Génère un visuel propre de l'arborescence complète du projet."""
    txt_file.write("==================================================\n")
    txt_file.write("          ARBORESCENCE COMPLÈTE DU PROJET\n")
    txt_file.write("==================================================\n\n")
    
    for racine, dossiers, fichiers in os.walk('.'):
        dossiers[:] = [d for d in dossiers if d not in IGNORED_DIRS]
        
        niveau = racine.replace('.', '').count(os.sep)
        indentation = ' ' * 4 * niveau
        
        nom_dossier = os.path.basename(racine)
        if nom_dossier and nom_dossier != '.':
            txt_file.write(f"{indentation}📁 {nom_dossier}/\n")
        elif nom_dossier == '.':
            txt_file.write("📁 AeroSafe-AI/ (Racine)\n")
            
        indentation_fichier = ' ' * 4 * (niveau + 1)
        for fichier in fichiers:
            if fichier != OUTPUT_FILE and fichier != 'regrouper_projet.py':
                txt_file.write(f"{indentation_fichier}📄 {fichier}\n")
    txt_file.write("\n\n")

def copier_contenu_fichiers(txt_file):
    """Copie le contenu de CHAQUE fichier sans filtre d'extension."""
    txt_file.write("==================================================\n")
    txt_file.write("          CONTENU DE TOUS LES FICHIERS\n")
    txt_file.write("==================================================\n\n")
    
    for racine, dossiers, fichiers in os.walk('.'):
        dossiers[:] = [d for d in dossiers if d not in IGNORED_DIRS]
        
        for fichier in fichiers:
            if fichier == OUTPUT_FILE or fichier == 'regrouper_projet.py':
                continue
                
            chemin_complet = os.path.join(racine, fichier)
            chemin_relatif = os.path.relpath(chemin_complet)
            
            txt_file.write(f"{"="*60}\n")
            txt_file.write(f"=== FICHIER : {chemin_relatif}\n")
            txt_file.write(f"{"="*60}\n\n")
            
            try:
                # 'errors="replace"' gère les caractères spéciaux sans faire planter le script
                with open(chemin_complet, 'r', encoding='utf-8', errors='replace') as f_entree:
                    contenu = f_entree.read()
                    
                    # Petite vérification pour éviter d'écrire du pur binaire illisible
                    if '\x00' in contenu[:1000]:  # Si le fichier contient des octets nuls (signe de binaire)
                        txt_file.write("[Fichier binaire ou non-textuel détecté - Contenu masqué pour lisibilité]\n")
                    else:
                        txt_file.write(contenu)
            except Exception as e:
                txt_file.write(f"[Erreur de lecture du fichier : {str(e)}]\n")
            
            txt_file.write("\n\n")

# Exécution
with open(OUTPUT_FILE, 'w', encoding='utf-8') as f_sortie:
    generer_arborescence(f_sortie)
    copier_contenu_fichiers(f_sortie)

print(f"Extraction totale réussie dans : {OUTPUT_FILE}")