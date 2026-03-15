const WHATSAPP_NUMBER = "5213921589515"; // TU NÚMERO

const modal = document.getElementById("modal");
const modalImg = document.getElementById("modal-img");
const closeBtn = document.querySelector(".close");

/* ===== MODAL ===== */
function abrirModal(src) {
  modalImg.src = src;
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function cerrarModal() {
  modal.classList.add("hidden");
  document.body.style.overflow = "auto";
}

closeBtn.addEventListener("click", cerrarModal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) cerrarModal();
});

/* ===== WHATSAPP ===== */
function crearLinkWhatsApp(mensaje) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
}

/* ===== HOME INTERIORS ===== */
function renderProductos(lista, contenedorId) {
  const contenedor = document.getElementById(contenedorId);

  lista.forEach(p => {
    const mensaje = `Hola, me interesa este producto:\n\n${p.nombre}`;

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}">
      <h3>${p.nombre}</h3>
      <a 
        href="${crearLinkWhatsApp(mensaje)}"
        target="_blank"
        class="btn-whatsapp"
      >
        📞 WhatsApp
      </a>
    `;

    card.addEventListener("click", () => abrirModal(p.imagen));

    // Evitar que el click del botón abra el modal
    card.querySelector(".btn-whatsapp")
      .addEventListener("click", e => e.stopPropagation());

    contenedor.appendChild(card);
  });
}

/* ===== ZAPATOS ===== */
function renderZapatos(lista, contenedorId) {
  const contenedor = document.getElementById(contenedorId);

  lista.forEach(p => {
    const mensaje = `Hola, me interesa este zapato:\n
Modelo: ${p.nombre}
Talla: ${p.talla}
Color: ${p.color}
Precio: ${p.precio}`;

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}">
      <h3>${p.nombre}</h3>
      <p>Talla: ${p.talla}</p>
      <p class="color">${p.color}</p>
      <p class="precio">${p.precio}</p>
      <a 
        href="${crearLinkWhatsApp(mensaje)}"
        target="_blank"
        class="btn-whatsapp"
      >
        📞 WhatsApp
      </a>
    `;

    card.addEventListener("click", () => abrirModal(p.imagen));

    card.querySelector(".btn-whatsapp")
      .addEventListener("click", e => e.stopPropagation());

    contenedor.appendChild(card);
  });
}

/* ===== PANTALONES ===== */
function renderPantalones(lista, contenedorId) {
  const contenedor = document.getElementById(contenedorId);

  lista.forEach(p => {
    const mensaje = `Hola, me interesa este pantalón:\n
Modelo: ${p.nombre}
Talla: ${p.talla}
Color: ${p.color}
Precio: ${p.precio}`;

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}">
      <h3>${p.nombre}</h3>
      <p>Talla: ${p.talla}</p>
      <p class="color">${p.color}</p>
      <p class="precio">${p.precio}</p>
      <a 
        href="${crearLinkWhatsApp(mensaje)}"
        target="_blank"
        class="btn-whatsapp"
      >
        📞 WhatsApp
      </a>
    `;

    card.addEventListener("click", () => abrirModal(p.imagen));

    card.querySelector(".btn-whatsapp")
      .addEventListener("click", e => e.stopPropagation());

    contenedor.appendChild(card);
  });
}

renderProductos(catalogo.homeInteriors, "home-interiors");
renderZapatos(catalogo.zapatos, "zapatos");
renderPantalones(catalogo.pantalones, "pantalones");
