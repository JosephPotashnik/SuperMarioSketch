const canvas = document.getElementById('gameCanvas');

const ctx = canvas.getContext('2d');
const gravity = 0.5;
let keys = {};
let canvasOffsetX = 0;
let xMax = 1200;

// Load background image (optional)
const background = new Image();
background.src = './img/background.png'; // Make sure you have a background image or comment this out
const platformImage = new Image();
platformImage.src = './img/platform.png';

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
        this.width = 32;
        this.height = 32;
        this.runningStrength = 5;      
        this.velocityX = 0;//velocity is actually pixels per frame refresh time.
        this.jumpingStrength = -10; 
        this.velocityY = 0;
        this.isJumping = false;

        let idleImg = new Image();
        idleImg.src = './img/Idle (32x32).png';
        let runImg = new Image();
        runImg.src = './img/Run (32x32).png';
        let jumpImg = new Image();
        jumpImg.src = './img/Jump (32x32).png';
        let fallImg = new Image();
        fallImg.src = './img/Fall (32x32).png';

        this.spriteMap = new Map();
        this.spriteMap.set("Idle", idleImg);
        this.spriteMap.set("Run", runImg);
        this.spriteMap.set("Jump", jumpImg);
        this.spriteMap.set("Fall", fallImg);

        this.currentSprite = this.spriteMap.get("Idle");

        // Sprite animation details
        this.frameIndex = 0;
        this.totalFrames = 11;
        this.frameWidth = 32; // Assuming each frame is 50px wide
        this.frameHeight = 32; // Assuming each frame is 50px tall
        this.animationSpeed = 1; // Adjust this value for the speed of animation
        this.frameCounter = 0;
    }

    update() 
    {
        if (keys['ArrowRight']) 
        {
            this.currentSprite = this.spriteMap.get("Run");
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
            this.currentSprite = this.spriteMap.get("Run");
            this.velocityX = this.runningStrength;
            this.x -= this.velocityX;

            if (this.x + canvasOffsetX < (canvas.width / 4) && canvasOffsetX < 0)
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
    

        //check sprites before applying gravity.
        if (this.velocityY == 0)
            {
                //TODO: fix nicer so total frame will be associated with each Sprite entry in the map.
                this.totalFrames = 11;
                this.currentSprite = this.spriteMap.get("Idle");
            }
            else if (this.velocityY < 0)
            {
                this.totalFrames = 1;
                this.currentSprite = this.spriteMap.get("Jump");
            }
            else
            {
                this.totalFrames = 1;
                this.currentSprite = this.spriteMap.get("Fall");
            }

        // Gravity
        this.velocityY += gravity;  // Simulates gravity
        this.y += this.velocityY;


        // Animation frame update
        this.frameCounter++;
        if (this.frameCounter >= this.animationSpeed) {
            this.frameIndex = (this.frameIndex + 1) % this.totalFrames; // Loop through the frames
            this.frameCounter = 0;
        }

        



         //fallen below canvas - death pit
        if (this.y   > canvas.height) 
        {
            console.log("calling to init");
            init();
        }
        
    }

    draw() {
        ctx.drawImage(
            this.currentSprite,
            this.frameIndex * this.frameWidth, 0,
            this.frameWidth, this.frameHeight,
            this.x + canvasOffsetX, this.y,
            this.width, this.height
        );

    }

}

class Platform {
    x;
    y;
    width;
    height;
    img;

    constructor(_x, _y, _w = 100)
    {
        this.x = _x;
        this.y = _y;
        this.img = platformImage;

        this.width = _w;
        this.height = 20;

    }

    draw() 
    {
        if (this.x + canvasOffsetX + this.width > 0 &&         // Check if right edge is past the left of the canvas
            this.x + canvasOffsetX < canvas.width &&           // Check if left edge is before the right of the canvas
            this.y + this.height > 0 &&        // Check if bottom edge is past the top of the canvas
            this.y < canvas.height)            // Check if top edge is before the bottom of the canvas
            {
                ctx.drawImage(this.img, this.x + canvasOffsetX, this.y, this.width, this.height);
            }
    }

    checkPlatformCollision(player) {
        //original
        let collision = false;
        if (player.x < this.x + this.width  && //player is left of the right side of the platform
            player.x + player.width > this.x  && // player is right to the left side of the platform
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

    //background first
    drawBackground();
    //then objects
    drawPlatforms();
    //then player
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

    //canvasOffsetX/4 creates parallax effect because the background moves out of the screen 4 times slower
    //than the platforms in the foreground.

    if (background.complete) 
    {
  //      ctx.drawImage(backgroundImage, backgroundX, 0, canvas.width, canvas.height);
   // ctx.drawImage(backgroundImage, backgroundX + canvas.width, 0, canvas.width, canvas.height);

        ctx.drawImage(background, 0 + canvasOffsetX/4, 0, canvas.width, canvas.height);
        ctx.drawImage(background, canvas.width + canvasOffsetX/4, 0, canvas.width, canvas.height);

    }
}

let player = [];
let platforms = [];

function init()
{
    canvasOffsetX = 0;
    // Player object
    player = new Player(30, 30);

    // Platforms array
    platforms = [
        new Platform(0, canvas.height-20, 500),
        new Platform(100, 350),
        new Platform(300, 300),
        new Platform(500, 250),
        new Platform(700, 350)
    ];
    
}

init();
requestAnimationFrame(gameLoop);
