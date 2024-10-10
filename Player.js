import { gravity } from './Game.js'; 
export class Player 
{
    x;
    y;
    width;
    height;
    velocityX; 
    velocityY;
    isJumping;
    runningStrength;
    jumpingStrength;
    ctx;
    canvas;
    xMax;
    yMax;

    //image map is key: String, value: Image()
    constructor(_x, _y, imagesMap, totalFrames, _ctx, _canvas, _xMax, _yMax)
    {
        this.x = _x;
        this.y = _y;
        const [firstValue] = imagesMap.values();
        this.width = firstValue.width / totalFrames;
        this.height = firstValue.height;
        this.xMax = _xMax;
        this.yMax = _yMax;

        this.y -= this.height;  //on creation, we receive coordinates of the platform we are created on.
                                //hence substract height of character once.
        this.runningStrength = 5;      
        this.velocityX = 0;//velocity is actually pixels per frame refresh time.
        this.jumpingStrength = -10; 
        this.velocityY = 0;
        this.isJumping = false;
        this.ctx = _ctx;
        this.canvas = _canvas;

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

    update(canvasOffsetX, keys, players) 
    {
        //console.log(this.keys === keys);  // Should log "true"
        if (keys['ArrowRight']) 
        {
            this.currentSprite = this.spriteMap.get("Run");
            this.velocityX = this.runningStrength;
            this.x += this.velocityX;  //x = vt. velocity is actually pixels per frame refresh time.
            if (this.x + canvasOffsetX >= (this.canvas.width / 2) && this.x  <= this.xMax - (this.canvas.width / 2))
            {
                canvasOffsetX -= this.velocityX;  // Move the world left when moving right
            }

            if (this.x + this.width > this.xMax)
            {
                this.x = this.xMax - this.width;
            }
        }
        else if (keys['ArrowLeft']) 
        {
            this.currentSprite = this.spriteMap.get("Run");
            this.velocityX = this.runningStrength;
            this.x -= this.velocityX;

            if (this.x + canvasOffsetX < (this.canvas.width / 4) && canvasOffsetX < 0)
            { 
                canvasOffsetX += this.velocityX;  // Move the world right when moving left
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
        if (this.y   > this.canvas.height) 
        {
            return [true, canvasOffsetX];
        }

        return [false, canvasOffsetX];

    }

    draw(canvasOffsetX) {
        this.ctx.drawImage(
            this.currentSprite,
            this.frameIndex * this.frameWidth, 0,
            this.frameWidth, this.frameHeight,
            this.x + canvasOffsetX, this.y,
            this.width, this.height
        );

    }

}
