package ma.ac.uir.marchepublic.suivi_marche.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Service
public class FileService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public List<String> lireTachesDuFichierCPS(String filename) throws IOException {
        List<String> taches = new ArrayList<>();

        try {
            System.out.println("📖 Lecture du fichier CPS: " + filename);
            System.out.println("📂 Répertoire d'upload configuré: " + uploadDir);

            // Construire le chemin complet
            Path filePath = Paths.get(uploadDir, filename);
            System.out.println("📍 Chemin complet construit: " + filePath.toAbsolutePath());

            // Vérifier si le fichier existe
            if (!Files.exists(filePath)) {
                // Afficher des informations de diagnostic
                System.err.println("❌ Fichier introuvable: " + filePath.toAbsolutePath());
                System.err.println("📂 Répertoire de travail actuel: " + Paths.get("").toAbsolutePath());

                // Lister les fichiers dans le dossier uploads
                Path uploadPath = Paths.get(uploadDir);
                if (Files.exists(uploadPath)) {
                    System.err.println("📁 Contenu du dossier uploads:");
                    File[] files = uploadPath.toFile().listFiles();
                    if (files != null && files.length > 0) {
                        for (File file : files) {
                            System.err.println("  - " + file.getName());
                        }
                    } else {
                        System.err.println("  (vide)");
                    }
                } else {
                    System.err.println("❌ Le dossier uploads n'existe pas: " + uploadPath.toAbsolutePath());
                }

                throw new IOException("Fichier introuvable: " + filename);
            }

            // Lire toutes les lignes du fichier
            List<String> lignes = Files.readAllLines(filePath);
            System.out.println("✅ Fichier lu avec succès, nombre de lignes: " + lignes.size());

            boolean dansSectionTaches = false;
            String titreTacheCourante = null;
            StringBuilder descriptionTacheCourante = new StringBuilder();
            boolean enDescription = false;
            int numeroTache = 0;

            for (int i = 0; i < lignes.size(); i++) {
                String ligne = lignes.get(i).trim();

                // Détecter le début de la section des tâches
                if ((ligne.contains("2.") && ligne.toUpperCase().contains("TÂCHES")) ||
                        ligne.toUpperCase().contains("TÂCHES À RÉALISER")) {
                    dansSectionTaches = true;
                    System.out.println("✅ Section tâches détectée: " + ligne);
                    continue;
                }

                if (dansSectionTaches) {
                    // Arrêter si on arrive à une autre section majeure
                    if (ligne.startsWith("3.") ||
                            ligne.toUpperCase().contains("MATÉRIELS REQUIS") ||
                            ligne.toUpperCase().contains("LICENCES") ||
                            ligne.toUpperCase().contains("DURÉE TOTALE") ||
                            ligne.toUpperCase().contains("BUDGET") ||
                            ligne.toUpperCase().contains("RISQUES") ||
                            ligne.toUpperCase().contains("REMARQUES")) {
                        System.out.println("⏹️ Fin de la section tâches détectée: " + ligne);

                        // Sauvegarder la dernière tâche en cours
                        sauvegarderTacheSiExistante(taches, titreTacheCourante, descriptionTacheCourante, ++numeroTache);
                        break;
                    }

                    // Détecter le début d'une nouvelle tâche (format: "Tâche X :")
                    if (ligne.matches("^Tâche\\s+\\d+\\s*:.*")) {
                        // Sauvegarder la tâche précédente si elle existe
                        sauvegarderTacheSiExistante(taches, titreTacheCourante, descriptionTacheCourante, ++numeroTache);

                        // Réinitialiser pour la nouvelle tâche
                        titreTacheCourante = null;
                        descriptionTacheCourante = new StringBuilder();
                        enDescription = false;
                        System.out.println("🆕 Nouvelle tâche détectée: " + ligne);
                        continue;
                    }

                    // Détecter le titre de la tâche
                    if (ligne.startsWith("Titre :")) {
                        titreTacheCourante = ligne.replaceFirst("^Titre\\s*:", "").trim();
                        enDescription = false;
                        System.out.println("🏷️  Titre de tâche trouvé: " + titreTacheCourante);
                        continue;
                    }

                    // Détecter le début de la description
                    if (ligne.startsWith("Description :")) {
                        String description = ligne.replaceFirst("^Description\\s*:", "").trim();
                        if (!description.isEmpty()) {
                            if (descriptionTacheCourante.length() > 0) {
                                descriptionTacheCourante.append(" ");
                            }
                            descriptionTacheCourante.append(description);
                        }
                        enDescription = true;
                        continue;
                    }

                    // Si on est en train de lire une description (lignes indentées)
                    if (enDescription && titreTacheCourante != null) {
                        // Vérifier si c'est une ligne de description (indentée) et pas un nouveau champ
                        if (!ligne.isEmpty() &&
                                !ligne.startsWith("Durée estimée :") &&
                                !ligne.startsWith("Date limite :") &&
                                !ligne.matches("^Tâche\\s+\\d+\\s*:.*") &&
                                !ligne.startsWith("Titre :")) {

                            // Nettoyer la ligne (enlever l'indentation)
                            String ligneNettoyee = ligne.trim();
                            if (!ligneNettoyee.isEmpty()) {
                                if (descriptionTacheCourante.length() > 0) {
                                    descriptionTacheCourante.append(" ");
                                }
                                descriptionTacheCourante.append(ligneNettoyee);
                            }
                        } else if (ligne.startsWith("Durée estimée :") || ligne.startsWith("Date limite :")) {
                            // Arrêter la description quand on arrive aux autres champs
                            enDescription = false;
                        }
                    }
                }
            }

            // Sauvegarder la dernière tâche après la boucle (pour la tâche 4)
            sauvegarderTacheSiExistante(taches, titreTacheCourante, descriptionTacheCourante, ++numeroTache);

            System.out.println("✅ Total tâches extraites: " + taches.size());

            // DEBUG: Afficher toutes les tâches extraites
            for (int i = 0; i < taches.size(); i++) {
                System.out.println("🔍 Tâche " + (i + 1) + ": " + taches.get(i));
            }

        } catch (IOException e) {
            System.err.println("❌ Erreur IO lors de la lecture du fichier CPS: " + e.getMessage());
            e.printStackTrace();
            throw new IOException("Erreur lors de la lecture du fichier CPS: " + filename + " - " + e.getMessage(), e);
        }

