const LAYERS = {
    armor3: { name: "Blindaje nivel III", effect: "+350 kg · −15 km/h", icon: "🛡" },
    armor5: { name: "Blindaje nivel V", effect: "+600 kg · −30 km/h", icon: "🛡" },
    suspension: { name: "Suspensión reforzada", effect: "Compensa el peso del blindaje", icon: "⇕" },
    gas: { name: "Conversión a gas (GNV)", effect: "−45% costo por km", icon: "⛽" },
    accessibility: { name: "Movilidad reducida", effect: "Rampa + controles manuales", icon: "♿" },
    taxi: { name: "Conversión a taxi", effect: "Taxímetro + servicio público", icon: "🚕" }
};

const METRICS = [
    { key: "weight", name: "Peso", better: "down", max: 3500, format: v => num(v, 0) + " kg" },
    { key: "power", name: "Potencia", better: "up", max: 260, format: v => num(v, 0) + " hp" },
    { key: "consumption", name: "Consumo", better: "down", max: 20, format: v => num(v, 1) + " L/100km" },
    { key: "costPerKm", name: "Costo por km", better: "down", max: 800, format: v => "$" + num(v, 0) + "/km" },
    { key: "maxSpeed", name: "Velocidad máxima", better: "up", max: 220, format: v => num(v, 0) + " km/h" },
    { key: "acceleration", name: "Aceleración 0–100", better: "down", max: 20, format: v => num(v, 1) + " s" },
    { key: "price", name: "Costo total", better: "neutral", max: 900e6, format: v => "$" + num(v / 1e6, 1) + " M" }
];

let layers = [];
let shown = {};
let previousDocs = [];

const color = key => getComputedStyle(document.documentElement).getPropertyValue("--" + key).trim();
const num = (v, d) => v.toLocaleString("es-CO", { minimumFractionDigits: d, maximumFractionDigits: d });

function buildCatalog() {
    const list = document.getElementById("catalog");
    Object.entries(LAYERS).forEach(([key, meta]) => {
        const card = document.createElement("button");
        card.className = "card";
        card.id = "card-" + key;
        card.style.setProperty("--c", color(key));
        card.innerHTML = `
            <span class="card-icon">${meta.icon}</span>
            <span><div class="card-name">${meta.name}</div><div class="card-effect">${meta.effect}</div></span>
            <span class="card-state">+</span>`;
        card.addEventListener("click", () => transform([...layers, key], key));
        list.appendChild(card);
    });
}

function buildMetrics() {
    document.getElementById("metrics").innerHTML = METRICS.map(m => `
        <div class="metric">
            <div class="metric-top">
                <span class="metric-name">${m.name}</span>
                <span class="metric-before" id="before-${m.key}"></span>
                <span class="metric-after" id="after-${m.key}"></span>
                <span class="delta" id="delta-${m.key}"></span>
            </div>
            <div class="bars">
                <div class="bar bar-before" id="barb-${m.key}"></div>
                <div class="bar bar-after" id="bara-${m.key}"></div>
            </div>
        </div>`).join("");
}

async function transform(nextLayers, triedKey) {
    const response = await fetch("/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layers: nextLayers })
    });
    const data = await response.json();
    const added = data.applied.length > layers.length && triedKey;
    layers = data.applied;

    if (data.error) showError(data.error, data.failedLayer);
    render(data, added);
}

function render(data, animateNewLayer) {
    renderCatalog();
    renderOnion(animateNewLayer);
    renderMetrics(data.before, data.after);
    renderDocs(data);
    document.getElementById("layerCount").textContent = layers.length + (layers.length === 1 ? " capa" : " capas");
    document.getElementById("plate").classList.toggle("public", layers.includes("taxi"));
}

function renderCatalog() {
    Object.keys(LAYERS).forEach(key => {
        const card = document.getElementById("card-" + key);
        const used = layers.includes(key);
        card.disabled = used;
        card.classList.toggle("used", used);
        card.querySelector(".card-state").textContent = used ? "✓" : "+";
    });
}

function renderOnion(animateNewLayer) {
    let html = `<div class="core">
        <span class="core-label">Vehículo original</span>
        ${carSvg()}
        <div class="core-badges">${layers.map(k => `<span class="badge" style="background:${color(k)}">${LAYERS[k].icon}</span>`).join("")}</div>
    </div>`;

    layers.forEach((key, i) => {
        const fresh = animateNewLayer && i === layers.length - 1 ? " fresh" : "";
        html = `<div class="layer${fresh}" style="--c:${color(key)}">
            <div class="layer-tag"><span class="order">${i + 1}</span>${LAYERS[key].name}
                <button title="Quitar capa" onclick="removeLayer(${i})">×</button>
            </div>${html}</div>`;
    });

    document.getElementById("onion").innerHTML = html;
}

