package ma.ac.uir.marchepublic.suivi_marche.service;

import ma.ac.uir.marchepublic.suivi_marche.dto.BesoinRequest;
import ma.ac.uir.marchepublic.suivi_marche.entity.Besoin;
import ma.ac.uir.marchepublic.suivi_marche.entity.Employe;
import ma.ac.uir.marchepublic.suivi_marche.repository.BesoinRepository;
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
}