        return taches;
    }

    /**
     * Sauvegarde une tâche si elle existe
     */
    private void sauvegarderTacheSiExistante(List<String> taches, String titre, StringBuilder description, int numeroTache) {
        if (titre != null && !titre.isEmpty()) {
            String tacheComplete = titre;
            if (description.length() > 0) {
                // Nettoyer la description (supprimer les espaces multiples)
                String descriptionNettoyee = description.toString().replaceAll("\\s+", " ").trim();
                tacheComplete += " - " + descriptionNettoyee;
            }
            taches.add(tacheComplete);
            System.out.println("💾 Tâche " + numeroTache + " sauvegardée: " + tacheComplete);

            // Réinitialiser pour éviter les duplications
            titre = null;
            description.setLength(0);
        }
    }

    public String lireContenuFichierCPS(String filename) throws IOException {
        try {
            System.out.println("📖 Lecture contenu CPS: " + filename);
            System.out.println("📂 Répertoire d'upload: " + uploadDir);

            // Construire le chemin complet
            Path filePath = Paths.get(uploadDir, filename);
            System.out.println("📍 Chemin complet: " + filePath.toAbsolutePath());

            if (!Files.exists(filePath)) {
                System.err.println("❌ Fichier introuvable: " + filePath.toAbsolutePath());
                throw new IOException("Fichier CPS introuvable: " + filename);
            }

            String content = Files.readString(filePath);
            System.out.println("✅ Contenu lu avec succès, taille: " + content.length() + " caractères");

            return content;
        } catch (IOException e) {
            System.err.println("❌ Erreur lecture contenu CPS: " + e.getMessage());
            throw new IOException("Erreur lors de la lecture du fichier CPS: " + filename + " - " + e.getMessage(), e);
        }
    }
}