# Prototype (Prototipo)

Archivos: `vehicle/VehiclePrototype.java`, fragmento para `vehicle/StandardVehicle.java` y `app/PrototypeExample.java`.

Copia los dos archivos Java nuevos a las carpetas del clon del proyecto. En StandardVehicle conserva lo que ya existe: añade `VehiclePrototype` a `implements` y aplica `vehicle/StandardVehicle.copy-snippet.txt`. Esta entrega copia solo el estado de StandardVehicle; no copia decoradores.

Compilar y ejecutar desde la raíz:
```powershell
javac -d out vehicle\*.java app\*.java
java -cp out app.PrototypeExample
```

Commit y push:
```bash
git switch -c feat/prototype-vehicles
git add vehicle/VehiclePrototype.java vehicle/StandardVehicle.java app/PrototypeExample.java
git commit -m "feat: add prototype copying for standard vehicles"
git push -u origin feat/prototype-vehicles
```
Luego abre un Pull Request a la rama principal. No incluyas `out/`.
