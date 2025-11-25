package ma.ac.uir.marchepublic.suivi_marche.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ma.ac.uir.marchepublic.suivi_marche.entity.Besoin;
import ma.ac.uir.marchepublic.suivi_marche.repository.BesoinRepository;
import ma.ac.uir.marchepublic.suivi_marche.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api/files")
@CrossOrigin
public class FileController {

    @Autowired
    private BesoinRepository besoinRepository;

    @Autowired
    private FileService fileService;

    @GetMapping("/besoin/{besoinId}/cps")
    public ResponseEntity<String> getCpsFileContent(@PathVariable Long besoinId) {
        try {
            Besoin besoin = besoinRepository.findById(besoinId)
                    .orElseThrow(() -> new RuntimeException("Besoin non trouvé"));

            if (besoin.getFichierCPS() == null || besoin.getFichierCPS().isEmpty()) {
                return ResponseEntity.badRequest().body("Aucun fichier CPS associé à ce besoin");
            }

            String content = fileService.lireContenuFichierCPS(besoin.getFichierCPS());
            return ResponseEntity.ok(content);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Erreur lors de la lecture du fichier: " + e.getMessage());
        }
    }
}