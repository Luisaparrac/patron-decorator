package app;

import vehicle.Vehicle;

import java.util.List;

/**
 * Convierte vehiculos y listas a texto JSON sin librerias externas,
 * para enviarlos al frontend.
 */
public class JsonWriter {

    public static String vehicle(Vehicle v) {
        return "{"
                + "\"brand\":\"" + v.getBrand() + "\","
                + "\"weight\":" + v.getWeightKg() + ","
                + "\"power\":" + v.getPowerHp() + ","
                + "\"consumption\":" + v.getFuelConsumption() + ","
                + "\"costPerKm\":" + v.getCostPerKm() + ","
                + "\"maxSpeed\":" + v.getMaxSpeedKmh() + ","
                + "\"acceleration\":" + v.getAccelerationSeconds() + ","
                + "\"price\":" + v.getPrice() + ","
                + "\"procedures\":" + list(v.getRequiredProcedures())
                + "}";
    }

    public static String list(List<String> items) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < items.size(); i++) {
            sb.append("\"").append(text(items.get(i))).append("\"");
            if (i < items.size() - 1) sb.append(",");
        }
        return sb.append("]").toString();
    }

    public static String text(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
