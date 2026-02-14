const WHATSAPP_NUMBER = "5213921589515"; // TU NÚMERO

const modal = document.getElementById("modal");
const modalImg = document.getElementById("modal-img");
const closeBtn = document.querySelector(".close");

function abrirModal(src) {
  modalImg.src = src;
  modal.classList.remove("hidden");
}

closeBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});

function crearLinkWhatsApp(mensaje) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
}

/* HOME INTERIORS */
function renderProductos(lista, contenedorId) {
  const contenedor = document.getElementById(contenedorId);

  lista.forEach(p => {
    const mensaje = `Hola, me interesa este producto:\n\n${p.nombre}\nPrecio: ${p.precio}`;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}">
      <h3>${p.nombre}</h3>
      <p class="precio">${p.precio}</p>
      <a 
        href="${crearLinkWhatsApp(mensaje)}"
        target="_blank"
        class="btn-whatsapp"
        onclick="event.stopPropagation()"
      >
        📞​ WhatsApp
      </a>
    `;

    card.addEventListener("click", () => abrirModal(p.imagen));
    contenedor.appendChild(card);
  });
}

/* ZAPATOS */
function renderZapatos(lista, contenedorId) {
  const contenedor = document.getElementById(contenedorId);

  lista.forEach(p => {
    const mensaje = `Hola, me interesa este zapato:\n\nModelo: ${p.nombre}\nTalla: ${p.talla}\nColor: ${p.color}\nPrecio: ${p.precio}`;

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
        onclick="event.stopPropagation()"
      >
        📞​ WhatsApp
      </a>
    `;

    card.addEventListener("click", () => abrirModal(p.imagen));
    contenedor.appendChild(card);
  });
}

renderProductos(catalogo.homeInteriors, "home-interiors");
renderZapatos(catalogo.zapatos, "zapatos");
