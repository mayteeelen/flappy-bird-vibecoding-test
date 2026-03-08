
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
    w: 48, // groter
    h: 34, // groter
    gravity: 0.18, // minder snel vallen
    jump: 5.2,     // iets krachtiger sprong
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
const pipeGap = 170; // grotere opening
let pipeTimer = 0;
const pipeInterval = 120; // pijpen komen minder vaak

function addPipe() {
    const top = Math.random() * (canvas.height - pipeGap - 100) + 50;
    pipes.push({
        x: canvas.width,
        top: top,
        bottom: top + pipeGap
    });
}

function drawPipes() {
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
        ctx.restore();
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
let lives = 3;
let gameOver = false;

function drawScore() {
    ctx.fillStyle = '#000';
    ctx.font = '32px Arial';
    ctx.fillText(score, 20, 50);
    // Levens
    ctx.font = '24px Arial';
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
            if (lives > 0) {
                // Zet vogel terug naar startpositie en snelheid
                bird.y = 150;
                bird.velocity = 0;
                // Schuif alle pijpen verder naar rechts zodat je tijd krijgt
                pipes.forEach(pipe => { pipe.x += 120; });
            } else {
                gameOver = true;
            }
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
canvas.addEventListener('mousedown', function() {
    if (gameOver) {
        resetGame();
    } else {
        bird.flap();
    }
});

gameLoop();
