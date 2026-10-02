package vehicle;

import java.util.List;

/**
 * DECORADOR CONCRETO: suspension reforzada.
 * Solo tiene sentido sobre un vehiculo ya blindado: compensa parte de la perdida
 * de velocidad y aceleracion que causa el peso extra del blindaje.
 */
public class ReinforcedSuspensionDecorator extends VehicleDecorator {

    public ReinforcedSuspensionDecorator(Vehicle vehicle) {
        super(vehicle);
        if (!vehicle.hasArmor()) {
            throw new IllegalStateException("La suspension reforzada solo se puede instalar en un vehiculo blindado.");
        }
    }

    public double getWeightKg() { return vehicle.getWeightKg() + 40; }
    public double getMaxSpeedKmh() { return vehicle.getMaxSpeedKmh() + 8; }
    public double getAccelerationSeconds() { return vehicle.getAccelerationSeconds() - 0.8; }
    public double getPrice() { return vehicle.getPrice() + 12_000_000; }

    protected List<String> addedProcedures() {
        return List.of("Certificado de modificacion de suspension - Centro de Diagnostico Automotor");
    }
}
