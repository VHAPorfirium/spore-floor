import { hallwayColorPalette as colors } from "../hallwayColorPalette.js";
import { logicalScreenWidth, logicalScreenHeight } from "../hallwayRenderingMeasurements.js";

const tintOpacityAtFullInfection = 0.22;
const vignetteOpacityOnCleanFloor = 0.35;
const extraVignetteOpacityAtFullInfection = 0.4;

/** Deixa a tela inteira mais esverdeada e fechada conforme o andar fica mais infectado. */
export class InfectionTintDrawer {
  constructor(drawingContext) {
    this.drawingContext = drawingContext;
  }

  draw(infectionLevel) {
    this.drawGreenTint(infectionLevel);
    this.drawVignette(infectionLevel);
  }

  drawGreenTint(infectionLevel) {
    const context = this.drawingContext;
    context.globalAlpha = infectionLevel * tintOpacityAtFullInfection;
    context.fillStyle = colors.infectionTint;
    context.fillRect(0, 0, logicalScreenWidth, logicalScreenHeight);
    context.globalAlpha = 1;
  }

  drawVignette(infectionLevel) {
    const context = this.drawingContext;
    const vignetteOpacity = vignetteOpacityOnCleanFloor + infectionLevel * extraVignetteOpacityAtFullInfection;
    const vignetteGradient = context.createRadialGradient(
      logicalScreenWidth / 2, logicalScreenHeight / 2, logicalScreenHeight * 0.35,
      logicalScreenWidth / 2, logicalScreenHeight / 2, logicalScreenWidth * 0.62,
    );
    vignetteGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    vignetteGradient.addColorStop(1, `rgba(0, 0, 0, ${vignetteOpacity})`);
    context.fillStyle = vignetteGradient;
    context.fillRect(0, 0, logicalScreenWidth, logicalScreenHeight);
  }
}
