// SignalementService.java
package ma.ac.uir.marchepublic.suivi_marche.service;

import ma.ac.uir.marchepublic.suivi_marche.entity.Signalement;
import ma.ac.uir.marchepublic.suivi_marche.entity.Besoin;
import ma.ac.uir.marchepublic.suivi_marche.entity.Employe;
import ma.ac.uir.marchepublic.suivi_marche.repository.SignalementRepository;
import ma.ac.uir.marchepublic.suivi_marche.repository.BesoinRepository;
import ma.ac.uir.marchepublic.suivi_marche.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SignalementService {

    @Autowired
    private SignalementRepository signalementRepository;

    @Autowired
    private BesoinRepository besoinRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    public Signalement creerSignalement(Long employeId, Long besoinId, String numeroTache, String message) {
        Employe employe = (Employe) utilisateurRepository.findById(employeId)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

        Besoin besoin = besoinRepository.findById(besoinId)
                .orElseThrow(() -> new RuntimeException("Besoin non trouvé"));

        // Vérifier que l'employé n'est pas le propriétaire du besoin
        if (besoin.getEmploye().getId().equals(employeId)) {
            throw new RuntimeException("Vous ne pouvez pas signaler votre propre besoin");
        }

        Signalement signalement = new Signalement();
        signalement.setNumeroTache(numeroTache);
        signalement.setMessage(message);
        signalement.setDateSignalement(LocalDateTime.now());
        signalement.setEmploye(employe);
        signalement.setBesoin(besoin);

        return signalementRepository.save(signalement);
    }

    public List<Signalement> getSignalementsParBesoin(Long besoinId) {
        return signalementRepository.findByBesoinIdOrderByDateSignalementDesc(besoinId);
    }
}