
// Sound management
const flapSound = new Audio('sound_flap.mp3');
const crashSound = new Audio('sound_crash.mp3');
let soundEnabled = true;

// Preload sounds
flapSound.load();
crashSound.load();

// Sound toggle functionality - set up after DOM loads
document.addEventListener('DOMContentLoaded', function() {
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering flap
            soundEnabled = !soundEnabled;
            soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
            soundToggle.classList.toggle('muted', !soundEnabled);
        });
    }
});

function playSound(sound) {
    if (!soundEnabled || !sound) return;

    try {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Sound play failed:', e));
    } catch (e) {
        console.log('Sound error:', e);
    }
}

// Jungle achtergrond
const bgImg = new Image();
bgImg.src = 'jungle.png';
let bgX = 0;
const bgScrollSpeed = 2; // zelfde snelheid als pijpen

let exploding = false;
let explosionFrame = 0;
// Flappy Bird sprite
const birdImg = new Image();
birdImg.src = 'bird.png';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');


function resizeCanvas() {
    // Houd canvas vullend, maar behoud landscape verhouding indien gewenst
    let w = window.innerWidth;
    let h = window.innerHeight;
    // Optioneel: forceer landscape verhouding op mobiel
    // if (w < h) h = w * 1.5;
    canvas.width = w;
    canvas.height = h;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Extra: op mobiel, resize bij orientation change
window.addEventListener('orientationchange', resizeCanvas);



// Game variables
let frames = 0;
const DEGREE = Math.PI/180;

const bird = {
    x: 150, // meer naar rechts
    y: 150,
    w: 48 * 1.25, // 1.25x origineel
    h: 34 * 1.25, // 1.25x origineel
        gravity: 0.12, // nog minder snel vallen
        jump: 5.7,     // nog krachtiger sprong
    velocity: 0,
    draw() {
        ctx.drawImage(birdImg, this.x - this.w/2, this.y - this.h/2, this.w, this.h);
    },
    flap() {
        this.velocity = -this.jump;
        playSound(flapSound);
    },
    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;
        // Ground and ceiling bounds are checked in the main game loop
        // to ensure crash sound plays properly
        if (this.y + this.h/2 > canvas.height) {
            this.y = canvas.height - this.h/2;
            this.velocity = 0;
        }
        if (this.y - this.h/2 < 0) {
            this.y = this.h/2;
            this.velocity = 0;
        }
    }
};

const pipes = [];
const pipeWidth = 52;
const pipeGap = bird.h * 6; // nog grotere opening voor de vogel
let pipeTimer = 0;
const pipeInterval = 320; // pijpen komen veel minder vaak

function addPipe() {
    const top = Math.random() * (canvas.height - pipeGap - 100) + 50;
    pipes.push({
        x: canvas.width,
        top: top,
        bottom: top + pipeGap
    });
}

function drawPipes() {
    const rim = 14; // breedte van de rand
    pipes.forEach(pipe => {
        // Top pipe
        ctx.save();
        ctx.fillStyle = '#bbb';
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.rect(pipe.x, 0, pipeWidth, pipe.top);
        ctx.fill();
        ctx.stroke();
        // Flens bovenkant (links en rechts breder)
        ctx.fillStyle = '#888';
        ctx.fillRect(pipe.x - rim, pipe.top - rim, pipeWidth + 2 * rim, rim);
        ctx.strokeRect(pipe.x - rim, pipe.top - rim, pipeWidth + 2 * rim, rim);
        ctx.restore();
        // Bottom pipe
        ctx.save();
        ctx.fillStyle = '#bbb';
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.rect(pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);
        ctx.fill();
        ctx.stroke();
        // Flens onderkant (links en rechts breder)
        ctx.fillStyle = '#888';
        ctx.fillRect(pipe.x - rim, pipe.bottom, pipeWidth + 2 * rim, rim);
        ctx.strokeRect(pipe.x - rim, pipe.bottom, pipeWidth + 2 * rim, rim);
        ctx.restore();
    });
}

function drawExplosion(x, y, frame) {
    // Simpele cirkel-explosie animatie
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i;
        const r = 10 + frame * 3;
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + Math.cos(angle) * r, y + Math.sin(angle) * r, 6 + frame, 0, 2 * Math.PI);
        ctx.fillStyle = frame % 2 === 0 ? '#ff0' : '#f00';
        ctx.globalAlpha = 1 - frame / 10;
        ctx.fill();
        ctx.restore();
    }
}

