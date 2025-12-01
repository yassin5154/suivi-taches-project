package ma.ac.uir.marchepublic.suivi_marche.service;

import ma.ac.uir.marchepublic.suivi_marche.dto.SignalementRequest;
import ma.ac.uir.marchepublic.suivi_marche.dto.ValidationRequest;
import ma.ac.uir.marchepublic.suivi_marche.entity.Besoin;
import ma.ac.uir.marchepublic.suivi_marche.entity.Employe;
import ma.ac.uir.marchepublic.suivi_marche.entity.Tache;
import ma.ac.uir.marchepublic.suivi_marche.repository.BesoinRepository;
import ma.ac.uir.marchepublic.suivi_marche.repository.TacheRepository;
import ma.ac.uir.marchepublic.suivi_marche.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TacheService {

    @Autowired
    private TacheRepository tacheRepository;

    @Autowired
    private BesoinRepository besoinRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    public void signalerTacheNonPertinente(String employeId, Long besoinId, SignalementRequest signalement) {
        Long employeIdLong = Long.parseLong(employeId);
        Employe employe = (Employe) utilisateurRepository.findById(employeIdLong)
                .orElseThrow(() -> new RuntimeException("Employe not found"));

        Besoin besoin = besoinRepository.findById(besoinId)
                .orElseThrow(() -> new RuntimeException("Besoin non trouvé"));

        // Vérifier que l'employé n'est pas propriétaire du besoin
        if (besoin.getEmploye().getId().equals(employeIdLong)) {
            throw new RuntimeException("Vous ne pouvez pas signaler vos propres tâches");
        }

        // Vérifier que le besoin est du même service
        if (!besoin.getEmploye().getService().equals(employe.getService())) {
            throw new RuntimeException("Accès non autorisé à ce besoin");
        }

        // Vérifier que le besoin est en attente
        if (!"EN_ATTENTE".equals(besoin.getStatut())) {
            throw new RuntimeException("Impossible de signaler une tâche d'un besoin déjà traité");
        }

        // TODO: Implémenter la logique d'envoi de notification au chef
        System.out.println("Signalement envoyé au chef de service:");
        System.out.println("Employé: " + employe.getNom() + " " + employe.getPrenom());
        System.out.println("Besoin: " + besoin.getTitre());
        System.out.println("Tâche ID: " + signalement.getTacheId());
        System.out.println("Motif: " + signalement.getMotif());
    }

    // NOUVEAU: Marquer une tâche comme terminée
    public void terminerTache(Long tacheId) {
        Tache tache = tacheRepository.findById(tacheId)
                .orElseThrow(() -> new RuntimeException("Tâche non trouvée"));

        if ("TERMINEE".equals(tache.getStatut())) {
            throw new RuntimeException("Cette tâche est déjà terminée");
        }

        tache.setStatut("TERMINEE");
        tacheRepository.save(tache);
    }

}