'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = 800;
const H = 600;

// ── Input ─────────────────────────────────────────────────────────────────────
const keys = {};
const justPressed = {};

window.addEventListener('keydown', e => {
  justPressed[e.code] = !keys[e.code];
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code))
    e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function pressed(code) {
  const val = justPressed[code];
  justPressed[code] = false;
  return val;
}

// ── Utils ─────────────────────────────────────────────────────────────────────
const wrap  = (v, max) => ((v % max) + max) % max;
const dist  = (a, b)   => Math.hypot(a.x - b.x, a.y - b.y);
const rand  = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));

// ── Bullet ────────────────────────────────────────────────────────────────────
class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    const SPEED = 520;
    this.vx = Math.cos(angle) * SPEED;
    this.vy = Math.sin(angle) * SPEED;
    this.ttl  = 1.1;
    this.radius = 2;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Proyectil enemigo ─────────────────────────────────────────────────────────
const ENEMY_BULLET_SPEED = 260;
const ENEMY_BULLET_TTL   = 2.2;

class EnemyBullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * ENEMY_BULLET_SPEED;
    this.vy = Math.sin(angle) * ENEMY_BULLET_SPEED;
    this.ttl  = ENEMY_BULLET_TTL;
    this.radius = 3;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    ctx.fillStyle = '#ff5a5a';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Asteroid ──────────────────────────────────────────────────────────────────
const RADII  = [0, 16, 30, 50];   // por tamaño 1, 2, 3
const SPEEDS = [0, 85, 55, 32];   // velocidad base por tamaño
const POINTS = [0, 100, 50, 20];  // puntos por tamaño

class Asteroid {
  constructor(x, y, size = 3) {
    this.x    = x;
    this.y    = y;
    this.size = size;
    this.radius = RADII[size];
    this.dead = false;

    const angle = rand(0, Math.PI * 2);
    const speed = SPEEDS[size] + rand(-15, 15);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rotSpeed = rand(-1.2, 1.2);
    this.rot = rand(0, Math.PI * 2);

    // Polígono irregular
    const n = randInt(8, 13);
    this.verts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = this.radius * rand(0.6, 1.0);
      this.verts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
  }

  update(dt) {
    this.x   = wrap(this.x + this.vx * dt, W);
    this.y   = wrap(this.y + this.vy * dt, H);
    this.rot += this.rotSpeed * dt;
  }

