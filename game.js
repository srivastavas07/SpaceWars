// Get canvas element and context for drawing
const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")
// Set canvas dimensions to window size minus padding
const WINDOW_WIDTH = window.innerWidth - 10
const WINDOW_HEIGHT = window.innerHeight - 10
canvas.width = WINDOW_WIDTH
canvas.height = WINDOW_HEIGHT

// Game constants for controlling gameplay mechanics
const FPS = 60 // Frames per second
const SPACESHIP_WIDTH = 75 // Width of spaceship sprites
const SPACESHIP_HEIGHT = 60 // Height of spaceship sprites 
const VEL = 5 // Movement velocity of spaceships
const MAX_BULLETS = 3 // Maximum number of bullets each ship can fire at once
const BULLET_VELOCITY = 8 // Speed of bullets

// Load game image assets
const yellowSpaceshipImg = new Image()
yellowSpaceshipImg.src = "Assets/spaceship_yellow.png"
const redSpaceshipImg = new Image()
redSpaceshipImg.src = "Assets/spaceship_red.png"
const spaceBackgroundImg = new Image()
spaceBackgroundImg.src = "/Assets/space.png"

// Load game sound effects
const shootSound = new Audio("Assets/Gun+Silencer.mp3",) // Sound for firing bullets
const hitSound = new Audio("Assets/Grenade+1.mp3",) // Sound for bullet impacts

// Initialize game state object to track positions, health and bullets
const gameState = {
    yellow: {
        x: 100, // Starting x position
        y: 300, // Starting y position
        health: 10, // Starting health
        bullets: [], // Array to store active bullets
    },
    red: {
        x: window.innerWidth - 200,
        y: 300,
        health: 10,
        bullets: [],
    },
    keys: {}, // Object to track pressed keys
}

// Set up event listeners for keyboard input and game restart
document.addEventListener("keydown", (e) => (gameState.keys[e.key] = true))
document.addEventListener("keyup", (e) => (gameState.keys[e.key] = false))
document.addEventListener("keydown", handleShooting)
document.getElementById("restartButton").addEventListener("click", function () {
    window.location.reload();
});

// Handle bullet shooting for both spaceships
function handleShooting(e) {
    // Yellow spaceship shoots with 'f' key
    if (e.key === "f" && gameState.yellow.bullets.length < MAX_BULLETS) {
        gameState.yellow.bullets.push({
            x: gameState.yellow.x + SPACESHIP_WIDTH - 10,
            y: gameState.yellow.y + SPACESHIP_HEIGHT / 2 - 2,
            width: 10,
            height: 5,
        })
        shootSound.currentTime = 0
        shootSound.play()
    }
    // Red spaceship shoots with 'm' key
    if (e.key === "m" && gameState.red.bullets.length < MAX_BULLETS) {
        gameState.red.bullets.push({
            x: gameState.red.x - 10,
            y: gameState.red.y + SPACESHIP_HEIGHT / 2 - 2,
            width: 10,
            height: 5,
        })
        shootSound.currentTime = 0
        shootSound.play()
    }
}

// Handle movement for both spaceships based on key presses
function handleMovement() {
    // Yellow spaceship movement with WASD keys
    if (gameState.keys["a"] && gameState.yellow.x > 0) {
        gameState.yellow.x -= VEL
    }
    if (gameState.keys["d"] && gameState.yellow.x + SPACESHIP_WIDTH < WINDOW_WIDTH / 2 - 5) {
        gameState.yellow.x += VEL
    }
    if (gameState.keys["w"] && gameState.yellow.y > 0) {
        gameState.yellow.y -= VEL
    }
    if (gameState.keys["s"] && gameState.yellow.y + SPACESHIP_HEIGHT < WINDOW_HEIGHT) {
        gameState.yellow.y += VEL
    }

    // Red spaceship movement with arrow keys
    if (gameState.keys["ArrowLeft"] && gameState.red.x > WINDOW_WIDTH / 2 + 5) {
        gameState.red.x -= VEL
    }
    if (gameState.keys["ArrowRight"] && gameState.red.x + SPACESHIP_WIDTH < WINDOW_WIDTH) {
        gameState.red.x += VEL
    }
    if (gameState.keys["ArrowUp"] && gameState.red.y > 0) {
        gameState.red.y -= VEL
    }
    if (gameState.keys["ArrowDown"] && gameState.red.y + SPACESHIP_HEIGHT < WINDOW_HEIGHT) {
        gameState.red.y += VEL
    }
}

