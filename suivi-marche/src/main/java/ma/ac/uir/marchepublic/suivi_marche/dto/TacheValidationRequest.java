package ma.ac.uir.marchepublic.suivi_marche.dto;

import java.time.LocalDate;

public class TacheValidationRequest {
    private boolean valide;
    private String motifRefus;
    private String titre;
    private LocalDate dateFinale;
    private String dureeEstimee;
    private LocalDate dateLimite;

    // Constructeur par défaut
    public TacheValidationRequest() {
    }

    // Getters et Setters
    public boolean isValide() { return valide; }
    public void setValide(boolean valide) { this.valide = valide; }

    public String getMotifRefus() { return motifRefus; }
    public void setMotifRefus(String motifRefus) { this.motifRefus = motifRefus; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public LocalDate getDateFinale() { return dateFinale; }
    public void setDateFinale(LocalDate dateFinale) { this.dateFinale = dateFinale; }

    public String getDureeEstimee() { return dureeEstimee; }
    public void setDureeEstimee(String dureeEstimee) { this.dureeEstimee = dureeEstimee; }

    public LocalDate getDateLimite() { return dateLimite; }
    public void setDateLimite(LocalDate dateLimite) { this.dateLimite = dateLimite; }
}