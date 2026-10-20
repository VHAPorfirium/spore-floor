import { hallwayColorPalette as colors } from "../hallwayColorPalette.js";
import { floorTopY, signageFont } from "../hallwayRenderingMeasurements.js";

const doorWidth = 84;
const doorHeight = 180;
const doorFrameThickness = 8;
const exitSignWidth = 64;
const exitSignHeight = 24;
const exitSignDistanceAboveDoor = 44;

export class StairwellDoorDrawer {
  constructor(drawingContext, stairwellDoorCenterX) {
    this.drawingContext = drawingContext;
    this.stairwellDoorCenterX = stairwellDoorCenterX;
  }

  draw(exitSignText) {
    const context = this.drawingContext;
    const doorCenterX = this.stairwellDoorCenterX;
    const doorLeftX = doorCenterX - doorWidth / 2;
    const doorTopY = floorTopY - doorHeight;

    context.fillStyle = colors.apartmentDoorFrame;
    context.fillRect(doorLeftX - doorFrameThickness, doorTopY - doorFrameThickness, doorWidth + doorFrameThickness * 2, doorHeight + doorFrameThickness);
    context.fillStyle = colors.stairwellDoor;
    context.fillRect(doorLeftX, doorTopY, doorWidth, doorHeight);
    context.fillStyle = colors.elevatorSteel;
    context.fillRect(doorLeftX + 8, doorTopY + 92, doorWidth - 16, 8);

    this.drawExitSign(doorTopY - exitSignDistanceAboveDoor, exitSignText);
  }

  drawExitSign(exitSignTopY, exitSignText) {
    const context = this.drawingContext;
    context.fillStyle = colors.exitSignBackground;
    context.fillRect(this.stairwellDoorCenterX - exitSignWidth / 2, exitSignTopY, exitSignWidth, exitSignHeight);
    context.fillStyle = colors.exitSignText;
    context.font = signageFont;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(exitSignText, this.stairwellDoorCenterX, exitSignTopY + 13);
  }
}
