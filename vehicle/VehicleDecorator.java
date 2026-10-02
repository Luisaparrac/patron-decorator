package vehicle;

import java.util.ArrayList;
import java.util.List;

/**
 * DECORADOR BASE del patron Decorator.
 * Guarda una referencia al vehiculo que envuelve y, por defecto, le delega todo.
 * Cada decorador concreto solo sobrescribe lo que su transformacion modifica,
 * asi el codigo de cada capa queda corto y enfocado.
 */
public abstract class VehicleDecorator implements Vehicle {
    protected final Vehicle vehicle;

    protected VehicleDecorator(Vehicle vehicle) {
        this.vehicle = vehicle;
    }

    public String getBrand() { return vehicle.getBrand(); }
    public double getWeightKg() { return vehicle.getWeightKg(); }
    public double getPowerHp() { return vehicle.getPowerHp(); }
    public double getFuelConsumption() { return vehicle.getFuelConsumption(); }
    public double getCostPerKm() { return vehicle.getCostPerKm(); }
    public double getMaxSpeedKmh() { return vehicle.getMaxSpeedKmh(); }
    public double getAccelerationSeconds() { return vehicle.getAccelerationSeconds(); }
    public double getPrice() { return vehicle.getPrice(); }
    public boolean hasArmor() { return vehicle.hasArmor(); }
    public int getArmorLevel() { return vehicle.getArmorLevel(); }
    public boolean isTaxi() { return vehicle.isTaxi(); }

    public List<String> getRequiredProcedures() {
        List<String> procedures = new ArrayList<>(vehicle.getRequiredProcedures());
        procedures.addAll(addedProcedures());
        return procedures;
    }

    // Cada capa declara solo los tramites nuevos que genera; la acumulacion es automatica
    protected abstract List<String> addedProcedures();
}
