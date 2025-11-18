package ma.ac.uir.marchepublic.suivi_marche.entity;

import jakarta.persistence.Entity;

@Entity
public class ChefService extends Utilisateur {

    private String service;

    public ChefService() {
        setRole("CHEF");
    }

    public ChefService(String username, String password, String service) {
        super(username, password, "CHEF");
        this.service = service;
    }

    // Getters and Setters
    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }
}