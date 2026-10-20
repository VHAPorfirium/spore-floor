import { drawFungusBlobCluster } from "./fungusBlobCluster.js";

const moldPatchOpacity = 0.6;

export class MoldPatchDrawer {
  constructor(drawingContext) {
    this.drawingContext = drawingContext;
  }

  draw(moldPatch) {
    drawFungusBlobCluster(this.drawingContext, moldPatch.positionX, moldPatch.positionY, moldPatch.radiusInPixels, moldPatchOpacity);
  }
}
