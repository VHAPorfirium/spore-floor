import { Anomaly } from "./Anomaly.js";
import { GameConfiguration } from "../GameConfiguration.js";

export class ElevatorIndicatorShowsWrongFloorAnomaly extends Anomaly {
  constructor() {
    super(
      "elevator-indicator-shows-wrong-floor",
      "The elevator indicator shows the floor above",
      GameConfiguration.elevatorPositionX,
    );
  }

  applyToHallwayLayout(hallwayLayout) {
    const floorAboveNumber = hallwayLayout.floorNumber + 1;
    hallwayLayout.elevatorIndicatorText = String(floorAboveNumber);
  }
}
