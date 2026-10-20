import { Anomaly } from "./Anomaly.js";

export class MoldPatchOnWallAnomaly extends Anomaly {
  constructor() {
    super("mold-patch-on-wall", "A patch of spore mold is growing on the wall");
  }

  applyToHallwayLayout(hallwayLayout) {
    hallwayLayout.moldPatches.push({ positionX: 1570, positionY: 230, radiusInPixels: 46 });
  }
}
