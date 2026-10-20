const $ = id => document.getElementById(id);
let productos = [];
let marcaActiva = "Todos";
let categoriaActiva = "";
const PASO = 40; // productos que se muestran por tanda
let visibles = PASO;
let soloFavs = false;
let favs = [];
try { favs = JSON.parse(localStorage.getItem("favs") || "[]"); } catch {}

/* ===== CSV (soporta comillas y comas dentro de texto) ===== */
function parseCSV(texto) {
  const filas = []; let fila = [], campo = "", comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') comillas = false;
      else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === ",") { fila.push(campo); campo = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      fila.push(campo); filas.push(fila); fila = []; campo = "";
    } else campo += c;
  }
  if (campo || fila.length) { fila.push(campo); filas.push(fila); }
  const [enc, ...datos] = filas;
  const cols = enc.map(h => h.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
  return datos.filter(f => f.some(x => x.trim())).map(f =>
    Object.fromEntries(cols.map((c, i) => [c, (f[i] || "").trim()])));
}

/* ===== Datos ===== */
async function cargar() {
  try {
    const r = await fetch(SHEET_CSV_URL + (SHEET_CSV_URL.includes("?") ? "&" : "?") + "t=" + Date.now());
    if (!r.ok) throw new Error();
    productos = parseCSV(await r.text()).filter(p => p.id && p.nombre).map(p => {
      const cant = p.cantidad === "" ? 1 : parseInt(p.cantidad, 10) || 0;
      return { ...p, cantidad: cant, precioNum: parseFloat(p.precio) || null,
               vendido: p.estado.toLowerCase() === "vendido" || cant <= 0 };
    });
    $("estado").classList.add("hidden");
    crearBotones(); render(); pintarCarrito();
  } catch {
    $("estado").textContent = "No se pudo cargar el catálogo. Intenta de nuevo en un momento.";
  }
}

/* ===== Botones de marca ===== */
function crearBotones() {
  const marcas = ["Todos", ...MARCAS.filter(m => productos.some(p => p.marca === m))];
  $("marcas").innerHTML = marcas.map(m =>
    `<button data-m="${m}" class="${m === marcaActiva ? "activo" : ""}">${m}</button>`).join("");
  $("marcas").onclick = e => {
    if (!e.target.dataset.m) return;
    marcaActiva = e.target.dataset.m;
    document.querySelectorAll("#marcas button").forEach(b => b.classList.toggle("activo", b === e.target));
    actualizarTallas(); crearCategorias(); render();
  };
}

function actualizarTallas() {
  const conTalla = productos.filter(p => p.talla && (marcaActiva === "Todos" || p.marca === marcaActiva));
  const esRopa = ["Ropa", "Calzado"].includes(marcaActiva);
  $("talla").classList.toggle("hidden", !esRopa);
  const tallas = [...new Set(conTalla.map(p => p.talla))].sort((a, b) => parseFloat(a) - parseFloat(b));
  $("talla").innerHTML = `<option value="">Todas las tallas</option>` +
    tallas.map(t => `<option>${t}</option>`).join("");
}

