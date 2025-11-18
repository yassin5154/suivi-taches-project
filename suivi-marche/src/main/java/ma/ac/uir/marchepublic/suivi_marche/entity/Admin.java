package ma.ac.uir.marchepublic.suivi_marche.entity;

import jakarta.persistence.Entity;

@Entity
public class Admin extends Utilisateur {

    public Admin() {
        setRole("ADMIN");
    }

    public Admin(String username, String password) {
        super(username, password, "ADMIN");
    }
}