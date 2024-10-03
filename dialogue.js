// Constants
const DIALOGUE_BOX_HEIGHT = 150;
const DIALOGUE_SPEED = 20;  // Speed of text appearing (ms per character)

// Dialogue state
let currentDialogueIndex = 0;
let currentCharIndex = 0;
let dialogueFinished = false;
let accumulatedTime = 0;

const dialogues = [
    { speaker: 'Monkey', text: ' Guys?.. Where are we? (Hit [Enter] to continue)' },
    { speaker: 'Cat', text: 'I have absolutely no idea. (Hit [Enter] to continue)' },
    { speaker: 'Dog', text: 'Doesn\'t something strike you as strange?' },
    { speaker: 'Monkey', text: 'What?' },
    { speaker: 'Dog', text: 'Since when are we capable of speaking?' },
    { speaker: 'Game', text: 'Use [LeftArrow] and [RightArrow] to move, Press [Space] to Jump'},
    { speaker: 'Game', text: 'Press [1] or [2] or [3] to switch between the characters (Hit [Enter] to close dialogue)'}
];


// Helper to draw the dialogue box
export function drawDialogueBox(ctx, canvas) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(50,  50, canvas.width - 100, DIALOGUE_BOX_HEIGHT);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, canvas.width - 100, DIALOGUE_BOX_HEIGHT);
}

// Helper to draw the text
function drawText(ctx, canvas, text, startX) {
    const lines = wrapText(ctx, text, canvas.width - 120 - startX);
    ctx.fillStyle = 'white';
    ctx.font = '20px pixelFont';  // Pixel art fonts give it a retro feel
    lines.forEach((line, index) => {
        ctx.fillText(line, startX, 90 + index * 24);
    });
}

// Helper to wrap text within the dialogue box
function wrapText(ctx, text, maxWidth) {
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

export function renderDialogue(ctx, canvas, deltaTime) {
    const currentDialogue = dialogues[currentDialogueIndex];
    
    if (dialogueFinished) {
        currentCharIndex = currentDialogue.text.length;
    } else {
        // Accumulate delta time across frames
        accumulatedTime += deltaTime;

        // Only advance text when accumulated time exceeds DIALOGUE_SPEED
        if (accumulatedTime >= DIALOGUE_SPEED) {
            currentCharIndex++;
            accumulatedTime = 0;  // Reset accumulated time after advancing text

            // Check if we've reached the end of the dialogue
            if (currentCharIndex >= currentDialogue.text.length) {
                currentCharIndex = currentDialogue.text.length;
                dialogueFinished = true;
            }
        }
    }

    // Draw the speaker's name in yellow
    ctx.fillStyle = 'yellow';
    ctx.font = 'bold 20px pixelFont';
    ctx.fillText(`${currentDialogue.speaker}: `, 70, 90);

    // Draw the dialogue text in white
    const displayedText = currentDialogue.text.substring(0, currentCharIndex);
    let addedWidth = ctx.measureText(`${currentDialogue.speaker}: `).width
    drawText(ctx, canvas, displayedText, 70 + addedWidth );  // Start after the name
}

export function dialogueUpdate(keys)
{
    if (keys['Enter'] && dialogueFinished) {
        dialogueFinished = false;
        currentDialogueIndex++;
        if (currentDialogueIndex >= dialogues.length) {
            currentDialogueIndex = 0;  
            return false;
        }
        currentCharIndex = 0;
        return true;
    }
    return true;    
}