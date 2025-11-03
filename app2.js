// Game State
const gameState = {
    screen: 'platform',
    platform: null,
    character: null,
    bestScore: 0,
    currentScore: 0,
    gameStarted: false,
    gameOver: false
};

// DOM Elements
const screens = {
    platform: document.getElementById('platformScreen'),
    character: document.getElementById('characterScreen'),
    game: document.getElementById('gameScreen'),
    gameOver: document.getElementById('gameOverScreen')
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Audio Elements
const audioElements = {
    maleMusic: document.getElementById('maleMusic'),
    femaleMusic: document.getElementById('femaleMusic'),
    maleCry: document.getElementById('maleCry'),
    femaleCry: document.getElementById('femaleCry')
};

// Character Data
const characters = {
    male: {
        name: 'Priyangshu',
        image: 'malecr.jpg',
        music: audioElements.maleMusic,
        crySound: audioElements.maleCry
    },
    female: {
        name: 'Shahiba',
        image: 'femalecr.jpg',
        music: audioElements.femaleMusic,
        crySound: audioElements.femaleCry
    }
};

// Game Variables
let bird = {
    x: 100,
    y: 250,
    width: 40,
    height: 40,
    velocity: 0,
    gravity: 0.5,
    jump: -8,
    image: null
};

let pipes = [];
let particles = [];
let frameCount = 0;
const pipeGap = 180;
const pipeWidth = 80;
let pipeSpeed = 3;

// Load character images
const characterImages = {
    male: new Image(),
    female: new Image()
};
characterImages.male.src = 'malecr.jpg';
characterImages.female.src = 'femalecr.jpg';

// Screen Management
function showScreen(screenName) {
    Object.keys(screens).forEach(key => {
        screens[key].classList.remove('active');
    });
    screens[screenName].classList.add('active');
    gameState.screen = screenName;
}

// Platform Selection
document.querySelectorAll('.platform-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        gameState.platform = e.currentTarget.dataset.platform;
        showScreen('character');
    });
});

// Character Selection
document.querySelectorAll('.character-card').forEach(card => {
    card.addEventListener('click', (e) => {
        const characterType = e.currentTarget.dataset.character;
        gameState.character = characterType;
        bird.image = characterImages[characterType];
        showScreen('game');
        initGame();
    });
});

// Game Over Buttons
document.getElementById('playAgainBtn').addEventListener('click', () => {
    showScreen('game');
    initGame();
});

document.getElementById('changeCharacterBtn').addEventListener('click', () => {
    stopAllAudio();
    showScreen('character');
});

// Canvas Setup
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Initialize Game
function initGame() {
    // Reset game state
    gameState.gameStarted = false;
    gameState.gameOver = false;
    gameState.currentScore = 0;
    
    // Reset bird
    bird.x = 100;
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    
    // Clear pipes and particles
    pipes = [];
    particles = [];
    frameCount = 0;
    pipeSpeed = 3;
    
    // Update score display
    document.getElementById('currentScore').textContent = '0';
    document.getElementById('bestScore').textContent = gameState.bestScore;
    
    // Show start prompt
    document.getElementById('startPrompt').style.display = 'block';
    
    // Stop all audio and start appropriate music
    stopAllAudio();
    
    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Audio Management
function stopAllAudio() {
    Object.values(audioElements).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });
}

function startBackgroundMusic() {
    const character = characters[gameState.character];
    character.music.play().catch(err => console.log('Audio play failed:', err));
}

function playGameOverSound() {
    const character = characters[gameState.character];
    character.crySound.play().catch(err => console.log('Audio play failed:', err));
}

// Input Handling
function handleJump() {
    if (!gameState.gameStarted && !gameState.gameOver) {
        gameState.gameStarted = true;
        document.getElementById('startPrompt').style.display = 'none';
        startBackgroundMusic();
    }
    
    if (gameState.gameStarted && !gameState.gameOver) {
        bird.velocity = bird.jump;
    }
}

canvas.addEventListener('click', handleJump);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleJump();
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        handleJump();
    }
});

// Create Pipe
function createPipe() {
    const minHeight = 80;
    const maxHeight = canvas.height - pipeGap - minHeight - 100;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + pipeGap,
        bottomHeight: canvas.height - topHeight - pipeGap,
        passed: false,
        scored: false
    });
}

// Create Particle Effect
function createParticles(x, y) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1,
            color: `hsl(${Math.random() * 60 + 160}, 70%, 60%)`
        });
    }
}

