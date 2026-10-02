package vehicle;

import java.util.List;

/**
 * DECORADOR CONCRETO: adaptacion para personas con movilidad reducida.
 * Agrega rampa de acceso y controles manuales de freno y acelerador.
 */
public class AccessibilityAdaptationDecorator extends VehicleDecorator {

    public AccessibilityAdaptationDecorator(Vehicle vehicle) {
        super(vehicle);
    }

    public double getWeightKg() { return vehicle.getWeightKg() + 90; }
    public double getPrice() { return vehicle.getPrice() + 28_000_000; }

    protected List<String> addedProcedures() {
        return List.of("Certificado de adaptacion: rampa y controles manuales",
                "Registro de vehiculo adaptado en el RUNT");
    }
}
