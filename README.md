# Taller de Transformación Vehicular — Patrón Decorator

Simula un taller colombiano que blinda, convierte a gas, adapta para movilidad reducida o convierte en taxi un vehículo existente. Cada transformación es un **decorador** que envuelve al vehículo anterior, modifica su ficha técnica y acumula los trámites del RUNT.

## Cómo encaja el patrón

| Rol del patrón | Clase |
|---|---|
| Componente | `vehicle/Vehicle.java` |
| Componente concreto | `vehicle/StandardVehicle.java` (Toyota Prado 2024 de fábrica) |
| Decorador base | `vehicle/VehicleDecorator.java` (delega todo y acumula trámites) |
| Decoradores concretos | `ArmorLevel3Decorator`, `ArmorLevel5Decorator`, `ReinforcedSuspensionDecorator`, `NaturalGasConversionDecorator`, `AccessibilityAdaptationDecorator`, `TaxiConversionDecorator` |

## Reglas de negocio (validadas en el constructor de cada decorador)

- La **suspensión reforzada** solo se instala si ya hay blindaje debajo.
- Un **taxi** no puede tener blindaje **nivel V** (se valida en ambos órdenes).
- Un vehículo no puede tener **dos niveles de blindaje** a la vez.

El orden importa: el gas reduce el costo por km *después* de que el blindaje lo subió.

## Estructura

```
vehicle/   componente, decorador base y decoradores concretos
app/       Main (servidor web), TransformationWorkshop, JsonWriter
web/       index.html, style.css, script.js
```

## Cómo correrlo (desde la raíz del proyecto)

```powershell
javac -d out vehicle\*.java app\*.java
java -cp out app.Main
```

Abrir **http://localhost:8080**.
