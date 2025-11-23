package ma.ac.uir.marchepublic.suivi_marche.controller;

import ma.ac.uir.marchepublic.suivi_marche.dto.BesoinRequest;
import ma.ac.uir.marchepublic.suivi_marche.entity.Besoin;
import ma.ac.uir.marchepublic.suivi_marche.service.BesoinService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employe")
@CrossOrigin
public class EmployeController {

    @Autowired
    private BesoinService besoinService;

    // CREATE BESOIN - Change path variable name to be more specific
    @PostMapping("/{employeId}/besoin")
    public Besoin createBesoin(@PathVariable("employeId") String employeId, @RequestBody BesoinRequest request) {
        return besoinService.creerBesoin(employeId, request);
    }

    // LIST BESOIN - Change path variable name to be more specific
    @GetMapping("/{employeId}/besoins")
    public List<Besoin> getBesoins(@PathVariable("employeId") String employeId) {
        return besoinService.getBesoinsEmploye(employeId);
    }
}