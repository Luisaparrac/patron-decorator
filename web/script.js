/* ============================================================
   Taller de Transformación Vehicular — frontend

   El servidor Java es la única autoridad sobre las reglas de negocio:
   aquí se pide una pila de capas y se pinta lo que responda.

   El SVG del vehículo se construye UNA sola vez; cada transformación
   solo agrega o quita clases `has-*` sobre el <svg>, y el CSS se encarga
   de animar la transición. Así nunca se reinicia una animación a medias.
   ============================================================ */

/* ---------- catálogo de capas ---------- */

const LAYERS = {
    armor3: {
        name: "Blindaje nivel III",
        effect: "+350 kg · −15 km/h",
        cls: "ArmorLevel3Decorator",
        icon: `<path d="M12 3 5 5.6v5.2c0 4.3 3 8.1 7 9.2 4-1.1 7-4.9 7-9.2V5.6L12 3z"/>`
    },
    armor5: {
        name: "Blindaje nivel V",
        effect: "+600 kg · −30 km/h",
        cls: "ArmorLevel5Decorator",
        icon: `<path d="M12 3 5 5.6v5.2c0 4.3 3 8.1 7 9.2 4-1.1 7-4.9 7-9.2V5.6L12 3z"/><path d="M12 7.2 8.7 8.4v2.4c0 2 1.4 3.8 3.3 4.3 1.9-.5 3.3-2.3 3.3-4.3V8.4L12 7.2z"/>`
    },
    suspension: {
        name: "Suspensión reforzada",
        effect: "Compensa el peso del blindaje",
        cls: "ReinforcedSuspensionDecorator",
        icon: `<path d="M12 3.5v17M8.2 7.3 12 3.5l3.8 3.8M8.2 16.7 12 20.5l3.8-3.8"/>`
    },
    gas: {
        name: "Conversión a gas (GNV)",
        effect: "−45 % costo por km",
        cls: "NaturalGasConversionDecorator",
        icon: `<path d="M12 3.2s6 6.6 6 10.4a6 6 0 0 1-12 0c0-3.8 6-10.4 6-10.4z"/>`
    },
    accessibility: {
        name: "Movilidad reducida",
        effect: "Rampa + controles manuales",
        cls: "AccessibilityAdaptationDecorator",
        icon: `<circle cx="11" cy="4.4" r="1.9"/><path d="M9.3 8.1h3.4v4.6h-2.5"/><path d="M12.2 12.7a5.4 5.4 0 1 0 4.6 7.2"/><path d="M15.4 12.7h3.2l-1.6 4.4"/>`
    },
    taxi: {
        name: "Conversión a taxi",
        effect: "Taxímetro + servicio público",
        cls: "TaxiConversionDecorator",
        icon: `<path d="M9.2 3.6h5.6v2.1H9.2z"/><path d="M4.3 16.4h15.4v-3.7l-2.1-5.3H6.4l-2.1 5.3z"/><circle cx="7.6" cy="18.3" r="1.5"/><circle cx="16.4" cy="18.3" r="1.5"/>`
    }
};

const METRICS = [
    { key: "weight",       name: "Peso",              better: "down",    max: 3500,  format: v => num(v, 0) + " kg" },
    { key: "power",        name: "Potencia",          better: "up",      max: 260,   format: v => num(v, 0) + " hp" },
    { key: "consumption",  name: "Consumo",           better: "down",    max: 20,    format: v => num(v, 1) + " L/100km" },
    { key: "costPerKm",    name: "Costo por km",      better: "down",    max: 800,   format: v => "$" + num(v, 0) + "/km" },
    { key: "maxSpeed",     name: "Velocidad máxima",  better: "up",      max: 220,   format: v => num(v, 0) + " km/h" },
    { key: "acceleration", name: "Aceleración 0–100", better: "down",    max: 20,    format: v => num(v, 1) + " s" },
    { key: "price",        name: "Inversión total",   better: "neutral", max: 900e6, format: v => "$" + num(v / 1e6, 1) + " M" }
];

