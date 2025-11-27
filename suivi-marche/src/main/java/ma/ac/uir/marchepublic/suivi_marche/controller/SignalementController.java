// SignalementController.java
package ma.ac.uir.marchepublic.suivi_marche.controller;

import ma.ac.uir.marchepublic.suivi_marche.entity.Signalement;
import ma.ac.uir.marchepublic.suivi_marche.service.SignalementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/signalements")
@CrossOrigin
public class SignalementController {

    @Autowired
    private SignalementService signalementService;

    @PostMapping("/employe/{employeId}/besoin/{besoinId}")
    public ResponseEntity<Signalement> creerSignalement(
            @PathVariable Long employeId,
            @PathVariable Long besoinId,
            @RequestBody Map<String, String> request) {

        String numeroTache = request.get("numeroTache");
        String message = request.get("message");

        Signalement signalement = signalementService.creerSignalement(employeId, besoinId, numeroTache, message);
        return ResponseEntity.ok(signalement);
    }

    @GetMapping("/besoin/{besoinId}")
    public ResponseEntity<List<Signalement>> getSignalementsParBesoin(@PathVariable Long besoinId) {
        List<Signalement> signalements = signalementService.getSignalementsParBesoin(besoinId);
        return ResponseEntity.ok(signalements);
    }
}