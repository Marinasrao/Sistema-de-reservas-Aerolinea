package com.aerolinea.service;

import com.aerolinea.entity.Policy;
import com.aerolinea.repository.PolicyRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PolicyService {

    private final PolicyRepository policyRepository;

    public PolicyService(PolicyRepository policyRepository) {
        this.policyRepository = policyRepository;
    }

    public List<Policy> getActivePolicies() {
        return policyRepository.findByActiveTrueOrderByDisplayOrderAsc();
    }

    public List<Policy> getAllPolicies() {
        return policyRepository.findAllByOrderByDisplayOrderAsc();
    }

    public Policy createPolicy(Policy policy) {
        if (policy.getActive() == null) {
            policy.setActive(true);
        }

        if (policy.getDisplayOrder() == null) {
            policy.setDisplayOrder(0);
        }

        return policyRepository.save(policy);
    }

    public Policy updatePolicy(Long id, Policy policy) {
        Policy existing = policyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Política no encontrada con ID: " + id));

        existing.setTitle(policy.getTitle());
        existing.setDescription(policy.getDescription());

        if (policy.getActive() != null) {
            existing.setActive(policy.getActive());
        }

        if (policy.getDisplayOrder() != null) {
            existing.setDisplayOrder(policy.getDisplayOrder());
        }

        return policyRepository.save(existing);
    }

    public void deletePolicy(Long id) {
        if (!policyRepository.existsById(id)) {
            throw new IllegalArgumentException("Política no encontrada con ID: " + id);
        }

        policyRepository.deleteById(id);
    }
}
