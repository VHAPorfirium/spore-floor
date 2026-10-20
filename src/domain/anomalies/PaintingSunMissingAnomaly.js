import { Anomaly } from "./Anomaly.js";
import { paintingPositionsX } from "../HallwayLayout.js";

const paintingWithoutSunIndex = 2;

export class PaintingSunMissingAnomaly extends Anomaly {
  constructor() {
    super("painting-sun-missing", "The sun is missing from a painting", paintingPositionsX[paintingWithoutSunIndex]);
  }

  applyToHallwayLayout(hallwayLayout) {
    hallwayLayout.paintings[paintingWithoutSunIndex].isSunVisible = false;
  }
}
