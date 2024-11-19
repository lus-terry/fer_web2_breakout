// Get canvas element from index.html by id
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game parameters
const BALL_RADIUS = 10;
const BRICK_ROWS = 5;
const BRICK_COLS = 10;
const BRICK_WIDTH = canvas.width / BRICK_COLS - 6;
const BRICK_HEIGHT = 25;
const BRICK_OFFSET_TOP = 50;
const BRICK_PADDING = 5;
const BRICK_COLORS = ["red", "orange", "yellow", "green", "blue"];
const PADDLE_WIDTH = canvas.width / 10 - 6;
const PADDLE_HEIGHT = BRICK_HEIGHT;


// Game variables
let paddleX = (canvas.width - PADDLE_WIDTH) / 2;
let paddleY = canvas.height - PADDLE_HEIGHT - 10;
let ballX = canvas.width / 2;
let ballY = paddleY - BALL_RADIUS - 20;
let ballXchange = 3 * (Math.random() < 0.5 ? 1 : -1);
let ballYchange = -3;
let bricks = [];
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let isGameOver = false;
let isPaddleMovingLeft = false; 
let isPaddleMovingRight = false; 
const paddleSpeed = 7;

// Initialize bricks function
function initializeBricks() {
  for (let r = 0; r < BRICK_ROWS; r++) { // Iterate through each row
    bricks[r] = []; //brick array
    for (let c = 0; c < BRICK_COLS; c++) { // Iterate through each column in teh current row
      bricks[r][c] = { // Create new brick
        x: 0,
        y: 0,
        visible: true,
      };
    }
  }
}

// Draw paddle
function drawPaddle() {
  // Set shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";  
  ctx.shadowBlur = 10;                     
  ctx.shadowOffsetX = 4;                   
  ctx.shadowOffsetY = 4;

  //Set color
  ctx.fillStyle = "blue";

  // Draw paddle
  ctx.fillRect(paddleX, paddleY, PADDLE_WIDTH, PADDLE_HEIGHT);
}

// Draw ball
function drawBall() {
    ctx.beginPath(); // Start new path 
    ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2); // Draw a circle

    // Set color 
    ctx.fillStyle = "white"; 
    ctx.fill(); 

    ctx.closePath(); // Close path 
  }
  

// Draw single brick
function drawSingleBrick(brick, color) {
  // Set shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";  
  ctx.shadowBlur = 10;                     
  ctx.shadowOffsetX = 4;                   
  ctx.shadowOffsetY = 4;

  // Set color
  ctx.fillStyle = color;

  // Draw brick
  ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
}

// Draw all bricks
function drawBricks() {
    for (let r = 0; r < BRICK_ROWS; r++) { // Iterate through each row
      for (let c = 0; c < BRICK_COLS; c++) { // Iterate through each column in the current row
        const brick = bricks[r][c]; // Get current brick
        if (brick.visible) { // Check if brick is visible
          brick.x = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_PADDING; // Calculate X position 
          brick.y = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_PADDING + BRICK_OFFSET_TOP; // Calculate Y 
          drawSingleBrick(brick, BRICK_COLORS[r % BRICK_COLORS.length]); // Draw brick 
        }
      }
    }
  }
  

// Write score
function drawScore() {
  // Set size and font
  ctx.font = "20px Arial";

  // Set color
  ctx.fillStyle = "white";

  //Write scores
  ctx.fillText(`Score: ${score}`, canvas.width - 150, 35);
  ctx.fillText(`High Score: ${highScore}`, canvas.width - 350, 35);
}

// Detect collisions
function detectCollisions() {
    // Ball and walls
    if (ballX + BALL_RADIUS > canvas.width || ballX - BALL_RADIUS < 0) {
      ballXchange = -ballXchange; // Reverse horizontal direction when hitting the walls
    }
    if (ballY - BALL_RADIUS < 0) {
      ballYchange = -ballYchange; // Reverse vertical direction when hitting the top wall
    }

    // Ball and paddle
    if (
      ballX > paddleX &&                      // Ball is within the left edge of the paddle
      ballX < paddleX + PADDLE_WIDTH &&        // Ball is within the right edge of the paddle
      ballY + BALL_RADIUS > paddleY           // Ball is touching the top of the paddle
    ) {
      ballYchange = -ballYchange; // Reverse vertical direction when hitting the paddle

      // Ball bounces differently depending on where it hits the paddle
      const paddleCenterX = paddleX + PADDLE_WIDTH / 2;
      const ballDistFromCenter = ballX - paddleCenterX;

      if (ballDistFromCenter < 0) { // Ball hits the left side of the paddle
        ballXchange = -Math.abs(ballXchange); // Ball moves left after hitting the left side
      } else if (ballDistFromCenter > 0) { // Ball hits the right side of the paddle
        ballXchange = Math.abs(ballXchange); // Ball moves right after hitting the right side
      }
      
    }

    // Ball and bricks
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        const brick = bricks[r][c];
        if (
          brick.visible &&                         // Check if the brick is still visible
          ballX > brick.x &&                       // Ball is to the right of the left edge of the brick
          ballX < brick.x + BRICK_WIDTH &&         // Ball is to the left of the right edge of the brick
          ballY > brick.y &&                       // Ball is below the top edge of the brick
          ballY < brick.y + BRICK_HEIGHT          // Ball is above the bottom edge of the brick
        ) {
          ballYchange = -ballYchange; // Reverse vertical direction when hitting the brick
          brick.visible = false;      // Make the brick disappear
          score++;                    // Increment score for destroyed brick
          if (score > highScore) {
            highScore = score;        // Update high score
            localStorage.setItem("highScore", highScore); // Save high score in localStorage
          }
        }
      }
    }

    // Ball out of bounds (bottom edge)
    if (ballY + BALL_RADIUS > canvas.height) {
      isGameOver = true; // Set game over when ball goes out of bounds
    }
}


