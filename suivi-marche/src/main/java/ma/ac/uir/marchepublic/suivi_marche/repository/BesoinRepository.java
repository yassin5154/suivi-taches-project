package ma.ac.uir.marchepublic.suivi_marche.repository;

import ma.ac.uir.marchepublic.suivi_marche.entity.Besoin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BesoinRepository extends JpaRepository<Besoin, Long> {

    List<Besoin> findByEmployeId(Long employeId);

    // Correction: Utiliser JOIN avec l'entité Employe
    @Query("SELECT b FROM Besoin b JOIN b.employe e WHERE e.service = :service")
    List<Besoin> findByService(@Param("service") String service);

}