// Update Game
function updateGame() {
    if (!gameState.gameStarted || gameState.gameOver) return;
    
    // Update bird
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    
    // Create pipes
    frameCount++;
    if (frameCount % 90 === 0) {
        createPipe();
    }
    
    // Update pipes
    pipes.forEach((pipe, index) => {
        pipe.x -= pipeSpeed;
        
        // Check if bird passed pipe
        if (!pipe.scored && pipe.x + pipeWidth < bird.x) {
            pipe.scored = true;
            gameState.currentScore++;
            document.getElementById('currentScore').textContent = gameState.currentScore;
            createParticles(bird.x, bird.y);
            
            // Update best score
            if (gameState.currentScore > gameState.bestScore) {
                gameState.bestScore = gameState.currentScore;
                document.getElementById('bestScore').textContent = gameState.bestScore;
            }
            
            // Increase difficulty
            if (gameState.currentScore % 5 === 0) {
                pipeSpeed = Math.min(pipeSpeed + 0.3, 8);
            }
        }
        
        // Remove off-screen pipes
        if (pipe.x + pipeWidth < 0) {
            pipes.splice(index, 1);
        }
    });
    
    // Update particles
    particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.02;
        
        if (particle.life <= 0) {
            particles.splice(index, 1);
        }
    });
    
    // Collision detection
    checkCollisions();
}

// Check Collisions
function checkCollisions() {
    // Ground and ceiling
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        endGame();
        return;
    }
    
    // Pipes
    pipes.forEach(pipe => {
        // Check if bird is in pipe's x range
        if (bird.x + bird.width > pipe.x && bird.x < pipe.x + pipeWidth) {
            // Check if bird hits top or bottom pipe
            if (bird.y < pipe.topHeight || bird.y + bird.height > pipe.bottomY) {
                endGame();
            }
        }
    });
}

// End Game
function endGame() {
    gameState.gameOver = true;
    
    // Stop background music
    characters[gameState.character].music.pause();
    
    // Play game over sound
    playGameOverSound();
    
    // Update final scores
    document.getElementById('finalScore').textContent = gameState.currentScore;
    document.getElementById('finalBestScore').textContent = gameState.bestScore;
    
    // Show game over screen after a delay
    setTimeout(() => {
        showScreen('gameOver');
    }, 1500);
}

// Draw Game
function drawGame() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(0.5, '#e0f6ff');
    gradient.addColorStop(1, '#90ee90');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    
    // Draw pipes
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillStyle = '#228B22';
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.strokeStyle = '#1a5c1a';
        ctx.lineWidth = 3;
        ctx.strokeRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, pipe.bottomHeight);
        ctx.strokeRect(pipe.x, pipe.bottomY, pipeWidth, pipe.bottomHeight);
        
        // Draw ATTENDANCE label
        ctx.save();
        ctx.translate(pipe.x + pipeWidth / 2, pipe.topHeight - 30);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ATTENDANCE', 0, 0);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeText('ATTENDANCE', 0, 0);
        ctx.restore();
        
        // Draw ATTENDANCE label on bottom pipe
        ctx.save();
        ctx.translate(pipe.x + pipeWidth / 2, pipe.bottomY + 30);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ATTENDANCE', 0, 0);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeText('ATTENDANCE', 0, 0);
        ctx.restore();
    });
    
    // Draw particles
    particles.forEach(particle => {
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });
    
    // Draw bird
    if (bird.image && bird.image.complete) {
        ctx.save();
        ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
        
        // Rotate bird based on velocity
        const rotation = Math.min(Math.max(bird.velocity * 0.05, -0.5), 0.5);
        ctx.rotate(rotation);
        
        // Draw circular clipped image
        ctx.beginPath();
        ctx.arc(0, 0, bird.width / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        
        ctx.drawImage(bird.image, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
        
        ctx.restore();
        
        // Draw bird border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(bird.x + bird.width / 2, bird.y + bird.height / 2, bird.width / 2, 0, Math.PI * 2);
        ctx.stroke();
    } else {
        // Fallback if image not loaded
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(bird.x + bird.width / 2, bird.y + bird.height / 2, bird.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}

// Game Loop
function gameLoop() {
    updateGame();
    drawGame();
    
    if (gameState.screen === 'game' && !gameState.gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// Initialize on load
window.addEventListener('load', () => {
    showScreen('platform');
});