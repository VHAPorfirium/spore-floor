import { hallwayColorPalette as colors } from "../hallwayColorPalette.js";
import { logicalScreenWidth, logicalScreenHeight, messageFontFamily } from "../hallwayRenderingMeasurements.js";

const fadeInPortionOfFloorTransition = 0.25;

/** Telas que cobrem o corredor inteiro: transição de andar e tela de fuga. */
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

  drawEscapeScreen() {
    const context = this.drawingContext;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = colors.interfaceText;
    context.font = `30px ${messageFontFamily}`;
    context.fillText("You left the building.", logicalScreenWidth / 2, logicalScreenHeight / 2 - 20);
    context.fillStyle = colors.interfaceTextDimmed;
    context.font = `17px ${messageFontFamily}`;
    context.fillText("Press E to go back inside.", logicalScreenWidth / 2, logicalScreenHeight / 2 + 26);
  }
}
