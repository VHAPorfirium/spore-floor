import { hallwayColorPalette as colors } from "../hallwayColorPalette.js";
import { ceilingBottomY } from "../hallwayRenderingMeasurements.js";
import { calculateCeilingLampBrightness } from "../ceilingLampBrightness.js";

const fluorescentTubeWidth = 80;
const fluorescentTubeHeight = 7;
const minimumTubeOpacityWhenOff = 0.3;

export class CeilingLampFixtureDrawer {
  constructor(drawingContext) {
    this.drawingContext = drawingContext;
  }

  draw(ceilingLamp, elapsedTimeInSeconds) {
    const context = this.drawingContext;
    const lampBrightness = calculateCeilingLampBrightness(ceilingLamp, elapsedTimeInSeconds);

    context.globalAlpha = minimumTubeOpacityWhenOff + (1 - minimumTubeOpacityWhenOff) * lampBrightness;
    context.fillStyle = colors.fluorescentTube;
    context.fillRect(ceilingLamp.positionX - fluorescentTubeWidth / 2, ceilingBottomY, fluorescentTubeWidth, fluorescentTubeHeight);
    context.globalAlpha = 1;
  }
}
