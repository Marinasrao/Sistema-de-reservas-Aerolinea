package com.aerolinea.service;

import com.aerolinea.entity.Characteristic;
import com.aerolinea.entity.Category;
import com.aerolinea.repository.CharacteristicRepository;
import com.aerolinea.repository.CategoryRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class CharacteristicService {

    private final CharacteristicRepository characteristicRepository;

    @PersistenceContext
    private EntityManager em;

    public CharacteristicService(CharacteristicRepository characteristicRepository) {
        this.characteristicRepository = characteristicRepository;
    }

    public List<Characteristic> getAll() {
        return characteristicRepository.findAll();
    }

    public Characteristic create(Characteristic characteristic) {
        return characteristicRepository.save(characteristic);
    }

    public Characteristic update(Long id, Characteristic characteristic) {
        characteristic.setId(id);
        return characteristicRepository.save(characteristic);
    }

    @Transactional
    public void delete(Long id) {
        em.createNativeQuery(
                "DELETE FROM category_characteristics WHERE characteristic_id = ?"
        ).setParameter(1, id).executeUpdate();

        em.createNativeQuery(
                "DELETE FROM characteristics WHERE id = ?"
        ).setParameter(1, id).executeUpdate();
    }
}
