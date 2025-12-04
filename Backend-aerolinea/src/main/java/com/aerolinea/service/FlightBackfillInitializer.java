package com.aerolinea.service;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

@Component
public class FlightBackfillInitializer {

    @Autowired
    private FlightService flightService;

    @PostConstruct
    public void init() {
        int deleted = flightService.deletePastFlights();
        int created = flightService.backfillFlightsForAllRecommendations();
        System.out.println(" Vuelos pasados eliminados: " + deleted);
        System.out.println(" Vuelos generados automáticamente: " + created);
    }
}

