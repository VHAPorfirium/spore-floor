import { Anomaly } from "./Anomaly.js";
import { apartmentDoorPositionsX } from "../HallwayLayout.js";

const firstSwappedDoorIndex = 1;
const secondSwappedDoorIndex = 3;

export class SwappedDoorNumbersAnomaly extends Anomaly {
  constructor() {
    const positionBetweenSwappedDoorsX =
      (apartmentDoorPositionsX[firstSwappedDoorIndex] + apartmentDoorPositionsX[secondSwappedDoorIndex]) / 2;
    super("swapped-door-numbers", "Two door numbers swapped places", positionBetweenSwappedDoorsX);
  }

  applyToHallwayLayout(hallwayLayout) {
    const firstSwappedDoor = hallwayLayout.doors[firstSwappedDoorIndex];
    const secondSwappedDoor = hallwayLayout.doors[secondSwappedDoorIndex];
    const firstSwappedDoorNumberText = firstSwappedDoor.doorNumberText;
    firstSwappedDoor.doorNumberText = secondSwappedDoor.doorNumberText;
    secondSwappedDoor.doorNumberText = firstSwappedDoorNumberText;
  }
}
