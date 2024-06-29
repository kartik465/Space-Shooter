const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const aspectRatio = 16 / 9; // Example aspect ratio (adjust as needed)
let canvasWidth, canvasHeight;

function resizeCanvas() {
  const { innerWidth, innerHeight } = window;
  const orientation = innerWidth > innerHeight ? "landscape" : "portrait";

  if (orientation === "landscape") {
    canvasHeight = innerHeight;
    canvasWidth = canvasHeight * aspectRatio;
  } else {
    canvasWidth = innerWidth;
    canvasHeight = canvasWidth / aspectRatio;
  }

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", resizeCanvas); // Handle orientation change
resizeCanvas(); // Call initially to set the canvas size
// Call initially to set the canvas size

const backgroundImage = new Image();
backgroundImage.onload = function () {
  draw();
};
backgroundImage.src = "background.jpg";

// PLayer //

const playerImage = new Image();
playerImage.onload = function () {
  draw();
};
playerImage.src = "PLAYER.svg";

const player = {
  x: canvas.width / 2,
  y: canvas.height - 50,
  width: 120,
  height: 120,
  speed: 3,
  velocityX: 0,
  health: 100, // Initial health set to 100
  maxHealth: 100 // Maximum health the player can have
};


// Function to draw hearts representing player's health

let playerMaxHealth = 100;
let animationTimer = 0;
let animationDirection = 1;
let visible = true;
let blinkInterval = 1000; // Interval between blinking effects
let blinkTimer = null; // Timer for blinking effect

function drawHearts(playerHealth) {
  const heartWidth = 30;
  const heartHeight = 30;
  const heartsX = 20;
  const heartsY = 60;

  ctx.fillStyle = "#FF0000"; // Red color for hearts

  // Draw hearts
  for (let i = 0; i < Math.floor(playerHealth / 10); i++) {
    const heartX = heartsX + i * (heartWidth + 5);
    const heartY = heartsY;

    // Draw a heart shape
    ctx.beginPath();
    ctx.moveTo(heartX + heartWidth / 2, heartY + heartHeight / 4);
    ctx.bezierCurveTo(
      heartX + heartWidth,
      heartY,
      heartX + heartWidth,
      heartY + heartHeight / 2,
      heartX + heartWidth / 2,
      heartY + heartHeight
    );
    ctx.bezierCurveTo(
      heartX,
      heartY + heartHeight / 2,
      heartX,
      heartY,
      heartX + heartWidth / 2,
      heartY + heartHeight / 4
    );
    ctx.fill();
  }

  // Blinking effect below hearts if player's health is below 25%
  if (playerHealth < 25 && !blinkTimer) {
    blinkTimer = setInterval(() => toggleBlink(playerHealth), blinkInterval);
  } else if (playerHealth >= 25 && blinkTimer) {
    clearInterval(blinkTimer);
    blinkTimer = null;
    ctx.clearRect(
      0,
      heartsY + heartHeight + 10,
      Math.max(0, player.maxHealth - playerHealth) * (heartWidth / player.maxHealth) * (30 + 5),
      5
    );
  }

  // Animation effect on the hearts
  if (animationTimer > 0) {
    animationTimer -= deltaTime;
    if (animationTimer <= 0) {
      animationDirection *= -1;
      animationTimer = animationSpeed;
    }
    for (let i = 0; i < Math.floor(playerHealth / 10); i++) {
      const heartX = heartsX + i * (heartWidth + 5);
      const heartY = heartsY;
      ctx.save();
      ctx.translate(heartX, heartY);
      ctx.rotate(animationDirection * Math.PI / 180);
      ctx.beginPath();
      ctx.moveTo(heartWidth / 2, heartHeight / 4);
      ctx.bezierCurveTo(
        heartWidth,
        height,
        heartWidth,
        height / 2,
        width / 2,
        height
      );
      ctx.bezierCurveTo(
        width,
        height / 2,
        width,
        height,
        width / 2,
        height / 4
      );
      ctx.fill();
      ctx.restore();
    }
    animationDirection += animationSpeed;
   
}

function toggleBlink() {
  if (visible) {
    ctx.clearRect(
      0,
      heartsY + heartHeight + 10,
      Math.max(0, playerMaxHealth - playerHealth) * (heartWidth / playerMaxHealth) * (30 + 5),
      5
    );
    visible = false;
  } else {
    ctx.fillStyle = "#FF0000"; // Red color for hearts
    ctx.fillRect(
      0,
      heartsY + heartHeight + 10,
      Math.max(0, playerMaxHealth - playerHealth) * (heartWidth / playerMaxHealth) * (30 + 5),
      5
    );
    visible = true;
  }
}
}

// Assuming player object is defined like this:

// Example usage:
// drawHearts(player.health);
// bombs //
const lasers = [];
const bombs = [];

let bombCooldown = false;
const bombCooldownTime = 2000; // 5 seconds cooldown

const backgroundMusic = new Audio("background.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;
backgroundMusic.play();

const laserSound = new Audio("laser.mp3");
laserSound.volume = 0.3;

const bombSound = new Audio("falling-bomb.mp3");
bombSound.volume = 0.5;
// image //
function drawBackground() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}
// player //
function drawPlayer() {
  ctx.drawImage(
    playerImage,
    player.x - player.width / 2,
    player.y - player.height / 2,
    player.width,
    player.height
  );
}
// enemies //
const enemies = [];

function drawEnemies() {
  for (const enemy of enemies) {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  }
}

// lasers //
function drawLasers() {
  for (const laser of lasers) {
    // Calculate smooth movement by interpolating the position
    laser.interpolateY = laser.interpolateY || laser.y;
    laser.interpolateY -= 0.2 * (laser.interpolateY - laser.y);

    // Adjust parameters for the laser shape
    let laserWidth = 10;
    let laserHeight = 20;
    let cornerRadius = 5;

    // Example gradient fill
    let gradient = ctx.createLinearGradient(laser.x - laserWidth / 2, laser.interpolateY, laser.x + laserWidth / 2, laser.interpolateY);
    gradient.addColorStop(0, '#00FF00');
    gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
    ctx.fillStyle = gradient;

    // Example motion blur effect
    ctx.shadowColor = '#00FF00';
    ctx.shadowBlur = 5;

    // Draw the rounded rectangle laser
    roundRect(ctx, laser.x - laserWidth / 2, laser.interpolateY, laserWidth, laserHeight, cornerRadius);

    // Reset shadow and other effects
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.fill();
}






/**
 * Draws the bombs on the canvas.
 *
 * @function
 * @name drawBombs
 */
function drawBombs() {
  // Iterate through each bomb
  for (const bomb of bombs) {
    // Create a radial gradient (inner color, outer color)
    const gradient = ctx.createRadialGradient(bomb.x, bomb.y, 5, bomb.x, bomb.y, 10);
    gradient.addColorStop(0, '#FF4500'); // Inner color
    gradient.addColorStop(1, '#8B0000'); // Outer color

    // Set the fill style to the gradient
    ctx.fillStyle = gradient;

    // Optionally, add a shadow to the bomb
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw spikes around the bomb
    const spikeCount = 8;
    const spikeLength = 15;
    for (let i = 0; i < spikeCount; i++) {
      const angle = (i * 2 * Math.PI) / spikeCount;
      const xStart = bomb.x + Math.cos(angle) * 10;
      const yStart = bomb.y + Math.sin(angle) * 10;
      const xEnd = bomb.x + Math.cos(angle) * (10 + spikeLength);
      const yEnd = bomb.y + Math.sin(angle) * (10 + spikeLength);

      ctx.beginPath();
      ctx.moveTo(xStart, yStart);
      ctx.lineTo(xEnd, yEnd);
      ctx.strokeStyle = '#FF4500';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw a filled circle representing the bomb
    ctx.beginPath();
    ctx.arc(bomb.x, bomb.y, 10, 0, 2 * Math.PI);
    ctx.fill();

    // Restore the default shadow settings for the next elements
    ctx.shadowBlur = 0;
  }
}



function movePlayer() {
  const acceleration = 0.5;
  const targetX = mousePos.x;

  if (player.x !== targetX) {
    player.velocityX = (targetX - player.x) * acceleration;
  }

  player.x += player.velocityX;

  if (player.x - player.width / 2 < 0) {
    player.x = player.width / 2;
    player.velocityX = 0;
  } else if (player.x + player.width / 2 > canvas.width) {
    player.x = canvas.width - player.width / 2;
    player.velocityX = 0;
  }
}

let enemySpawnRate = 2000;
let lastSpawnTime = 0;

function spawnEnemy() {
  const currentTime = Date.now();
  if (currentTime - lastSpawnTime > enemySpawnRate) {
    lastSpawnTime = currentTime;

    const isToughEnemy = Math.random() < 0.5; // 50% chance to spawn a tough enemy
    const newEnemy = {
      x: Math.random() * (canvas.width - 30), // Random X position within canvas
      y: 0,
      width: 30,
      height: 30,
      color: isToughEnemy ? "#0000FF" : "#FF0000", // Blue for tough enemies, red for normal
      speed: 3,
      health: isToughEnemy ? 2 : 1 // Tough enemies have 2 health points
    };

    // Check for overlap with existing enemies
    let overlap = false;
    for (const enemy of enemies) {
      if (
        newEnemy.x < enemy.x + enemy.width &&
        newEnemy.x + newEnemy.width > enemy.x &&
        newEnemy.y < enemy.y + enemy.height &&
        newEnemy.y + newEnemy.height > enemy.y
      ) {
        overlap = true;
        break;
      }
    }

    if (!overlap) {
      enemies.push(newEnemy);
    }
  }
}

function moveEnemies() {
  const boundaryMargin = canvas.width * 0.2; // 20% of canvas width as boundary margin

  for (const enemy of enemies) {
    enemy.y += enemy.speed;
    if (enemy.y > canvas.height) {
      enemy.y = 0;
      enemy.x = Math.random() * (canvas.width - 30); // Respawn at a new random X position
    }

    // Ensure enemy stays within canvas boundaries horizontally
    if (enemy.x < boundaryMargin) {
      enemy.x = boundaryMargin;
    } else if (enemy.x + enemy.width > canvas.width - boundaryMargin) {
      enemy.x = canvas.width - boundaryMargin - enemy.width;
    }

    // Avoid overlapping with other enemies horizontally
    for (const otherEnemy of enemies) {
      if (enemy !== otherEnemy) {
        if (
          enemy.x < otherEnemy.x + otherEnemy.width &&
          enemy.x + enemy.width > otherEnemy.x
        ) {
          const direction = enemy.x < otherEnemy.x ? -1 : 1;
          enemy.x += direction * enemy.speed;
        }
      }
    }
  }
}

function moveLasers() {
  const laserSpeed = 5;

  for (const laser of lasers) {
    laser.y -= laserSpeed;
    if (laser.y < 0) {
      lasers.splice(lasers.indexOf(laser), 1);
    }
  }
}

function moveBombs() {
  const bombSpeed = 7;

  for (const bomb of bombs) {
    bomb.y -= bombSpeed;
    if (bomb.y < 0) {
      bombs.splice(bombs.indexOf(bomb), 1);
    }
  }
}

let score = 0;

function drawScore() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "right";
  ctx.fillText("Score: " + score, canvas.width - 10, 30);
}

let coins = 0;

const collisionSound = new Audio("collision.mp3");
collisionSound.volume = 0.5;



function collisionDetection() {
  // Check collision between lasers and enemies
  for (let i = lasers.length - 1; i >= 0; i--) {
    const laser = lasers[i];
    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];
      if (
        laser.x < enemy.x + enemy.width &&
        laser.x + 5 > enemy.x &&
        laser.y < enemy.y + enemy.height &&
        laser.y + 5 > enemy.y
      ) {
        // Decrease enemy health
        enemy.health -= 1;

        // Play collision sound
        collisionSound.play();

        // Remove the laser that hit the enemy
        lasers.splice(i, 1);

        if (enemy.health <= 0) {
          // Increment score and coins based on the type of enemy
          if (enemy.color === "#0000FF") {
            // Tough enemy
            score += 22.5; // 50% more score
            coins += 30; // 50% more coins
          } else {
            // Normal enemy
            score += 15;
            coins += 20;
          }

          // Reset enemy position
          enemy.y = 0;
          enemy.x = Math.random() * (canvas.width - 30);
          enemy.health = enemy.color === "#0000FF" ? 2 : 1; // Reset health
        }

        // Exit the loop since the laser is destroyed
        break;
      }
    }
  }

  // Check collision between player and enemies
  for (const enemy of enemies) {
    if (
      player.x < enemy.x + enemy.width &&
      player.x + player.width > enemy.x &&
      player.y < enemy.y + enemy.height &&
      player.y + player.height > enemy.y
    ) {
      // Decrease player health
      player.health -= 2;

      // Play collision sound
      collisionSound.play();

      // Reset enemy position
      enemy.y = 0;
      enemy.x = Math.random() * (canvas.width - 30);

      // Check if player is dead
      if (player.health <= 0) {
        // Game over logic
        alert("Game Over!");
        player.health = player.maxHealth;

        // Reset player's battery to 75
        player.battery = 75;

        score = 0;
        coins = 0;

        // Clear enemies array
        enemies.splice(0, enemies.length);
      }
    }
  }
}


