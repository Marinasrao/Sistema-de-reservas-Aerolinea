package com.aerolinea.service;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

@Component
public class FlightBackfillInitializer {

    private final FlightService flightService;

    public FlightBackfillInitializer(FlightService flightService) {
        this.flightService = flightService;
    }

    @PostConstruct
    public void cleanPastFlightsWhenApplicationStarts() {
        flightService.deletePastFlights();
    }
}