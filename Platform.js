import { GameObject } from './GameObject.js';

const platformImage = new Image();
platformImage.src = './img/platform.png';

export class Platform extends GameObject
{

    constructor(_x, _y, _w, _ctx, _canvas) {
        super(_x, _y, _w, 24, platformImage, _ctx, _canvas); 
      }

    
    checkCollision(player, canvasOffsetX) 
    {        
        let collision = false;

        if (this.onCanvasArea(canvasOffsetX))   
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