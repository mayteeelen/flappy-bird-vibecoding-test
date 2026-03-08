const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');



// Game variables
let frames = 0;
const DEGREE = Math.PI/180;

const bird = {
    x: 50,
    y: 150,
    radius: 12,
    gravity: 0.25,
    jump: 4.6,
    velocity: 0,
    draw() {
        ctx.fillStyle = '#ff0';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();
    },
    flap() {
        this.velocity = -this.jump;
    },
    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;
        if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
            this.velocity = 0;
            gameOver = true;
        }
        if (this.y - this.radius < 0) {
            this.y = this.radius;
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
        if (
            bird.x + bird.radius > pipe.x &&
            bird.x - bird.radius < pipe.x + pipeWidth &&
            (bird.y - bird.radius < pipe.top || bird.y + bird.radius > pipe.bottom)
        ) {
            return true;
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