/* Geometría del vehículo: un solo sitio donde cambiar las medidas */
const CAR = {
    w: 560, h: 260,
    ground: 212,
    axleY: 164, tireR: 48,
    rearX: 150, frontX: 410,
    body: "M 58 178 L 56 128 C 56 112 62 102 74 98 L 86 56 C 88 48 95 44 106 44 "
        + "L 320 44 C 332 44 340 48 346 56 L 374 98 L 472 104 C 494 106 508 116 509 132 "
        + "L 511 164 C 512 174 506 178 496 178 L 466 178 A 58 58 0 0 0 354 178 "
        + "L 206 178 A 58 58 0 0 0 94 178 Z",
    // Los pasos de rueda, reutilizados por el labio del guardabarros y por los resortes
    archRear:  "M 206 178 A 58 58 0 0 0 94 178",
    archFront: "M 466 178 A 58 58 0 0 0 354 178",
    glass: "M 104 56 L 316 52 L 372 96 L 92 92 Z",
    pillars: "M 170 53.5 L 182 53.5 L 182 92.5 L 170 92.5 Z "
           + "M 248 53 L 260 53 L 260 93 L 248 93 Z "
           + "M 298 52 L 312 52 L 348 95 L 334 95 Z"
};

/* ---------- estado ---------- */

let layers = [];          // orden de aplicación: [0] toca el vehículo de fábrica
let shown = {};           // último valor animado de cada métrica
let previousDocs = [];    // trámites del render anterior, para animar solo los nuevos
let blocked = {};         // { capa: motivo } del último rechazo del servidor
let lastData = null;
let busy = false;

const el = id => document.getElementById(id);
const num = (v, d) => v.toLocaleString("es-CO", { minimumFractionDigits: d, maximumFractionDigits: d });
const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ============================================================
   Vehículo: se arma una vez y después solo cambia de clases
   ============================================================ */

