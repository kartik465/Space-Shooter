function bombCollisionDetection() {
  const explosionRadius = 100; // Define explosion radius

  for (let i = bombs.length - 1; i >= 0; i--) {
    const bomb = bombs[i];

    // Check collision with enemies
    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];

      if (
        bomb.x < enemy.x + enemy.width &&
        bomb.x + 10 > enemy.x &&
        bomb.y < enemy.y + enemy.height &&
        bomb.y + 10 > enemy.y
      ) {
        // Remove the bomb
        bombs.splice(i, 1);

        // Destroy nearby enemies
        for (let k = enemies.length - 1; k >= 0; k--) {
          const nearbyEnemy = enemies[k];
          const distance = Math.sqrt(
            Math.pow(bomb.x - nearbyEnemy.x, 2) +
            Math.pow(bomb.y - nearbyEnemy.y, 2)
          );
          if (distance < explosionRadius) {
            // Increment score and coins based on the type of enemy
            if (nearbyEnemy.color === "#0000FF") {
              // Tough enemy
              score += 75.5; // 50% more score
              coins += 60; // 50% more coins
            } else {
              // Normal enemy
              score += 55;
              coins += 40;
            }

            // Remove the enemy
            enemies.splice(k, 1);
          }
        }

        // Play bomb sound
        bombSound.currentTime = 0;
        bombSound.play();

        // Exit the enemy loop since the bomb has been processed
        break;
      }
    }

    // Check collision with asteroids
    for (let j = asteroids.length - 1; j >= 0; j--) {
      const asteroid = asteroids[j];

      if (
        bomb.x < asteroid.x + asteroid.width &&
        bomb.x + 10 > asteroid.x &&
        bomb.y < asteroid.y + asteroid.height &&
        bomb.y + 10 > asteroid.y
      ) {
        // Remove the bomb
        bombs.splice(i, 1);

        // Destroy nearby asteroids
        for (let k = asteroids.length - 1; k >= 0; k--) {
          const nearbyAsteroid = asteroids[k];
          const distance = Math.sqrt(
            Math.pow(bomb.x - nearbyAsteroid.x, 2) +
            Math.pow(bomb.y - nearbyAsteroid.y, 2)
          );
          if (distance < explosionRadius) {
            // Increment score and coins for destroying asteroids
            score += 30;
            coins += 20;

            // Remove the asteroid
            asteroids.splice(k, 1);
          }
        }

        // Play bomb sound
        bombSound.currentTime = 0;
        bombSound.play();

        // Exit the asteroid loop since the bomb has been processed
        break;
      }
    }
  }
}



function drawCoins() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "#FFD700";
  ctx.textAlign = "right";
  ctx.fillText("Coins: " + coins, canvas.width - 10, 60);
}

const battery = {
  max: 75,
  current: 75
};

let isBlinking = false;
let batteryBlinkTimer;

function drawBattery() {
  const batteryWidth = 20;
  const batteryHeight = 155;
  const batteryX = 20;
  const batteryY = 20;

  ctx.strokeStyle = "#FFFFFF";
  ctx.strokeRect(batteryX, batteryY, batteryWidth, batteryHeight);

  let batteryColor;
  const batteryPercentage = (battery.current / battery.max) * 100;
  if (batteryPercentage > 75) {
    batteryColor = "#00FF00";
  } else if (batteryPercentage > 25) {
    batteryColor = "#FFFF00";
  } else if (batteryPercentage > 10) {
    batteryColor = "#FFA500";
  } else {
    batteryColor = "#FF0000";
  }

  if (batteryPercentage < 25) {
    if (!batteryBlinkTimer) {
      batteryBlinkTimer = setInterval(() => {
        isBlinking = !isBlinking;
      }, 500);
    }
    if (isBlinking) {
      batteryColor = "#FFFF00";
    } else {
      batteryColor = "#FF0000";
    }
  } else if (batteryBlinkTimer) {
    clearInterval(batteryBlinkTimer);
    batteryBlinkTimer = null;
    isBlinking = false;
  }

  const batteryLevelHeight = (battery.current / battery.max) * batteryHeight;
  ctx.fillStyle = batteryColor;
  ctx.fillRect(
    batteryX,
    batteryY + batteryHeight - batteryLevelHeight,
    batteryWidth,
    batteryLevelHeight
  );
}

function regenerateBattery() {
  if (battery.current < battery.max) {
    battery.current = Math.min(battery.max, battery.current + 2);
  }
}

setInterval(regenerateBattery, 4000);

let lastLaserTime = 0;

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();
  movePlayer();
  spawnEnemy();
  moveEnemies();
  drawScore();
  drawPlayer();
  drawEnemies();
  drawLasers();
  drawBombs(); // Draw bombs
  drawBattery();
  moveLasers();
  moveBombs(); // Move bombs
  collisionDetection();
  bombCollisionDetection(); // Check for bomb collisions
  drawCoins();
  drawHearts(player.health); // Draw hearts for player health


  spawnAsteroid();
  moveAsteroids() ;
  drawAsteroids()
  asteroidCollisionDetection();

  const currentTime = Date.now();
  if (currentTime - lastLaserTime < 1000) {
    backgroundMusic.volume = 0.3;
    laserSound.volume = 0.3;
  } else {
    backgroundMusic.volume = 0.5;
    laserSound.volume = 0.3;
  }

  requestAnimationFrame(draw);
}

