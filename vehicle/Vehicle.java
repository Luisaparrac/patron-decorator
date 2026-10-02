package vehicle;

import java.util.List;

/**
 * COMPONENTE del patron Decorator.
 * Define todo lo que cualquier vehiculo (original o transformado) debe exponer.
 * Tanto el vehiculo base como cada decorador implementan esta interfaz,
 * por eso se pueden envolver unos dentro de otros sin limite.
 */
public interface Vehicle {
    String getBrand();
    double getWeightKg();
    double getPowerHp();
    double getFuelConsumption();
    double getCostPerKm();
    double getMaxSpeedKmh();
    double getAccelerationSeconds();
    double getPrice();
    List<String> getRequiredProcedures();

    // Banderas que permiten a un decorador "mirar" que capas ya existen debajo de el
    boolean hasArmor();
    int getArmorLevel();
    boolean isTaxi();
}
