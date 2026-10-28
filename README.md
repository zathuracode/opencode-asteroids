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
| OVNI      | 200    |

## Características

- 3 vidas con invencibilidad temporal al reaparecer (parpadeo)
- Asteroides se parten en fragmentos más pequeños al ser destruidos
- Partículas de explosión al destruir asteroides
- Power-up **Velocidad**: duplica la propulsión de la nave durante 5 segundos
- OVNI hostil: aparece cada cierto tiempo, cruza la pantalla y dispara proyectiles rojos apuntando a la nave
- Power-up **Escudo**: burbuja protectora durante 5 segundos que bloquea los proyectiles del OVNI

## Power-ups

| Power-up  | Efecto                                                   |
| --------- | -------------------------------------------------------- |
| Velocidad | Duplica la propulsión de la nave durante 5 s              |
| Escudo    | Bloquea los proyectiles enemigos durante 5 s              |

- Cae con un 15 % de probabilidad al destruir asteroides grandes o medianos.
- Cada drop es Escudo con un 40 % de probabilidad y Velocidad con el resto.
- El ítem flota por la pantalla y desaparece a los 12 s si no se recoge.
- El HUD muestra el tiempo restante de cada efecto en cian (Velocidad) y verde (Escudo).
- Los efectos se pierden si la nave es destruida.
