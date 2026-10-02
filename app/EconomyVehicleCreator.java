package app;
import vehicle.StandardVehicle;
import vehicle.Vehicle;
/** Producto demostrativo; ajustar datos con el grupo. */
public class EconomyVehicleCreator extends VehicleCreator {
    @Override public Vehicle createVehicle() { return new StandardVehicle("Vehiculo compacto (demo)",1200,95,6.0,260,160,13.0,75_000_000); }
}
