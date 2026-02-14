const contenedor = document.getElementById("catalogo");

productos.forEach(p => {
  contenedor.innerHTML += `
    <div class="card">
      <img src="${p.imagen}">
      <h3>${p.nombre}</h3>
      <p class="precio">${p.precio}</p>
      <p>${p.descripcion}</p>
    </div>
  `;
});
