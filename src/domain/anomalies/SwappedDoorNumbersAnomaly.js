import { Anomaly } from "./Anomaly.js";

export class SwappedDoorNumbersAnomaly extends Anomaly {
  constructor() {
    super("swapped-door-numbers", "Two door numbers swapped places");
  }

  applyToHallwayLayout(hallwayLayout) {
    const secondDoor = hallwayLayout.doors[1];
    const fourthDoor = hallwayLayout.doors[3];
    const secondDoorNumberText = secondDoor.doorNumberText;
    secondDoor.doorNumberText = fourthDoor.doorNumberText;
    fourthDoor.doorNumberText = secondDoorNumberText;
  }
}
