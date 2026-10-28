# Asteroids

Clon del clásico arcade **Asteroids** implementado en canvas HTML5 puro, sin dependencias ni bundler.

## Descripción

Nave espacial en un campo de asteroides con envolvimiento de bordes (el espacio es toroidal). Destruye asteroides para sumar puntos: los grandes se parten en medianos, los medianos en pequeños. Incluye power-ups especiales y tipos de asteroides únicos como la estrella fugaz.

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

| Tecla     | Acción     |
| --------- | ---------- |
| `←` `→`   | Rotar nave |
| `↑`       | Propulsar  |
| `Espacio` | Disparar   |

## Puntuación

| Asteroide | Puntos |
| --------- | ------ |
| Grande    | 20     |
| Mediano   | 50     |
| Pequeño   | 100    |

## Características

- 3 vidas con invencibilidad temporal al reaparecer (parpadeo)
- Asteroides se parten en fragmentos más pequeños al ser destruidos
- Partículas de explosión al destruir asteroides
- Power-up **Velocidad**: duplica la propulsión de la nave durante 5 segundos
- Power-up **Triple**: dispara 3 balas en abanico durante 5 segundos

## Power-ups

| Power-up  | Color | Efecto                                          |
| --------- | ----- | ----------------------------------------------- |
| Velocidad | Cian  | Duplica la propulsión de la nave durante 5 s    |
| Triple    | Verde | Dispara 3 balas en abanico durante 5 s          |

- Cada asteroide grande o mediano tiene un 15 % de probabilidad de soltar un power-up; el tipo (Velocidad o Triple) se elige al azar.
- El ítem flota por la pantalla y desaparece a los 12 s si no se recoge.
- El HUD muestra el tiempo restante de cada efecto con su color.
- Los efectos se acumulan entre sí y se pierden si la nave es destruida.
