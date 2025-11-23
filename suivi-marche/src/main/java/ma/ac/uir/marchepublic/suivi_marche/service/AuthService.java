package ma.ac.uir.marchepublic.suivi_marche.service;

import ma.ac.uir.marchepublic.suivi_marche.dto.AuthResponse;
import ma.ac.uir.marchepublic.suivi_marche.dto.LoginRequest;
import ma.ac.uir.marchepublic.suivi_marche.entity.Admin;
import ma.ac.uir.marchepublic.suivi_marche.entity.ChefService;
import ma.ac.uir.marchepublic.suivi_marche.entity.Employe;
import ma.ac.uir.marchepublic.suivi_marche.entity.Utilisateur;
import ma.ac.uir.marchepublic.suivi_marche.repository.UtilisateurRepository;
import ma.ac.uir.marchepublic.suivi_marche.util.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class AuthService implements UserDetailsService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Utilisateur utilisateur = utilisateurRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé: " + username));

        return new User(utilisateur.getUsername(), utilisateur.getPassword(), new ArrayList<>());
    }

    public AuthResponse authenticate(LoginRequest loginRequest) {
        Utilisateur utilisateur = utilisateurRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        System.out.println("Input password: " + loginRequest.getPassword());
        System.out.println("Stored password: " + utilisateur.getPassword());

        // Direct string comparison
        if (!loginRequest.getPassword().equals(utilisateur.getPassword())) {
            throw new RuntimeException("Mot de passe incorrect");
        }

        String jwt = jwtUtils.generateJwtToken(utilisateur.getUsername());

        return new AuthResponse(jwt, utilisateur.getUsername(), utilisateur.getRole(), utilisateur.getId());
    }

    public AuthResponse register(LoginRequest registerRequest) {
        if (utilisateurRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("Nom d'utilisateur déjà utilisé");
        }

        Utilisateur utilisateur;
        // Remove password encoding - store plain text
        String password = registerRequest.getPassword();

        switch (registerRequest.getRole().toUpperCase()) {
            case "ADMIN":
                utilisateur = new Admin(registerRequest.getUsername(), password);
                break;
            case "CHEF":
                utilisateur = new ChefService(registerRequest.getUsername(), password, "Service par défaut");
                break;
            case "EMPLOYE":
                utilisateur = new Employe(registerRequest.getUsername(), password, "Service par défaut",
                        "Poste par défaut");
                break;
            default:
                throw new RuntimeException("Rôle non valide");
        }

        utilisateurRepository.save(utilisateur);

        String jwt = jwtUtils.generateJwtToken(utilisateur.getUsername());
        return new AuthResponse(jwt, utilisateur.getUsername(), utilisateur.getRole(), utilisateur.getId());
    }
}