function updatePipes() {
    pipes.forEach(pipe => {
        pipe.x -= bgScrollSpeed; // pijpen bewegen even snel als achtergrond
    });
    // Remove pipes that are off screen
    if (pipes.length && pipes[0].x + pipeWidth < 0) {
        pipes.shift();
        score++;
        if (exploding) {
            // Teken explosie op vogelpositie
            drawExplosion(bird.x, bird.y, explosionFrame);
            explosionFrame++;
            if (explosionFrame > 10) {
                exploding = false;
                if (lives <= 0) {
                    gameOver = true;
                } else {
                    // Reset vogel
                    bird.y = 150;
                    bird.velocity = 0;
                    pipes.forEach(pipe => { pipe.x += 120; });
                }
            }
            drawPipes();
            drawScore();
            if (gameOver) {
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#fff';
                ctx.font = '48px Arial';
                ctx.fillText('Game Over', 180, 300);
                ctx.font = '24px Arial';
                ctx.fillText('Press Space to Restart', 170, 350);
            }
            requestAnimationFrame(gameLoop);
            return;
        }
    }
}

function checkCollision() {
    for (let pipe of pipes) {
        // Bird bounding box
        const birdLeft = bird.x - bird.w/2;
        const birdRight = bird.x + bird.w/2;
        const birdTop = bird.y - bird.h/2;
        const birdBottom = bird.y + bird.h/2;
        // Pipe bounding boxes
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + pipeWidth;
        // Check horizontal overlap
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            // Check vertical collision with top or bottom pipe
            if (birdTop < pipe.top || birdBottom > pipe.bottom) {
                return true;
            }
        }
    }
    return false;
}


let score = 0;
let lives = 3;
let gameOver = false;

function drawScore() {
    // Score
    ctx.font = '32px Arial';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText(score, 20, 50);
    ctx.fillStyle = '#fff';
    ctx.fillText(score, 20, 50);
    // Levens
    ctx.font = '24px Arial';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText('Levens: ' + lives, 20, 80);
    ctx.fillStyle = '#fff';
    ctx.fillText('Levens: ' + lives, 20, 80);
}

function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
    lives = 3;
    gameOver = false;
    pipeTimer = 0;
}


function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Scrollende achtergrond
    bgX -= bgScrollSpeed;
    if (bgX <= -canvas.width) bgX = 0;
    ctx.drawImage(bgImg, bgX, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImg, bgX + canvas.width, 0, canvas.width, canvas.height);

    if (exploding) {
        drawExplosion(bird.x, bird.y, explosionFrame);
        explosionFrame++;
        drawPipes();
        drawScore();
        if (explosionFrame > 10) {
            exploding = false;
            if (lives <= 0) {
                gameOver = true;
            } else {
                bird.y = 150;
                bird.velocity = 0;
                pipes.forEach(pipe => { pipe.x += 120; });
            }
        }
        if (gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#fff';
            ctx.font = '48px Arial';
            ctx.fillText('Game Over', 180, 300);
            ctx.font = '24px Arial';
            ctx.fillText('Press Space to Restart', 170, 350);
        }
        requestAnimationFrame(gameLoop);
        return;
    }

    bird.draw();
    if (!gameOver) {
        bird.update();
        if (++pipeTimer % pipeInterval === 0) addPipe();
        updatePipes();
        // Botsing of vallen
        let collision = checkCollision();
        let outOfBounds = (bird.y + bird.h/2 > canvas.height) || (bird.y - bird.h/2 < 0);
        if (collision || outOfBounds) {
            lives--;
            exploding = true;
            explosionFrame = 0;
            playSound(crashSound);
            return requestAnimationFrame(gameLoop);
        }
    }
    drawPipes();
    drawScore();
    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '48px Arial';
        ctx.fillText('Game Over', 180, 300);
        ctx.font = '24px Arial';
        ctx.fillText('Press Space to Restart', 170, 350);
    }
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        if (gameOver) {
            resetGame();
        } else {
            bird.flap();
        }
    }
});

// Touch controls voor mobiel
canvas.addEventListener('mousedown', function() {
    if (gameOver) {
        resetGame();
    } else {
        bird.flap();
    }
});
canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    if (gameOver) {
        resetGame();
    } else {
        bird.flap();
    }
}, { passive: false });


// Start het spel pas als de achtergrond geladen is
bgImg.onload = function() {
    gameLoop();
};
