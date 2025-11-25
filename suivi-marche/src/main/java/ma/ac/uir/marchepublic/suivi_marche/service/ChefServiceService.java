package ma.ac.uir.marchepublic.suivi_marche.service;

import ma.ac.uir.marchepublic.suivi_marche.dto.BesoinValidationRequest;
import ma.ac.uir.marchepublic.suivi_marche.dto.TacheValidationRequest;
import ma.ac.uir.marchepublic.suivi_marche.entity.Besoin;
import ma.ac.uir.marchepublic.suivi_marche.entity.ChefService;
import ma.ac.uir.marchepublic.suivi_marche.entity.Tache;
import ma.ac.uir.marchepublic.suivi_marche.repository.BesoinRepository;
import ma.ac.uir.marchepublic.suivi_marche.repository.TacheRepository;
import ma.ac.uir.marchepublic.suivi_marche.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ChefServiceService {

    @Autowired
    private BesoinRepository besoinRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private TacheRepository tacheRepository;

    @Autowired
    private FileService fileService;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    /**
     * Valide ou refuse un besoin
     */
    public Besoin validerBesoin(Long besoinId, BesoinValidationRequest validationRequest) {
        try {
            System.out.println("✅ Validation du besoin ID: " + besoinId + 
                ", Statut: " + (validationRequest.isValide() ? "ACCEPTE" : "REFUSE"));
            
            Besoin besoin = besoinRepository.findById(besoinId)
                    .orElseThrow(() -> new RuntimeException("Besoin non trouvé avec id: " + besoinId));

            System.out.println("📋 Besoin trouvé: " + besoin.getTitre() + " (Statut actuel: " + besoin.getStatut() + ")");

            if (validationRequest.isValide()) {
                besoin.setStatut("ACCEPTE");
                besoin.setValidationDate(LocalDate.now());
                besoin.setMotifRefus(null);
                System.out.println("🔄 Statut changé à: ACCEPTE");
                
                // Extraire et sauvegarder les tâches du vrai fichier CPS
                try {
                    extraireEtSauvegarderTaches(besoin);
                    System.out.println("✅ Tâches extraites avec succès");
                } catch (Exception e) {
                    System.err.println("❌ Erreur extraction tâches: " + e.getMessage());
                    // Ne pas bloquer la validation si l'extraction échoue
                    System.out.println("⚠️ Validation continuée sans extraction des tâches");
                }
            } else {
                besoin.setStatut("REFUSE");
                besoin.setMotifRefus(validationRequest.getMotifRefus());
                besoin.setValidationDate(LocalDate.now());
                System.out.println("🔄 Statut changé à: REFUSE, Motif: " + validationRequest.getMotifRefus());
            }

            // Sauvegarder le besoin
            Besoin besoinSauvegarde = besoinRepository.save(besoin);
            System.out.println("💾 Besoin sauvegardé avec succès, nouveau statut: " + besoinSauvegarde.getStatut());
            
            return besoinSauvegarde;
            
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la validation du besoin " + besoinId + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de la validation du besoin: " + e.getMessage(), e);
        }
    }

    /**
     * Extrait et sauvegarde les tâches du vrai fichier CPS
     */
    private void extraireEtSauvegarderTaches(Besoin besoin) {
        try {
            System.out.println("📝 Début extraction tâches pour besoin: " + besoin.getId());

            if (besoin.getFichierCPS() == null || besoin.getFichierCPS().isEmpty()) {
                System.err.println("❌ Aucun fichier CPS défini pour le besoin " + besoin.getId());
                throw new RuntimeException("Aucun fichier CPS trouvé pour extraire les tâches");
            }

            String filename = besoin.getFichierCPS();
            List<String> tachesDescriptions = fileService.lireTachesDuFichierCPS(filename);

            System.out.println("📊 " + tachesDescriptions.size() + " tâches extraites du fichier");

            int compteur = 0;
            for (String tacheComplete : tachesDescriptions) {
                Tache tache = new Tache();

                // Séparer le titre et la description si possible
                String[] parties = tacheComplete.split(" - ", 2);
                if (parties.length >= 2) {
                    tache.setTitre(parties[0].trim());
                    tache.setDescription(parties[1].trim());
                } else {
                    // Si pas de séparation, utiliser toute la chaîne comme titre
                    tache.setTitre(tacheComplete.trim());
                    tache.setDescription(tacheComplete.trim());
                }

                tache.setStatut("EN_ATTENTE");
                tache.setBesoin(besoin);

                Tache tacheSauvegardee = tacheRepository.save(tache);
                compteur++;
                System.out.println("💾 Tâche " + compteur + " sauvegardée - Titre: " + tache.getTitre());
            }

            System.out.println("✅ " + compteur + " tâches sauvegardées pour le besoin " + besoin.getId());

        } catch (Exception e) {
            System.err.println("❌ Erreur lors de l'extraction des tâches: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de l'extraction des tâches du fichier CPS: " + e.getMessage(), e);
        }
    }

    /**
     * Valide ou refuse une tâche spécifique
     */
    // Dans la méthode validerTache, ajouter la mise à jour des nouveaux champs
    public Tache validerTache(Long tacheId, TacheValidationRequest validationRequest) {
        try {
            System.out.println("✅ Validation de la tâche ID: " + tacheId +
                    ", Statut: " + (validationRequest.isValide() ? "ACCEPTEE" : "REFUSEE"));

            Tache tache = tacheRepository.findById(tacheId)
                    .orElseThrow(() -> new RuntimeException("Tâche non trouvée avec id: " + tacheId));

            // Vérifier que les champs requis sont remplis si on accepte la tâche
            if (validationRequest.isValide()) {
                // Validation: vérifier que les champs requis sont remplis
                if (validationRequest.getTitre() == null || validationRequest.getTitre().trim().isEmpty()) {
                    throw new RuntimeException("Le titre de la tâche est obligatoire");
                }
                if (validationRequest.getDateFinale() == null) {
                    throw new RuntimeException("La date finale de réalisation est obligatoire");
                }
                if (validationRequest.getDureeEstimee() == null || validationRequest.getDureeEstimee().trim().isEmpty()) {
                    throw new RuntimeException("La durée estimée est obligatoire");
                }

                tache.setStatut("ACCEPTEE");
                tache.setMotifRefus(null);
            } else {
                tache.setStatut("REFUSEE");
                tache.setMotifRefus(validationRequest.getMotifRefus());
            }

            // Mettre à jour les nouveaux champs (même pour le refus, pour garder les modifications)
            tache.setTitre(validationRequest.getTitre());
            tache.setDateFinale(validationRequest.getDateFinale());
            tache.setDureeEstimee(validationRequest.getDureeEstimee());
            tache.setDateLimite(validationRequest.getDateLimite());

            Tache tacheSauvegarde = tacheRepository.save(tache);
            System.out.println("💾 Tâche sauvegardée, nouveau statut: " + tacheSauvegarde.getStatut());

            return tacheSauvegarde;

        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la validation de la tâche " + tacheId + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de la validation de la tâche: " + e.getMessage(), e);
        }
    }

    /**
     * Récupère les tâches d'un besoin accepté
     */
    public List<Tache> getTachesDuBesoin(Long besoinId) {
        try {
            System.out.println("📝 Récupération des tâches pour besoin: " + besoinId);
            
            Besoin besoin = besoinRepository.findById(besoinId)
                    .orElseThrow(() -> new RuntimeException("Besoin non trouvé avec id: " + besoinId));

            if (!"ACCEPTE".equals(besoin.getStatut())) {
                throw new RuntimeException("Le besoin doit être accepté pour voir ses tâches");
            }

            List<Tache> taches = tacheRepository.findByBesoinId(besoinId);
            System.out.println("📋 " + taches.size() + " tâches trouvées pour le besoin " + besoinId);
            
            return taches;
            
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la récupération des tâches: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de la récupération des tâches: " + e.getMessage(), e);
        }
    }

    /**
     * Récupère le contenu réel du fichier CPS
     */
    public String getCpsContent(Long besoinId) throws IOException {
        try {
            System.out.println("📄 Lecture CPS pour besoin ID: " + besoinId);
            
            Besoin besoin = besoinRepository.findById(besoinId)
                    .orElseThrow(() -> new RuntimeException("Besoin non trouvé avec id: " + besoinId));

            if (besoin.getFichierCPS() == null || besoin.getFichierCPS().isEmpty()) {
                throw new RuntimeException("Aucun fichier CPS trouvé pour ce besoin");
            }

            String filePath = buildFilePath(besoin.getFichierCPS());
            Path path = Paths.get(filePath);
            
            if (!Files.exists(path)) {
                throw new RuntimeException("Fichier CPS introuvable: " + besoin.getFichierCPS());
            }

            String content = Files.readString(path);
            System.out.println("✅ Fichier CPS lu avec succès");
            
            return content;

        } catch (Exception e) {
            System.err.println("❌ Erreur lecture CPS: " + e.getMessage());
            throw new IOException("Erreur lors de la lecture du fichier CPS: " + e.getMessage(), e);
        }
    }

    /**
     * Construit le chemin complet du fichier
     */
    /**
 * Construit le chemin complet du fichier
 */
