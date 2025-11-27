// Signalement.java
package ma.ac.uir.marchepublic.suivi_marche.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Signalement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numeroTache;
    private String message;
    private LocalDateTime dateSignalement;

    @ManyToOne
    @JoinColumn(name = "employe_id")
    private Employe employe;

    @ManyToOne
    @JoinColumn(name = "besoin_id")
    private Besoin besoin;

    // Getters/Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNumeroTache() { return numeroTache; }
    public void setNumeroTache(String numeroTache) { this.numeroTache = numeroTache; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getDateSignalement() { return dateSignalement; }
    public void setDateSignalement(LocalDateTime dateSignalement) { this.dateSignalement = dateSignalement; }

    public Employe getEmploye() { return employe; }
    public void setEmploye(Employe employe) { this.employe = employe; }

    public Besoin getBesoin() { return besoin; }
    public void setBesoin(Besoin besoin) { this.besoin = besoin; }
}