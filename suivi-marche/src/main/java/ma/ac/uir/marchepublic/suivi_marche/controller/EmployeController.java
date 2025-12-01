package ma.ac.uir.marchepublic.suivi_marche.controller;

import ma.ac.uir.marchepublic.suivi_marche.dto.BesoinRequest;
import ma.ac.uir.marchepublic.suivi_marche.entity.Besoin;
import ma.ac.uir.marchepublic.suivi_marche.entity.Tache;
import ma.ac.uir.marchepublic.suivi_marche.repository.TacheRepository;
import ma.ac.uir.marchepublic.suivi_marche.service.BesoinService;
import ma.ac.uir.marchepublic.suivi_marche.repository.UtilisateurRepository;
import ma.ac.uir.marchepublic.suivi_marche.service.TacheService;
import ma.ac.uir.marchepublic.suivi_marche.dto.SignalementRequest;
import ma.ac.uir.marchepublic.suivi_marche.dto.ValidationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employe")
@CrossOrigin
public class EmployeController {

    @Autowired
    private BesoinService besoinService;

    @Autowired
    private TacheService tacheService;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private TacheRepository tacheRepository;

    // CREATE BESOIN
    @PostMapping("/{employeId}/besoin")
    public Besoin createBesoin(@PathVariable("employeId") String employeId, @RequestBody BesoinRequest request) {
        return besoinService.creerBesoin(employeId, request);
    }

    // LIST BESOIN
    @GetMapping("/{employeId}/besoins")
    public List<Besoin> getBesoins(@PathVariable("employeId") String employeId) {
        return besoinService.getBesoinsEmploye(employeId);
    }

    // NOUVEAU: Obtenir tous les besoins du service de l'employé
    @GetMapping("/{employeId}/besoins-service")
    public List<Besoin> getBesoinsService(@PathVariable("employeId") String employeId) {
        return besoinService.getBesoinsDuService(employeId);
    }

    // NOUVEAU: Modifier un besoin (seulement si statut EN_ATTENTE)
    @PutMapping("/{employeId}/besoin/{besoinId}")
    public Besoin modifierBesoin(@PathVariable("employeId") String employeId,
                                 @PathVariable("besoinId") Long besoinId,
                                 @RequestBody BesoinRequest request) {
        return besoinService.modifierBesoin(employeId, besoinId, request);
    }

    // NOUVEAU: Signaler une tâche non pertinente
    @PostMapping("/{employeId}/besoin/{besoinId}/signaler-tache")
    public ResponseEntity<?> signalerTache(@PathVariable("employeId") String employeId,
                                           @PathVariable("besoinId") Long besoinId,
                                           @RequestBody SignalementRequest signalement) {
        try {
            tacheService.signalerTacheNonPertinente(employeId, besoinId, signalement);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // NOUVEAU: Obtenir les tâches d'un besoin spécifique
    @GetMapping("/besoin/{besoinId}/taches")
    public List<Tache> getTachesByBesoinId(@PathVariable Long besoinId) {
        return tacheRepository.findByBesoinId(besoinId);
    }

    // NOUVEAU: Obtenir les besoins acceptés du service avec leurs tâches
    @GetMapping("/{employeId}/besoins-acceptes")
    public List<Besoin> getBesoinsAcceptesDuService(@PathVariable("employeId") String employeId) {
        return besoinService.getBesoinsAcceptesDuService(employeId);
    }

    // NOUVEAU: Marquer une tâche comme terminée
    @PostMapping("/tache/{tacheId}/terminer")
    public ResponseEntity<?> terminerTache(@PathVariable("tacheId") Long tacheId) {
        try {
            tacheService.terminerTache(tacheId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}