private String buildFilePath(String filename) {
    System.out.println("📍 Construction chemin pour: " + filename);
    
    // Si le chemin est déjà absolu, le retourner tel quel
    if (filename.startsWith("/") || filename.contains(":") || filename.startsWith("\\")) {
        return filename;
    }
    
    // Nettoyer le nom de fichier
    String cleanFilename = filename.trim();
    
    // Vérifier si le fichier existe dans le répertoire uploads
    try {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            System.out.println("📁 Répertoire uploads créé: " + uploadPath.toAbsolutePath());
        }
        
        Path filePath = uploadPath.resolve(cleanFilename);
        System.out.println("📍 Chemin complet résolu: " + filePath.toAbsolutePath());
        
        // Vérifier si le fichier existe
        if (!Files.exists(filePath)) {
            System.err.println("❌ Fichier non trouvé: " + filePath.toAbsolutePath());
            // Lister les fichiers disponibles pour debug
            try {
                List<Path> files = Files.list(uploadPath).collect(Collectors.toList());
                System.out.println("📂 Fichiers disponibles dans uploads:");
                files.forEach(f -> System.out.println("   - " + f.getFileName()));
            } catch (IOException e) {
                System.err.println("❌ Impossible de lister les fichiers: " + e.getMessage());
            }
        } else {
            System.out.println("✅ Fichier trouvé: " + filePath.toAbsolutePath());
        }
        
        return filePath.toString();
        
    } catch (Exception e) {
        System.err.println("❌ Erreur construction chemin: " + e.getMessage());
        // Fallback: essayer avec le chemin relatif
        return uploadDir + "/" + cleanFilename;
    }
}

    /**
     * Récupère tous les besoins du service du chef
     */
    public List<Besoin> getBesoinsParService(String chefServiceId) {
        try {
            Long chefIdLong = parseId(chefServiceId);

            ChefService chefService = (ChefService) utilisateurRepository.findById(chefIdLong)
                    .orElseThrow(() -> new RuntimeException("Chef de service non trouvé avec id: " + chefServiceId));

            if (chefService.getService() == null || chefService.getService().isEmpty()) {
                throw new RuntimeException("Le chef de service n'a pas de service défini");
            }

            List<Besoin> besoins = besoinRepository.findByService(chefService.getService());
            System.out.println("📋 " + besoins.size() + " besoins trouvés pour le service: " + chefService.getService());

            // ⚠️ CORRECTION: Charger les tâches explicitement pour éviter LazyLoadingException
            for (Besoin besoin : besoins) {
                // Initialiser la collection si nécessaire
                if (besoin.getTaches() != null) {
                    besoin.getTaches().size(); // Force le chargement
                }
            }

            return besoins;
        } catch (Exception e) {
            System.err.println("❌ Erreur récupération besoins: " + e.getMessage());
            throw new RuntimeException("Erreur lors de la récupération des besoins: " + e.getMessage(), e);
        }
    }

    public Tache creerNouvelleTache(Long besoinId, Tache nouvelleTache) {
        try {
            System.out.println("➕ Création nouvelle tâche pour besoin: " + besoinId);

            // Vérifier que le besoin existe et est accepté
            Besoin besoin = besoinRepository.findById(besoinId)
                    .orElseThrow(() -> new RuntimeException("Besoin non trouvé avec id: " + besoinId));

            if (!"ACCEPTE".equals(besoin.getStatut())) {
                throw new RuntimeException("Le besoin doit être accepté pour ajouter des tâches manuellement");
            }

            // Créer et sauvegarder la nouvelle tâche
            Tache tache = new Tache();
            tache.setTitre(nouvelleTache.getTitre());
            tache.setDescription(nouvelleTache.getDescription());
            tache.setStatut("EN_ATTENTE"); // Par défaut en attente
            tache.setDateFinale(nouvelleTache.getDateFinale());
            tache.setDureeEstimee(nouvelleTache.getDureeEstimee());
            tache.setDateLimite(nouvelleTache.getDateLimite());
            tache.setBesoin(besoin);

            Tache tacheSauvegardee = tacheRepository.save(tache);
            System.out.println("✅ Nouvelle tâche créée avec succès: " + tache.getTitre());

            return tacheSauvegardee;

        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la création de la tâche: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de la création de la tâche: " + e.getMessage(), e);
        }
    }

    /**
     * Parse un ID String en Long avec gestion d'erreur
     */
    private Long parseId(String id) {
        try {
            return Long.parseLong(id);
        } catch (NumberFormatException e) {
            throw new RuntimeException("ID invalide: " + id);
        }
    }
}