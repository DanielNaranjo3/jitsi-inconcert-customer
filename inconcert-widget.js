// ─────────────────────────────────────────────────────────────────────
// Widget de videollamadas para InConcert (Coopealianza).
// Este archivo vive dentro de la configuración de InConcert (solo JS).
// Pégalo completo reemplazando el script actual.
// ─────────────────────────────────────────────────────────────────────

// El contenedor + iframe se crean UNA sola vez, apenas carga este script
// (no cuando el agente da clic en ENTRAR). Así el iframe queda escuchando
// el socket del backend desde el inicio y puede avisar cuando llega un
// cliente, sin importar si el agente aún no ha abierto la ventana.
let contenedor = null;
let iframeJitsi = null;
let minimizado = false;
let maximizado = false;
let alturaAntes = '';
let estadoAntes = {};

function crearContenedorJitsi() {
  if (contenedor) return;

  contenedor = document.createElement('div');
  contenedor.id = 'jitsi-box';
  contenedor.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 700px;
        height: 500px;
        z-index: 9999;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 24px rgba(0,0,0,0.5);
        background: #000;
        resize: both;
        min-width: 320px;
        min-height: 240px;
        display: none;
    `;

  // ─── BARRA SUPERIOR (drag + botones) ───
  const barra = document.createElement('div');
  barra.style.cssText = `
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 36px;
        background: rgba(0,0,0,0.75);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 10px;
        cursor: move;
        z-index: 10001;
        user-select: none;
        border-radius: 12px 12px 0 0;
    `;

  const titulo = document.createElement('span');
  titulo.innerText = ' Sala Reunión';
  titulo.style.cssText = 'color: #fff; font-size: 13px;';

  const controles = document.createElement('div');
  controles.style.cssText = 'display: flex; gap: 8px;';

  const btnMin = document.createElement('button');
  btnMin.innerText = '─';
  btnMin.title = 'Minimizar';
  btnMin.style.cssText = `
        background: #f0a500; color: #000; border: none;
        border-radius: 4px; padding: 2px 8px;
        cursor: pointer; font-size: 13px; font-weight: bold;
    `;

  const btnMax = document.createElement('button');
  btnMax.innerText = '□';
  btnMax.title = 'Maximizar';
  btnMax.style.cssText = `
        background: #28a745; color: #fff; border: none;
        border-radius: 4px; padding: 2px 8px;
        cursor: pointer; font-size: 13px;
    `;

  const btnCerrar = document.createElement('button');
  btnCerrar.innerText = '✕';
  btnCerrar.title = 'Ocultar';
  btnCerrar.style.cssText = `
        background: #dc3545; color: #fff; border: none;
        border-radius: 4px; padding: 2px 8px;
        cursor: pointer; font-size: 13px; font-weight: bold;
    `;

  controles.appendChild(btnMin);
  controles.appendChild(btnMax);
  controles.appendChild(btnCerrar);
  barra.appendChild(titulo);
  barra.appendChild(controles);

  // ─── IFRAME ───
  iframeJitsi = document.createElement('iframe');
  iframeJitsi.src = "https://danielnaranjo3.github.io/jitsi-inconcert-customer/"; // ← tu URL
  iframeJitsi.style.cssText = `
        position: absolute;
        top: 36px; left: 0;
        width: 100%;
        height: calc(100% - 36px);
        border: none;
    `;
  iframeJitsi.allow = "camera; microphone; display-capture; fullscreen";

  contenedor.appendChild(barra);
  contenedor.appendChild(iframeJitsi);
  document.body.appendChild(contenedor);

  // ─── OCULTAR (antes "cerrar" destruía el iframe; ahora solo se oculta,
  // para no perder la conexión de socket que detecta al próximo cliente) ───
  btnCerrar.onclick = function () {
    contenedor.style.display = 'none';
  };

  // ─── MINIMIZAR ───
  btnMin.onclick = function () {
    if (!minimizado) {
      alturaAntes = contenedor.style.height;
      contenedor.style.height = '36px';
      contenedor.style.overflow = 'hidden';
      iframeJitsi.style.display = 'none';
      minimizado = true;
      btnMin.innerText = '▲';
    } else {
      contenedor.style.height = alturaAntes;
      contenedor.style.overflow = 'hidden';
      iframeJitsi.style.display = 'block';
      minimizado = false;
      btnMin.innerText = '─';
    }
  };

  // ─── MAXIMIZAR ───
  btnMax.onclick = function () {
    if (!maximizado) {
      estadoAntes = {
        width: contenedor.style.width,
        height: contenedor.style.height,
        top: contenedor.style.top,
        left: contenedor.style.left,
        bottom: contenedor.style.bottom,
        right: contenedor.style.right,
        borderRadius: contenedor.style.borderRadius
      };
      contenedor.style.width = '100vw';
      contenedor.style.height = '100vh';
      contenedor.style.top = '0';
      contenedor.style.left = '0';
      contenedor.style.bottom = 'auto';
      contenedor.style.right = 'auto';
      contenedor.style.borderRadius = '0';
      maximizado = true;
      btnMax.innerText = '❐';
    } else {
      Object.assign(contenedor.style, estadoAntes);
      maximizado = false;
      btnMax.innerText = '□';
    }
  };

  // ─── DRAG (mover) ───
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  barra.addEventListener('mousedown', function (e) {
    if (maximizado) return;
    isDragging = true;
    offsetX = e.clientX - contenedor.getBoundingClientRect().left;
    offsetY = e.clientY - contenedor.getBoundingClientRect().top;
    contenedor.style.bottom = 'auto';
    contenedor.style.right = 'auto';
  });

  document.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    contenedor.style.left = (e.clientX - offsetX) + 'px';
    contenedor.style.top = (e.clientY - offsetY) + 'px';
  });

  document.addEventListener('mouseup', function () {
    isDragging = false;
  });
}

crearContenedorJitsi();

// ─── AVISO DE CLIENTES EN ESPERA ───────────────────────────────────────
// No se crea ningún elemento visual nuevo aquí: se usa el campo de texto
// "clientesEsperando" creado en el diseñador de InConcert (mismo patrón
// que nombreCompleto / email / razonContacto) y se le hace setText().
function actualizarContadorEspera(total) {
  if (typeof clientesEsperando === 'undefined') return;
  clientesEsperando.setText(total > 0 ? `${total} cliente(s) esperando` : '');
}

// ─── BOTÓN ENTRAR: siempre la misma forma de entrar del agente ───────
// Muestra el contenedor (ya existente, ya conectado) y le pide al iframe
// que se una ahora mismo a la sala del cliente más antiguo en espera.
if (typeof btnEntrar !== 'undefined') {
  btnEntrar.onClick(function () {
    contenedor.style.display = 'block';

    if (iframeJitsi && iframeJitsi.contentWindow) {
      iframeJitsi.contentWindow.postMessage({ tipo: 'unirseAhora' }, '*');
    }
  });
}

// ─── RECIBIR DATOS DE JITSI E INCONCERT ──────────────────────────────

window.addEventListener('message', function (event) {
  const data = event.data;
  if (!data || !data.tipo) return;

  // ── Aviso de que hay un cliente esperando (llega apenas se crea la
  // reunión, sin que el agente haya dado clic en ENTRAR todavía) ──
  if (data.tipo === 'clienteEsperando') {
    const datos = data.datosInvisibles;

    console.log('%c ── Cliente esperando ──', 'color: #ff9900; font-weight: bold;');
    console.log('%c  ► id:             ', 'color: #ff9900;', datos.id);
    console.log('%c  ► nombreUsuario:  ', 'color: #ff9900;', datos.nombreUsuario);
    console.log('%c  ► correo:         ', 'color: #ff9900;', datos.correo);
    console.log('%c  ► motivoContacto: ', 'color: #ff9900;', datos.motivoContacto);

    var idIngreso = datos.id;
    var nombre = datos.nombreUsuario;
    var correo = datos.correo;
    var motivoContacto = datos.motivoContacto;

    nombreCompleto.setText(nombre);
    email.setText(correo);
    razonContacto.setText(motivoContacto);

    window._reunionActual = { id: idIngreso };
    console.log("idIngreso", idIngreso);

    horaInicio.setText("");
    horaFin.setText("");
    duracion.setText("");

    actualizarContadorEspera(data.totalEnCola || 1);
  }

  // ── El iframe avisa cuántos quedan en cola después de que el agente
  // atendió a uno (dio clic en ENTRAR) ──
  if (data.tipo === 'colaActualizada') {
    actualizarContadorEspera(data.totalEnCola || 0);
  }

  // ── La videollamada del agente terminó: dejamos todo listo para el
  // próximo cliente sin recrear el iframe (el socket sigue escuchando) ──
  if (data.tipo === 'llamadaFinalizada') {
    contenedor.style.display = 'none';
    minimizado = false;
    maximizado = false;
  }

  // ── Eventos de participantes de Jitsi ──
  if (data.tipo === 'participanteEntro') {
    console.log('%c Entró: ' + data.nombre + ' a las ' + data.hora, 'color: #00ff00;');
    horaInicio.setText(data.hora);
    window._jitsiEntrada = data.timestamp;
  }

  if (data.tipo === 'participanteSalio') {
    console.log('%c Salió: ' + data.nombre + ' a las ' + data.hora, 'color: #ff5252;');
    horaFin.setText(data.hora);

    if (window._jitsiEntrada) {
      const diffMs = data.timestamp - window._jitsiEntrada;
      const diffMin = Math.floor(diffMs / 60000);
      const diffSeg = Math.floor((diffMs % 60000) / 1000);
      const duracionStr = `${diffMin}m ${diffSeg}s`;

      duracion.setText(duracionStr);

      console.log('%c Duración: ' + duracionStr, 'color: #ff9900;');
      window._jitsiEntrada = null;
    }
  }
});

// ─── VARIABLES GLOBALES ───────────────────────────────────────────────
window._reunionActual = null;

// ─── MANEJADOR DEL BOTÓN GUARDAR (Bypass CSP vía Iframe) ─────────────
if (typeof btnGuardar !== 'undefined') {
  btnGuardar.onClick(function () {
    const id = window._reunionActual ? window._reunionActual.id : null;

    if (!id) {
      console.error('No hay un ID de reunión activo para guardar.');
      return;
    }

    const payload = {
      id: id,
      inicioReunion: horaInicio.getText(),
      finReunion: horaFin.getText(),
      duracionReunion: duracion.getText(),
      motivoContacto: razonContacto.getText()
    };

    if (iframeJitsi && iframeJitsi.contentWindow) {
      console.log(`Transfiriendo datos al iframe de GitHub para PATCH (ID ${id}):`, payload);

      iframeJitsi.contentWindow.postMessage({
        tipo: 'ejecutarPatchAzure',
        datos: payload
      }, '*');

      console.log(`%c Datos enviados con éxito al iframe para el ID ${id}. Esperando procesamiento...`, 'color: #28a745; font-weight: bold;');
    } else {
      console.error('Error: El iframe de Jitsi no está disponible.');
    }
  });
}
