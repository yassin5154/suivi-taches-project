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

            Path filePath = Paths.get(uploadDir, filename);
            System.out.println("📍 Chemin complet construit: " + filePath.toAbsolutePath());

            if (!Files.exists(filePath)) {
                System.err.println("❌ Fichier introuvable: " + filePath.toAbsolutePath());
                System.err.println("📂 Répertoire de travail actuel: " + Paths.get("").toAbsolutePath());

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

            List<String> lignes = Files.readAllLines(filePath);
            System.out.println("✅ Fichier lu avec succès, nombre de lignes: " + lignes.size());

            boolean dansSectionTaches = false;
            String titreTacheCourante = null;
            StringBuilder descriptionTacheCourante = new StringBuilder();
            String dureeEstimeeCourante = null;
            boolean enDescription = false;

            for (int i = 0; i < lignes.size(); i++) {
                String ligne = lignes.get(i);
                String ligneTrim = ligne.trim();

                // Détecter le début de la section des tâches
                if ((ligneTrim.contains("2.") && ligneTrim.toUpperCase().contains("TÂCHES")) ||
                        ligneTrim.toUpperCase().contains("TÂCHES À RÉALISER")) {
                    dansSectionTaches = true;
                    System.out.println("✅ Section tâches détectée: " + ligneTrim);
                    continue;
                }

                if (dansSectionTaches) {
                    // Arrêter si on arrive à une autre section majeure
                    if (ligneTrim.matches("^\\d+\\..*") &&
                            (ligneTrim.toUpperCase().contains("MATÉRIELS") ||
                                    ligneTrim.toUpperCase().contains("LICENCES") ||
                                    ligneTrim.toUpperCase().contains("DURÉE TOTALE") ||
                                    ligneTrim.toUpperCase().contains("BUDGET") ||
                                    ligneTrim.toUpperCase().contains("RISQUES") ||
                                    ligneTrim.toUpperCase().contains("REMARQUES"))) {
                        System.out.println("⏹️ Fin de la section tâches détectée: " + ligneTrim);

                        // Sauvegarder la dernière tâche en cours
                        if (titreTacheCourante != null && !titreTacheCourante.isEmpty()) {
                            sauvegarderTache(taches, titreTacheCourante, descriptionTacheCourante, dureeEstimeeCourante);
                        }
                        break;
                    }

                    // Détecter le début d'une nouvelle tâche (format: "Tâche X :")
                    if (ligneTrim.matches("^Tâche\\s+\\d+\\s*:.*")) {
                        // Sauvegarder la tâche précédente si elle existe
                        if (titreTacheCourante != null && !titreTacheCourante.isEmpty()) {
                            sauvegarderTache(taches, titreTacheCourante, descriptionTacheCourante, dureeEstimeeCourante);
                        }

                        // Réinitialiser pour la nouvelle tâche
                        titreTacheCourante = null;
                        descriptionTacheCourante = new StringBuilder();
                        dureeEstimeeCourante = null;
                        enDescription = false;
                        System.out.println("🆕 Nouvelle tâche détectée: " + ligneTrim);
                        continue;
                    }

                    // Détecter le titre de la tâche (avec ou sans indentation)
                    if (ligneTrim.startsWith("Titre :")) {
                        titreTacheCourante = ligneTrim.replaceFirst("^Titre\\s*:", "").trim();
                        enDescription = false;
                        System.out.println("🏷️  Titre de tâche trouvé: " + titreTacheCourante);
                        continue;
                    }

                    // Détecter le début de la description
                    if (ligneTrim.startsWith("Description :")) {
                        String description = ligneTrim.replaceFirst("^Description\\s*:", "").trim();
                        if (!description.isEmpty()) {
                            descriptionTacheCourante.append(description);
                        }
                        enDescription = true;
                        System.out.println("📝 Description détectée: " + description);
                        continue;
                    }

                    // Détecter la durée estimée
                    if (ligneTrim.startsWith("Durée estimée :")) {
                        dureeEstimeeCourante = ligneTrim.replaceFirst("^Durée estimée\\s*:", "").trim();
                        enDescription = false;
                        System.out.println("⏱️ Durée estimée détectée: " + dureeEstimeeCourante);
                        continue;
                    }

                    // Si on est en train de lire une description
                    if (enDescription && titreTacheCourante != null) {
                        // Vérifier si c'est une ligne de description (indentée) et pas un nouveau champ
                        if (!ligneTrim.isEmpty() &&
                                !ligneTrim.startsWith("Durée estimée :") &&
                                !ligneTrim.startsWith("Date limite :") &&
                                !ligneTrim.matches("^Tâche\\s+\\d+\\s*:.*") &&
                                !ligneTrim.startsWith("Titre :")) {

                            if (descriptionTacheCourante.length() > 0) {
                                descriptionTacheCourante.append(" ");
                            }
                            descriptionTacheCourante.append(ligneTrim);
                            System.out.println("📝 Ajout à description: " + ligneTrim);
                        } else if (ligneTrim.startsWith("Durée estimée :") || ligneTrim.startsWith("Date limite :")) {
                            // Arrêter la description quand on arrive aux autres champs
                            enDescription = false;
                        }
                    }
                }
            }

            // Sauvegarder la dernière tâche après la boucle
            if (titreTacheCourante != null && !titreTacheCourante.isEmpty()) {
                sauvegarderTache(taches, titreTacheCourante, descriptionTacheCourante, dureeEstimeeCourante);
            }

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
    private void sauvegarderTache(List<String> taches, String titre, StringBuilder description, String dureeEstimee) {
        String tacheComplete = titre;
        if (description.length() > 0) {
            String descriptionNettoyee = description.toString().replaceAll("\\s+", " ").trim();
            tacheComplete += " - " + descriptionNettoyee;
        }
        if (dureeEstimee != null && !dureeEstimee.isEmpty()) {
            tacheComplete += " [Durée: " + dureeEstimee + "]";
        }
        taches.add(tacheComplete);
        System.out.println("💾 Tâche sauvegardée: " + tacheComplete);
    }

    public String lireContenuFichierCPS(String filename) throws IOException {
        try {
            System.out.println("📖 Lecture contenu CPS: " + filename);
            System.out.println("📂 Répertoire d'upload: " + uploadDir);

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