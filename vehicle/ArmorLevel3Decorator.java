package vehicle;

import java.util.List;

/**
 * DECORADOR CONCRETO: blindaje nivel III (resiste armas cortas).
 * Las laminas y vidrios blindados suben el peso, lo que reduce velocidad y aceleracion
 * y aumenta el consumo. Exige permiso de la Superintendencia de Vigilancia.
 */
public class ArmorLevel3Decorator extends VehicleDecorator {

    public ArmorLevel3Decorator(Vehicle vehicle) {
        super(vehicle);
        if (vehicle.hasArmor()) {
            throw new IllegalStateException("El vehiculo ya tiene blindaje; no se pueden acumular dos niveles.");
        }
    }

    public double getWeightKg() { return vehicle.getWeightKg() + 350; }
    public double getMaxSpeedKmh() { return vehicle.getMaxSpeedKmh() - 15; }
    public double getAccelerationSeconds() { return vehicle.getAccelerationSeconds() + 1.8; }
    public double getFuelConsumption() { return vehicle.getFuelConsumption() + 1.5; }
    public double getCostPerKm() { return vehicle.getCostPerKm() + 60; }
    public double getPrice() { return vehicle.getPrice() + 180_000_000; }
    public boolean hasArmor() { return true; }
    public int getArmorLevel() { return 3; }

    protected List<String> addedProcedures() {
        return List.of("Permiso de blindaje nivel III - Superintendencia de Vigilancia y Seguridad Privada");
    }
}
