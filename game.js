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
        this.width = firstValue.width / totalFrames;
        this.height = firstValue.height;

        this.y -= this.height;  //on creation, we receive coordinates of the platform we are created on.
                                //hence substract height of character once.
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
        else if (this.velocityY == 0 && !this.isJumping)
        {
            if (keys['Digit1'])
                currentPlayer = players[0];
            else if (keys['Digit2'])
                currentPlayer = players[1];
            else if (keys['Digit3'])
                currentPlayer = players[2];
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

class GameObject 
{
    x;
    y;
    width;
    height;
    img;

    onCanvasArea()
    {
        return (this.x + canvasOffsetX + this.width > 0 &&         // Check if right edge is past the left of the canvas
            this.x + canvasOffsetX < canvas.width &&           // Check if left edge is before the right of the canvas
            this.y + this.height > 0 &&        // Check if bottom edge is past the top of the canvas
            this.y < canvas.height);            // Check if top edge is before the bottom of the canvas
    }


    constructor(_x, _y, _w, _h, _img)
    {
        this.x = _x;
        this.y = _y;
        this.width = _w;
        this.height = _h;
        this.img = _img;
    }

    draw() 
    {
        if (this.onCanvasArea())           
        {
            ctx.drawImage(this.img, this.x + canvasOffsetX, this.y, this.width, this.height);
        }
    }


}

class Platform extends GameObject{

    constructor(_x, _y, _w) {
        super(_x, _y, _w, 20, platformImage); 
      }

    
    checkCollision(player) 
    {        
        let collision = false;
        if (this.onCanvasArea())   
        {        
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
    checkCollisions();
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    //background first
    drawBackground();
    //then objects
    drawGameObjects();
    //then players
    players.forEach(x => x.draw());
}


function drawGameObjects() {
    gameObjects.forEach(x => x.draw());
}

function checkCollisions() {
    
    players.forEach(p => {
        for(let i=0;i<gameObjects.length;i++)
            {
                gameObjects[i].checkCollision(p);
            }
    });

    
}

function drawBackground() {

    //canvasOffsetX/4 creates parallax effect because the background moves out of the screen 4 times slower
    //than the platforms in the foreground.
    if (background.complete) 
    {
        ctx.drawImage(background, 0 + canvasOffsetX/4, 0, canvas.width, canvas.height);
        ctx.drawImage(background, canvas.width + canvasOffsetX/4, 0, canvas.width, canvas.height);
    }
}

let players = []
let currentPlayer = [];
let dog = [];
let cat = [];
let monkey = [];
let gameObjects = [];

let spriteMapMonkey = [];
let spriteMapCat = [];
let spriteMapDog = [];

async function createCharactersSpriteMap()
{
    spriteMapMonkey = await createSpriteMap('./img/StreetAnimals/Monkey');
    spriteMapCat = await createSpriteMap('./img/StreetAnimals/Cat');
    spriteMapDog = await createSpriteMap('./img/StreetAnimals/Dog');
 
}
async function createSpriteMap(relativePath)
{
    let spriteMap = new Map();
    //file names of animations are fixed as follows:
    let urlArray= [];
    urlArray.push([relativePath + '/Idle.png', 'Idle']);
    urlArray.push([relativePath + '/Walk.png', 'Walk']);
    urlArray.push([relativePath + '/Idle.png', 'Jump']);//TODO: design jump animation.
    urlArray.push([relativePath + '/Idle.png', 'Fall']);//TODO: design fall animation
    let promiseArray = [];

    for(let i = 0;i<urlArray.length;i++)
    {
        promiseArray.push(new Promise(resolve => {

            const img = new Image();
            img.src = urlArray[i][0];
            img.onload = function() {
                spriteMap.set(urlArray[i][1], img);
                resolve();
            };

        }));
    }
    await Promise.all(promiseArray); // wait for all the images to be loaded
    return spriteMap;
}

function init()
{
    players = [];
    canvasOffsetX = 0;
    let totalFrames = 4; //4 frames in each sprite animation. TODO: compute from each sprite animation length.
    let firstFloorPlatform = new Platform(0, canvas.height-20, 1200);

    dog = new Player(firstFloorPlatform.x +50, firstFloorPlatform.y, spriteMapDog, totalFrames);
    cat = new Player(firstFloorPlatform.x + 10, firstFloorPlatform.y, spriteMapCat, totalFrames);
    monkey = new Player(firstFloorPlatform.x + 80, firstFloorPlatform.y, spriteMapMonkey, totalFrames);

    players.push(dog);
    players.push(cat);
    players.push(monkey);

    currentPlayer = dog;

    // Platforms array
    gameObjects = [
        firstFloorPlatform,
        new Platform(100, 350, 100),
        new Platform(300, 300, 100),
        new Platform(500, 250, 100),
        new Platform(700, 350, 100)
    ];
    
}

createCharactersSpriteMap().then(() => {
    init();
    requestAnimationFrame(gameLoop);
});

