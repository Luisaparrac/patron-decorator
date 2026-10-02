package vehicle;

import java.util.List;

/**
 * DECORADOR CONCRETO: conversion a taxi.
 * Agrega taximetro y cambia el servicio de particular a publico.
 * Valida la incompatibilidad con el blindaje nivel V.
 */
public class TaxiConversionDecorator extends VehicleDecorator {

    public TaxiConversionDecorator(Vehicle vehicle) {
        super(vehicle);
        if (vehicle.getArmorLevel() >= 5) {
            throw new IllegalStateException("No se puede convertir en taxi un vehiculo con blindaje nivel V.");
        }
    }

    public double getWeightKg() { return vehicle.getWeightKg() + 5; }
    public double getPrice() { return vehicle.getPrice() + 6_000_000; }
    public boolean isTaxi() { return true; }

    protected List<String> addedProcedures() {
        return List.of("Instalacion y calibracion de taximetro",
                "Cambio de servicio particular a publico",
                "Tarjeta de operacion - Secretaria de Movilidad");
    }
}
