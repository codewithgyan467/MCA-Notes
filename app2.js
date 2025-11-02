// -- Game Constants and State
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const CHAR_WIDTH = 50;
const CHAR_HEIGHT = 60;
const GROUND_Y = 450;
const INITIAL_SPEED = 6;
const GRAVITY = 0.6;
const JUMP_POWER = 14;
const SPAWN_INTERVAL = 1000;
const OBSTACLE_WIDTH = 40;
const OBSTACLE_HEIGHT = 40;
const MIN_GAP = 1500, MAX_GAP = 3000;

// -- Images
const DEFAULT_CHAR = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14/assets/72x72/1f604.png';
const DEFAULT_OBS = 'https://upload.wikimedia.org/wikipedia/commons/3/38/Joy_pixel_block.png';

let gameState = "device"; // device, customize, countdown, running, over
let deviceType = "pc"; // or "mobile"
let charImg = null, obsImg = null;
let uploadedCharURL = "", uploadedObsURL = "";

let canvas, ctx;
let player, obstacles = [], speed, score, spawnTimer, jumping, jumpVelocity, isOnGround;
let touchActive = false;
let gameInterval;
let running = false;

window.onload = () => {
  setupEvents();
  showScreen("device-select");
};

function setupEvents() {
  document.getElementById('mobile-btn').onclick = () => { deviceType = "mobile"; showScreen("customize"); };
  document.getElementById('pc-btn').onclick = () => { deviceType = "pc"; showScreen("customize"); };
  document.getElementById('start-btn').onclick = () => startCountdown();
  document.getElementById('retry-btn').onclick = () => restartGame();
  document.getElementById('customize-btn').onclick = () => showScreen("customize");
  document.getElementById('change-device-btn').onclick = () => showScreen("device-select");

  document.getElementById('char-img-input').onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    uploadedCharURL = URL.createObjectURL(file);
    document.getElementById('char-img-preview').src = uploadedCharURL;
  };

  document.getElementById('obs-img-input').onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    uploadedObsURL = URL.createObjectURL(file);
    document.getElementById('obs-img-preview').src = uploadedObsURL;
  };

  // Previews: show default emoji if no selection
  document.getElementById('char-img-preview').src = DEFAULT_CHAR;
  document.getElementById('obs-img-preview').src = DEFAULT_OBS;
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.style.display = "none");
  document.getElementById(id).style.display = "flex";
  gameState = id.includes("device") ? "device"
            : id === "customize" ? "customize"
            : id === "countdown" ? "countdown"
            : id === "game-screen" ? "running"
            : id === "game-over" ? "over"
            : "device";
  // Set jump instructions
  if (id === "game-screen") {
    document.getElementById('jump-instruction').innerText =
      deviceType === "pc" ? "Press SPACEBAR to Jump" : "Tap screen to Jump";
  }
}

function startCountdown() {
  // Set selected images or defaults
  charImg = new Image();
  charImg.src = uploadedCharURL || DEFAULT_CHAR;
  obsImg = new Image();
  obsImg.src = uploadedObsURL || DEFAULT_OBS;

  showScreen("countdown");
  let c = 3;
  document.getElementById('countdown-text').innerText = c;
  const interval = setInterval(() => {
    c--;
    if (c > 0) {
      document.getElementById('countdown-text').innerText = c;
    } else {
      document.getElementById('countdown-text').innerText = "GO!";
      setTimeout(() => {
        clearInterval(interval);
        startGame();
      }, 700);
    }
  }, 800);
}

function startGame() {
  showScreen("game-screen");
  // Setup canvas
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');
  // Reset game state
  speed = INITIAL_SPEED;
  score = 0;
  spawnTimer = 0;
  player = {
    x: 120, y: GROUND_Y - CHAR_HEIGHT,
    width: CHAR_WIDTH, height: CHAR_HEIGHT,
    vy: 0,
    isOnGround: true
  };
  obstacles = [];
  running = true;

  // Controls:
  if (deviceType === "pc") {
    window.onkeydown = e => { if ((e.code === "Space" || e.keyCode === 32) && player.isOnGround && running) jump(); };
    canvas.ontouchstart = () => {};
    window.ontouchstart = null;
  } else {
    // on mobile: tap to jump (entire screen)
    window.ontouchstart = e => {
      if (!player.isOnGround || !running) return;
      jump();
      e.preventDefault();
    };
    window.onkeydown = null;
  }

  requestAnimationFrame(gameLoop);
}

function jump() {
  if (player.isOnGround) {
    player.vy = -JUMP_POWER;
    player.isOnGround = false;
  }
}

function gameLoop() {
  if (!running) return;
  // Clear
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Parallax BG
  ctx.fillStyle = "#a1cafc";
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  // Draw ground
  ctx.fillStyle = "#5e9b5e";
  ctx.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT-GROUND_Y);

  // -- Obstacles
  spawnTimer -= speed;
  if (spawnTimer <= 0) {
    spawnTimer = Math.random() * (MAX_GAP - MIN_GAP) + MIN_GAP;
    obstacles.push({
      x: GAME_WIDTH + 40,
      y: GROUND_Y - OBSTACLE_HEIGHT,
      width: OBSTACLE_WIDTH, height: OBSTACLE_HEIGHT
    });
  }
  for (let i=0; i<obstacles.length; i++) {
    obstacles[i].x -= speed;
    // Draw obstacle
    ctx.save();
    ctx.drawImage(
      obsImg, obstacles[i].x, obstacles[i].y,
      OBSTACLE_WIDTH, OBSTACLE_HEIGHT
    );
    ctx.restore();
  }
  obstacles = obstacles.filter(obs => obs.x + OBSTACLE_WIDTH > 0);

  // -- Update player
  player.vy += GRAVITY;
  player.y += player.vy;
  // On ground
  if (player.y + player.height >= GROUND_Y) {
    player.y = GROUND_Y - player.height;
    player.vy = 0;
    player.isOnGround = true;
  }
  // -- Collisions
  for (const obs of obstacles) {
    if (
      player.x < obs.x + obs.width &&
      player.x + player.width > obs.x &&
      player.y + player.height > obs.y &&
      player.y < obs.y + obs.height
    ) {
      endGame();
      return;
    }
  }
  // -- Draw character
  ctx.save();
  // Draw running body
  ctx.fillStyle = "#3b3b5c";
  ctx.fillRect(player.x+10, player.y+32, 30, 28);
  ctx.fillStyle = "#654321";
  ctx.fillRect(player.x+20, player.y+50, 10, 12); // legs
  // Draw face
  ctx.beginPath();
  ctx.arc(player.x+25, player.y+22, 18, 0, 2*Math.PI);
  ctx.closePath();
  ctx.save();
  ctx.clip();
  ctx.drawImage(charImg, player.x+7, player.y+4, 36, 36);
  ctx.restore();
  ctx.restore();

  // Score
  score += 0.04 * speed;
  document.getElementById('score-display').innerText = "Score: " + Math.floor(score);

  // Update speed for difficulty
  if (Math.floor(score) % 100 === 0 && speed < 12) speed += 0.01;

  requestAnimationFrame(gameLoop);
}

function endGame() {
  running = false;
  showScreen("game-over");
  document.getElementById('end-title').innerText = "Game Over!";
  document.getElementById('end-score').innerText = `Final Score: ${Math.floor(score)}`;
}

function restartGame() {
  showScreen("countdown");
  startCountdown();
}
