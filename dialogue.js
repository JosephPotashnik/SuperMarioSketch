import { Event } from './Event.js';

// Constants
const DIALOGUE_BOX_HEIGHT = 150;
const DIALOGUE_SPEED = 15;  // Speed of text appearing (ms per character)

export class Dialogue extends Event
{
    currentDialogueIndex;
    currentCharIndex;
    currentSpeakerFinished;
    accumulatedTime;
    dialogues;
    ctx;
    canvas;

constructor(_ctx, _canvas, _dialogues, _pred)
{
    super(_pred); 
    this.currentDialogueIndex = 0;
    this.currentCharIndex = 0;
    this.currentSpeakerFinished = false;
    this.accumulatedTime = 0;
    this.ctx = _ctx;
    this.canvas = _canvas;
    this.dialogues = [..._dialogues];
}


// Helper to draw the dialogue box
drawDialogueBox() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(50,  50, this.canvas.width - 100, DIALOGUE_BOX_HEIGHT);
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(50, 50, this.canvas.width - 100, DIALOGUE_BOX_HEIGHT);
}

// Helper to draw the text
drawText(text, startX) 
{
    const lines = this.wrapText(this.ctx, text, this.canvas.width - 120 - startX);
    this.ctx.fillStyle = 'white';
    this.ctx.font = '20px pixelFont';  // Pixel art fonts give it a retro feel
    lines.forEach((line, index) => {
        this.ctx.fillText(line, startX, 90 + index * 24);
    });
}

// Helper to wrap text within the dialogue box
wrapText(ctx, text, maxWidth) 
{
    const words = text.split(' ');
    const lines = [];
    let line = '';
    words.forEach(word => {
        const testLine = line + word + ' ';
        const width = ctx.measureText(testLine).width;
        if (width > maxWidth) {
            lines.push(line);
            line = word + ' ';
        } else {
            line = testLine;
        }
    });
    lines.push(line);
    return lines;
}

    render(deltaTime) 
    {
        if (this.occurring)
        {
            const currentDialogue = this.dialogues[this.currentDialogueIndex];
            
            if (this.currentSpeakerFinished) {
                this.currentCharIndex = currentDialogue.text.length;
            } 
            else {
                // Accumulate delta time across frames
                this.accumulatedTime += deltaTime;

                // Only advance text when accumulated time exceeds DIALOGUE_SPEED
                if (this.accumulatedTime >= DIALOGUE_SPEED) {
                    this.currentCharIndex++;
                    this.accumulatedTime = 0;  // Reset accumulated time after advancing text

                    // Check if we've reached the end of the dialogue
                    if (this.currentCharIndex >= currentDialogue.text.length) {
                        this.currentCharIndex = currentDialogue.text.length;
                        this.currentSpeakerFinished = true;
                    }
                }
            }

            // Draw the speaker's name in yellow
            this.ctx.fillStyle = 'yellow';
            this.ctx.font = 'bold 20px pixelFont';
            this.ctx.fillText(`${currentDialogue.speaker}: `, 70, 90);

            // Draw the dialogue text in white
            const displayedText = currentDialogue.text.substring(0, this.currentCharIndex);
            let addedWidth = this.ctx.measureText(`${currentDialogue.speaker}: `).width
            this.drawText(displayedText, 70 + addedWidth );  // Start after the name
        }
    }

    update(keys)
    {
        let occuring = super.update();
        if (occuring)
        {
            if (keys['Enter'] && this.currentSpeakerFinished) 
            {
                keys['Enter'] = false;
                this.currentSpeakerFinished = false;
                this.currentDialogueIndex++;
                if (this.currentDialogueIndex >= this.dialogues.length) 
                {
                    this.currentDialogueIndex = 0; 
                    super.endEvent(); 
                }
                this.currentCharIndex = 0;
            }
        }

        return occuring;
    }
}
