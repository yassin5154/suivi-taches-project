package ma.ac.uir.marchepublic.suivi_marche.dto;

public class BesoinRequest {

    private String titre;
    private String description;
    private String fichierCPS; // path of uploaded file

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
}
