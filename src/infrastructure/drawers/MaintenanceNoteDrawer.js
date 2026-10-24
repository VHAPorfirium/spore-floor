import { hallwayColorPalette as colors } from "../hallwayColorPalette.js";

const notePaperWidth = 26;
const notePaperHeight = 32;
const notePaperTopY = 232;
const notePaperTiltInRadians = -0.06;
const numberOfScribbledLines = 5;

/** Papel preso na parede. O texto só aparece quando o jogador lê (ScreenOverlayDrawer). */
export class MaintenanceNoteDrawer {
  constructor(drawingContext) {
    this.drawingContext = drawingContext;
  }

  draw(maintenanceNote) {
    const context = this.drawingContext;
    context.save();
    context.translate(maintenanceNote.positionX, notePaperTopY + notePaperHeight / 2);
    context.rotate(notePaperTiltInRadians);

    context.fillStyle = colors.maintenanceNotePaper;
    context.fillRect(-notePaperWidth / 2, -notePaperHeight / 2, notePaperWidth, notePaperHeight);

    context.fillStyle = colors.maintenanceNoteInk;
    context.globalAlpha = 0.45;
    for (let lineIndex = 0; lineIndex < numberOfScribbledLines; lineIndex++) {
      const lineWidth = lineIndex === numberOfScribbledLines - 1 ? 10 : 18;
      context.fillRect(-notePaperWidth / 2 + 4, -notePaperHeight / 2 + 7 + lineIndex * 5, lineWidth, 1.5);
    }
    context.globalAlpha = 1;

    context.fillStyle = colors.maintenanceNotePin;
    context.beginPath();
    context.arc(0, -notePaperHeight / 2 + 3, 2.5, 0, Math.PI * 2);
    context.fill();

    context.restore();
  }
}
