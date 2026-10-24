import { hallwayColorPalette as colors } from "../hallwayColorPalette.js";
import { logicalScreenWidth, logicalScreenHeight, messageFontFamily } from "../hallwayRenderingMeasurements.js";
import { wrapTextIntoLines } from "./textWrapping.js";

const fadeInPortionOfFloorTransition = 0.25;
const notePaperWidth = 520;
const notePaperPadding = 34;
const noteLineHeight = 26;

function formatSecondsAsMinutesAndSeconds(totalSeconds) {
  const wholeSeconds = Math.floor(totalSeconds);
  const minutes = Math.floor(wholeSeconds / 60);
  const seconds = String(wholeSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

/** Telas que cobrem o corredor: transição de andar, leitura de nota e tela de fuga. */
export class ScreenOverlayDrawer {
  constructor(drawingContext) {
    this.drawingContext = drawingContext;
  }

  drawFloorTransition(floorTransitionProgress, floorTransitionMessage) {
    const context = this.drawingContext;
    const darknessOpacity = Math.min(1, floorTransitionProgress / fadeInPortionOfFloorTransition);

    context.fillStyle = `rgba(0, 0, 0, ${darknessOpacity})`;
    context.fillRect(0, 0, logicalScreenWidth, logicalScreenHeight);

    const isScreenFullyDark = darknessOpacity >= 1;
    if (isScreenFullyDark) {
      context.fillStyle = colors.interfaceText;
      context.font = `26px ${messageFontFamily}`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(floorTransitionMessage, logicalScreenWidth / 2, logicalScreenHeight / 2);
    }
  }

  drawMaintenanceNoteReading(maintenanceNoteText) {
    const context = this.drawingContext;
    context.fillStyle = "rgba(0, 0, 0, 0.72)";
    context.fillRect(0, 0, logicalScreenWidth, logicalScreenHeight);

    context.font = `17px ${messageFontFamily}`;
    const textLines = wrapTextIntoLines(context, maintenanceNoteText, notePaperWidth - notePaperPadding * 2);
    const notePaperHeight = textLines.length * noteLineHeight + notePaperPadding * 2;
    const notePaperLeftX = (logicalScreenWidth - notePaperWidth) / 2;
    const notePaperTopY = (logicalScreenHeight - notePaperHeight) / 2 - 16;

    context.fillStyle = colors.maintenanceNotePaper;
    context.fillRect(notePaperLeftX, notePaperTopY, notePaperWidth, notePaperHeight);

    context.fillStyle = colors.maintenanceNoteInk;
    context.textAlign = "left";
    context.textBaseline = "top";
    textLines.forEach((textLine, lineIndex) => {
      context.fillText(textLine, notePaperLeftX + notePaperPadding, notePaperTopY + notePaperPadding + lineIndex * noteLineHeight);
    });

    context.fillStyle = colors.interfaceTextDimmed;
    context.textAlign = "center";
    context.font = `15px ${messageFontFamily}`;
    context.fillText("[E] Put the note back", logicalScreenWidth / 2, notePaperTopY + notePaperHeight + 18);
  }

  drawEscapeScreen(elapsedRunTimeInSeconds, numberOfTimesSentBackToStartingFloor) {
    const context = this.drawingContext;
    const screenCenterX = logicalScreenWidth / 2;
    const screenCenterY = logicalScreenHeight / 2;
    context.textAlign = "center";
    context.textBaseline = "middle";

    context.fillStyle = colors.interfaceText;
    context.font = `34px ${messageFontFamily}`;
    context.fillText("You left the building.", screenCenterX, screenCenterY - 60);

    context.fillStyle = colors.interfaceTextDimmed;
    context.font = `18px ${messageFontFamily}`;
    context.fillText(`Time inside: ${formatSecondsAsMinutesAndSeconds(elapsedRunTimeInSeconds)}`, screenCenterX, screenCenterY);
    const timesSentBackText = numberOfTimesSentBackToStartingFloor === 1 ? "1 time" : `${numberOfTimesSentBackToStartingFloor} times`;
    context.fillText(`The hallway took you back ${timesSentBackText}.`, screenCenterX, screenCenterY + 28);

    context.font = `15px ${messageFontFamily}`;
    context.fillText("Your fingernails are a little green. You try not to look.", screenCenterX, screenCenterY + 80);
    context.fillText("Click or press E to go back inside.", screenCenterX, screenCenterY + 130);
  }
}
