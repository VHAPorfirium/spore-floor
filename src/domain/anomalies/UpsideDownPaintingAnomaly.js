import { Anomaly } from "./Anomaly.js";

export class UpsideDownPaintingAnomaly extends Anomaly {
  constructor() {
    super("upside-down-painting", "A painting is hanging upside down");
  }

  applyToHallwayLayout(hallwayLayout) {
    const middlePainting = hallwayLayout.paintings[1];
    middlePainting.isUpsideDown = true;
  }
}
