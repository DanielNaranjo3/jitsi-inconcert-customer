if (typeof btnEntrar !== 'undefined') {
    btnEntrar.onClick(function () {

        if (document.getElementById('jitsi-box')) return;

        const contenedor = document.createElement('div');
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

        // Botón minimizar
        const btnMin = document.createElement('button');
        btnMin.innerText = '─';
        btnMin.title = 'Minimizar';
        btnMin.style.cssText = `
            background: #f0a500; color: #000; border: none;
            border-radius: 4px; padding: 2px 8px;
            cursor: pointer; font-size: 13px; font-weight: bold;
        `;

        // Botón maximizar
        const btnMax = document.createElement('button');
        btnMax.innerText = '□';
        btnMax.title = 'Maximizar';
        btnMax.style.cssText = `
            background: #28a745; color: #fff; border: none;
            border-radius: 4px; padding: 2px 8px;
            cursor: pointer; font-size: 13px;
        `;

        // Botón cerrar
        const btnCerrar = document.createElement('button');
        btnCerrar.innerText = '✕';
        btnCerrar.title = 'Cerrar';
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
        const iframe = document.createElement('iframe');
        iframe.src = "https://danielnaranjo3.github.io/jitsi-inconcert-customer/original/"; // ← versión original
        iframe.style.cssText = `
            position: absolute;
            top: 36px; left: 0;
            width: 100%;
            height: calc(100% - 36px);
            border: none;
        `;
        iframe.allow = "camera; microphone; display-capture; fullscreen";

        contenedor.appendChild(barra);
        contenedor.appendChild(iframe);
        document.body.appendChild(contenedor);

        // ─── CERRAR ───
        btnCerrar.onclick = function () {
            document.body.removeChild(contenedor);
        };

        // ─── MINIMIZAR ───
        let minimizado = false;
        let alturaAntes = contenedor.style.height;
        btnMin.onclick = function () {
            if (!minimizado) {
                alturaAntes = contenedor.style.height;
                contenedor.style.height = '36px';
                contenedor.style.overflow = 'hidden';
                iframe.style.display = 'none';
                minimizado = true;
                btnMin.innerText = '▲';
            } else {
                contenedor.style.height = alturaAntes;
                contenedor.style.overflow = 'hidden';
                iframe.style.display = 'block';
                minimizado = false;
                btnMin.innerText = '─';
            }
        };

        // ─── MAXIMIZAR ───
        let maximizado = false;
        let estadoAntes = {};
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
    });
}

// ─── RECIBIR DATOS DE JITSI E INCONCERT ──────────────────────────────

window.addEventListener('message', function (event) {
    const data = event.data;
    if (!data || !data.tipo) return;

    // ── Datos del cliente enviados desde el HTML via WebSocket ──
    if (data.tipo === 'datosReunionEntrante') {
        const datos = data.datosInvisibles;

        // Log del mensaje completo recibido del iframe
        console.log('%c ── Mensaje recibido del HTML ──', 'color: #00bfff; font-weight: bold;');
        console.log('%c  ► Mensaje completo:', 'color: #00bfff;', data);
        console.log('%c  ► id:             ', 'color: #00bfff;', datos.id);
        console.log('%c  ► nombreUsuario:  ', 'color: #00bfff;', datos.nombreUsuario);
        console.log('%c  ► correo:         ', 'color: #00bfff;', datos.correo);
        console.log('%c  ► motivoContacto: ', 'color: #00bfff;', datos.motivoContacto);

        // Pintar la información directamente en los inputs usando sus nombres correctos en InConcert
        var idIngreso = datos.id;
        var nombre = datos.nombreUsuario;
        var correo = datos.correo;
        var motivoContacto = datos.motivoContacto;

        nombreCompleto.setText(nombre);
        email.setText(correo);
        razonContacto.setText(motivoContacto);

        // Guardar id de reunión para el PATCH posterior
        window._reunionActual = { id: idIngreso };
        console.log("idIngreso", idIngreso);

        // Limpiar los campos de tiempo de la reunión anterior al recibir una nueva
        horaInicio.setText("");
        horaFin.setText("");
        duracion.setText("");
        idIngreso = null;
    }

    // ── Eventos de participantes de Jitsi ──
    if (data.tipo === 'participanteEntro') {
        console.log('%c Entró: ' + data.nombre + ' a las ' + data.hora, 'color: #00ff00;');

        horaInicio.setText(data.hora);

        // Guardar timestamp para calcular duración
        window._jitsiEntrada = data.timestamp;
    }

    if (data.tipo === 'participanteSalio') {
        console.log('%c Salió: ' + data.nombre + ' a las ' + data.hora, 'color: #ff5252;');

        horaFin.setText(data.hora);

        // Calcular duración
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
//const API_BASE_URL = "https://webinar-customertouch.azurewebsites.net/api/reuniones/";

// NOTA: El socket vive en el iframe (index.html).
// Los datos del cliente llegan a indice.js vía postMessage (tipo: 'datosReunionEntrante').


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

        const iframeJitsi = document.getElementById('jitsi-box')?.querySelector('iframe');

        if (iframeJitsi && iframeJitsi.contentWindow) {
            console.log(`Transfiriendo datos al iframe de GitHub para PATCH (ID ${id}):`, payload);

            // Enviamos los datos al origen de GitHub Pages
            iframeJitsi.contentWindow.postMessage({
                tipo: 'ejecutarPatchAzure',
                datos: payload
            }, '*');

            // ─── ¡AQUÍ COLOCAS EL CONSOLE LOG DE VERIFICACIÓN! ───
            console.log(`%c Datos enviados con éxito al iframe para el ID ${id}. Esperando procesamiento...`, 'color: #28a745; font-weight: bold;');

        } else {
            console.error('Error: El iframe de Jitsi no está abierto o disponible en pantalla.');
        }
    });
}
