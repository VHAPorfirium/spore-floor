import { Anomaly } from "./Anomaly.js";

const anyPositionInTheMiddleOfTheHallwayX = 1200;

/**
 * Algo segue o jogador. Por enquanto aparece como uma segunda sombra atrás dele;
 * o som de passos entra junto com o sistema de áudio.
 */
export class FootstepsBehindPlayerAnomaly extends Anomaly {
  constructor() {
    super("footsteps-behind-player", "Something is following right behind you", anyPositionInTheMiddleOfTheHallwayX);
  }

  applyToHallwayLayout(hallwayLayout) {
    hallwayLayout.isSomethingFollowingPlayer = true;
  }
}
