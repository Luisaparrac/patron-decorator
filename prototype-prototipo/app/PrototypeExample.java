package app;
import vehicle.StandardVehicle;
public class PrototypeExample {
    public static void main(String[] args) {
        StandardVehicle original = new StandardVehicle("Toyota Prado 2024", 2100, 201, 11.5, 520, 175, 11.0, 290_000_000);
        StandardVehicle copy = original.copy();
        if (original == copy || !original.getBrand().equals(copy.getBrand()) || original.getPrice() != copy.getPrice())
            throw new AssertionError("La copia debe ser otra instancia con los mismos valores");
        System.out.println("Prototype correcto: copia independiente con los mismos valores.");
    }
}
