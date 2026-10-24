import { hallwayColorPalette as colors } from "../hallwayColorPalette.js";
import { logicalScreenWidth, logicalScreenHeight, messageFontFamily } from "../hallwayRenderingMeasurements.js";

const promptBlinkSpeed = 2.4;

export class TitleScreenDrawer {
  constructor(drawingContext) {
    this.drawingContext = drawingContext;
  }

  draw(elapsedTimeInSeconds) {
    const context = this.drawingContext;
    const screenCenterX = logicalScreenWidth / 2;
    context.textAlign = "center";
    context.textBaseline = "middle";

    context.fillStyle = colors.interfaceText;
    context.font = `64px ${messageFontFamily}`;
    context.fillText("SPORE FLOOR", screenCenterX, 170);

    context.fillStyle = colors.interfaceTextDimmed;
    context.font = `18px ${messageFontFamily}`;
    context.fillText("The hallway repeats. Something is growing in it.", screenCenterX, 222);

    context.font = `15px ${messageFontFamily}`;
    context.fillText("If anything is wrong, take the elevator back. If nothing is wrong, take the stairs.", screenCenterX, 300);
    context.fillText("Reach the ground floor to get out.", screenCenterX, 324);
    context.fillText("A / D or arrows: walk     E: interact     M: sound on/off", screenCenterX, 372);
    context.fillText("Play with sound on. Some things can only be heard.", screenCenterX, 396);

    const promptOpacity = 0.55 + Math.sin(elapsedTimeInSeconds * promptBlinkSpeed) * 0.45;
    context.globalAlpha = promptOpacity;
    context.fillStyle = colors.interfaceText;
    context.font = `22px ${messageFontFamily}`;
    context.fillText("Click or press E to step out of the elevator", screenCenterX, logicalScreenHeight - 80);
    context.globalAlpha = 1;
  }
}
