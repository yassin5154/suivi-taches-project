package ma.ac.uir.marchepublic.suivi_marche.repository;

import ma.ac.uir.marchepublic.suivi_marche.entity.Besoin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BesoinRepository extends JpaRepository<Besoin, Long> {

    List<Besoin> findByEmployeId(Long employeId);
}
