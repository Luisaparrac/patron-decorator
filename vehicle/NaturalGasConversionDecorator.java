package vehicle;

import java.util.List;

/**
 * DECORADOR CONCRETO: conversion a gas natural vehicular (GNV).
 * El gas es mas barato que la gasolina, asi que el costo por kilometro baja casi a la mitad,
 * pero el cilindro suma peso y el motor pierde algo de potencia.
 */
public class NaturalGasConversionDecorator extends VehicleDecorator {

    public NaturalGasConversionDecorator(Vehicle vehicle) {
        super(vehicle);
    }

    public double getWeightKg() { return vehicle.getWeightKg() + 70; }
    public double getPowerHp() { return vehicle.getPowerHp() * 0.9; }
    public double getCostPerKm() { return vehicle.getCostPerKm() * 0.55; }
    public double getPrice() { return vehicle.getPrice() + 4_500_000; }

    protected List<String> addedProcedures() {
        return List.of("Certificado de conversion a GNV - taller autorizado",
                "Actualizacion del tipo de combustible en el RUNT");
    }
}
