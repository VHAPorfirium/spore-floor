import { hallwayColorPalette as colors } from "../hallwayColorPalette.js";
import { floorTopY, signageFont } from "../hallwayRenderingMeasurements.js";
import { drawFungusBlobCluster } from "./fungusBlobCluster.js";

const doorWidth = 74;
const doorHeight = 172;
const doorFrameThickness = 7;
const doorKnobRadius = 4;
const numberPlateWidth = 44;
const numberPlateHeight = 18;
const numberPlateDistanceFromDoorTop = 22;
const fungusOverNumberRadiusInPixels = 12;
const fungusOverNumberOpacity = 0.92;

export class ApartmentDoorDrawer {
  constructor(drawingContext) {
    this.drawingContext = drawingContext;
  }

  draw(door) {
    const context = this.drawingContext;
    const doorLeftX = door.positionX - doorWidth / 2;
    const doorTopY = floorTopY - doorHeight;

    context.fillStyle = colors.apartmentDoorFrame;
    context.fillRect(doorLeftX - doorFrameThickness, doorTopY - doorFrameThickness, doorWidth + doorFrameThickness * 2, doorHeight + doorFrameThickness);
    context.fillStyle = colors.apartmentDoor;
    context.fillRect(doorLeftX, doorTopY, doorWidth, doorHeight);

    context.fillStyle = colors.brassNumberPlate;
    context.beginPath();
    context.arc(doorLeftX + doorWidth - 12, doorTopY + 96, doorKnobRadius, 0, Math.PI * 2);
    context.fill();

    const numberPlateTopY = doorTopY + numberPlateDistanceFromDoorTop;
    this.drawNumberPlate(door, numberPlateTopY);

    if (door.isDoorNumberCoveredByFungus) {
      const numberPlateCenterY = numberPlateTopY + numberPlateHeight / 2;
      drawFungusBlobCluster(context, door.positionX, numberPlateCenterY, fungusOverNumberRadiusInPixels, fungusOverNumberOpacity);
    }
  }

  drawNumberPlate(door, numberPlateTopY) {
    const context = this.drawingContext;
    context.fillStyle = colors.brassNumberPlate;
    context.fillRect(door.positionX - numberPlateWidth / 2, numberPlateTopY, numberPlateWidth, numberPlateHeight);
    context.fillStyle = colors.brassNumberText;
    context.font = signageFont;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(door.doorNumberText, door.positionX, numberPlateTopY + 10);
  }
}