const keys = {
  left: false,
  right: false
};

// Touch control variables
// Touch control variables
let touchLeft = false;
let touchRight = false;
let touchLaser = false;
let touchBomb = false;
let touchStartPos = { x: 0, y: 0 };
let touchEndPos = { x: 0, y: 0 };
let swipeThreshold = 30; // Minimum distance for a swipe to be registered

// Function to handle touch start
function handleTouchStart(event) {
  const touch = event.touches[0];
  touchStartPos = { x: touch.clientX, y: touch.clientY };

  // Determine touch areas immediately
  const screenWidth = window.innerWidth;

  // Left and right touch areas
  if (touchStartPos.x < screenWidth / 2) {
    touchLeft = true;
    touchRight = false;
  } else {
    touchRight = true;
    touchLeft = false;
  }
}

// Function to handle touch move
function handleTouchMove(event) {
  const touch = event.touches[0];
  const screenWidth = window.innerWidth;

  if (touch.clientX < screenWidth / 2) {
    touchLeft = true;
    touchRight = false;
  } else {
    touchRight = true;
    touchLeft = false;
  }
}

// Function to handle touch end
function handleTouchEnd(event) {
  const touch = event.changedTouches[0];
  touchEndPos = { x: touch.clientX, y: touch.clientY };

  handleGesture();
}

// Function to handle gestures
function handleGesture() {
  const deltaX = touchEndPos.x - touchStartPos.x;
  const deltaY = touchEndPos.y - touchStartPos.y;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Horizontal swipe
    if (Math.abs(deltaX) > swipeThreshold) {
      if (deltaX > 0) {
        // Swipe right
        touchRight = true;
        touchLeft = false;
      } else {
        // Swipe left
        touchLeft = true;
        touchRight = false;
      }
    }
  } else {
    // Vertical swipe
    if (Math.abs(deltaY) > swipeThreshold) {
      if (deltaY > 0) {
        // Swipe down
        touchBomb = true;
        touchLaser = false;
      } else {
        // Swipe up
        touchLaser = true;
        touchBomb = false;
      }
    }
  }
}

// Event listeners for touch controls
window.addEventListener("touchstart", handleTouchStart);
window.addEventListener("touchmove", handleTouchMove);
window.addEventListener("touchend", handleTouchEnd);

// Example player object with movement methods

// Update function to handle touch controls
function update() {
  // Handle movement
  if (keys.left || touchLeft) {
    player.moveLeft();
  }
  if (keys.right || touchRight) {
    player.moveRight();
  }

  // Handle shooting lasers
  if (touchLaser) {
    player.shootLaser();
  }

  // Handle throwing bombs
  if (touchBomb) {
    player.throwBomb();
  }
}

// Example game loop
function gameLoop() {
  update();
  requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();

// Update function should be called in your game loop
// Example:
 setInterval(update, 1000 / 60); // 60 FPS

// Keyboard event listeners (existing code)
window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    keys.left = true;
  }
  if (event.key === "ArrowRight") {
    keys.right = true;
  }
  if (event.key === "Shift") {
    // Handle shift key for bomb throw
    if (!bombCooldown && battery.current > 10) {
      bombs.push({ x: player.x, y: player.y - player.height / 2 });
      bombCooldown = true;
      setTimeout(() => {
        bombCooldown = false;
      }, bombCooldownTime);
      bombSound.currentTime = 0;
      bombSound.play();
    }
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft") {
    keys.left = false;
  }
  if (event.key === "ArrowRight") {
    keys.right = false;
  }
});

canvas.addEventListener("mousedown", (event) => {
  if (event.button === 0) {
    if (battery.current > 0) {
      lasers.push({ x: player.x, y: player.y - player.height / 2 });
      battery.current = Math.max(0, battery.current - 2);
      laserSound.currentTime = 0;
      laserSound.play();
      lastLaserTime = Date.now();
    }
  }
});

const mousePos = { x: canvas.width / 2, y: player.y };

canvas.addEventListener("mousemove", (event) => {
  mousePos.x = event.clientX - canvas.getBoundingClientRect().left;
});

let lastTime = 0;
let frames = 0;

function updateFPS() {
  // Get current timestamp
  const currentTime = Date.now();
  frames++;

  // Calculate FPS every 100 milliseconds (adjust as needed)
  if (currentTime > lastTime + 100) {
    const fps = Math.round((frames * 1000) / (currentTime - lastTime));
    console.log(`FPS: ${fps}`);
    lastTime = currentTime;
    frames = 0;
  }

  // Schedule next animation frame using requestAnimationFrame
  requestAnimationFrame(updateFPS);
}

// Start the FPS meter (optional, for debugging)
requestAnimationFrame(updateFPS);



draw();