  split() {
    if (this.size <= 1) return [];
    return [
      new Asteroid(this.x, this.y, this.size - 1),
      new Asteroid(this.x, this.y, this.size - 1),
    ];
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(this.verts[0][0], this.verts[0][1]);
    for (let i = 1; i < this.verts.length; i++)
      ctx.lineTo(this.verts[i][0], this.verts[i][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// ── OVNI ──────────────────────────────────────────────────────────────────────
const UFO_RADIUS     = 18;
const UFO_POINTS     = 200;
const UFO_TTL        = 14;                        // segundos que permanece en pantalla
const UFO_SPAWN_MIN  = 14;                        // espera mínima entre apariciones
const UFO_SPAWN_MAX  = 22;                        // espera máxima entre apariciones
const UFO_SHOOT_MIN  = 1.2;                       // cadencia de disparo
const UFO_SHOOT_MAX  = 2;

class Ufo {
  constructor() {
    const fromLeft = Math.random() < 0.5;
    this.x      = fromLeft ? 0 : W;
    this.y      = rand(80, H - 80);
    this.vx     = (fromLeft ? 1 : -1) * rand(70, 110);
    this.vy     = rand(-25, 25);
    this.radius = UFO_RADIUS;
    this.ttl    = UFO_TTL;
    this.shootTimer = rand(0.6, 1.4);
    this.dead   = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) { this.dead = true; return; }

    this.shootTimer -= dt;
    if (this.shootTimer <= 0 && !ship.dead) {
      this.shootTimer = rand(UFO_SHOOT_MIN, UFO_SHOOT_MAX);
      const angle = Math.atan2(ship.y - this.y, ship.x - this.x) + rand(-0.15, 0.15);
      enemyBullets.push(new EnemyBullet(this.x, this.y, angle));
    }
  }

  draw() {
    // Parpadeo cuando está a punto de retirarse
    if (this.ttl < 2 && Math.floor(this.ttl * 8) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';

    // Cúpula
    ctx.beginPath();
    ctx.arc(0, -3, 7, Math.PI, 0);
    ctx.stroke();

    // Cuerpo
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo( 18, 0);
    ctx.lineTo( 10, 7);
    ctx.lineTo(-10, 7);
    ctx.closePath();
    ctx.stroke();

    // Base
    ctx.beginPath();
    ctx.moveTo(-7, 7);
    ctx.lineTo( 7, 7);
    ctx.stroke();

    ctx.restore();
  }
}

// ── Ship ──────────────────────────────────────────────────────────────────────
class Ship {
  constructor() { this.reset(); }

  reset() {
    this.x      = W / 2;
    this.y      = H / 2;
    this.angle  = -Math.PI / 2;
    this.vx     = 0;
    this.vy     = 0;
    this.radius = 12;
    this.thrusting     = false;
    this.invincible    = 3;
    this.shootCooldown = 0;
    this.speedBoost    = 0;
    this.shield        = 0;
    this.dead          = false;
  }

  update(dt) {
    if (this.dead) return;
    if (this.invincible    > 0) this.invincible    -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.speedBoost    > 0) this.speedBoost    = Math.max(0, this.speedBoost - dt);
    if (this.shield        > 0) this.shield        = Math.max(0, this.shield - dt);

    const ROT     = 3.5;   // rad/s
    const THRUST  = this.speedBoost > 0 ? 520 : 260;  // px/s² (el doble con Velocidad)
    const DRAG    = 0.987;

    if (keys['ArrowLeft'])  this.angle -= ROT * dt;
    if (keys['ArrowRight']) this.angle += ROT * dt;

    this.thrusting = !!keys['ArrowUp'];
    if (this.thrusting) {
      this.vx += Math.cos(this.angle) * THRUST * dt;
      this.vy += Math.sin(this.angle) * THRUST * dt;
    }

    this.vx *= DRAG;
    this.vy *= DRAG;
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
  }

  tryShoot() {
    if (this.shootCooldown > 0 || this.dead) return [];
    this.shootCooldown = 0.2;
    const NOSE = 21;
    const ox = this.x + Math.cos(this.angle) * NOSE;
    const oy = this.y + Math.sin(this.angle) * NOSE;
    return [new Bullet(ox, oy, this.angle)];
  }

  draw() {
    if (this.dead) return;
    // Parpadeo durante invencibilidad de reaparición
    if (this.invincible > 0 && Math.floor(this.invincible * 8) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';

    // Silueta clásica: triángulo con muesca trasera
    ctx.beginPath();
    ctx.moveTo( 20,  0);   // nariz
    ctx.lineTo(-12, -9);   // ala izquierda
    ctx.lineTo( -7,  0);   // muesca trasera
    ctx.lineTo(-12,  9);   // ala derecha
    ctx.closePath();
    ctx.stroke();

    // Llama del propulsor
    if (this.thrusting && Math.random() > 0.35) {
      const boosted = this.speedBoost > 0;
      ctx.beginPath();
      ctx.moveTo(-8, -4);
      ctx.lineTo(-8 - (boosted ? rand(14, 26) : rand(6, 14)), 0);
      ctx.lineTo(-8,  4);
      ctx.strokeStyle = boosted
        ? 'rgba(77, 227, 255, 0.9)'
        : 'rgba(255, 130, 0, 0.85)';
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ── Partículas (explosión) ────────────────────────────────────────────────────
class Particle {
  constructor(x, y, color = '255,255,255') {
    this.x  = x;
    this.y  = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(30, 130);
    this.vx   = Math.cos(angle) * speed;
    this.vy   = Math.sin(angle) * speed;
    this.life = rand(0.4, 1.1);
    this.ttl  = this.life;
    this.color = color;
    this.dead = false;
  }

  update(dt) {
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const alpha = this.ttl / this.life;
    ctx.strokeStyle = `rgba(${this.color},${alpha.toFixed(2)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.05, this.y - this.vy * 0.05);
    ctx.stroke();
  }
}

// ── Power-ups ─────────────────────────────────────────────────────────────────
const BOOST_DURATION  = 5;     // segundos que dura Velocidad
const SHIELD_DURATION = 5;     // segundos que dura Escudo
const SHIELD_RADIUS   = 26;    // radio visual y de bloqueo de la burbuja
const BOOST_DROP      = 0.15;  // probabilidad de caer al destruir un asteroide
const POWERUP_TTL     = 12;    // segundos antes de desvanecerse sin recoger
const SHIELD_DROP     = 0.4;   // proporción de drops que son Escudo

class PowerUp {
  constructor(x, y, type = 'velocidad') {
    this.x = x;
    this.y = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(20, 45);
    this.vx     = Math.cos(angle) * speed;
    this.vy     = Math.sin(angle) * speed;
    this.radius = 11;
    this.ttl    = POWERUP_TTL;
    this.rot    = 0;
    this.type   = type;
    this.dead   = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.rot += 2 * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    // Parpadeo cuando está a punto de desaparecer
    if (this.ttl < 3 && Math.floor(this.ttl * 8) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.strokeStyle = this.type === 'escudo' ? '#7dffb0' : '#4de3ff';
    ctx.lineWidth   = 1.8;
    ctx.lineJoin    = 'round';

    if (this.type === 'escudo') {
      // Hexágono con núcleo
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 3;
        const x = Math.cos(a) * this.radius;
        const y = Math.sin(a) * this.radius;
        if (i === 0) ctx.moveTo(x, y);
        else         ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Rombo
      ctx.beginPath();
      ctx.moveTo(0, -this.radius);
      ctx.lineTo(this.radius * 0.72, 0);
      ctx.lineTo(0, this.radius);
      ctx.lineTo(-this.radius * 0.72, 0);
      ctx.closePath();
      ctx.stroke();

      // Doble chevrón apuntando a la derecha
      ctx.beginPath();
      ctx.moveTo(-7, -5); ctx.lineTo(-1, 0); ctx.lineTo(-7, 5);
      ctx.moveTo( 1, -5); ctx.lineTo( 7, 0); ctx.lineTo( 1, 5);
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ── Estado del juego ──────────────────────────────────────────────────────────
let ship, bullets, enemyBullets, asteroids, particles, powerUps, ufo;
let score, lives, level;
let state;      // 'playing' | 'dead' | 'gameover'
let deadTimer, ufoTimer;

function spawnAsteroids(count) {
  const SAFE_DIST = 130;
  for (let i = 0; i < count; i++) {
    let x, y;
    do {
      x = rand(0, W);
      y = rand(0, H);
    } while (Math.hypot(x - W / 2, y - H / 2) < SAFE_DIST);
    asteroids.push(new Asteroid(x, y, 3));
  }
}

function initGame() {
  ship          = new Ship();
  bullets       = [];
  enemyBullets  = [];
  asteroids     = [];
  particles     = [];
  powerUps      = [];
  ufo           = null;
  ufoTimer      = rand(UFO_SPAWN_MIN, UFO_SPAWN_MAX);
  score  = 0;
  lives  = 3;
  level  = 1;
  state  = 'playing';
  spawnAsteroids(4);
}

function nextLevel() {
  level++;
  bullets      = [];
  enemyBullets = [];
  particles    = [];
  powerUps     = [];
  ufo          = null;
  ufoTimer     = rand(UFO_SPAWN_MIN, UFO_SPAWN_MAX);
  ship.reset();
  spawnAsteroids(3 + level);
}

function explode(x, y, count = 8, color = '255,255,255') {
  for (let i = 0; i < count; i++) particles.push(new Particle(x, y, color));
}

function killShip() {
  explode(ship.x, ship.y, 14);
  ship.dead = true;
  ship.speedBoost = 0;
  ship.shield     = 0;
  enemyBullets    = [];
  lives--;
  if (lives <= 0) {
    state = 'gameover';
  } else {
    state     = 'dead';
    deadTimer = 2;
  }
}

// ── Update ────────────────────────────────────────────────────────────────────
function update(dt) {
  if (state === 'gameover') {
    if (pressed('Space')) initGame();
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    return;
  }

  if (state === 'dead') {
    deadTimer -= dt;
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    asteroids.forEach(a => a.update(dt));
    powerUps.forEach(p => p.update(dt));
    powerUps = powerUps.filter(p => !p.dead);
    enemyBullets.forEach(b => b.update(dt));
    enemyBullets = enemyBullets.filter(b => !b.dead);
    if (ufo) {
      ufo.update(dt);
      if (ufo.dead) ufo = null;
    }
    if (deadTimer <= 0) { state = 'playing'; ship.reset(); }
    return;
  }

  // Disparar
  if (pressed('Space')) {
    bullets.push(...ship.tryShoot());
  }

  // Aparición del OVNI
  if (!ufo) {
    ufoTimer -= dt;
    if (ufoTimer <= 0) {
      ufo = new Ufo();
      ufoTimer = rand(UFO_SPAWN_MIN, UFO_SPAWN_MAX);
    }
  }

  ship.update(dt);
  bullets.forEach(b => b.update(dt));
  enemyBullets.forEach(b => b.update(dt));
  asteroids.forEach(a => a.update(dt));
  particles.forEach(p => p.update(dt));
  powerUps.forEach(p => p.update(dt));
  if (ufo) {
    ufo.update(dt);
    if (ufo.dead) ufo = null;
  }

  bullets      = bullets.filter(b => !b.dead);
  enemyBullets = enemyBullets.filter(b => !b.dead);
  particles    = particles.filter(p => !p.dead);
  powerUps     = powerUps.filter(p => !p.dead);

  // Nave vs power-up
  for (const p of powerUps) {
    if (dist(ship, p) < ship.radius + p.radius) {
      p.dead = true;
      if (p.type === 'escudo') {
        ship.shield = SHIELD_DURATION;
        explode(p.x, p.y, 8, '125,255,176');
      } else {
        ship.speedBoost = BOOST_DURATION;
        explode(p.x, p.y, 8);
      }
    }
  }
  powerUps = powerUps.filter(p => !p.dead);

  // Bala vs asteroide
  const newAsteroids = [];
  for (const b of bullets) {
    for (const a of asteroids) {
      if (!a.dead && !b.dead && dist(b, a) < a.radius) {
        b.dead = true;
        a.dead = true;
        score += POINTS[a.size];
        explode(a.x, a.y, a.size * 5);
        if (a.size >= 2 && Math.random() < BOOST_DROP)
          powerUps.push(new PowerUp(a.x, a.y, Math.random() < SHIELD_DROP ? 'escudo' : 'velocidad'));
        newAsteroids.push(...a.split());
      }
    }
  }
  asteroids = asteroids.filter(a => !a.dead).concat(newAsteroids);
  bullets   = bullets.filter(b => !b.dead);

  // Bala vs OVNI
  if (ufo) {
    for (const b of bullets) {
      if (!b.dead && dist(b, ufo) < ufo.radius) {
        b.dead = true;
        ufo.dead = true;
        score += UFO_POINTS;
        explode(ufo.x, ufo.y, 12);
        break;
      }
    }
    if (ufo.dead) ufo = null;
  }
  bullets = bullets.filter(b => !b.dead);

  // Escudo vs proyectil enemigo
  if (ship.shield > 0) {
    for (const b of enemyBullets) {
      if (!b.dead && dist(ship, b) < SHIELD_RADIUS + b.radius) {
        b.dead = true;
        explode(b.x, b.y, 5, '77,227,255');
      }
    }
    enemyBullets = enemyBullets.filter(b => !b.dead);
  }

  // Nave vs proyectil enemigo
  if (!ship.dead && ship.invincible <= 0) {
    for (const b of enemyBullets) {
      if (!b.dead && dist(ship, b) < ship.radius + b.radius) {
        b.dead = true;
        killShip();
        break;
      }
    }
    enemyBullets = enemyBullets.filter(b => !b.dead);
  }

  // Nave vs asteroide
  if (!ship.dead && ship.invincible <= 0) {
    for (const a of asteroids) {
      if (dist(ship, a) < ship.radius + a.radius * 0.82) {
        killShip();
        break;
      }
    }
  }

  // Nave vs OVNI
  if (!ship.dead && ship.invincible <= 0 && ufo &&
      dist(ship, ufo) < ship.radius + ufo.radius * 0.82) {
    killShip();
  }

  // Nivel completado
  if (state === 'playing' && asteroids.length === 0) nextLevel();
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function drawLifeIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 2);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth   = 1.2;
  ctx.lineJoin    = 'round';
  ctx.beginPath();
  ctx.moveTo( 9,  0);
  ctx.lineTo(-6, -5);
  ctx.lineTo(-3,  0);
  ctx.lineTo(-6,  5);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawHUD() {
  ctx.fillStyle = '#fff';
  ctx.font = '15px monospace';

  ctx.textAlign = 'left';
  ctx.fillText(`SCORE  ${score}`, 14, 26);

  ctx.textAlign = 'center';
  ctx.fillText(`NIVEL ${level}`, W / 2, 26);

  for (let i = 0; i < lives; i++)
    drawLifeIcon(W - 16 - i * 22, 18);

  // Indicadores de power-ups (apilados para no solaparse)
  let indicatorY = 50;
  if (ship.speedBoost > 0) {
    const pct = ship.speedBoost / BOOST_DURATION;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#4de3ff';
    ctx.font      = '14px monospace';
    ctx.fillText(`VELOCIDAD ${ship.speedBoost.toFixed(1)}s`, 14, indicatorY);
    ctx.fillRect(14, indicatorY + 8, 140 * pct, 3);
    indicatorY += 24;
  }

  if (ship.shield > 0) {
    const pct = ship.shield / SHIELD_DURATION;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#7dffb0';
    ctx.font      = '14px monospace';
    ctx.fillText(`ESCUDO ${ship.shield.toFixed(1)}s`, 14, indicatorY);
    ctx.fillRect(14, indicatorY + 8, 140 * pct, 3);
  }

  ctx.fillStyle = '#fff';
}

// Burbuja del escudo; se dibuja aparte para que no la oculte el parpadeo de invencibilidad
function drawShield() {
  if (ship.dead || ship.shield <= 0) return;

  const pulse = 1 + Math.sin(ship.shield * 9) * 0.035;
  const alpha = 0.5 + Math.sin(ship.shield * 9) * 0.12;

  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.strokeStyle = `rgba(77, 227, 255, ${alpha.toFixed(2)})`;
  ctx.fillStyle   = 'rgba(77, 227, 255, 0.06)';
  ctx.lineWidth   = 1.6;
  ctx.beginPath();
  ctx.arc(0, 0, SHIELD_RADIUS * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawOverlay(title, sub) {
  ctx.textAlign   = 'center';
  ctx.fillStyle   = '#fff';
  ctx.font        = 'bold 46px monospace';
  ctx.fillText(title, W / 2, H / 2 - 18);
  ctx.font        = '18px monospace';
  ctx.fillStyle   = 'rgba(255,255,255,0.65)';
  ctx.fillText(sub, W / 2, H / 2 + 22);
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  particles.forEach(p => p.draw());
  asteroids.forEach(a => a.draw());
  powerUps.forEach(p => p.draw());
  bullets.forEach(b => b.draw());
  enemyBullets.forEach(b => b.draw());
  if (ufo) ufo.draw();
  ship.draw();
  drawShield();

  drawHUD();

  if (state === 'gameover')
    drawOverlay('GAME OVER', `PUNTAJE: ${score}   —   ESPACIO PARA REINICIAR`);
}

// ── Loop principal ────────────────────────────────────────────────────────────
let lastTime = null;

function loop(ts) {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

initGame();
requestAnimationFrame(loop);
