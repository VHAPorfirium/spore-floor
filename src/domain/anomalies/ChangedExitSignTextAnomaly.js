import { Anomaly } from "./Anomaly.js";

export class ChangedExitSignTextAnomaly extends Anomaly {
  constructor() {
    super("changed-exit-sign-text", "The exit sign says STAY instead of EXIT");
  }

  applyToHallwayLayout(hallwayLayout) {
    hallwayLayout.exitSign.text = "STAY";
  }
}
