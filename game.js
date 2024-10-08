import * as Dialogue from './dialogue.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gravity = 0.5;
let keys = {};
let canvasOffsetX = 0;
let xMax = 0;
let yMax = 0;

let lastRenderTime = 0;
let dialogueActive = true;
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
                focusOnCharacter(players[0])
            else if (keys['Digit2'])
                focusOnCharacter(players[1])
            else if (keys['Digit3'])
                focusOnCharacter(players[2])

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
        super(_x, _y, _w, 24, platformImage); 
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
const doubleTapThreshold = 300;
let lastTapTime = 0;
// Add touch event listeners for mobile
document.addEventListener('touchstart', function (event) {
    const touch = event.touches[0]; // Get the first touch point
    const touchX = touch.clientX; // Get the touch X position
    const touchY = touch.clientY; // Get the touch Y position

    const currentTime = new Date().getTime(); // Current time

    // Check if the time between taps is within the threshold
    if (currentTime - lastTapTime < doubleTapThreshold) {
        // Handle double tap
        keys['Enter'] = true;
    }
    // Logic to determine which button was pressed
    else if (touchX < canvas.width / 4) {
        keys['ArrowLeft'] = true; // Move left if touch is on the left side
    } else if (touchX > (canvas.width*3 / 4)) 
    {
        keys['ArrowRight'] = true; // Move right if touch is on the right side
    }
    // Detect jump (for example, a touch on the bottom half of the canvas)
    else if (touchY > canvas.height / 2) {
        keys['Space'] = true; // Jump if touch is on the bottom half
    }
    lastTapTime = currentTime; // Update last tap time

});

document.addEventListener('touchend', function (event) {
    keys['ArrowLeft'] = false;
    keys['ArrowRight'] = false;
    keys['Space'] = false;
});

// Game loop
function gameLoop(currentTime) {
    update();
    render(currentTime);
    requestAnimationFrame(gameLoop);
}

function update() {
    
    if (dialogueActive)
    {
        dialogueActive = Dialogue.dialogueUpdate(keys);
    }
    else
    {
        currentPlayer.update();
        checkCollisions();

    }
}



function render(time) 
{
    const deltaTime = time - lastRenderTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    //background first
    drawBackground();
    //then objects
    drawGameObjects();
    //then players
    players.forEach(x => x.draw());

    if (dialogueActive)
    {
        //dialogue:
        Dialogue.drawDialogueBox(ctx, canvas);
        Dialogue.renderDialogue(ctx, canvas, deltaTime);
    }
    lastRenderTime = time;
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


function loadMapFromFile(url) {
    return fetch(url)
        .then(response => response.text())
        .then(text => {
            return text.split("\n");
        });
}


function init()
{
    canvasOffsetX = 0;
    const tileWidth = 24;
    const tileHeight = 24;
    
    loadMapFromFile('./levels/Book1.txt').then(map => {
        gameObjects = parseMap(map, tileWidth, tileHeight);

        let totalFrames = 4; //4 frames in each sprite animation. TODO: compute from each sprite animation length.

        dog = new Player(50,yMax - 24, spriteMapDog, totalFrames);
        cat = new Player(10, yMax - 24, spriteMapCat, totalFrames);
        monkey = new Player(80, yMax - 24, spriteMapMonkey, totalFrames);

        players = [];
        players.push(dog);
        players.push(cat);
        players.push(monkey);
        currentPlayer = dog;
    });
}

createCharactersSpriteMap().then(() => {
    init();
    requestAnimationFrame(gameLoop);
});

function parseMap(map, tileWidth, tileHeight) {
    let platforms = [];
    
    xMax = 0;
    yMax = map.length * tileHeight;
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (map[y][x] === '#') {
                let platformX = x * tileWidth;  // Calculate X position based on tile size
                let platformY = y * tileHeight; // Calculate Y position based on tile size
                platforms.push(new Platform(platformX, platformY, tileWidth)); // Create a new platform
            }
        }
        if (xMax < map[y].length)
        {
            xMax = map[y].length;
        }
    }

    xMax *= tileWidth;
    console.log("xMax : " + xMax);
    return platforms;
}

// Function to update the canvas offset to focus on a character
//TODO: a dimming effect when switching between characters.

function focusOnCharacter(character) {
    currentPlayer = character;
    // Calculate the new offset based on character position and canvas width
    canvasOffsetX = canvas.width / 2 - character.x;
    if (canvasOffsetX > 0) canvasOffsetX = 0;

    if (canvasOffsetX  < canvas.width  - xMax)
    {
        canvasOffsetX =  canvas.width  - xMax;
    }
}

