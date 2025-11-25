package ma.ac.uir.marchepublic.suivi_marche.dto;

public class BesoinValidationRequest {
    private boolean valide;
    private String motifRefus;

    // Constructeur par défaut IMPORTANT
    public BesoinValidationRequest() {
    }

    // Constructeur avec paramètres
    public BesoinValidationRequest(boolean valide, String motifRefus) {
        this.valide = valide;
        this.motifRefus = motifRefus;
    }

    // Getters et Setters
    public boolean isValide() {
        return valide;
    }

    public void setValide(boolean valide) {
        this.valide = valide;
    }

    public String getMotifRefus() {
        return motifRefus;
    }

    public void setMotifRefus(String motifRefus) {
        this.motifRefus = motifRefus;
    }
}