// asteriod //
const asteroids = [];
const maxAsteroids = 5;
function spawnAsteroid() {
  if (asteroids.length < maxAsteroids) {
      let asteroid;
      let minDistance = 100; // Minimum distance between asteroids
      let edgeBuffer = canvas.width * 0.1; // 10% of canvas width as edge buffer

      do {
          asteroid = {
              x: Math.random() * (canvas.width - 50),
              y: -50,
              width: 50,
              height: 50,
              speed: 2,
              health: 3,
              color: "grey"
          };

          // Check distance from existing asteroids
          let tooClose = false;
          for (const existingAsteroid of asteroids) {
              // Calculate distance between centers of two asteroids
              const dx = asteroid.x + asteroid.width / 2 - (existingAsteroid.x + existingAsteroid.width / 2);
              const dy = asteroid.y + asteroid.height / 2 - (existingAsteroid.y + existingAsteroid.height / 2);
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < minDistance) {
                  tooClose = true;
                  break;
              }
          }

          // Check distance from left and right edges
          if (!tooClose) {
              if (asteroid.x < edgeBuffer || asteroid.x + asteroid.width > canvas.width - edgeBuffer) {
                  tooClose = true;
              }
          }

          if (!tooClose) {
              asteroids.push(asteroid);
              break; // Exit the loop if asteroid is successfully added
          }
      } while (true); // Infinite loop until a suitable position is found
  }
}