function buildCar() {
    el("stageCar").innerHTML = `
<svg class="car" viewBox="0 0 ${CAR.w} ${CAR.h}" preserveAspectRatio="xMidYMid meet"
     role="img" aria-labelledby="carTitle">
    <title id="carTitle">Vehículo del taller con las transformaciones aplicadas</title>

    <defs>
        <linearGradient id="gPaint" x1="0" y1="0" x2="0.08" y2="1">
            <stop offset="0"    stop-color="#A3B4C8"/>
            <stop offset="0.26" stop-color="#70808F"/>
            <stop offset="0.5"  stop-color="#4A5464"/>
            <stop offset="0.52" stop-color="#394251"/>
            <stop offset="1"    stop-color="#1C222C"/>
        </linearGradient>

        <linearGradient id="gPaintTaxi" x1="0" y1="0" x2="0.08" y2="1">
            <stop offset="0"    stop-color="#FFE07A"/>
            <stop offset="0.3"  stop-color="#FBBE13"/>
            <stop offset="0.52" stop-color="#C98B00"/>
            <stop offset="1"    stop-color="#6E4B00"/>
        </linearGradient>

        <linearGradient id="gGlass" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0"    stop-color="#6E93B4"/>
            <stop offset="0.24" stop-color="#2C4256"/>
            <stop offset="0.62" stop-color="#15202C"/>
            <stop offset="1"    stop-color="#0A1017"/>
        </linearGradient>

        <radialGradient id="gTire" cx="0.5" cy="0.45" r="0.55">
            <stop offset="0.55" stop-color="#171A20"/>
            <stop offset="0.82" stop-color="#262B33"/>
            <stop offset="1"    stop-color="#0B0D11"/>
        </radialGradient>

        <linearGradient id="gRim" x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0"    stop-color="#F0F5FB"/>
            <stop offset="0.45" stop-color="#9DAABA"/>
            <stop offset="1"    stop-color="#4A5362"/>
        </linearGradient>

        <radialGradient id="gShadow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0"   stop-color="#000000" stop-opacity="0.62"/>
            <stop offset="0.6" stop-color="#000000" stop-opacity="0.22"/>
            <stop offset="1"   stop-color="#000000" stop-opacity="0"/>
        </radialGradient>

        <radialGradient id="gHead" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0"   stop-color="#FFF7DC" stop-opacity="0.9"/>
            <stop offset="0.5" stop-color="#FFE59B" stop-opacity="0.3"/>
            <stop offset="1"   stop-color="#FFD873" stop-opacity="0"/>
        </radialGradient>

        <clipPath id="clipBody"><path d="${CAR.body}"/></clipPath>
    </defs>

    <!-- ===== piso ===== -->
    <ellipse cx="285" cy="${CAR.ground + 1}" rx="232" ry="13" fill="url(#gShadow)"/>
    <ellipse cx="${CAR.rearX}"  cy="${CAR.ground}" rx="56" ry="7" fill="#000" opacity="0.5"/>
    <ellipse cx="${CAR.frontX}" cy="${CAR.ground}" rx="56" ry="7" fill="#000" opacity="0.5"/>

    <g class="lift"><g class="bob">

        <!-- Rampa de acceso: bisagra en el parachoques trasero, va detrás de la
             carrocería para que el borde del parachoques tape el pivote -->
        <g class="ramp">
            <path d="M 76 162 L 6 205 L 6 216 L 76 176 Z" fill="#1A2535" stroke="#3D7FD0" stroke-width="1.6"/>
            <path d="M 76 162 L 6 205" stroke="#7BBCFF" stroke-width="2.6" stroke-linecap="round"/>
            <path d="M 64 174 L 16 203 M 52 181 L 22 199 M 40 188 L 28 196"
                  stroke="#4D9FFF" stroke-width="1.4" stroke-opacity="0.6"/>
        </g>

        <!-- ===== bajos y chasis ===== -->
        <path d="M 72 126 L 500 132 L 500 186 L 72 186 Z" fill="#0B0E14"/>
        <path d="M 96 170 L 466 174 L 466 184 L 96 184 Z" fill="#131821"/>

        <!-- resortes y guardabarros reforzados (suspensión) -->
        <g class="coil" fill="none" stroke="#FF9A3C" stroke-linecap="round">
            <path d="${CAR.archRear}"  stroke-width="3.4" stroke-opacity="0.95"/>
            <path d="${CAR.archFront}" stroke-width="3.4" stroke-opacity="0.95"/>
            <path d="M 150 184 v 12 M 410 184 v 12"   stroke-width="6" stroke-opacity="0.45"/>
        </g>

        <!-- cilindro de GNV y boca de llenado -->
        <g class="gas-kit">
            <rect x="226" y="170" width="92" height="26" rx="13" fill="#123A31" stroke="#2FD9A0" stroke-width="1.6"/>
            <rect x="236" y="176" width="72" height="3.5" rx="1.75" fill="#2FD9A0" opacity="0.35"/>
            <text x="272" y="191" font-size="9.5" font-weight="700" fill="#2FD9A0"
                  text-anchor="middle" font-family="JetBrains Mono, monospace" letter-spacing="1">GNV</text>
            <path d="M 318 183 h 14 a 4 4 0 0 1 4 -4 v -6" fill="none" stroke="#2FD9A0" stroke-width="2"/>
            <circle cx="79" cy="132" r="7.5" fill="#0E131A" stroke="#2FD9A0" stroke-width="1.8"/>
            <path d="M 79 128.4 v 7.2 M 75.4 132 h 7.2" stroke="#2FD9A0" stroke-width="1.7" stroke-linecap="round"/>
        </g>

        <!-- ===== carrocería: dos pinturas que se cruzan por opacidad ===== -->
        <path class="paint-std"  d="${CAR.body}" fill="url(#gPaint)"/>
        <path class="paint-taxi" d="${CAR.body}" fill="url(#gPaintTaxi)"/>

        <!-- detalles recortados a la silueta -->
        <g clip-path="url(#clipBody)">
            <path d="M 46 156 L 518 163 L 518 190 L 46 190 Z" fill="#11161E"/>
            <path d="M 46 174 L 518 180 L 518 190 L 46 190 Z" fill="#070A0F"/>
            <path d="M 50 131 L 516 137" stroke="#FFFFFF" stroke-opacity="0.13" stroke-width="3.5"/>
            <path d="M 50 136 L 516 142" stroke="#000000" stroke-opacity="0.3" stroke-width="2.4"/>
            <path d="M 50 96 L 376 99"  stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="2"/>
            <path d="M 52 148 L 82 150 L 82 180 L 52 180 Z" fill="#0C1118"/>
            ${checkerStripe()}
            <path class="sheen" d="M 96 36 L 150 36 L 86 190 L 32 190 Z" fill="#FFFFFF" fill-opacity="0.4"/>
        </g>

        <!-- contorno y luz de borde que separa el auto del fondo -->
        <path d="${CAR.body}" fill="none" stroke="#05080D" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M 86 56 C 88 48 95 44 106 44 L 320 44 C 332 44 340 48 346 56 L 374 98 L 472 104"
              fill="none" stroke="#DCE8F6" stroke-opacity="0.6" stroke-width="2.1" stroke-linecap="round"/>

        <!-- labio de los pasos de rueda -->
        <g fill="none" stroke="#C3D4E6" stroke-opacity="0.3" stroke-width="2.2" stroke-linecap="round">
            <path d="${CAR.archRear}"/>
            <path d="${CAR.archFront}"/>
        </g>

        <!-- ===== barras del techo ===== -->
        <rect x="118" y="38" width="186" height="5" rx="2.5" fill="#333C49"/>
        <rect x="126" y="42" width="7" height="4" fill="#262E39"/>
        <rect x="289" y="42" width="7" height="4" fill="#262E39"/>

        <!-- ===== vidrios ===== -->
        <path d="${CAR.glass}" fill="url(#gGlass)"/>
        <path class="glass-armor" d="${CAR.glass}" fill="#070E18"/>
        <path d="M 130 92 L 196 55 L 226 55 L 160 92 Z" fill="#CFE4F7" opacity="0.08"/>
        <path d="M 250 93 L 300 54 L 312 54 L 262 93 Z" fill="#CFE4F7" opacity="0.055"/>
        <path d="${CAR.glass}" fill="none" stroke="#060B12" stroke-width="2.2"/>

        <!-- pilares: también cambian de color con el taxi -->
        <path class="paint-std"  d="${CAR.pillars}" fill="url(#gPaint)"/>
        <path class="paint-taxi" d="${CAR.pillars}" fill="url(#gPaintTaxi)"/>

        <!-- ===== blindaje: marco reforzado, plancha y remaches ===== -->
        <g class="armor-kit">
            <g clip-path="url(#clipBody)">
                <path class="armor-plate" d="M 88 100 L 356 103 L 356 162 L 88 158 Z"
                      fill="#141C28" opacity="0.6"/>
            </g>
            <path d="${CAR.glass}" fill="none" stroke="#5BA8DC" stroke-width="2.6" stroke-opacity="0.5"/>
            ${rivets()}
        </g>

        <!-- ===== líneas de puertas, manijas, espejo ===== -->
        <g stroke-linecap="round">
            <path d="M 92 95 L 90 176"   stroke="#080C12" stroke-width="1.7" stroke-opacity="0.85"/>
            <path d="M 183 94 L 181 176" stroke="#080C12" stroke-width="1.7" stroke-opacity="0.85"/>
            <path d="M 261 95 L 259 176" stroke="#080C12" stroke-width="1.7" stroke-opacity="0.85"/>
            <path d="M 185 94 L 183 176" stroke="#FFFFFF" stroke-width="1" stroke-opacity="0.13"/>
            <path d="M 263 95 L 261 176" stroke="#FFFFFF" stroke-width="1" stroke-opacity="0.13"/>
        </g>
        <rect x="196" y="112" width="25" height="6" rx="3" fill="#D3DEEC" opacity="0.5"/>
        <rect x="274" y="113" width="25" height="6" rx="3" fill="#D3DEEC" opacity="0.5"/>
        <path d="M 316 100 L 341 106 L 339 117 L 316 111 Z" fill="#39424F" stroke="#080C12" stroke-width="1.3"/>

        <!-- ===== luces ===== -->
        <ellipse class="head-glow" cx="516" cy="119" rx="30" ry="13" fill="url(#gHead)"/>
        <path d="M 474 110 L 505 116 C 510 117 511 125 506 126 L 474 123 Z" fill="#F7FAFF"/>
        <path d="M 480 117 L 503 121" stroke="#8FA8C8" stroke-width="2" stroke-opacity="0.75"/>
        <path d="M 486 136 L 510 140 L 510 157 L 484 153 Z" fill="#0C1119"/>
        <path d="M 489 143 L 508 146 M 489 148 L 508 151" stroke="#262E3A" stroke-width="2"/>
        <rect x="490" y="160" width="17" height="6" rx="3" fill="#CBD9E9" opacity="0.55"/>
        <path d="M 57 115 L 76 118 L 76 140 L 57 136 Z" fill="#E03A2E"/>
        <path d="M 59 131 L 74 133 L 74 138 L 59 135 Z" fill="#F2A849" opacity="0.9"/>
        <path d="M 57 115 L 76 118 L 76 140 L 57 136 Z" fill="none" stroke="#05080D" stroke-width="1.6"/>

        <!-- ===== símbolo de accesibilidad en la puerta ===== -->
        <g class="wheelchair" transform="translate(212 134) scale(1.02)" fill="none"
           stroke="#4D9FFF" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="0" cy="-11" r="2.4" fill="#4D9FFF" stroke="none"/>
            <path d="M -2.4 -6.6 h 4.6 v 6.2 h -3.4"/>
            <path d="M 1.6 -0.4 a 6.6 6.6 0 1 0 5.6 8.8"/>
            <path d="M 5.4 -0.4 h 4 l -2 5.4"/>
        </g>

        <!-- ===== letrero de taxi ===== -->
        <g class="taxi-kit">
            <rect x="196" y="40" width="8" height="6" fill="#141009"/>
            <rect x="236" y="40" width="8" height="6" fill="#141009"/>
            <rect x="176" y="21" width="88" height="21" rx="4.5" fill="#141009" stroke="#FFC53D" stroke-width="1.7"/>
            <text x="220" y="36" font-size="12.5" font-weight="700" fill="#FFC53D" text-anchor="middle"
                  font-family="Space Grotesk, Inter, sans-serif" letter-spacing="2.5">TAXI</text>
        </g>

    </g></g>

    <!-- ===== ruedas ===== -->
    ${wheel(CAR.rearX, "rear")}
    ${wheel(CAR.frontX, "front")}
</svg>`;
}

