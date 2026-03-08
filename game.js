
// Flappy Bird sprite
const birdImg = new Image();
birdImg.src = 'bird.png';
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');



// Game variables
let frames = 0;
const DEGREE = Math.PI/180;

const bird = {
    x: 50,
    y: 150,
    w: 34,
    h: 24,
    gravity: 0.25,
    jump: 4.6,
    velocity: 0,
    draw() {
        ctx.drawImage(birdImg, this.x - this.w/2, this.y - this.h/2, this.w, this.h);
    },
    flap() {
        this.velocity = -this.jump;
    },
    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;
        if (this.y + this.h/2 > canvas.height) {
            this.y = canvas.height - this.h/2;
            this.velocity = 0;
            gameOver = true;
        }
        if (this.y - this.h/2 < 0) {
            this.y = this.h/2;
            this.velocity = 0;
        }
    }
};

const pipes = [];
const pipeWidth = 52;
const pipeGap = 120;
let pipeTimer = 0;

function addPipe() {
    const top = Math.random() * (canvas.height - pipeGap - 100) + 50;
    pipes.push({
        x: canvas.width,
        top: top,
        bottom: top + pipeGap
    });
}

function drawPipes() {
    ctx.fillStyle = '#0f0';
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);
    });
}

function updatePipes() {
    pipes.forEach(pipe => {
        pipe.x -= 2;
    });
    // Remove pipes that are off screen
    if (pipes.length && pipes[0].x + pipeWidth < 0) {
        pipes.shift();
        score++;
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
let gameOver = false;

function drawScore() {
    ctx.fillStyle = '#000';
    ctx.font = '32px Arial';
    ctx.fillText(score, 20, 50);
}

function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
    gameOver = false;
    pipeTimer = 0;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bird.draw();
    if (!gameOver) {
        bird.update();
        if (++pipeTimer % 90 === 0) addPipe();
        updatePipes();
        if (checkCollision()) gameOver = true;
    }
    drawPipes();
    drawScore();
    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '48px Arial';
        ctx.fillText('Game Over', 80, 300);
        ctx.font = '24px Arial';
        ctx.fillText('Press Space to Restart', 70, 350);
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
canvas.addEventListener('mousedown', function() {
    if (gameOver) {
        resetGame();
    } else {
        bird.flap();
    }
});

gameLoop();
