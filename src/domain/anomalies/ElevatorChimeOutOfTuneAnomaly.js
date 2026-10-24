import { Anomaly } from "./Anomaly.js";
import { GameConfiguration } from "../GameConfiguration.js";
import { ElevatorChimeTone } from "../ElevatorChimeTone.js";

/** Anomalia só de áudio: o sino de chegada toca desafinado. */
export class ElevatorChimeOutOfTuneAnomaly extends Anomaly {
  constructor() {
    const requiresSoundToNotice = true;
    super(
      "elevator-chime-out-of-tune",
      "The elevator arrival chime plays out of tune",
      GameConfiguration.elevatorPositionX,
      requiresSoundToNotice,
    );
  }

  applyToHallwayLayout(hallwayLayout) {
    hallwayLayout.elevatorChimeTone = ElevatorChimeTone.outOfTune;
  }
}
