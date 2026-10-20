import { Anomaly } from "./Anomaly.js";
import { ceilingLampPositionsX } from "../HallwayLayout.js";
import { CeilingLampFlickerPattern } from "../CeilingLampFlickerPattern.js";

const flickeringLampIndex = 2;

export class LampFlickeringOutOfRhythmAnomaly extends Anomaly {
  constructor() {
    super(
      "lamp-flickering-out-of-rhythm",
      "One ceiling lamp flickers out of rhythm",
      ceilingLampPositionsX[flickeringLampIndex],
    );
  }

  applyToHallwayLayout(hallwayLayout) {
    hallwayLayout.ceilingLamps[flickeringLampIndex].flickerPattern = CeilingLampFlickerPattern.irregularFlicker;
  }
}
