import { Anomaly } from "./Anomaly.js";

/** Fica um pouco antes da última lâmpada, meio na sombra. */
const infectedFigurePositionX = 2095;

export class InfectedFigureAtHallwayEndAnomaly extends Anomaly {
  constructor() {
    super("infected-figure-at-hallway-end", "An infected figure stands near the stairwell door", infectedFigurePositionX);
  }

  applyToHallwayLayout(hallwayLayout) {
    hallwayLayout.standingFigures.push({ positionX: infectedFigurePositionX });
  }
}
