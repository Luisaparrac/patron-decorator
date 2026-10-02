package vehicle;

import java.util.ArrayList;
import java.util.List;

/**
 * COMPONENTE CONCRETO del patron Decorator.
 * Es el vehiculo tal como sale del concesionario, sin ninguna transformacion.
 * Todos los decoradores parten de este objeto y le van agregando capas.
 */
public class StandardVehicle implements Vehicle {
    private final String brand;
    private final double weightKg;
    private final double powerHp;
    private final double fuelConsumption;
    private final double costPerKm;
    private final double maxSpeedKmh;
    private final double accelerationSeconds;
    private final double price;

    public StandardVehicle(String brand, double weightKg, double powerHp, double fuelConsumption,
                           double costPerKm, double maxSpeedKmh, double accelerationSeconds, double price) {
        this.brand = brand;
        this.weightKg = weightKg;
        this.powerHp = powerHp;
        this.fuelConsumption = fuelConsumption;
        this.costPerKm = costPerKm;
        this.maxSpeedKmh = maxSpeedKmh;
        this.accelerationSeconds = accelerationSeconds;
        this.price = price;
    }

    public String getBrand() { return brand; }
    public double getWeightKg() { return weightKg; }
    public double getPowerHp() { return powerHp; }
    public double getFuelConsumption() { return fuelConsumption; }
    public double getCostPerKm() { return costPerKm; }
    public double getMaxSpeedKmh() { return maxSpeedKmh; }
    public double getAccelerationSeconds() { return accelerationSeconds; }
    public double getPrice() { return price; }

    // Tramites minimos que todo vehiculo particular tiene ante el RUNT
    public List<String> getRequiredProcedures() {
        List<String> procedures = new ArrayList<>();
        procedures.add("Matricula inicial ante el RUNT");
        procedures.add("SOAT vigente");
        procedures.add("Revision tecnico-mecanica");
        return procedures;
    }

    public boolean hasArmor() { return false; }
    public int getArmorLevel() { return 0; }
    public boolean isTaxi() { return false; }
}
