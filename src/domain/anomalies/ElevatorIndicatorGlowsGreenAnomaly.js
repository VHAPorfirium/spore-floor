import { Anomaly } from "./Anomaly.js";
import { GameConfiguration } from "../GameConfiguration.js";
import { ElevatorIndicatorColor } from "../ElevatorIndicatorColor.js";

/**
 * O número continua certo; só a cor muda.
 * (Antes o painel mostrava o andar de cima, e o jogador achava que tinha voltado para o 10.)
 */
export class ElevatorIndicatorGlowsGreenAnomaly extends Anomaly {
  constructor() {
    super(
      "elevator-indicator-glows-green",
      "The elevator floor indicator glows green instead of amber",
      GameConfiguration.elevatorPositionX,
    );
  }

  applyToHallwayLayout(hallwayLayout) {
    hallwayLayout.elevatorIndicatorColor = ElevatorIndicatorColor.sporeGreen;
  }
}
