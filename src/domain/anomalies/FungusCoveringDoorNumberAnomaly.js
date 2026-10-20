import { Anomaly } from "./Anomaly.js";
import { apartmentDoorPositionsX } from "../HallwayLayout.js";

const fungusCoveredDoorIndex = 4;

export class FungusCoveringDoorNumberAnomaly extends Anomaly {
  constructor() {
    super(
      "fungus-covering-door-number",
      "Fungus is growing over a door number",
      apartmentDoorPositionsX[fungusCoveredDoorIndex],
    );
  }

  applyToHallwayLayout(hallwayLayout) {
    hallwayLayout.doors[fungusCoveredDoorIndex].isDoorNumberCoveredByFungus = true;
  }
}
