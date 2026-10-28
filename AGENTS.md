# AGENTS.md

Clon de Asteroids en canvas HTML5 puro. No hay gestor de paquetes, bundler, build, lint ni tests — no busques scripts de npm; no existen.

## Ejecutar y verificar

- Abre `index.html` en el navegador, o usa `npx serve .` y visita `http://localhost:3000` (según el README).
- No hay servidor de desarrollo ni watch: recarga la página después de editar.
- No hay tests automatizados. Verifica los cambios jugando; no afirmes que una suite de tests pasó.

## Estructura

- `index.html` — canvas fijo de 800x600 más CSS inline; carga `game.js` como script clásico (no como módulo ES).
- `game.js` — todo el juego: clases de entidades, entrada, estado, update/draw y el bucle `requestAnimationFrame`. Está organizado con banners `// ── Sección ──`; coloca el código nuevo en la sección correspondiente.
- `favicon.svg` — solo el icono; no hay otros assets.

## Trampas y detalles

- El tamaño del canvas está duplicado: `width`/`height` en `index.html` deben mantenerse sincronizados con `W`/`H` en `game.js`.
- Todo vive en el ámbito del script como globales (`ship`, `bullets`, `asteroids`, `particles`, `state`, ...); no hay módulos ni exports. El estado se reinicia con `initGame()`.
- La entrada tiene dos modos: `keys[code]` es estado mantenido y `pressed(code)` es de un solo disparo y limpia su flag. Usa `pressed` para acciones (disparar, reiniciar tras game over) y `keys` para controles continuos. `Space` hace ambas cosas: disparar y reiniciar.
- El mundo es toroidal: toda entidad en movimiento usa `wrap(v, W|H)` en ambos ejes. Las partículas intencionalmente no hacen wrap. Cualquier entidad móvil nueva debe hacer wrap.
- El tamaño de asteroide 1–3 indexa los arrays paralelos `RADII`, `SPEEDS` y `POINTS`; `split()` decrementa el tamaño. Si agregas tamaños, cambia los tres arrays a la vez.
- La colisión es solo por distancia entre centros (nave vs asteroide usa `0.82 * asteroid.radius`); no hay colisiones de polígonos.
- `state` es `'playing' | 'dead' | 'gameover'` y condiciona tanto `update()` como `draw()`; el comportamiento nuevo debe contemplar cada estado (por ejemplo, en game over se congelan nave y asteroides, pero las partículas siguen animándose).
- Los textos visibles para el jugador, las etiquetas del HUD y los comentarios están en español; mantén ese idioma en los nuevos (y en el README).
- El bucle limita `dt` a 0.05 s, así que la física es independiente del framerate pero los saltos largos de frame se recortan. No existe manejo de pausa.