/* Una rueda: la llanta exterior queda fija y todo lo que tiene relieve gira */
function wheel(cx, pos) {
    const cy = CAR.axleY;
    return `<g class="wheel wheel-${pos}">
        <circle cx="${cx}" cy="${cy}" r="${CAR.tireR}" fill="url(#gTire)"/>
        <g class="rim rim-${pos}">
            <circle cx="${cx}" cy="${cy}" r="44.5" fill="none" stroke="#2D333C"
                    stroke-width="6" stroke-dasharray="3.5 6"/>
            <circle cx="${cx}" cy="${cy}" r="38" fill="#0F1217"/>
            <circle cx="${cx}" cy="${cy}" r="34" fill="none" stroke="#3A424D" stroke-width="1.4"/>
            <circle cx="${cx}" cy="${cy}" r="30.5" fill="url(#gRim)"/>
            <circle cx="${cx}" cy="${cy}" r="30.5" fill="none" stroke="#E6EDF6"
                    stroke-opacity="0.35" stroke-width="2"/>
            ${spokes(cx, cy)}
            <circle cx="${cx}" cy="${cy}" r="8.5" fill="#2B333F"/>
            <circle cx="${cx}" cy="${cy}" r="3.2" fill="#9FAEC0"/>
        </g>
    </g>`;
}

