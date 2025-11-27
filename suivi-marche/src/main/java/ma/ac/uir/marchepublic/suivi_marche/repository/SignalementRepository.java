// SignalementRepository.java
package ma.ac.uir.marchepublic.suivi_marche.repository;

import ma.ac.uir.marchepublic.suivi_marche.entity.Signalement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SignalementRepository extends JpaRepository<Signalement, Long> {
    List<Signalement> findByBesoinId(Long besoinId);
    List<Signalement> findByBesoinIdOrderByDateSignalementDesc(Long besoinId);
}