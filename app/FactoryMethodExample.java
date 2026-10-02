package app;
import vehicle.Vehicle;
public class FactoryMethodExample {
    public static void main(String[] args) {
        VehicleCreator[] creators={new StandardVehicleCreator(),new EconomyVehicleCreator()};
        for (VehicleCreator c:creators) { Vehicle v=c.createVehicle(); System.out.println(v.getBrand()+" - precio: "+v.getPrice()); }
    }
}
