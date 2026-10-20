import { Anomaly } from "./Anomaly.js";
import { paintingPositionsX } from "../HallwayLayout.js";

const upsideDownPaintingIndex = 1;

export class UpsideDownPaintingAnomaly extends Anomaly {
  constructor() {
    super("upside-down-painting", "A painting is hanging upside down", paintingPositionsX[upsideDownPaintingIndex]);
  }

  applyToHallwayLayout(hallwayLayout) {
    hallwayLayout.paintings[upsideDownPaintingIndex].isUpsideDown = true;
  }
}
