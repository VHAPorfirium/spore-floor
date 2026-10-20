import { Anomaly } from "./Anomaly.js";
import { GameConfiguration } from "../GameConfiguration.js";

export class ChangedExitSignTextAnomaly extends Anomaly {
  constructor() {
    super("changed-exit-sign-text", "The exit sign says STAY instead of EXIT", GameConfiguration.stairwellDoorPositionX);
  }

  applyToHallwayLayout(hallwayLayout) {
    hallwayLayout.exitSign.text = "STAY";
  }
}
