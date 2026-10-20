import { hallwayColorPalette as colors } from "../hallwayColorPalette.js";
import { floorTopY } from "../hallwayRenderingMeasurements.js";
import { drawFungusBlobCluster } from "./fungusBlobCluster.js";

const figureSwayInPixels = 1.5;
const figureSwaySpeed = 0.8;
const fungusOnHeadRadiusInPixels = 9;
const fungusOnHeadOpacity = 0.7;

/** Figura humana parada, um pouco mais alta que o jogador, com fungo brotando da cabeça. */
export class StandingFigureDrawer {
  constructor(drawingContext) {
    this.drawingContext = drawingContext;
  }

  draw(standingFigure, elapsedTimeInSeconds) {
    const context = this.drawingContext;
    const figureCenterX = standingFigure.positionX + Math.sin(elapsedTimeInSeconds * figureSwaySpeed) * figureSwayInPixels;

    context.fillStyle = colors.infectedFigureSilhouette;
    context.fillRect(figureCenterX - 10, floorTopY - 56, 8, 56);
    context.fillRect(figureCenterX + 2, floorTopY - 56, 8, 56);
    context.fillRect(figureCenterX - 16, floorTopY - 122, 32, 68);
    context.fillRect(figureCenterX - 22, floorTopY - 118, 6, 60);
    context.fillRect(figureCenterX + 16, floorTopY - 118, 6, 60);

    context.beginPath();
    context.arc(figureCenterX, floorTopY - 138, 15, 0, Math.PI * 2);
    context.fill();

    drawFungusBlobCluster(context, figureCenterX + 6, floorTopY - 150, fungusOnHeadRadiusInPixels, fungusOnHeadOpacity);
  }
}
