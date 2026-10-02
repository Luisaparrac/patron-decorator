package app;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import vehicle.StandardVehicle;
import vehicle.Vehicle;

import java.io.File;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;

/**
 * Punto de entrada. Levanta un servidor web en el puerto 8080 que:
 *  - sirve el frontend de la carpeta web/
 *  - expone /api/transform, donde se apilan los decoradores en el orden elegido.
 */
public class Main {
    private static final TransformationWorkshop workshop = new TransformationWorkshop();

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        server.createContext("/", Main::serveStatic);
        server.createContext("/api/transform", Main::handleTransform);
        server.start();
        System.out.println("Server running at http://localhost:8080");
    }

    private static Vehicle baseVehicle() {
        return new StandardVehicle("Toyota Prado 2024", 2100, 201, 11.5, 520, 175, 11.0, 290_000_000);
    }

    // Aplica las capas una por una; si alguna rompe una regla, se descarta solo esa capa y se reporta
    private static void handleTransform(HttpExchange exchange) throws IOException {
        String body = new String(exchange.getRequestBody().readAllBytes());
        Vehicle before = baseVehicle();
        Vehicle after = before;
        List<String> applied = new ArrayList<>();
        List<String> procedureCounts = new ArrayList<>();
        String error = "";
        String failedLayer = "";

        for (String layer : readLayers(body)) {
            try {
                after = workshop.apply(after, layer);
                applied.add(layer);
                procedureCounts.add(String.valueOf(after.getRequiredProcedures().size()));
            } catch (IllegalStateException | IllegalArgumentException e) {
                error = e.getMessage();
                failedLayer = layer;
            }
        }

        String json = "{\"before\":" + JsonWriter.vehicle(before)
                + ",\"after\":" + JsonWriter.vehicle(after)
                + ",\"applied\":" + JsonWriter.list(applied)
                + ",\"procedureCounts\":" + JsonWriter.list(procedureCounts)
                + ",\"error\":\"" + JsonWriter.text(error) + "\""
                + ",\"failedLayer\":\"" + failedLayer + "\"}";
        send(exchange, json.getBytes(), "application/json");
    }

    // Lee el arreglo "layers":["armor3","gas"] del cuerpo de la peticion
    private static List<String> readLayers(String json) {
        List<String> layers = new ArrayList<>();
        int start = json.indexOf("[");
        int end = json.indexOf("]");
        if (start == -1 || end <= start + 1) return layers;
        for (String part : json.substring(start + 1, end).split(",")) {
            layers.add(part.replace("\"", "").trim());
        }
        return layers;
    }

    private static void serveStatic(HttpExchange exchange) throws IOException {
        String path = exchange.getRequestURI().getPath();
        if (path.equals("/")) path = "/index.html";
        File file = new File("web" + path);
        if (!file.exists()) {
            exchange.sendResponseHeaders(404, -1);
            return;
        }
        String type = path.endsWith(".css") ? "text/css" : path.endsWith(".js") ? "application/javascript" : "text/html";
        send(exchange, Files.readAllBytes(file.toPath()), type + "; charset=utf-8");
    }

    private static void send(HttpExchange exchange, byte[] bytes, String contentType) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", contentType);
        exchange.sendResponseHeaders(200, bytes.length);
        exchange.getResponseBody().write(bytes);
        exchange.close();
    }
}