// Game over function
function gameOver() {
    ctx.font = "70px 'ArcadeClassic', sans-serif"; // Set size and font
    ctx.fillStyle = "white"; // Set color
    ctx.textAlign = "center"; // Center text
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2); // Display main message
    ctx.font = "20px Arial";
    ctx.fillText("Press 'R' to restart", canvas.width / 2, canvas.height / 2 + 50); 
  }
  
  // Win function
  function win() {
    ctx.font = "70px 'ArcadeClassic', sans-serif"; // Set size and font
    ctx.fillStyle = "white"; // Set color
    ctx.textAlign = "center"; // Center text
    ctx.fillText("YOU WIN!", canvas.width / 2, canvas.height / 2); // Display main message
    ctx.font = "20px Arial";
    ctx.fillText("Press 'R' to restart", canvas.width / 2, canvas.height / 2 + 50); 
  }
  

// Reset game function
function resetGame() {
  // Reset game variables
  paddleX = (canvas.width - PADDLE_WIDTH) / 2;
  ballX = canvas.width / 2;
  ballY = paddleY - BALL_RADIUS - 20;
  ballXchange = 5 * (Math.random() < 0.5 ? 1 : -1);
  ballYchange = -5;
  score = 0;
  isGameOver = false;

  // Make bricks visible again
  initializeBricks();

  // Start game again
  update();
}

// Update game function
function update() {
    console.log(getComputedStyle(document.body).fontFamily);

  // If game is over call gameOver fnction
  if (isGameOver) {
    gameOver();
    return;
  }

  // If all bricks are destroyed call win function
  if (score === BRICK_ROWS * BRICK_COLS) {
    win();
    return;
  }

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw paddle, ball, bricks and scores
  drawPaddle();
  drawBall();
  drawBricks();
  drawScore();

  // Update ball position 
  ballX += ballXchange;
  ballY += ballYchange;

  // Check colisions
  detectCollisions();

  // Update paddle position
  updatePaddlePosition();

  // Request next animation frame
  requestAnimationFrame(update);
}

// Event listeners for paddle movement

document.addEventListener("keydown", (e) => {
// When the left arrow key is pressed => set isPaddleMovingLeft true
    if (e.key === "ArrowLeft") {
      isPaddleMovingLeft = true;
    }
// When the right arrow key is pressed => set isPaddleMovingRight true
    if (e.key === "ArrowRight") {
      isPaddleMovingRight = true;
    }
});

document.addEventListener("keyup", (e) => {
// When the left arrow key is released => set isPaddleMovingLeft false
  if (e.key === "ArrowLeft") {
    isPaddleMovingLeft = false;
  }
// When the right arrow key is released => set isPaddleMovingRight false
  if (e.key === "ArrowRight") {
    isPaddleMovingRight = false;
  }
});

// Updating paddle position function
function updatePaddlePosition() {
// If paddle is moving left and paddle is not at the left edge of the canvas => move the paddle left
  if (isPaddleMovingLeft && paddleX > 0) {
    paddleX -= paddleSpeed; // Move paddle left
  }
// If paddle is moving right and paddle is not at the right edge of the canvas => move the paddle right
  if (isPaddleMovingRight && paddleX < canvas.width - PADDLE_WIDTH) {
    paddleX += paddleSpeed; // Move paddle right
  }
}

// Event listener for restarting the game on "R" key
document.addEventListener("keydown", (e) => {
    if (isGameOver && e.key.toLowerCase() === "r") {
      resetGame(); // Restart game on "R" key press
    }
  });
  

// Start the game
initializeBricks();
update();

