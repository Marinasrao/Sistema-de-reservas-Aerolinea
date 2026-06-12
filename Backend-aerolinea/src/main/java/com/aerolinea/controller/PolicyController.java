package com.aerolinea.controller;

import com.aerolinea.entity.Policy;
import com.aerolinea.service.PolicyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/policies")
public class PolicyController {

    private final PolicyService policyService;

    public PolicyController(PolicyService policyService) {
        this.policyService = policyService;
    }

    @GetMapping
    public ResponseEntity<List<Policy>> getActivePolicies() {
        return ResponseEntity.ok(policyService.getActivePolicies());
    }
}
