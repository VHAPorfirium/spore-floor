import { hallwayColorPalette as colors } from "../hallwayColorPalette.js";
import { logicalScreenWidth } from "../hallwayRenderingMeasurements.js";

export class DebugInformationDrawer {
  constructor(drawingContext) {
    this.drawingContext = drawingContext;
  }

  draw(floorState) {
    const context = this.drawingContext;
    const debugText = floorState.hasAnomaly
      ? `DEBUG anomaly: ${floorState.activeAnomaly.anomalyIdentifier} (${floorState.activeAnomaly.anomalyDescription})`
      : "DEBUG anomaly: none";
    context.textAlign = "right";
    context.textBaseline = "top";
    context.fillStyle = colors.debugText;
    context.font = "13px Arial, sans-serif";
    context.fillText(debugText, logicalScreenWidth - 16, 16);
  }
}
