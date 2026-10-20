import { Anomaly } from "./Anomaly.js";
import { SporeDriftDirection } from "../SporeDriftDirection.js";

const anyPositionInTheMiddleOfTheHallwayX = 1200;

export class SporesDriftingUpwardAnomaly extends Anomaly {
  constructor() {
    super("spores-drifting-upward", "The spores in the air drift upward", anyPositionInTheMiddleOfTheHallwayX);
  }

  applyToHallwayLayout(hallwayLayout) {
    hallwayLayout.ambientSpores.driftDirection = SporeDriftDirection.risingUp;
  }
}