// Update bullet positions and check for collisions
function handleBullets() {
    // Update yellow spaceship bullets
    gameState.yellow.bullets.forEach((bullet, index) => {
        bullet.x += BULLET_VELOCITY

        // Remove bullets that go off screen
        if (bullet.x > WINDOW_WIDTH) {
            gameState.yellow.bullets.splice(index, 1)
        } else if (
            checkCollision(bullet, {
                x: gameState.red.x,
                y: gameState.red.y,
                width: SPACESHIP_WIDTH,
                height: SPACESHIP_HEIGHT,
            })
        ) {
            // Handle bullet hit on red spaceship
            gameState.yellow.bullets.splice(index, 1)
            gameState.red.health--
            hitSound.currentTime = 0
            hitSound.play()
        }
    })

    // Update red spaceship bullets
    gameState.red.bullets.forEach((bullet, index) => {
        bullet.x -= BULLET_VELOCITY

        // Remove bullets that go off screen
        if (bullet.x < 0) {
            gameState.red.bullets.splice(index, 1)
        } else if (
            checkCollision(bullet, {
                x: gameState.yellow.x,
                y: gameState.yellow.y,
                width: SPACESHIP_WIDTH,
                height: SPACESHIP_HEIGHT,
            })
        ) {
            // Handle bullet hit on yellow spaceship
            gameState.red.bullets.splice(index, 1)
            gameState.yellow.health--
            hitSound.currentTime = 0
            hitSound.play()
        }
    })
}

// Check for collision between two rectangles
function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    )
}

// Helper function to draw rotated images
function drawRotatedImage(image, x, y, width, height, degrees) {
    ctx.save()
    ctx.translate(x + width / 2, y + height / 2)
    ctx.rotate((degrees * Math.PI) / 180)
    ctx.drawImage(image, -width / 2, -height / 2, width, height)
    ctx.restore()
}

// Main drawing function to render game state
function draw() {
    // Draw background
    ctx.drawImage(spaceBackgroundImg, 0, 0, WINDOW_WIDTH, WINDOW_HEIGHT)

    // Draw center dividing line
    ctx.fillStyle = "black"
    ctx.fillRect(WINDOW_WIDTH / 2 - 5, 0, 10, WINDOW_HEIGHT)

    // Draw spaceships with proper rotation
    drawRotatedImage(yellowSpaceshipImg, gameState.yellow.x, gameState.yellow.y, SPACESHIP_WIDTH, SPACESHIP_HEIGHT, 270)
    drawRotatedImage(redSpaceshipImg, gameState.red.x, gameState.red.y, SPACESHIP_WIDTH, SPACESHIP_HEIGHT, 90)

    // Draw bullets for both ships
    ctx.fillStyle = "yellow"
    gameState.yellow.bullets.forEach((bullet) => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)
    })

    ctx.fillStyle = "red"
    gameState.red.bullets.forEach((bullet) => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)
    })

    // Update health displays in UI
    document.getElementById("yellowHealth").textContent = `Health: ${gameState.yellow.health}`
    document.getElementById("redHealth").textContent = `Health: ${gameState.red.health}`
}

// Check if either player has won
function checkWinner() {
    if (gameState.yellow.health <= 0) {
        return "Red Wins!"
    }
    if (gameState.red.health <= 0) {
        return "Yellow Wins!"
    }
    return null
}

// Main game loop
function gameLoop() {
    // Check for winner before updating
    const winner = checkWinner()
    if (winner) {
        document.getElementById("restartButton").style.visibility = "visible"
        const winnerElement = document.getElementById("winner")
        winnerElement.textContent = winner
        winnerElement.style.display = "block"
        return
    }

    // Update game state and render
    handleMovement()
    handleBullets()
    draw()
    requestAnimationFrame(gameLoop)
}

// Start game loop once background image is loaded
spaceBackgroundImg.onload = () => {
    gameLoop()
}