/* Cinco radios iguales, cada uno girado 72° alrededor del centro */
function spokes(cx, cy) {
    let out = "";
    for (let i = 0; i < 5; i++) {
        out += `<path transform="rotate(${i * 72} ${cx} ${cy})" fill="#121720" fill-opacity="0.82"
            d="M ${cx - 4.6} ${cy - 9} L ${cx - 6.2} ${cy - 25.5}
               Q ${cx} ${cy - 30} ${cx + 6.2} ${cy - 25.5}
               L ${cx + 4.6} ${cy - 9} Q ${cx} ${cy - 6} ${cx - 4.6} ${cy - 9} Z"/>`;
    }
    return out;
}

/* Remaches del blindaje a lo largo del cinturón y de la plancha inferior */
function rivets() {
    let out = `<g fill="#A8C8E4" opacity="0.8">`;
    for (let x = 100; x <= 356; x += 18) out += `<circle cx="${x}" cy="${99 + x * 0.012}" r="1.7"/>`;
    for (let x = 100; x <= 350; x += 25) out += `<circle cx="${x}" cy="${157 + x * 0.004}" r="1.5"/>`;
    return out + `</g>`;
}

/* Franja ajedrezada del taxi sobre la puerta */
function checkerStripe() {
    let out = `<g class="taxi-kit">`;
    for (let i = 0; i < 16; i++) {
        out += `<rect x="${96 + i * 11}" y="${141 + i * 0.13 + (i % 2 ? 11 : 0)}"
                 width="11" height="11" fill="#141009" opacity="0.92"/>`;
    }
    return out + `</g>`;
}

/* Cambia las clases del <svg>: el CSS hace el resto */
function updateCar() {
    const car = el("stageCar").querySelector(".car");
    if (!car) return;
    Object.keys(LAYERS).forEach(key => car.classList.toggle("has-" + key, layers.includes(key)));
    car.querySelector("title").textContent = layers.length
        ? "Vehículo con " + layers.map(k => LAYERS[k].name.toLowerCase()).join(", ")
        : "Vehículo de fábrica, sin transformaciones";
}

/* ============================================================
   Construcción inicial de los paneles
   ============================================================ */

