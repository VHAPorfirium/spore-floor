import { Anomaly } from "./Anomaly.js";
import { apartmentDoorPositionsX } from "../HallwayLayout.js";

const missingDoorIndex = 2;

export class MissingApartmentDoorAnomaly extends Anomaly {
  constructor() {
    super("missing-apartment-door", "One of the apartment doors is gone", apartmentDoorPositionsX[missingDoorIndex]);
  }

  applyToHallwayLayout(hallwayLayout) {
    hallwayLayout.doors = hallwayLayout.doors.filter((door, doorIndex) => doorIndex !== missingDoorIndex);
  }
}
