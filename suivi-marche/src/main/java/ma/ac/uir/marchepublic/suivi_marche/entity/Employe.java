package ma.ac.uir.marchepublic.suivi_marche.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;

@Entity
public class Employe extends Utilisateur {

    private String service;
    private String poste;
    @OneToMany(mappedBy = "employe", cascade = CascadeType.ALL)
    private List<Besoin> besoins = new ArrayList<>();

    public Employe() {
        setRole("EMPLOYE");
    }

    public Employe(String username, String password, String service, String poste) {
        super(username, password, "EMPLOYE");
        this.service = service;
        this.poste = poste;
    }

    // Getters and Setters
    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }

    public String getPoste() {
        return poste;
    }

    public void setPoste(String poste) {
        this.poste = poste;
    }
}