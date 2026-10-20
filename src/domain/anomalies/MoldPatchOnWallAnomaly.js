import { Anomaly } from "./Anomaly.js";

/** Mancha pequena perto do rodapé: precisa de atenção para ser notada. */
const moldPatchOnWall = Object.freeze({ positionX: 1590, positionY: 396, radiusInPixels: 15 });

export class MoldPatchOnWallAnomaly extends Anomaly {
  constructor() {
    super("mold-patch-on-wall", "A small patch of spore mold is growing near the baseboard", moldPatchOnWall.positionX);
  }

  applyToHallwayLayout(hallwayLayout) {
    hallwayLayout.moldPatches.push({ ...moldPatchOnWall });
  }
}