function buildCatalog() {
    const list = el("catalog");
    Object.entries(LAYERS).forEach(([key, meta]) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "card";
        card.id = "card-" + key;
        card.style.setProperty("--c", `var(--${key})`);
        card.innerHTML = `
            <span class="card-icon" aria-hidden="true">${svgIcon(meta.icon)}</span>
            <span class="card-body">
                <span class="card-name">${meta.name}</span>
                <span class="card-effect">${meta.effect}</span>
                <span class="card-reason" hidden></span>
            </span>
            <span class="card-state" aria-hidden="true">+</span>`;
        card.addEventListener("click", () => transform([...layers, key], { type: "add", key }));
        list.appendChild(card);
    });
}

function svgIcon(path, size = 17) {
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none"
        stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

function buildMetrics() {
    el("metrics").innerHTML = METRICS.map(m => `
        <div class="metric">
            <div class="metric-top">
                <span class="metric-name">${m.name}</span>
                <span class="metric-before" id="before-${m.key}"></span>
                <span class="metric-after mono" id="after-${m.key}"></span>
                <span class="delta" id="delta-${m.key}"></span>
            </div>
            <div class="bars">
                <div class="bar bar-before" id="barb-${m.key}"></div>
                <div class="bar bar-after" id="bara-${m.key}"></div>
            </div>
        </div>`).join("");
}

/* ============================================================
   Comunicación con el servidor
   ============================================================ */

async function transform(nextLayers, intent) {
    if (busy) return;
    const previous = layers;
    setBusy(true);

    let data;
    try {
        const response = await fetch("/api/transform", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ layers: nextLayers })
        });
        if (!response.ok) throw new Error("HTTP " + response.status);
        data = await response.json();
    } catch (e) {
        setBusy(false);
        showError("Sin conexión con el taller",
            "Revisa que el servidor Java siga corriendo en el puerto 8080.", null);
        return;
    }

    setBusy(false);

    // Reordenar nunca debe perder capas: si el nuevo orden rompe una regla,
    // se avisa y se vuelve al orden anterior sin tocar la pila.
    if (data.error && intent.type === "move") {
        showError("Orden no permitido", data.error, data.failedLayer);
        return transform(previous, { type: "revert" });
    }

    const added = data.applied.length > layers.length && intent.type === "add";
    layers = data.applied;
    blocked = data.error ? { [data.failedLayer]: data.error } : {};

    if (data.error) showError("Transformación rechazada", data.error, data.failedLayer);
    render(data, added);
}

function setBusy(value) {
    busy = value;
    el("layout").classList.toggle("busy", value);
}

/* ============================================================
   Render
   ============================================================ */

function render(data, animateNewLayer) {
    lastData = data;
    updateCar();
    renderCatalog();
    renderStage(data);
    renderOnion(animateNewLayer);
    renderCode();
    renderMetrics(data.before, data.after);
    renderDocs(data);
    renderStatus(data);
}

function renderCatalog() {
    Object.keys(LAYERS).forEach(key => {
        const card = el("card-" + key);
        const used = layers.includes(key);
        const reason = blocked[key];

        card.disabled = used;
        card.classList.toggle("used", used);
        card.classList.toggle("blocked", Boolean(reason));
        card.querySelector(".card-state").textContent = used ? "✓" : "+";
        card.setAttribute("aria-pressed", String(used));

        const reasonEl = card.querySelector(".card-reason");
        reasonEl.textContent = reason || "";
        reasonEl.hidden = !reason;
    });
    el("layerTag").textContent = layers.length + " / " + Object.keys(LAYERS).length;
}

function renderStage(data) {
    const a = data.after;
    el("brandTag").textContent = a.brand;
    el("hudWeight").textContent = num(a.weight, 0) + " kg";
    el("hudPower").textContent = num(a.power, 0) + " hp";
    el("hudSpeed").textContent = num(a.maxSpeed, 0) + " km/h";
    el("hudCost").textContent = "$" + num(a.costPerKm, 0);
    el("plate").classList.toggle("public", layers.includes("taxi"));

    el("stageChips").innerHTML = layers.map((key, i) =>
        `<span class="stage-chip" style="--c:var(--${key}); animation-delay:${i * 60}ms">
            ${svgIcon(LAYERS[key].icon, 12)}${LAYERS[key].name}
        </span>`).join("");
}