function moveAsteroids() {
  for (const asteroid of asteroids) {
      asteroid.y += asteroid.speed;
      if (asteroid.y > canvas.height) {
          asteroid.y = -asteroid.height;
          asteroid.x = Math.random() * (canvas.width - asteroid.width);
      }
  }
}

function drawAsteroids() {
  for (const asteroid of asteroids) {
      // Create a radial gradient for the asteroid to simulate lighting
      const gradient = ctx.createRadialGradient(
          asteroid.x + asteroid.width / 2, asteroid.y + asteroid.height / 2, asteroid.width / 8,
          asteroid.x + asteroid.width / 2, asteroid.y + asteroid.height / 2, asteroid.width / 2
      );
      
      gradient.addColorStop(0, asteroid.color);
      gradient.addColorStop(1, 'black');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      
      // Draw an irregular shape using a series of connected points
      const points = [];
      const numPoints = 8 + Math.floor(Math.random() * 4); // Between 8 and 11 points
      const angleStep = (Math.PI * 2) / numPoints;
      const radius = asteroid.width / 2;
      
      for (let i = 0; i < numPoints; i++) {
          const angle = i * angleStep;
          const distance = radius * (0.8 + Math.random() * 0.4); // 80% to 120% of radius
          const x = asteroid.x + asteroid.width / 2 + Math.cos(angle) * distance;
          const y = asteroid.y + asteroid.height / 2 + Math.sin(angle) * distance;
          points.push({ x, y });
      }
      
      // Draw the first point
      ctx.moveTo(points[0].x, points[0].y);
      
      // Draw the rest of the points
      for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
      }
      
      // Close the path and fill the shape
      ctx.closePath();
      ctx.fill();
      
      // Add some craters to the asteroid for more realism
      const numCraters = 2 + Math.floor(Math.random() * 3); // 2 to 4 craters
      for (let i = 0; i < numCraters; i++) {
          const craterRadius = radius * (0.1 + Math.random() * 0.2); // 10% to 30% of asteroid radius
          const craterX = asteroid.x + asteroid.width / 2 + Math.cos(Math.random() * Math.PI * 2) * (radius * 0.6);
          const craterY = asteroid.y + asteroid.height / 2 + Math.sin(Math.random() * Math.PI * 2) * (radius * 0.6);
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.beginPath();
          ctx.arc(craterX, craterY, craterRadius, 0, Math.PI * 2);
          ctx.fill();
      }

      // Add rough edges for more realism
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.lineWidth = 1;
      for (let i = 0; i < points.length; i++) {
          const nextPoint = points[(i + 1) % points.length];
          const midX = (points[i].x + nextPoint.x) / 2;
          const midY = (points[i].y + nextPoint.y) / 2;
          const offsetX = (Math.random() - 0.5) * 10; // Random offset for roughness
          const offsetY = (Math.random() - 0.5) * 10;
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(midX + offsetX, midY + offsetY);
          ctx.lineTo(nextPoint.x, nextPoint.y);
      }
      ctx.stroke();
  }
}

