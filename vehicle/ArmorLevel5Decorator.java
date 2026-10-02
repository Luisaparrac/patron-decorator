package vehicle;

import java.util.List;

/**
 * DECORADOR CONCRETO: blindaje nivel V (resiste fusiles).
 * Mucho mas pesado que el nivel III. Se agrega para demostrar la regla de negocio
 * que prohibe blindar un taxi a este nivel.
 */
public class ArmorLevel5Decorator extends VehicleDecorator {

    public ArmorLevel5Decorator(Vehicle vehicle) {
        super(vehicle);
        if (vehicle.hasArmor()) {
            throw new IllegalStateException("El vehiculo ya tiene blindaje; no se pueden acumular dos niveles.");
        }
        if (vehicle.isTaxi()) {
            throw new IllegalStateException("Un vehiculo de servicio publico (taxi) no puede tener blindaje nivel V.");
        }
    }

    public double getWeightKg() { return vehicle.getWeightKg() + 600; }
    public double getMaxSpeedKmh() { return vehicle.getMaxSpeedKmh() - 30; }
    public double getAccelerationSeconds() { return vehicle.getAccelerationSeconds() + 3.5; }
    public double getFuelConsumption() { return vehicle.getFuelConsumption() + 2.8; }
    public double getCostPerKm() { return vehicle.getCostPerKm() + 110; }
    public double getPrice() { return vehicle.getPrice() + 320_000_000; }
    public boolean hasArmor() { return true; }
    public int getArmorLevel() { return 5; }

    protected List<String> addedProcedures() {
        return List.of("Permiso de blindaje nivel V - Superintendencia de Vigilancia y Seguridad Privada",
                "Estudio de nivel de riesgo del propietario");
    }
}