function renderOnion(animateNewLayer) {
    const last = layers.length - 1;
    let html = `<div class="core">
        <span class="core-kind">StandardVehicle</span>
        <span class="core-label">Componente concreto</span>
        ${layers.length ? "" : `<p class="core-empty">Sin decoradores: así sale de fábrica.</p>`}
    </div>`;

    layers.forEach((key, i) => {
        const fresh = animateNewLayer && i === last ? " fresh" : "";
        const order = String(i + 1).padStart(2, "0");
        html = `<div class="layer${fresh}" style="--c:var(--${key})">
            <div class="layer-tag">
                <span class="order" aria-hidden="true">${order}</span>
                <span class="layer-name">${LAYERS[key].name}</span>
                <span class="layer-acts">
                    <button type="button" data-act="up" data-index="${i}" ${i === 0 ? "disabled" : ""}
                            aria-label="Aplicar ${LAYERS[key].name} antes">&uarr;</button>
                    <button type="button" data-act="down" data-index="${i}" ${i === last ? "disabled" : ""}
                            aria-label="Aplicar ${LAYERS[key].name} después">&darr;</button>
                    <button type="button" class="kill" data-act="remove" data-index="${i}"
                            aria-label="Quitar ${LAYERS[key].name}">&times;</button>
                </span>
            </div>${html}</div>`;
    });

    el("onion").innerHTML = html;
    el("layerCount").textContent = layers.length + (layers.length === 1 ? " capa" : " capas");
}

/* La pila dibujada, escrita como la cadena de constructores de Java */
function renderCode() {
    const lines = [
        `<span class="c">// Componente concreto</span>`,
        `<span class="t">Vehicle</span> prado = <span class="k">new</span> <span class="t">StandardVehicle</span><span class="p">(</span>`,
        `    <span class="s">"Toyota Prado 2024"</span><span class="p">,</span> <span class="n">2100</span><span class="p">,</span> <span class="n">201</span><span class="p">,</span> <span class="n">11.5</span><span class="p">,</span> <span class="n">520</span><span class="p">,</span> <span class="n">175</span><span class="p">,</span> <span class="n">11.0</span><span class="p">,</span> <span class="n">290_000_000</span><span class="p">);</span>`,
        ``
    ];

    if (!layers.length) {
        lines.push(`<span class="t">Vehicle</span> resultado = prado<span class="p">;</span>  <span class="c">// sin decoradores</span>`);
    } else {
        const outerToInner = [...layers].reverse();
        lines.push(`<span class="t">Vehicle</span> resultado =`);
        outerToInner.forEach((key, depth) => {
            const pad = "    ".repeat(depth + 1);
            lines.push(`${pad}<span class="k">new</span> <span class="t">${LAYERS[key].cls}</span><span class="p">(</span>`);
        });
        lines.push("    ".repeat(outerToInner.length + 1) + `prado`);
        for (let depth = outerToInner.length - 1; depth >= 0; depth--) {
            const pad = "    ".repeat(depth + 1);
            lines.push(pad + `<span class="p">)${depth === 0 ? ";" : ""}</span>`);
        }
    }

    el("code").innerHTML = lines
        .map((line, i) => `<span class="line" style="animation-delay:${i * 28}ms">${line || " "}</span>`)
        .join("");
}

function renderMetrics(before, after) {
    METRICS.forEach(m => {
        const delta = after[m.key] - before[m.key];
        const tone = Math.abs(delta) < 0.01 ? "zero"
            : m.better === "neutral" ? "neutral"
            : (delta > 0) === (m.better === "up") ? "good" : "bad";

        el("before-" + m.key).textContent = tone === "zero" ? "" : m.format(before[m.key]);

        const deltaEl = el("delta-" + m.key);
        deltaEl.className = "delta " + tone;
        deltaEl.textContent = tone === "zero" ? "=" : (delta > 0 ? "+" : "−") + m.format(Math.abs(delta)).replace("$", "");

        el("barb-" + m.key).style.width = Math.min(100, before[m.key] / m.max * 100) + "%";
        const barAfter = el("bara-" + m.key);
        barAfter.className = "bar bar-after " + tone;
        barAfter.style.width = Math.min(100, after[m.key] / m.max * 100) + "%";

        tween(m, shown[m.key] ?? before[m.key], after[m.key]);
        shown[m.key] = after[m.key];
    });
}

