package ma.ac.uir.marchepublic.suivi_marche.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "besoins")
public class Besoin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String fichierCPS; // path of .txt file uploaded

    private LocalDate dateCreation = LocalDate.now();

    @ManyToOne
    @JoinColumn(name = "employe_id")
    private Employe employe;

    private String statut = "EN_ATTENTE"; // EN_ATTENTE, ACCEPTE, REFUSE

    public Besoin() {
    }

    // Getters/Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFichierCPS() {
        return fichierCPS;
    }

    public void setFichierCPS(String fichierCPS) {
        this.fichierCPS = fichierCPS;
    }

    public LocalDate getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDate dateCreation) {
        this.dateCreation = dateCreation;
    }

    public Employe getEmploye() {
        return employe;
    }

    public void setEmploye(Employe employe) {
        this.employe = employe;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }
}
