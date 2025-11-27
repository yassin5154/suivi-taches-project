package ma.ac.uir.marchepublic.suivi_marche.dto;

public class SignalementRequest {
    private Long tacheId;
    private String motif;

    // Getters/Setters
    public Long getTacheId() { return tacheId; }
    public void setTacheId(Long tacheId) { this.tacheId = tacheId; }
    public String getMotif() { return motif; }
    public void setMotif(String motif) { this.motif = motif; }
}