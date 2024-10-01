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

                        //image map is key: String, value: Image()
    constructor(_x, _y, imagesMap, totalFrames)
    {
        this.x = _x;
        this.y = _y;
        const [firstValue] = imagesMap.values();
        console.log("first value is: " + firstValue);
        console.log("first value width is: " + firstValue.width);

        this.width = firstValue.width / totalFrames;
        this.height = firstValue.height;
        this.runningStrength = 5;      
        this.velocityX = 0;//velocity is actually pixels per frame refresh time.
        this.jumpingStrength = -10; 
        this.velocityY = 0;
        this.isJumping = false;

        this.spriteMap = new Map();
        for (const [key, value] of imagesMap) 
        { 
            this.spriteMap.set(key, value);
        }

        this.currentSprite = this.spriteMap.get("Idle");

        // Sprite animation details
        this.frameIndex = 0;
        this.totalFrames = totalFrames;
        this.frameWidth = firstValue.width / totalFrames; 
        this.frameHeight = firstValue.height; 
        this.animationSpeed = 10; 
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
                canvasOffsetX -= currentPlayer.velocityX;  // Move the world left when moving right
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
                canvasOffsetX += currentPlayer.velocityX;  // Move the world right when moving left
            }

            if (this.x <= 0)
            {
                this.x = 0;
            }
        }
        else if (keys['Digit1'])
        {
            currentPlayer = players[0];
        }
        else if (keys['Digit2'])
        {
            currentPlayer = players[1];
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
                this.currentSprite = this.spriteMap.get("Idle");
            }
            else if (this.velocityY < 0)
            {
                this.currentSprite = this.spriteMap.get("Jump");
            }
            else
            {
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
    currentPlayer.update();
    checkPlatformCollision();
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    //background first
    drawBackground();
    //then objects
    drawPlatforms();
    //then player
    //currentPlayer.draw();
    players.forEach(x => x.draw());
}


function drawPlatforms() {
    platforms.forEach(x => x.draw());
}

function checkPlatformCollision() {
    
    //platforms.forEach(platform => checkPlatformCollision(player));

    //assumption: can we collide with more than one platform?
    //if not, we can break immediately.

    players.forEach(p => {
        for(let i=0;i<platforms.length;i++)
            {
                if (platforms[i].checkPlatformCollision(p))
                {
                    break;
                }
            }
    });

    
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

let players = []
let currentPlayer = [];
let dog = [];
let cat = [];
let platforms = [];

//dog images
let spriteMapDog = new Map();
let idleImgDog = new Image();
let runImgDog = new Image();
let jumpImgDog = new Image();
let fallImDog = new Image();
idleImgDog.src = './img/StreetAnimals/2 Dog 2/Idle.png';
runImgDog.src = './img/StreetAnimals/2 Dog 2/Walk.png';
jumpImgDog.src = './img/StreetAnimals/2 Dog 2/Idle.png';
fallImDog.src = './img/StreetAnimals/2 Dog 2/Idle.png';
spriteMapDog.set("Idle", idleImgDog);
spriteMapDog.set("Run", runImgDog);
spriteMapDog.set("Jump", jumpImgDog);
spriteMapDog.set("Fall", fallImDog);

//cat images
let spriteMapCat = new Map();
let idleImgCat = new Image();
let runImgCat = new Image();
let jumpImgCat = new Image();
let fallImgCat = new Image();
idleImgCat.src = './img/StreetAnimals/4 Cat 2/Idle.png';
runImgCat.src = './img/StreetAnimals/4 Cat 2/Walk.png';
jumpImgCat.src = './img/StreetAnimals/4 Cat 2/Idle.png';
fallImgCat.src = './img/StreetAnimals/4 Cat 2/Idle.png';
spriteMapCat.set("Idle", idleImgCat);
spriteMapCat.set("Run", runImgCat);
spriteMapCat.set("Jump", jumpImgCat);
spriteMapCat.set("Fall", fallImgCat);


let imagesLoaded = 0;
let totalImages = 8;

function checkIfAllImagesLoaded() {
  if (imagesLoaded === totalImages) {
    init();
    requestAnimationFrame(gameLoop);
  }
}

idleImgDog.onload = function() {
  imagesLoaded++;
  checkIfAllImagesLoaded();
};
runImgDog.onload = function() {
  imagesLoaded++;
  checkIfAllImagesLoaded();
};
jumpImgDog.onload = function() {
  imagesLoaded++;
  checkIfAllImagesLoaded();
};
fallImDog.onload = function() {
  imagesLoaded++;
  checkIfAllImagesLoaded();
};

idleImgCat.onload = function() {
    imagesLoaded++;
    checkIfAllImagesLoaded();
  };
  runImgCat.onload = function() {
    imagesLoaded++;
    checkIfAllImagesLoaded();
  };
  jumpImgCat.onload = function() {
    imagesLoaded++;
    checkIfAllImagesLoaded();
  };
  fallImgCat.onload = function() {
    imagesLoaded++;
    checkIfAllImagesLoaded();
  };
function init()
{
    canvasOffsetX = 0;
    // Player object

    let totalFrames = 4; //4 frames in each sprite animation.

    players = [];
    dog = new Player(50, canvas.height-20 - 48, spriteMapDog, totalFrames);
    cat = new Player(10, canvas.height-20 - 48, spriteMapCat, totalFrames);
    players.push(dog);
    players.push(cat);
    currentPlayer = dog;

    // Platforms array
    platforms = [
        new Platform(0, canvas.height-20, 1200),
        new Platform(100, 350),
        new Platform(300, 300),
        new Platform(500, 250),
        new Platform(700, 350)
    ];
    
}

checkIfAllImagesLoaded();

