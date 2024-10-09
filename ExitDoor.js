import { GameObject } from './GameObject.js';

const exitDoorImage = new Image();
exitDoorImage.src = './img/ExitDoor.png';

export class ExitDoor extends GameObject
{

    constructor(_x, _y, _ctx, _canvas) {
        super(_x, _y-128+24, 87, 128, exitDoorImage, _ctx, _canvas); 
      }

    
    checkCollision(player, canvasOffsetX) 
    {        
        let collision = false;
        if (this.onCanvasArea())   
        {        
            if (player.x < this.x + this.width  && //player is left of the right side of the platform
                player.x + player.width > this.x  && // player is right to the left side of the platform
                player.y + player.height < this.y + this.height && // player above plaform
                player.y + player.height + player.velocityY > this.y)  // next step of player brings it below platform
                {
                   
                    //trigger dialogue once and win level.
                }
        }
        return collision;

    }
}