/* ===== Render ===== */
const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function linkWA(p) {
  const msg = `Hola, me interesa este producto:\n\n${p.nombre}\nID: ${p.id}` +
    (p.talla ? `\nTalla: ${p.talla}` : "") + (p.color ? `\nColor: ${p.color}` : "") +
    (p.precioNum ? `\nPrecio: $${p.precioNum}` : "");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function render(mantener) {
  if (mantener !== true) visibles = PASO; // al cambiar un filtro se vuelve a la primera tanda
  const q = $("buscar").value.trim().toLowerCase();
  const talla = $("talla").value, orden = $("orden").value;
  const pmin = parseFloat($("pmin").value) || 0, pmax = parseFloat($("pmax").value) || 0;
  let lista = productos.filter(p =>
    (marcaActiva === "Todos" || p.marca === marcaActiva) &&
    (!talla || p.talla === talla) &&
    (!categoriaActiva || p.categoria === categoriaActiva) &&
    (!soloFavs || favs.includes(p.id)) &&
    (!pmin || (p.precioNum && p.precioNum >= pmin)) &&
    (!pmax || (p.precioNum && p.precioNum <= pmax)) &&
    (!q || `${p.nombre} ${p.id} ${p.descripcion} ${p.categoria} ${p.color}`.toLowerCase().includes(q)));
  lista.sort((a, b) => a.vendido - b.vendido ||
    (orden === "asc" ? (a.precioNum || 0) - (b.precioNum || 0) :
     orden === "desc" ? (b.precioNum || 0) - (a.precioNum || 0) : 0));

  const total = lista.length;
  $("grid").innerHTML = lista.slice(0, visibles).map(p => `
    <article class="card ${p.vendido ? "vendido" : ""}" data-foto="images/${esc(p.foto)}">
      <div class="foto">
        <img loading="lazy" decoding="async" src="images/${esc(p.foto)}" alt="${esc(p.nombre)}">
        ${p.vendido ? '<span class="sello">VENDIDO</span>' : ""}
        <button class="fav ${favs.includes(p.id) ? "on" : ""}" data-fav="${esc(p.id)}" aria-label="Favorito">${favs.includes(p.id) ? "♥" : "♡"}</button>
      </div>
      <h3>${esc(p.nombre)}</h3>
      ${p.descripcion ? `<p class="desc">${esc(p.descripcion)}</p>` : ""}
      ${p.talla ? `<p>Talla: ${esc(p.talla)}${p.color ? " · " + esc(p.color) : ""}</p>` : ""}
      <p class="precio">${p.precioNum ? "$" + p.precioNum : "Consultar precio"}</p>
      ${!p.vendido && p.cantidad > 1 ? `<p class="quedan">Quedan ${p.cantidad}</p>` : ""}
      ${p.vendido ? "" : `<button class="btn-agregar" data-id="${esc(p.id)}">Agregar al pedido</button><br><a class="btn-whatsapp" target="_blank" rel="noopener" href="${linkWA(p)}">Preguntar</a>`}
    </article>`).join("") || '<p class="aviso">No hay productos con esos filtros.</p>';
  $("mas").classList.toggle("hidden", total <= visibles);
  $("btn-mas").textContent = `Ver más productos (${total - visibles} restantes)`;
}

/* ===== Eventos ===== */
$("buscar").addEventListener("input", render);
$("talla").addEventListener("change", render);
$("orden").addEventListener("change", render);
$("btn-mas").addEventListener("click", () => { visibles += PASO; render(true); });
$("pmin").addEventListener("input", render);
$("pmax").addEventListener("input", render);
$("wa-float").href = `https://wa.me/${WHATSAPP_NUMBER}`;

$("grid").addEventListener("click", e => {
  const fav = e.target.closest(".fav");
  if (fav) { toggleFav(fav.dataset.fav); return; }
  const add = e.target.closest(".btn-agregar");
  if (add) { if (agregar(add.dataset.id)) { add.textContent = "✓ Agregado"; setTimeout(() => add.textContent = "Agregar al pedido", 1200); } return; }
  if (e.target.closest(".btn-whatsapp")) return;
  const card = e.target.closest(".card");
  if (card) { $("modal-img").src = card.dataset.foto; $("modal").classList.remove("hidden"); document.body.style.overflow = "hidden"; }
});
const cerrar = () => { $("modal").classList.add("hidden"); document.body.style.overflow = ""; };
$("modal").addEventListener("click", cerrar);
document.addEventListener("keydown", e => e.key === "Escape" && cerrar());

/* ===== CATEGORÍAS ===== */
function crearCategorias() {
  const cats = [...new Set(productos.filter(p => marcaActiva !== "Todos" && p.marca === marcaActiva && p.categoria)
    .map(p => p.categoria))].sort();
  categoriaActiva = "";
  $("cats").classList.toggle("hidden", cats.length < 2);
  $("cats").innerHTML = ["Todas", ...cats].map(c =>
    `<button data-c="${esc(c)}" class="${c === "Todas" ? "activo" : ""}">${esc(c)}</button>`).join("");
}
$("cats").addEventListener("click", e => {
  const c = e.target.dataset.c;
  if (!c) return;
  categoriaActiva = c === "Todas" ? "" : c;
  document.querySelectorAll("#cats button").forEach(b => b.classList.toggle("activo", b === e.target));
  render();
});

/* ===== FAVORITOS ===== */
function contarFavs() {
  $("cuenta-fav").textContent = favs.length;
  $("cuenta-fav").classList.toggle("hidden", !favs.length);
}
function toggleFav(id) {
  favs = favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id];
  try { localStorage.setItem("favs", JSON.stringify(favs)); } catch {}
  contarFavs();
  if (soloFavs) return render(true);
  const b = document.querySelector(`.fav[data-fav="${CSS.escape(id)}"]`);
  if (b) { b.classList.toggle("on", favs.includes(id)); b.textContent = favs.includes(id) ? "♥" : "♡"; }
}
$("btn-fav").addEventListener("click", () => {
  soloFavs = !soloFavs;
  $("btn-fav").classList.toggle("activo", soloFavs);
  render();
});
contarFavs();

/* ===== HEADER: se oculta al bajar, aparece al subir ===== */
let ultimoY = 0;
addEventListener("scroll", () => {
  const y = scrollY, h = document.querySelector("header");
  if (Math.abs(y - ultimoY) < 8) return;
  h.classList.toggle("oculto", y > ultimoY && y > 120 && document.activeElement !== $("buscar"));
  ultimoY = y;
}, { passive: true });

