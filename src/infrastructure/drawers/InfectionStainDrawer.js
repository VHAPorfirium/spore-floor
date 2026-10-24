import { drawFungusBlobCluster } from "./fungusBlobCluster.js";

const infectionStainOpacity = 0.5;

/** Manchas da doença do prédio no alto da parede. Fazem parte do "normal" de cada andar. */
export class InfectionStainDrawer {
  constructor(drawingContext) {
    this.drawingContext = drawingContext;
  }

  draw(infectionStain) {
    drawFungusBlobCluster(
      this.drawingContext,
      infectionStain.positionX,
      infectionStain.positionY,
      infectionStain.radiusInPixels,
      infectionStainOpacity,
    );
  }
}
