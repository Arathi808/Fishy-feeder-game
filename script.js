 const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("scoreDisplay");
const restartBtn = document.getElementById("restartBtn");

let fish = { x: 300, y: 200, size: 20, speed: 5 };
let dx = 0, dy = 0;
let food = [];
let trash = [];
let powerUps = [];
let score = 0;
let gameActive = true;
let bubbles = [];

let speedBurstActive = false;
let normalSpeed = fish.speed;
let tailSwingAngle = 0;
const tailSwingSpeed = 0.15;

// Spawn functions
function spawnFood() {
  food.push({ x: Math.random() * (canvas.width - 20) + 10, y: -20 });
}
function spawnTrash() {
  trash.push({ x: Math.random() * (canvas.width - 20) + 5, y: -20 });
}
function spawnSpeedPowerUp() {
  powerUps.push({ x: Math.random() * (canvas.width - 20) + 10, y: -20, size: 12 });
}

// Controls
document.addEventListener("keydown", e => {
  if (!gameActive) return;
  if (e.key === "ArrowUp") { dx = 0; dy = -fish.speed; }
  if (e.key === "ArrowDown") { dx = 0; dy = fish.speed; }
  if (e.key === "ArrowLeft") { dx = -fish.speed; dy = 0; }
  if (e.key === "ArrowRight") { dx = fish.speed; dy = 0; }
});

restartBtn.addEventListener("click", () => resetGame());

function resetGame() {
  fish = { x: 300, y: 200, size: 20, speed: 5 };
  dx = dy = 0;
  food = [];
  trash = [];
  powerUps = [];
  score = 0;
  scoreDisplay.textContent = "Score: 0";
  gameActive = true;
  restartBtn.style.display = "none";
  speedBurstActive = false;
  fish.speed = normalSpeed;
  tailSwingAngle = 0;
  requestAnimationFrame(gameLoop);
}

// Draw bubbles background
function drawBubbles() {
  if (bubbles.length < 30) {
    bubbles.push({
      x: Math.random() * canvas.width,
      y: canvas.height + 10,
      radius: 1 + Math.random() * 3,
      speed: 0.5 + Math.random(),
    });
  }
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  bubbles.forEach((b, i) => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
    b.y -= b.speed;
    if (b.y < -10) bubbles.splice(i, 1);
  });
}

// Draw glowing fish with animated tail
function drawGlowingFishWithTail(f) {
  ctx.save();
  ctx.translate(f.x, f.y);

  // Animate tail swing
  tailSwingAngle += tailSwingSpeed;
  let tailX = -f.size - 10;
  let tailY = Math.sin(tailSwingAngle) * 8;

  // Draw glowing tail
  ctx.shadowColor = "rgba(255,140,0,0.8)";
  ctx.shadowBlur = 15;
  ctx.fillStyle = "#ff8c00"; // dark orange tail color
  ctx.beginPath();
  ctx.moveTo(tailX, 0);
  ctx.lineTo(tailX - 20, tailY - 15);
  ctx.lineTo(tailX - 20, tailY + 15);
  ctx.closePath();
  ctx.fill();

  // Draw glow aura layers
  ctx.shadowColor = "rgba(255, 165, 0, 1)";
  ctx.shadowBlur = 30;
  for(let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(0, 0, f.size + 6 + i * 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,165,0,${0.15 - i * 0.05})`;
    ctx.fill();
  }

  ctx.shadowBlur = 0;
  ctx.fillStyle = "orange";
  ctx.beginPath();
  ctx.arc(0, 0, f.size, 0, Math.PI * 2);
  ctx.fill();

  // Eye white
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(f.size / 3, -f.size / 3, f.size / 5, 0, Math.PI * 2);
  ctx.fill();

  // Pupil black
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(f.size / 3, -f.size / 3, f.size / 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Draw power-ups
function drawPowerUps() {
  ctx.fillStyle = "blue";
  powerUps.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Update power-ups and check collection
function updatePowerUps() {
  powerUps.forEach((p, i) => {
    p.y += 2;
    if (Math.hypot(p.x - fish.x, p.y - fish.y) < fish.size + p.size) {
      activateSpeedBurst();
      powerUps.splice(i, 1);
    } else if (p.y > canvas.height + 20) {
      powerUps.splice(i, 1);
    }
  });
}

// Speed burst power-up activation
function activateSpeedBurst() {
  if (speedBurstActive) return;
  speedBurstActive = true;
  fish.speed = normalSpeed * 2;
  setTimeout(() => {
    fish.speed = normalSpeed;
    speedBurstActive = false;
  }, 5000);
}

// Main update
function update() {
  fish.x += dx;
  fish.y += dy;
  fish.x = Math.max(fish.size, Math.min(canvas.width - fish.size, fish.x));
  fish.y = Math.max(fish.size, Math.min(canvas.height - fish.size, fish.y));
}

// Draw everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBubbles();
  drawGlowingFishWithTail(fish);
  drawPowerUps();

  ctx.fillStyle = "red";
  food.forEach(f => {
    ctx.beginPath();
    ctx.arc(f.x, f.y, 8, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "brown";
  trash.forEach(t => {
    ctx.fillRect(t.x, t.y, 15, 15);
  });
}

// Check collisions and update score
function checkCollisions() {
  food.forEach((f, i) => {
    f.y += 2;
    if (Math.hypot(f.x - fish.x, f.y - fish.y) < fish.size + 8) {
      score += 10;
      fish.size += 1;
      food.splice(i, 1);
      scoreDisplay.textContent = `Score: ${score}`;
    } else if (f.y > canvas.height + 10) {
      food.splice(i, 1);
    }
  });

  trash.forEach((t, i) => {
    t.y += 3;
    if (Math.hypot(t.x + 7.5 - fish.x, t.y + 7.5 - fish.y) < fish.size + 7.5) {
      score -= 5;
      fish.size = Math.max(10, fish.size - 2);
      trash.splice(i, 1);
      scoreDisplay.textContent = `Score: ${score}`;
    } else if (t.y > canvas.height + 15) {
      trash.splice(i, 1);
    }
  });

  updatePowerUps();
}

// Game loop
function gameLoop() {
  if (!gameActive) return;
  update();
  checkCollisions();
  draw();

  if (fish.size <= 10 || score < 0) {
    gameActive = false;
    restartBtn.style.display = "inline-block";
  } else {
    requestAnimationFrame(gameLoop);
  }
}

// Initial spawns and intervals
spawnFood();
spawnTrash();
setInterval(spawnFood, 2000);
setInterval(spawnTrash, 4000);
setInterval(spawnSpeedPowerUp, 15000);

requestAnimationFrame(gameLoop);