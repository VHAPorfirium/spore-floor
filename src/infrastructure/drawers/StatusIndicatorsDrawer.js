import { hallwayColorPalette as colors } from "../hallwayColorPalette.js";
import { logicalScreenWidth, logicalScreenHeight, messageFontFamily } from "../hallwayRenderingMeasurements.js";

const marginFromScreenEdgeInPixels = 16;

/** Avisos pequenos no canto inferior direito: som desligado e modo playtest. */
export class StatusIndicatorsDrawer {
  constructor(drawingContext) {
    this.drawingContext = drawingContext;
  }

  draw({ isSoundMuted = false, isPlaytestModeEnabled = false }) {
    const indicatorTexts = [];
    if (isPlaytestModeEnabled) {
      indicatorTexts.push("PLAYTEST  [L] save log");
    }
    if (isSoundMuted) {
      indicatorTexts.push("Sound off  [M]");
    }
    if (indicatorTexts.length === 0) {
      return;
    }

    const context = this.drawingContext;
    context.textAlign = "right";
    context.textBaseline = "bottom";
    context.fillStyle = colors.interfaceTextDimmed;
    context.font = `13px ${messageFontFamily}`;
    const lineHeightInPixels = 18;
    indicatorTexts.forEach((indicatorText, indicatorIndex) => {
      const positionY = logicalScreenHeight - marginFromScreenEdgeInPixels - indicatorIndex * lineHeightInPixels;
      context.fillText(indicatorText, logicalScreenWidth - marginFromScreenEdgeInPixels, positionY);
    });
  }
}
