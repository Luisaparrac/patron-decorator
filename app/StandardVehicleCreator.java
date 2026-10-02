package app;
import vehicle.StandardVehicle;
import vehicle.Vehicle;
public class StandardVehicleCreator extends VehicleCreator {
    @Override public Vehicle createVehicle() { return new StandardVehicle("Toyota Prado 2024",2100,201,11.5,520,175,11.0,290_000_000); }
}
