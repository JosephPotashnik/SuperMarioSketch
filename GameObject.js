export class GameObject 
{
    x;
    y;
    width;
    height;
    img;
    ctx;
    canvas;

    onCanvasArea(canvasOffsetX)
    {
        return (this.x + canvasOffsetX + this.width > 0 &&         // Check if right edge is past the left of the canvas
            this.x + canvasOffsetX < this.canvas.width &&           // Check if left edge is before the right of the canvas
            this.y + this.height > 0 &&        // Check if bottom edge is past the top of the canvas
            this.y < this.canvas.height);            // Check if top edge is before the bottom of the canvas
    }


    constructor(_x, _y, _w, _h, _img, _ctx, _canvas)
    {
        this.x = _x;
        this.y = _y;
        this.width = _w;
        this.height = _h;
        this.img = _img;
        this.ctx = _ctx;
        this.canvas = _canvas;
    }

    draw(canvasOffsetX) 
    {
        if (this.onCanvasArea(canvasOffsetX))           
        {
            this.ctx.drawImage(this.img, this.x + canvasOffsetX, this.y, this.width, this.height);
        }
    }
}