function carSvg() {
    const armor = layers.includes("armor5") ? "#1E2633" : layers.includes("armor3") ? "#3A4554" : "#A9D2EE";
    const body = layers.includes("taxi") ? color("taxi") : "#D3D7DD";
    const rim = layers.includes("suspension") ? color("suspension") : "#C9C2B6";
    const sign = layers.includes("taxi")
        ? `<rect x="122" y="7" width="36" height="11" rx="3" fill="#1d1600"/><text x="140" y="15.5" font-size="7.5" font-weight="800" fill="${color("taxi")}" text-anchor="middle" font-family="Manrope">TAXI</text>` : "";
    const tank = layers.includes("gas") ? `<rect x="194" y="56" width="24" height="13" rx="6.5" fill="${color("gas")}" stroke="#2A2119" stroke-width="1.5"/>` : "";
    const ramp = layers.includes("accessibility") ? `<path d="M224 76 L240 98" stroke="${color("accessibility")}" stroke-width="5" stroke-linecap="round"/>` : "";
    return `<svg viewBox="0 0 244 112">
        <ellipse cx="122" cy="100" rx="104" ry="6" fill="rgba(0,0,0,0.08)"/>
        ${sign}
        <path d="M16 80 L22 58 Q26 49 40 47 L70 45 L92 24 Q98 18 108 18 L168 18 Q178 18 185 26 L202 45 L214 48 Q228 52 228 66 L228 80 Z" fill="${body}" stroke="#2A2119" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M99 26 L82 44 L134 44 L134 26 Z" fill="${armor}"/>
        <path d="M142 26 L142 44 L192 44 L177 28 Q173 26 168 26 Z" fill="${armor}"/>
        ${tank}${ramp}
        <circle cx="62" cy="82" r="16" fill="#2A2119"/><circle cx="62" cy="82" r="7" fill="${rim}"/>
        <circle cx="186" cy="82" r="16" fill="#2A2119"/><circle cx="186" cy="82" r="7" fill="${rim}"/>
    </svg>`;
}

function renderMetrics(before, after) {
    document.getElementById("brand").textContent = after.brand;
    METRICS.forEach(m => {
        const delta = after[m.key] - before[m.key];
        const tone = Math.abs(delta) < 0.01 ? "zero"
            : m.better === "neutral" ? "neutral"
            : (delta > 0) === (m.better === "up") ? "good" : "bad";

        document.getElementById("before-" + m.key).textContent = tone === "zero" ? "" : m.format(before[m.key]);
        const deltaEl = document.getElementById("delta-" + m.key);
        deltaEl.className = "delta " + tone;
        deltaEl.textContent = tone === "zero" ? "=" : (delta > 0 ? "+" : "−") + m.format(Math.abs(delta)).replace("$", "");

        document.getElementById("barb-" + m.key).style.width = Math.min(100, before[m.key] / m.max * 100) + "%";
        const barAfter = document.getElementById("bara-" + m.key);
        barAfter.className = "bar bar-after " + tone;
        barAfter.style.width = Math.min(100, after[m.key] / m.max * 100) + "%";

        tween(m, shown[m.key] ?? before[m.key], after[m.key]);
        shown[m.key] = after[m.key];
    });
}

function tween(metric, from, to) {
    const el = document.getElementById("after-" + metric.key);
    const start = performance.now();
    const step = now => {
        const t = Math.min(1, (now - start) / 600);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = metric.format(from + (to - from) * eased);
        if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

function renderDocs(data) {
    const docs = data.after.procedures;
    const baseCount = data.before.procedures.length;
    const counts = data.procedureCounts.map(Number);
    let newIndex = 0;

    document.getElementById("docs").innerHTML = docs.map((doc, j) => {
        const owner = j < baseCount ? null : layers[counts.findIndex(c => j < c)];
        const c = owner ? color(owner) : "#8C8070";
        const source = owner ? LAYERS[owner].name : "Vehículo original";
        const isOld = previousDocs.includes(doc);
        const delay = isOld ? "" : `style="--c:${c}; animation-delay:${(newIndex++) * 90}ms"`;
        return `<li class="doc${isOld ? " old" : ""}" ${delay || `style="--c:${c}"`}>
            <span class="doc-check">✓</span>
            <span>${doc}<span class="doc-source">${source}</span></span>
        </li>`;
    }).join("");

    document.getElementById("docCount").textContent = docs.length;
    previousDocs = docs;
}

function removeLayer(index) {
    transform(layers.filter((_, i) => i !== index), null);
}

function showError(message, key) {
    const toast = document.getElementById("toast");
    document.getElementById("toastText").textContent = message;
    toast.hidden = false;
    clearTimeout(showError.timer);
    showError.timer = setTimeout(() => toast.hidden = true, 3800);

    const card = document.getElementById("card-" + key);
    if (card) {
        card.classList.remove("shake");
        void card.offsetWidth;
        card.classList.add("shake");
    }
}

document.getElementById("resetBtn").addEventListener("click", () => transform([], null));

buildCatalog();
buildMetrics();
transform([], null);
