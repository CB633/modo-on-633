# MODO ON 633 · Activá tus metas. Subí de nivel.

App web de organización escolar para estudiantes de secundaria. Sin cuentas, sin contraseñas, sin servidores:
los datos se guardan en el navegador de cada estudiante (localStorage) y se pueden respaldar en un archivo JSON.

## Archivos
- `index.html`  → estructura de la página
- `style.css`   → diseño (colores en las variables de `:root`)
- `app.js`      → toda la lógica (materias, notas, actividades, recordatorios, XP, copias)
- `manifest.webmanifest`, `sw.js`, `icon*.png/svg` → listos para instalar como PWA (opcional)

## Probarla en tu computadora
Abrí `index.html` con doble clic (Chrome o Edge). No necesita instalar nada.

## Publicarla gratis (GitHub Pages)
1. Creá una cuenta en https://github.com y un repositorio **público** nuevo (ej.: `modo-on-633`).
2. "Add file → Upload files": subí **todos** los archivos de esta carpeta (no la carpeta, sus archivos). "Commit changes".
3. "Settings → Pages → Build and deployment": Source = *Deploy from a branch*, Branch = `main` / `(root)` → Save.
4. En 1 o 2 minutos aparece el enlace: `https://TU-USUARIO.github.io/modo-on-633/`
5. QR: abrí el enlace en Chrome (computadora) → ícono de compartir de la barra de direcciones → "Crear código QR" → descargar.

## Modificarla
- Materias frecuentes: constante `FREQ` en `app.js`.
- Colores: variables `--v --b --c --f` en `style.css`.
- Avatares: función `avatar()` y listas `PAL`, `HEADS`, `AV_NAMES` en `app.js`.
- Puntos de XP: función `xp()` y llamadas `xp('tipo', puntos, tope diario)`.
- Si cambiás los archivos y la app "no se actualiza", subí de versión `CACHE` en `sw.js` (ej.: `modoon633-v2`).

## Privacidad
No hay cuentas, analíticas ni envío de datos. Todo vive en el celular del estudiante.
Si se borra el navegador o se cambia de celular, los datos se recuperan con "Recuperar mis datos" y una copia previa.
