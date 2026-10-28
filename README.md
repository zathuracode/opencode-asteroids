# Asteroids

Clon del clásico arcade **Asteroids** implementado en canvas HTML5 puro, sin dependencias ni bundler.

## Descripción

Nave espacial en un campo de asteroides con envolvimiento de bordes (el espacio es toroidal). Destruye asteroides para sumar puntos: los grandes se parten en medianos, los medianos en pequeños. Incluye power-ups especiales y tipos de asteroides únicos como la estrella fugaz. Un OVNI hostil cruza la pantalla y dispara a la nave; el power-up **Escudo** permite bloquear sus proyectiles.

## Tecnologías

- **HTML5 Canvas** — renderizado 2D
- **JavaScript (ES6+)** — lógica del juego en un solo archivo `game.js`
- Sin frameworks, sin bundler, sin dependencias

## Cómo correr

Abre `index.html` directamente en el navegador (doble clic), o usa un servidor local:

```bash
npx serve .
```

Luego visita `http://localhost:3000`.

## Controles

| Tecla     | Acción               |
| --------- | -------------------- |
| `←` `→`   | Rotar nave           |
| `↑`       | Propulsar            |
| `Espacio` | Disparar             |
| `1`–`5`   | Cambiar skin de nave |

## Puntuación

| Objetivo  | Puntos |
| --------- | ------ |
| Grande    | 20     |
| Mediano   | 50     |
| Pequeño   | 100    |
| OVNI      | 200    |

## Características

- 3 vidas con invencibilidad temporal al reaparecer (parpadeo)
- Asteroides se parten en fragmentos más pequeños al ser destruidos
- Partículas de explosión al destruir asteroides
- Power-up **Velocidad**: duplica la propulsión de la nave durante 5 segundos
- Power-up **Velocidad**: duplica la propulsión de la nave durante 5 segundos
- Power-up **Triple**: dispara 3 balas en abanico durante 5 segundos
- OVNI hostil: aparece cada cierto tiempo, cruza la pantalla y dispara proyectiles rojos apuntando a la nave
- Power-up **Escudo**: burbuja protectora durante 5 segundos que bloquea los proyectiles del OVNI

## Power-ups

| Power-up  | Color | Efecto                                          |
| --------- | ----- | ----------------------------------------------- |
| Velocidad | Cian  | Duplica la propulsión de la nave durante 5 s    |
| Triple    | Verde | Dispara 3 balas en abanico durante 5 s          |
| Escudo    | Menta | Bloquea los proyectiles enemigos durante 5 s    |

- Cada asteroide grande o mediano tiene un 15 % de probabilidad de soltar un power-up.
- El tipo se elige al azar: 40 % Escudo y el resto se reparte entre Velocidad y Triple.
- El ítem flota por la pantalla y desaparece a los 12 s si no se recoge.
- El HUD muestra el tiempo restante de cada efecto con su color.
- Los efectos se acumulan entre sí y se pierden si la nave es destruida.

## Skins

La apariencia de la nave se puede cambiar en cualquier momento con las teclas `1`–`5`:

| Tecla | Skin        | Estilo                           |
| ----- | ----------- | -------------------------------- |
| `1`   | Clásica     | Silueta original en blanco       |
| `2`   | Interceptor | Delta cian con línea de fuselaje |
| `3`   | Halcón      | Alas barridas ámbar con cabina   |
| `4`   | Fantasma    | Contorno discontinuo violeta     |
| `5`   | Neón        | Doble contorno verde con halo    |

- Al cambiar, aparece un aviso temporal en la parte inferior del canvas.
- Los iconos de vidas del HUD y la llama del propulsor usan la skin activa.
- La skin elegida se guarda en `localStorage` y se recupera al recargar.
- La skin es solo visual: el radio de colisión y el disparo no cambian.