function tween(metric, from, to) {
    const target = el("after-" + metric.key);
    if (reduceMotion() || from === to) {
        target.textContent = metric.format(to);
        return;
    }
    const start = performance.now();
    const step = now => {
        const t = Math.min(1, (now - start) / 650);
        const eased = 1 - Math.pow(1 - t, 3);
        target.textContent = metric.format(from + (to - from) * eased);
        if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

function renderDocs(data) {
    const docs = data.after.procedures;
    const baseCount = data.before.procedures.length;
    const counts = data.procedureCounts.map(Number);
    const check = `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor"
        stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 7"/></svg>`;
    let newIndex = 0;

    el("docs").innerHTML = docs.map((doc, j) => {
        const owner = j < baseCount ? null : layers[counts.findIndex(c => j < c)];
        const c = owner ? `var(--${owner})` : "var(--muted)";
        const source = owner ? LAYERS[owner].name : "Vehículo de fábrica";
        const isOld = previousDocs.includes(doc);
        const delay = isOld ? "" : `; animation-delay:${(newIndex++) * 70}ms`;
        return `<li class="doc${isOld ? " old" : ""}" style="--c:${c}${delay}">
            <span class="doc-check" aria-hidden="true">${check}</span>
            <span>${esc(doc)}<span class="doc-source">${source}</span></span>
        </li>`;
    }).join("");

    el("docCount").textContent = docs.length;
    previousDocs = docs;
}

function renderStatus(data) {
    const status = el("status");
    status.classList.toggle("error", Boolean(data.error));
    el("statusText").textContent = data.error ? "Última capa rechazada" : "Configuración válida";

    el("sbLayers").textContent = layers.length;
    el("sbDocs").textContent = data.after.procedures.length;
    el("sbPrice").textContent = "$" + num(data.after.price / 1e6, 1) + " M";
    el("resetBtn").disabled = layers.length === 0;

    // La configuración queda en la URL: se puede recargar o compartir el enlace
    history.replaceState(null, "", layers.length ? "#" + layers.join(",") : location.pathname);
}

/* ============================================================
   Acciones
   ============================================================ */

function moveLayer(index, direction) {
    const next = [...layers];
    const swapWith = index + direction;
    if (swapWith < 0 || swapWith >= next.length) return;
    [next[index], next[swapWith]] = [next[swapWith], next[index]];
    transform(next, { type: "move" });
}

function removeLayer(index) {
    transform(layers.filter((_, i) => i !== index), { type: "remove" });
}

function showError(title, message, key) {
    el("toastTitle").textContent = title;
    el("toastText").textContent = message;
    el("toast").hidden = false;
    clearTimeout(showError.timer);
    showError.timer = setTimeout(hideError, 5200);

    const card = key && el("card-" + key);
    if (card) {
        card.classList.remove("shake");
        void card.offsetWidth;   // reinicia la animación
        card.classList.add("shake");
    }
}

function hideError() {
    clearTimeout(showError.timer);
    el("toast").hidden = true;
}

function toggleTheme() {
    const light = document.documentElement.dataset.theme !== "light";
    document.documentElement.dataset.theme = light ? "light" : "dark";
    try { localStorage.setItem("taller-theme", light ? "light" : "dark"); } catch (e) {}
}

function toggleMotion() {
    const stage = el("stage");
    const rolling = stage.classList.toggle("rolling");
    const btn = el("motionBtn");
    btn.setAttribute("aria-pressed", String(rolling));
    btn.querySelector("span").textContent = rolling ? "Pausar" : "Animar";
}

/* ============================================================
   Arranque
   ============================================================ */

// Un solo listener para los botones de todas las capas, que se recrean en cada render
el("onion").addEventListener("click", event => {
    const button = event.target.closest("button[data-act]");
    if (!button) return;
    const index = Number(button.dataset.index);
    if (button.dataset.act === "remove") removeLayer(index);
    else moveLayer(index, button.dataset.act === "up" ? -1 : 1);
});

el("resetBtn").addEventListener("click", () => transform([], { type: "reset" }));
el("themeBtn").addEventListener("click", toggleTheme);
el("motionBtn").addEventListener("click", toggleMotion);
el("toastClose").addEventListener("click", hideError);
document.addEventListener("keydown", e => { if (e.key === "Escape") hideError(); });

if (reduceMotion()) toggleMotion();

buildCar();
buildCatalog();
buildMetrics();

// La pila inicial puede venir en la URL: /#armor3,suspension,taxi
const fromUrl = decodeURIComponent(location.hash.slice(1))
    .split(",")
    .filter(key => LAYERS[key]);

transform(fromUrl, { type: "reset" });
