package ma.ac.uir.marchepublic.suivi_marche.repository;

import ma.ac.uir.marchepublic.suivi_marche.entity.Tache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TacheRepository extends JpaRepository<Tache, Long> {

    // Correction: Utiliser @Param pour le paramètre
    @Query("SELECT t FROM Tache t WHERE t.besoin.id = :besoinId")
    List<Tache> findByBesoinId(@Param("besoinId") Long besoinId);
}