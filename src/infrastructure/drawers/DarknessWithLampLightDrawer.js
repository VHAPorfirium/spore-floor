import { logicalScreenWidth, logicalScreenHeight, ceilingBottomY } from "../hallwayRenderingMeasurements.js";
import { calculateCeilingLampBrightness } from "../ceilingLampBrightness.js";

const darknessColor = "rgba(4, 5, 3, 0.86)";
const lightInnerRadius = 10;
const lightOuterRadius = 260;
const lightCenterDistanceBelowCeiling = 120;
const lightRectangleHalfWidth = 280;

/** Escurece a tela inteira e "recorta" a luz embaixo de cada lâmpada, respeitando o brilho dela. */
export class DarknessWithLampLightDrawer {
  constructor(drawingContext) {
    this.drawingContext = drawingContext;
    this.lightMaskCanvas = document.createElement("canvas");
    this.lightMaskCanvas.width = logicalScreenWidth;
    this.lightMaskCanvas.height = logicalScreenHeight;
    this.lightMaskContext = this.lightMaskCanvas.getContext("2d");
  }

  draw(ceilingLamps, cameraOffsetX, elapsedTimeInSeconds) {
    const maskContext = this.lightMaskContext;
    maskContext.globalCompositeOperation = "source-over";
    maskContext.clearRect(0, 0, logicalScreenWidth, logicalScreenHeight);
    maskContext.fillStyle = darknessColor;
    maskContext.fillRect(0, 0, logicalScreenWidth, logicalScreenHeight);

    maskContext.globalCompositeOperation = "destination-out";
    ceilingLamps.forEach((ceilingLamp) => {
      const lampBrightness = calculateCeilingLampBrightness(ceilingLamp, elapsedTimeInSeconds);
      this.cutLightUnderLamp(ceilingLamp.positionX - cameraOffsetX, lampBrightness);
    });

    this.drawingContext.drawImage(this.lightMaskCanvas, 0, 0, logicalScreenWidth, logicalScreenHeight);
  }

  cutLightUnderLamp(lampScreenX, lampBrightness) {
    const maskContext = this.lightMaskContext;
    const lightGradient = maskContext.createRadialGradient(
      lampScreenX, ceilingBottomY, lightInnerRadius,
      lampScreenX, ceilingBottomY + lightCenterDistanceBelowCeiling, lightOuterRadius,
    );
    lightGradient.addColorStop(0, `rgba(0, 0, 0, ${lampBrightness})`);
    lightGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    maskContext.fillStyle = lightGradient;
    maskContext.fillRect(lampScreenX - lightRectangleHalfWidth, 0, lightRectangleHalfWidth * 2, logicalScreenHeight);
  }
}
