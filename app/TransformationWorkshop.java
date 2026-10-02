package app;

import vehicle.AccessibilityAdaptationDecorator;
import vehicle.ArmorLevel3Decorator;
import vehicle.ArmorLevel5Decorator;
import vehicle.NaturalGasConversionDecorator;
import vehicle.ReinforcedSuspensionDecorator;
import vehicle.TaxiConversionDecorator;
import vehicle.Vehicle;

/**
 * Taller de transformacion: recibe un vehiculo y la clave de una transformacion,
 * y devuelve el mismo vehiculo envuelto en el decorador correspondiente.
 * Aplicar varias transformaciones es simplemente llamar este metodo varias veces.
 */
public class TransformationWorkshop {

    public Vehicle apply(Vehicle vehicle, String key) {
        return switch (key) {
            case "armor3" -> new ArmorLevel3Decorator(vehicle);
            case "armor5" -> new ArmorLevel5Decorator(vehicle);
            case "suspension" -> new ReinforcedSuspensionDecorator(vehicle);
            case "gas" -> new NaturalGasConversionDecorator(vehicle);
            case "accessibility" -> new AccessibilityAdaptationDecorator(vehicle);
            case "taxi" -> new TaxiConversionDecorator(vehicle);
            default -> throw new IllegalArgumentException("Transformacion desconocida: " + key);
        };
    }
}
