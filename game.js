import * as Dialogue from './Dialogue.js';
import { Platform } from './Platform.js';
import { ExitDoor } from './ExitDoor.js';
import { Player } from './Player.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
export const gravity = 0.5;
let keys = {};
let canvasOffsetX = 0;
let xMax = 0;
let yMax = 0;
const tileWidth = 24;
const tileHeight = 24;

let lastRenderTime = 0;
let dialogueActive = false;
const background = new Image();
background.src = './img/background.png'; // Make sure you have a background image or comment this out


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
function gameLoop(currentTime) {
    update();

    if (currentPlayer.velocityY == 0 && !currentPlayer.isJumping)
    {
        if (keys['Digit1'])
            focusOnCharacter(players[0])
        else if (keys['Digit2'])
            focusOnCharacter(players[1])
        else if (keys['Digit3'])
            focusOnCharacter(players[2])
    }

    render(currentTime);
    requestAnimationFrame(gameLoop);
}

function update() {
    
    // if (dialogueActive)
    // {
    //     dialogueActive = Dialogue.dialogueUpdate(keys);
    // }
    // else
    {
        canvasOffsetX = currentPlayer.update(canvasOffsetX, keys, players);
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
    players.forEach(x => x.draw(canvasOffsetX));

    if (dialogueActive)
    {
        //dialogue:
        Dialogue.drawDialogueBox(ctx, canvas);
        Dialogue.renderDialogue(ctx, canvas, deltaTime);
    }
    lastRenderTime = time;
}


function drawGameObjects() {
    gameObjects.forEach(x => x.draw(canvasOffsetX));
}

function checkCollisions() {

    players.forEach(p => {
        for(let i=0;i<gameObjects.length;i++)
            {
                gameObjects[i].checkCollision(p, canvasOffsetX);
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


export function init()
{
    canvasOffsetX = 0;

    let totalFrames = 4; //4 frames in each sprite animation. TODO: compute from each sprite animation length.

    dog = new Player(50, yMax-tileHeight, spriteMapDog, totalFrames, ctx, canvas, xMax, yMax);
    cat = new Player(10,  yMax-tileHeight, spriteMapCat, totalFrames, ctx, canvas, xMax, yMax);
    monkey = new Player(80,  yMax-tileHeight, spriteMapMonkey, totalFrames, ctx, canvas, xMax, yMax);

    players = [];
    players.push(dog);
    players.push(cat);
    players.push(monkey);
    currentPlayer = dog;

}

createCharactersSpriteMap().then(
    () => loadMapFromFile('./levels/Book1.txt').then(map => {
        gameObjects = parseMap(map, tileWidth, tileHeight);
        init();
        requestAnimationFrame(gameLoop);
    }));


function parseMap(map, tileWidth, tileHeight) {
    let objects = [];
    
    xMax = 0;
    yMax = map.length * tileHeight;
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            let x = j * tileWidth;  
            let y = i * tileHeight; 
            if (map[i][j] === '#') 
            {
                objects.push(new Platform(x, y, tileWidth, ctx, canvas)); 
            }
            else if (map[i][j] === '$')
            {
                objects.push(new ExitDoor(x, y, ctx, canvas));
            }
        }
        if (xMax < map[i].length)
        {
            xMax = map[i].length;
        }
    }

    xMax *= tileWidth;
    return objects;
}

//TODO: a dimming effect when switching between characters.
export function focusOnCharacter(character) {
    currentPlayer = character;
    // Calculate the new offset based on character position and canvas width
    canvasOffsetX = canvas.width / 2 - character.x;
    if (canvasOffsetX > 0) canvasOffsetX = 0;

    if (canvasOffsetX  < canvas.width  - xMax)
    {
        canvasOffsetX =  canvas.width  - xMax;
    }
}

