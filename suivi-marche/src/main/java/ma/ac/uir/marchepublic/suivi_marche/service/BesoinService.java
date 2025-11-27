package ma.ac.uir.marchepublic.suivi_marche.service;

import ma.ac.uir.marchepublic.suivi_marche.dto.BesoinRequest;
import ma.ac.uir.marchepublic.suivi_marche.entity.Besoin;
import ma.ac.uir.marchepublic.suivi_marche.entity.Employe;
import ma.ac.uir.marchepublic.suivi_marche.entity.Tache;
import ma.ac.uir.marchepublic.suivi_marche.repository.BesoinRepository;
import ma.ac.uir.marchepublic.suivi_marche.repository.TacheRepository;
import ma.ac.uir.marchepublic.suivi_marche.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BesoinService {

    @Autowired
    private BesoinRepository besoinRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private TacheRepository tacheRepository;

    public Besoin creerBesoin(String employeId, BesoinRequest request) {
        // Convertir String en Long
        Long employeIdLong;
        try {
            employeIdLong = Long.parseLong(employeId);
        } catch (NumberFormatException e) {
            throw new RuntimeException("ID employé invalide: " + employeId);
        }

        Employe employe = (Employe) utilisateurRepository.findById(employeIdLong)
                .orElseThrow(() -> new RuntimeException("Employe not found with id: " + employeId));

        Besoin besoin = new Besoin();
        besoin.setTitre(request.getTitre());
        besoin.setDescription(request.getDescription());
        besoin.setFichierCPS(request.getFichierCPS());
        besoin.setEmploye(employe);

        return besoinRepository.save(besoin);
    }

    public List<Besoin> getBesoinsEmploye(String employeId) {
        // Convertir String en Long
        Long employeIdLong;
        try {
            employeIdLong = Long.parseLong(employeId);
        } catch (NumberFormatException e) {
            throw new RuntimeException("ID employé invalide: " + employeId);
        }

        return besoinRepository.findByEmployeId(employeIdLong);
    }

    // NOUVEAU: Obtenir tous les besoins du service de l'employé
    public List<Besoin> getBesoinsDuService(String employeId) {
        Long employeIdLong = Long.parseLong(employeId);
        Employe employe = (Employe) utilisateurRepository.findById(employeIdLong)
                .orElseThrow(() -> new RuntimeException("Employe not found with id: " + employeId));

        // Charger les besoins avec leurs tâches
        List<Besoin> besoins = besoinRepository.findByService(employe.getService());

        // Si la méthode avec fetch ne fonctionne pas, charger les tâches manuellement
        if (besoins != null && !besoins.isEmpty()) {
            for (Besoin besoin : besoins) {
                if (besoin.getTaches() == null || besoin.getTaches().isEmpty()) {
                    // Charger les tâches manuellement
                    List<Tache> taches = tacheRepository.findByBesoinId(besoin.getId());
                    besoin.setTaches(taches);
                }
            }
        }

        return besoins;
    }

    // NOUVEAU: Modifier un besoin
    public Besoin modifierBesoin(String employeId, Long besoinId, BesoinRequest request) {
        Long employeIdLong = Long.parseLong(employeId);
        Besoin besoin = besoinRepository.findById(besoinId)
                .orElseThrow(() -> new RuntimeException("Besoin non trouvé"));

        // Vérifier que l'employé est propriétaire du besoin
        if (!besoin.getEmploye().getId().equals(employeIdLong)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à modifier ce besoin");
        }

        // Vérifier que le besoin est encore en attente
        if (!"EN_ATTENTE".equals(besoin.getStatut())) {
            throw new RuntimeException("Impossible de modifier un besoin déjà traité");
        }

        // Mettre à jour les champs
        besoin.setTitre(request.getTitre());
        besoin.setDescription(request.getDescription());
        if (request.getFichierCPS() != null) {
            besoin.setFichierCPS(request.getFichierCPS());
        }

        return besoinRepository.save(besoin);
    }
}