function asteroidCollisionDetection() {
  // Check collision between lasers and asteroids
  for (let i = lasers.length - 1; i >= 0; i--) {
      const laser = lasers[i];
      for (let k = asteroids.length - 1; k >= 0; k--) {
          const asteroid = asteroids[k];
          if (
              laser.x < asteroid.x + asteroid.width &&
              laser.x + 5 > asteroid.x &&
              laser.y < asteroid.y + asteroid.height &&
              laser.y + 5 > asteroid.y
          ) {
              asteroid.health -= 1;
              lasers.splice(i, 1);

              if (asteroid.health <= 0) {
                  score += 75;
                  coins += 99;
                  asteroids.splice(k, 1);
              }
              break;
          }
      }
  }

  // Check collision between player and asteroids
  for (const asteroid of asteroids) {
      if (
          player.x < asteroid.x + asteroid.width &&
          player.x + player.width > asteroid.x &&
          player.y < asteroid.y + asteroid.height &&
          player.y + player.height > asteroid.y
      ) {
          player.health -= 5;
          asteroid.y = -asteroid.height;
          asteroid.x = Math.random() * (canvas.width - asteroid.width);

          if (player.health <= 0) {
              alert("Game Over!");
              player.health = player.maxHealth;
              score = 0;
              coins = 0;
              enemies.splice(0, enemies.length);
              asteroids.splice(0, asteroids.length);
          }
      }
  }
}