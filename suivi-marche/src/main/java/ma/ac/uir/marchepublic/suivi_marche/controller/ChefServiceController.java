package ma.ac.uir.marchepublic.suivi_marche.controller;

import ma.ac.uir.marchepublic.suivi_marche.dto.BesoinValidationRequest;
import ma.ac.uir.marchepublic.suivi_marche.dto.TacheValidationRequest;
import ma.ac.uir.marchepublic.suivi_marche.entity.Besoin;
import ma.ac.uir.marchepublic.suivi_marche.entity.Tache;
import ma.ac.uir.marchepublic.suivi_marche.service.ChefServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chef-service")
@CrossOrigin
public class ChefServiceController {

    @Autowired
    private ChefServiceService chefServiceService;

    // GET tous les besoins du service du chef
    @GetMapping("/{chefServiceId}/besoins")
    public ResponseEntity<List<Besoin>> getBesoinsDuService(@PathVariable("chefServiceId") String chefServiceId) {
        try {
            System.out.println("📋 GET Besoins pour chef: " + chefServiceId);
            List<Besoin> besoins = chefServiceService.getBesoinsParService(chefServiceId);
            return ResponseEntity.ok(besoins);
        } catch (Exception e) {
            System.err.println("❌ Erreur GET besoins: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // VALIDER ou REFUSER un besoin - POST method
    @PostMapping("/besoins/{besoinId}/validation")
    public ResponseEntity<Besoin> validerBesoin(@PathVariable("besoinId") Long besoinId,
            @RequestBody BesoinValidationRequest validationRequest) {
        try {
            System.out.println("✅ POST Validation besoin: " + besoinId + ", valide: " + validationRequest.isValide());
            Besoin besoin = chefServiceService.validerBesoin(besoinId, validationRequest);
            return ResponseEntity.ok(besoin);
        } catch (Exception e) {
            System.err.println("❌ Erreur POST validation besoin: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // VALIDER ou REFUSER une tâche spécifique - POST method
    @PostMapping("/taches/{tacheId}/validation")
    public ResponseEntity<Tache> validerTache(@PathVariable("tacheId") Long tacheId,
            @RequestBody TacheValidationRequest validationRequest) {
        try {
            System.out.println("✅ POST Validation tâche: " + tacheId + ", valide: " + validationRequest.isValide());
            Tache tache = chefServiceService.validerTache(tacheId, validationRequest);
            return ResponseEntity.ok(tache);
        } catch (Exception e) {
            System.err.println("❌ Erreur POST validation tâche: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET les tâches d'un besoin (pour affichage après validation du besoin)
    @GetMapping("/besoins/{besoinId}/taches")
    public ResponseEntity<List<Tache>> getTachesDuBesoin(@PathVariable("besoinId") Long besoinId) {
        try {
            System.out.println("📝 GET Tâches pour besoin: " + besoinId);
            List<Tache> taches = chefServiceService.getTachesDuBesoin(besoinId);
            return ResponseEntity.ok(taches);
        } catch (Exception e) {
            System.err.println("❌ Erreur GET tâches: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Endpoint pour lire le contenu du fichier CPS
    @GetMapping("/besoins/{besoinId}/cps-content")
    public ResponseEntity<String> getCpsContent(@PathVariable("besoinId") Long besoinId) {
        try {
            System.out.println("📄 GET Contenu CPS pour besoin: " + besoinId);
            String content = chefServiceService.getCpsContent(besoinId);
            return ResponseEntity.ok(content);
        } catch (Exception e) {
            System.err.println("❌ Erreur GET CPS content: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body("Erreur lors de la lecture du fichier: " + e.getMessage());
        }
    }

    // Endpoint de test pour l'extraction des tâches
    @GetMapping("/besoins/{besoinId}/test-extraction")
    public ResponseEntity<Map<String, Object>> testExtractionTaches(@PathVariable("besoinId") Long besoinId) {
        try {
            System.out.println("🧪 Test extraction tâches pour besoin: " + besoinId);
            
            // Implémentation temporaire pour test
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("besoinId", besoinId);
            response.put("test", "Endpoint de test fonctionnel");
            response.put("tachesExtractes", List.of("Tâche test 1", "Tâche test 2"));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Erreur test extraction: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Erreur test: " + e.getMessage()));
        }
    }

    // Dans ChefServiceController.java - Ajouter cette méthode
    @PostMapping("/besoins/{besoinId}/taches/nouvelle")
    public ResponseEntity<Tache> creerNouvelleTache(@PathVariable("besoinId") Long besoinId,
                                                    @RequestBody Tache nouvelleTache) {
        try {
            System.out.println("➕ POST Création nouvelle tâche pour besoin: " + besoinId);
            Tache tache = chefServiceService.creerNouvelleTache(besoinId, nouvelleTache);
            return ResponseEntity.ok(tache);
        } catch (Exception e) {
            System.err.println("❌ Erreur POST création tâche: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}