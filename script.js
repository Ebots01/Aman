// --- Page Animations ---

// Trigger staggered animation for section cards
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        // Delay each card's animation slightly based on its index
        card.style.animationDelay = `${(index + 1) * 0.2}s`;
    });
});


// --- Snake Game Logic ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("scoreValue");
const restartBtn = document.getElementById("restartBtn");

const gridSize = 20;
let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;

// CHANGED: Increased this number from 120 to 180 to slow down the snake
let gameSpeed = 180; 
let gameLoop;
let isGameActive = false;

function initGame() {
    snake = [{ x: 200, y: 200 }, { x: 180, y: 200 }]; // Start with 2 parts
    dx = gridSize; // Automatically move right
    dy = 0;
    score = 0;
    
    // CHANGED: Make sure it resets to the new normal speed when restarting
    gameSpeed = 180; 
    
    scoreElement.innerText = score;
    isGameActive = true;
    generateFood();
    
    clearInterval(gameLoop);
    gameLoop = setInterval(drawGame, gameSpeed); 
}

document.addEventListener("keydown", changeDirection);
restartBtn.addEventListener("click", initGame);

function changeDirection(event) {
    if(!isGameActive) return;
    const LEFT_KEY = 37, RIGHT_KEY = 39, UP_KEY = 38, DOWN_KEY = 40;
    const keyPressed = event.keyCode;
    const goingUp = dy === -gridSize, goingDown = dy === gridSize;
    const goingRight = dx === gridSize, goingLeft = dx === -gridSize;

    // Prevent scrolling window
    if([37, 38, 39, 40].indexOf(event.keyCode) > -1) event.preventDefault();

    if (keyPressed === LEFT_KEY && !goingRight) { dx = -gridSize; dy = 0; }
    if (keyPressed === UP_KEY && !goingDown) { dx = 0; dy = -gridSize; }
    if (keyPressed === RIGHT_KEY && !goingLeft) { dx = gridSize; dy = 0; }
    if (keyPressed === DOWN_KEY && !goingUp) { dx = 0; dy = gridSize; }
}

function drawGame() {
    if(!isGameActive) return;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    // Food Eaten logic
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.innerText = score;
        generateFood();
        
        // --- LEVEL UP MECHANIC ---
        // CHANGED: Made the speed-up gentler (subtracts 5 instead of 10)
        if (score % 30 === 0 && gameSpeed > 60) {
            gameSpeed -= 5; 
            clearInterval(gameLoop);
            gameLoop = setInterval(drawGame, gameSpeed); 
        }
    } else {
        snake.pop();
    }

    // Collision Logic (Walls or Self)
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height || hitSelf()) {
        gameOver();
        return;
    }

    // Clear Canvas with alpha for slight trail effect
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Food (Neon Magenta Square)
    ctx.fillStyle = "#ff00ff";
    ctx.fillRect(food.x, food.y, gridSize, gridSize);
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#ff00ff";

    // Draw Snake (Neon Cyan)
    ctx.shadowBlur = 0; 
    snake.forEach((part, index) => {
        if(index === 0) {
            ctx.fillStyle = "#ffffff"; // Head is white
        } else {
            ctx.fillStyle = "#00ffff"; // Body cyan
        }
        ctx.fillRect(part.x, part.y, gridSize - 1, gridSize - 1);
    });
}

