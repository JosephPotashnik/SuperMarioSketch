const canvas = document.getElementById('gameCanvas');

//canvas.width = window.innerWidth;
//canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');
const gravity = 0.5;

class Player {
    x;
    y;
    width;
    height;
    velocityX; 
    velocityY;
    isJumping;
    runningStrength;
    jumpingStrength;

    constructor(_x, _y)
    {
        this.x = _x;
        this.y = _y;
        this.width = 50;
        this.height = 50;
        this.runningStrength = 5;      
        this.velocityX = 0;//velocity is actually pixels per frame refresh time.
        this.jumpingStrength = -10; 
        this.velocityY = 0
        this.isJumping = false;
    }

    update() 
    {
        if (keys['ArrowRight']) 
        {
            this.velocityX = this.runningStrength;
            this.x += this.velocityX;  //x = vt. velocity is actually pixels per frame refresh time.
            if (this.x + canvasOffsetX >= (canvas.width / 2) && this.x  <= xMax - (canvas.width / 2))
            {
                canvasOffsetX -= player.velocityX;  // Move the world left when moving right
            }

            if (this.x + this.width > xMax)
            {
                this.x = xMax - this.width;
            }
        }
        else if (keys['ArrowLeft']) 
        {
            this.velocityX = this.runningStrength;
            this.x -= this.velocityX;

            if (this.x + canvasOffsetX < (canvas.width / 8) && canvasOffsetX < 0)
            { 
                canvasOffsetX += player.velocityX;  // Move the world right when moving left
            }

            if (this.x <= 0)
            {
                this.x = 0;
            }
        }
        this.velocityX = 0;

        // Jump logic
        if (keys['Space'] && !this.isJumping) {
            this.velocityY = this.jumpingStrength;  // Jump strength
            this.isJumping = true;
        }
    

        // Gravity
        this.velocityY += gravity;  // Simulates gravity
        this.y += this.velocityY;
    
        // Ground collision
        if (this.y + this.height  >= canvas.height) {
            this.y = canvas.height - this.height;
            this.isJumping = false;
            this.velocityY = 0;
        }
        
    }

    draw() {
        ctx.fillStyle = 'blue';
        //ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillRect(this.x + canvasOffsetX, this.y, this.width, this.height);

    }

}

class Platform {
    x;
    y;
    width;
    height;

    constructor(_x, _y)
    {
        this.x = _x;
        this.y = _y;
        this.width = 100;
        this.height = 10;
    }

    draw() {
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x + canvasOffsetX, this.y, this.width, this.height);
    }

    checkPlatformCollision(player) {
        //original
        let collision = false;
        if (player.x < this.x + this.width + canvasOffsetX && //player is left of the right side of the platform
            player.x + player.width > this.x + canvasOffsetX && // player is right to the left side of the platform
            player.y + player.height < this.y + this.height && // player above plaform
            player.y + player.height + player.velocityY > this.y)  // next step of player brings it below platform
            {
                player.y = this.y - player.height;
                player.velocityY = 0;
                player.isJumping = false;
                collision = true;
            }
        return collision;

    }

}
// Player object
const player = new Player(50, 300);
let keys = {};
let canvasOffsetX = 0;
let xMax = 2000;

// Platforms array
const platforms = [
    new Platform(100, 350),
    new Platform(300, 300),
    new Platform(500, 250),
    new Platform(700, 350)
];

// Load background image (optional)
const background = new Image();
//background.src = 'background.png'; // Make sure you have a background image or comment this out

// Event listeners for key press detection
document.addEventListener('keydown', function (event) {
    keys[event.code] = true;
    //This property (event.code)is useful when you want to handle keys based on their physical positions on the input device 
    //rather than the characters associated with those keys; 
});

document.addEventListener('keyup', function (event) {
    keys[event.code] = false;
});

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

function update() {
    player.update();
    checkPlatformCollision();
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    drawBackground();
    drawPlatforms();
    player.draw();
}


function drawPlatforms() {
    platforms.forEach(x => x.draw());
}

function checkPlatformCollision() {
    
    //platforms.forEach(platform => checkPlatformCollision(player));

    //assumption: can we collide with more than one platform?
    //if not, we can break immediately.
    for(let i=0;i<platforms.length;i++)
    {
        if (platforms[i].checkPlatformCollision(player))
        {
            break;
        }
    }
    
}

function drawBackground() {
    if (background.complete) {
        ctx.drawImage(background, canvasOffsetX, 0, canvas.width, canvas.height);
    }
}

requestAnimationFrame(gameLoop);
