import { hallwayColorPalette as colors } from "../hallwayColorPalette.js";
import { floorTopY } from "../hallwayRenderingMeasurements.js";
import { ElevatorIndicatorColor } from "../../domain/ElevatorIndicatorColor.js";

const digitColorByIndicatorColor = Object.freeze({
  [ElevatorIndicatorColor.amber]: colors.floorIndicatorDigits,
  [ElevatorIndicatorColor.sporeGreen]: colors.floorIndicatorDigitsSporeGreen,
});

const elevatorWidth = 140;
const elevatorHeight = 200;
const elevatorFrameThickness = 10;
const gapBetweenElevatorDoors = 4;
const floorIndicatorWidth = 56;
const floorIndicatorHeight = 28;
const floorIndicatorDistanceAboveElevator = 46;
const floorIndicatorFont = "bold 20px 'Arial Narrow', Arial, sans-serif";

export class ElevatorDrawer {
  constructor(drawingContext, elevatorCenterX) {
    this.drawingContext = drawingContext;
    this.elevatorCenterX = elevatorCenterX;
  }

  draw() {
    const context = this.drawingContext;
    const elevatorLeftX = this.elevatorCenterX - elevatorWidth / 2;
    const elevatorTopY = floorTopY - elevatorHeight;
    const singleDoorWidth = elevatorWidth / 2 - gapBetweenElevatorDoors / 2;

    context.fillStyle = colors.elevatorSteelShadow;
    context.fillRect(
      elevatorLeftX - elevatorFrameThickness,
      elevatorTopY - elevatorFrameThickness,
      elevatorWidth + elevatorFrameThickness * 2,
      elevatorHeight + elevatorFrameThickness,
    );
    context.fillStyle = colors.elevatorSteel;
    context.fillRect(elevatorLeftX, elevatorTopY, singleDoorWidth, elevatorHeight);
    context.fillRect(this.elevatorCenterX + gapBetweenElevatorDoors / 2, elevatorTopY, singleDoorWidth, elevatorHeight);
  }

  /** O painel tem luz própria: é desenhado depois da escuridão, para não ser apagado por ela. */
  drawGlowingFloorIndicator(elevatorIndicatorText, elevatorIndicatorColor) {
    const floorIndicatorTopY = floorTopY - elevatorHeight - floorIndicatorDistanceAboveElevator;
    const context = this.drawingContext;
    context.fillStyle = colors.floorIndicatorBackground;
    context.fillRect(this.elevatorCenterX - floorIndicatorWidth / 2, floorIndicatorTopY, floorIndicatorWidth, floorIndicatorHeight);
    context.fillStyle = digitColorByIndicatorColor[elevatorIndicatorColor];
    context.font = floorIndicatorFont;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(elevatorIndicatorText, this.elevatorCenterX, floorIndicatorTopY + 15);
  }
}