function gameOver() {
    isGameActive = false;
    clearInterval(gameLoop);
    
    // Draw semi-transparent overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Glitchy text effect on game over
    ctx.fillStyle = "#ff00ff";
    ctx.font = "40px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillText("SYSTEM CRASH", canvas.width / 2, canvas.height / 2);
    ctx.fillStyle = "#ffffff";
    ctx.font = "20px 'Courier New'";
    ctx.fillText(`FINAL_SCORE: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
}

function hitSelf() {
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }
    return false;
}

function generateFood() {
    food.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
    food.y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
}

// Start
initGame();

// ==========================================
// GAME 2: CYBER RUNNER (TEMPLE RUN STYLE)
// ==========================================
const runCanvas = document.getElementById("runnerCanvas");
const runCtx = runCanvas.getContext("2d");
const runnerScoreElement = document.getElementById("runnerScoreValue");
const runnerRestartBtn = document.getElementById("runnerRestartBtn");

let runLoop;
let isRunnerActive = false;
let runScore = 0;
let runSpeed = 5;
let obstacles = [];
let playerLane = 1; // 0 = Left, 1 = Center, 2 = Right
let frameCount = 0;

const laneWidth = runCanvas.width / 3;
const playerSize = 30;

function initRunner() {
    isRunnerActive = true;
    runScore = 0;
    runSpeed = 4; // Starting speed
    obstacles = [];
    playerLane = 1;
    frameCount = 0;
    runnerScoreElement.innerText = runScore;
    
    clearInterval(runLoop);
    // Runs at 60 Frames Per Second for smooth movement
    runLoop = setInterval(updateRunner, 1000 / 60); 
}

// Listen for A (Left) and D (Right) to switch lanes
document.addEventListener("keydown", (e) => {
    if (!isRunnerActive) return;
    
    if (e.key === 'a' || e.key === 'A') {
        if (playerLane > 0) playerLane--;
    }
    if (e.key === 'd' || e.key === 'D') {
        if (playerLane < 2) playerLane++;
    }
});

runnerRestartBtn.addEventListener("click", initRunner);

function updateRunner() {
    frameCount++;
    
    // Clear the canvas
    runCtx.fillStyle = "#000000";
    runCtx.fillRect(0, 0, runCanvas.width, runCanvas.height);

    // Draw Lane Dividers
    runCtx.strokeStyle = "#333333";
    runCtx.setLineDash([20, 15]);
    runCtx.beginPath();
    runCtx.moveTo(laneWidth, 0); runCtx.lineTo(laneWidth, runCanvas.height);
    runCtx.moveTo(laneWidth * 2, 0); runCtx.lineTo(laneWidth * 2, runCanvas.height);
    runCtx.stroke();
    runCtx.setLineDash([]); // Reset line dash

    // Add new obstacles (Red walls to dodge)
    if (frameCount % Math.floor(60 / (runSpeed/4)) === 0) {
        // Pick a random lane (0, 1, or 2)
        let obsLane = Math.floor(Math.random() * 3);
        obstacles.push({
            x: obsLane * laneWidth + (laneWidth - 50) / 2, // Center in lane
            y: -50,
            width: 50,
            height: 20,
            lane: obsLane
        });
    }

    // Move and Draw Obstacles
    runCtx.fillStyle = "#ff0055"; // Danger red color
    runCtx.shadowBlur = 10;
    runCtx.shadowColor = "#ff0055";
    
    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.y += runSpeed; // Move down
        runCtx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // Collision Detection
        let playerX = playerLane * laneWidth + (laneWidth - playerSize) / 2;
        let playerY = runCanvas.height - playerSize - 20;

        if (obs.lane === playerLane && obs.y + obs.height > playerY && obs.y < playerY + playerSize) {
            runnerGameOver();
            return;
        }
    }

    // Remove old obstacles that passed the bottom and increase score
    if (obstacles.length > 0 && obstacles[0].y > runCanvas.height) {
        obstacles.shift();
        runScore += 10;
        runnerScoreElement.innerText = runScore;
        
        // Make the game faster as you survive!
        if (runScore % 100 === 0) runSpeed += 0.5;
    }

    // Draw Player (Cyber Blue Square)
    let pX = playerLane * laneWidth + (laneWidth - playerSize) / 2;
    let pY = runCanvas.height - playerSize - 20;
    
    runCtx.fillStyle = "#00ffff";
    runCtx.shadowColor = "#00ffff";
    runCtx.fillRect(pX, pY, playerSize, playerSize);
}

function runnerGameOver() {
    isRunnerActive = false;
    clearInterval(runLoop);
    
    runCtx.fillStyle = "rgba(0, 0, 0, 0.8)";
    runCtx.fillRect(0, 0, runCanvas.width, runCanvas.height);
    
    runCtx.fillStyle = "#ff00ff";
    runCtx.shadowBlur = 0;
    runCtx.font = "30px 'Courier New'";
    runCtx.textAlign = "center";
    runCtx.fillText("YOU CRASHED", runCanvas.width / 2, runCanvas.height / 2);
    runCtx.fillStyle = "#ffffff";
    runCtx.font = "20px 'Courier New'";
    runCtx.fillText(`DISTANCE: ${runScore}`, runCanvas.width / 2, runCanvas.height / 2 + 40);
}

// Draw initial screen for runner so it isn't blank
runCtx.fillStyle = "#000";
runCtx.fillRect(0, 0, runCanvas.width, runCanvas.height);
runCtx.fillStyle = "#00ffff";
runCtx.font = "20px 'Courier New'";
runCtx.textAlign = "center";
runCtx.fillText("PRESS START TO RUN", runCanvas.width / 2, runCanvas.height / 2);