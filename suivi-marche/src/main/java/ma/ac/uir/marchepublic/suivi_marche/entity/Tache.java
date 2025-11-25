package ma.ac.uir.marchepublic.suivi_marche.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "taches")
public class Tache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Nouveau champ: titre modifiable par le chef
    private String titre;

    private String statut = "EN_ATTENTE"; // EN_ATTENTE, ACCEPTEE, REFUSEE

    private String motifRefus;

    // Nouveaux champs pour la planification
    private LocalDate dateFinale; // Date finale de réalisation
    private String dureeEstimee; // Durée estimée (ex: "2 semaines", "30 jours")
    private LocalDate dateLimite; // Date limite

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "besoin_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @JsonIgnore
    private Besoin besoin;

    public Tache() {
    }

    // Getters/Setters existants...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    // Nouveaux getters/setters
    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public String getMotifRefus() { return motifRefus; }
    public void setMotifRefus(String motifRefus) { this.motifRefus = motifRefus; }

    public LocalDate getDateFinale() { return dateFinale; }
    public void setDateFinale(LocalDate dateFinale) { this.dateFinale = dateFinale; }

    public String getDureeEstimee() { return dureeEstimee; }
    public void setDureeEstimee(String dureeEstimee) { this.dureeEstimee = dureeEstimee; }

    public LocalDate getDateLimite() { return dateLimite; }
    public void setDateLimite(LocalDate dateLimite) { this.dateLimite = dateLimite; }

    public Besoin getBesoin() { return besoin; }
    public void setBesoin(Besoin besoin) { this.besoin = besoin; }
}