/* ===== CARRITO ===== */
const MIN_CARRITO = 30; // minutos que se conserva el pedido sin cambios
let carrito = {};
let ts = 0;
try { ts = +localStorage.getItem("carritoTs") || 0; } catch {}
const tocar = () => { ts = Date.now(); try { localStorage.setItem("carritoTs", ts); } catch {} };
try { carrito = JSON.parse(localStorage.getItem("carrito") || "{}"); } catch {}
const guardar = () => { try { localStorage.setItem("carrito", JSON.stringify(carrito)); } catch {} };
const dinero = n => "$" + n.toLocaleString("es-MX");

function agregar(id) {
  const p = productos.find(x => x.id === id);
  if (!p || p.vendido) return false;
  const n = (carrito[id] || 0) + 1;
  if (n > p.cantidad) { alert(`Solo hay ${p.cantidad} pieza(s) disponible(s) de este producto.`); return false; }
  carrito[id] = n; tocar(); guardar(); pintarCarrito(); return true;
}

function pintarCarrito() {
  if (Object.keys(carrito).length && Date.now() - ts > MIN_CARRITO * 60000) carrito = {};
  // Quita productos vendidos o que ya no existen y ajusta cantidades
  Object.keys(carrito).forEach(id => {
    const p = productos.find(x => x.id === id);
    if (!p || p.vendido) delete carrito[id];
    else carrito[id] = Math.min(carrito[id], p.cantidad);
  });
  guardar();
  const items = Object.entries(carrito).map(([id, q]) => ({ p: productos.find(x => x.id === id), q }));
  const piezas = items.reduce((s, i) => s + i.q, 0);
  const total = items.reduce((s, i) => s + (i.p.precioNum || 0) * i.q, 0);
  const sinPrecio = items.filter(i => !i.p.precioNum).length;

  $("cuenta").textContent = piezas;
  $("cuenta").classList.toggle("hidden", !piezas);
  $("items").innerHTML = items.map(({ p, q }) => `
    <div class="item">
      <img src="images/${esc(p.foto)}" alt="">
      <div class="info">
        <strong>${esc(p.nombre)}</strong>
        <small>${p.talla ? "Talla " + esc(p.talla) + " · " : ""}${p.precioNum ? dinero(p.precioNum) + " c/u" : "Precio por confirmar"}</small>
        <div class="cant">
          <button data-acc="menos" data-id="${esc(p.id)}">−</button><span>${q}</span><button data-acc="mas" data-id="${esc(p.id)}">+</button>
          <button class="quitar" data-acc="quitar" data-id="${esc(p.id)}">Quitar</button>
        </div>
      </div>
      <b>${p.precioNum ? dinero(p.precioNum * q) : ""}</b>
    </div>`).join("") || '<p class="aviso">Aún no has agregado productos.</p>';

  $("total").textContent = dinero(total);
  $("nota").textContent = (sinPrecio ? `${sinPrecio} producto(s) sin precio: se confirmará por WhatsApp. ` : "") +
    (piezas ? `Tu pedido se conserva ${MIN_CARRITO} min sin cambios.` : "");
  $("enviar").classList.toggle("deshabilitado", !piezas);
  $("vaciar").classList.toggle("hidden", !piezas);

  const lineas = items.map(({ p, q }) =>
    `• ${q} x ${p.nombre} (ID: ${p.id}${p.talla ? ", talla " + p.talla : ""})` +
    (p.precioNum ? ` - ${dinero(p.precioNum * q)}` : " - precio por confirmar")).join("\n");
  const msg = `Hola, quiero hacer este pedido:\n\n${lineas}\n\nTotal: ${dinero(total)}` +
    (sinPrecio ? " (más productos por confirmar precio)" : "");
  $("enviar").href = piezas ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}` : "#";
}

const abrirCarrito = v => { $("carrito").classList.toggle("hidden", !v); document.body.style.overflow = v ? "hidden" : ""; };
$("btn-carrito").addEventListener("click", () => abrirCarrito(true));
$("cerrar-carrito").addEventListener("click", () => abrirCarrito(false));
$("carrito").addEventListener("click", e => { if (e.target === $("carrito")) abrirCarrito(false); });
$("vaciar").addEventListener("click", () => { carrito = {}; pintarCarrito(); });
$("enviar").addEventListener("click", e => { if (e.target.classList.contains("deshabilitado")) e.preventDefault(); });
$("items").addEventListener("click", e => {
  const { acc, id } = e.target.dataset;
  if (!acc) return;
  tocar();
  if (acc === "mas") agregar(id);
  else if (acc === "menos") { carrito[id] = (carrito[id] || 1) - 1; if (carrito[id] <= 0) delete carrito[id]; }
  else delete carrito[id];
  pintarCarrito();
});

setInterval(() => productos.length && pintarCarrito(), 30000);
cargar();