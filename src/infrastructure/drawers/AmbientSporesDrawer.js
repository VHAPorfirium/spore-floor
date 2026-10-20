import { hallwayColorPalette as colors } from "../hallwayColorPalette.js";
import { logicalScreenWidth, ceilingBottomY, floorTopY } from "../hallwayRenderingMeasurements.js";
import { SporeDriftDirection } from "../../domain/SporeDriftDirection.js";

const numberOfSporeParticles = 110;
const sporeFloatingAreaHeight = floorTopY - ceilingBottomY;
const sporeParticleOpacity = 0.45;
const sporeHorizontalSwayInPixels = 10;
const sporeHorizontalSwaySpeed = 0.6;
const visibleMarginInPixels = 20;

/** Mesmo "aleatório" a cada execução, para os esporos não pularem de lugar. */
function createDeterministicNumberBetweenZeroAndOne(seed) {
  const scrambledValue = Math.sin(seed * 12.9898) * 43758.5453;
  return scrambledValue - Math.floor(scrambledValue);
}

function calculatePositiveRemainder(dividend, divisor) {
  return ((dividend % divisor) + divisor) % divisor;
}

export class AmbientSporesDrawer {
  constructor(drawingContext, hallwayLengthInPixels) {
    this.drawingContext = drawingContext;
    this.sporeParticles = Array.from({ length: numberOfSporeParticles }, (unusedValue, particleIndex) => ({
      basePositionX: createDeterministicNumberBetweenZeroAndOne(particleIndex + 1) * hallwayLengthInPixels,
      baseOffsetY: createDeterministicNumberBetweenZeroAndOne(particleIndex + 101) * sporeFloatingAreaHeight,
      driftSpeedInPixelsPerSecond: 8 + createDeterministicNumberBetweenZeroAndOne(particleIndex + 201) * 14,
      swayPhase: createDeterministicNumberBetweenZeroAndOne(particleIndex + 301) * Math.PI * 2,
      radiusInPixels: 0.8 + createDeterministicNumberBetweenZeroAndOne(particleIndex + 401) * 1.4,
    }));
  }

  draw(ambientSpores, cameraOffsetX, elapsedTimeInSeconds) {
    const context = this.drawingContext;
    const verticalDriftDirection = ambientSpores.driftDirection === SporeDriftDirection.risingUp ? -1 : 1;

    context.globalAlpha = sporeParticleOpacity;
    context.fillStyle = colors.sporeParticle;

    this.sporeParticles.forEach((sporeParticle) => {
      const positionX = sporeParticle.basePositionX
        + Math.sin(elapsedTimeInSeconds * sporeHorizontalSwaySpeed + sporeParticle.swayPhase) * sporeHorizontalSwayInPixels;
      const isOutsideTheScreen = positionX < cameraOffsetX - visibleMarginInPixels
        || positionX > cameraOffsetX + logicalScreenWidth + visibleMarginInPixels;
      if (isOutsideTheScreen) {
        return;
      }

      const verticalDistanceTraveled = verticalDriftDirection * sporeParticle.driftSpeedInPixelsPerSecond * elapsedTimeInSeconds;
      const positionY = ceilingBottomY + calculatePositiveRemainder(sporeParticle.baseOffsetY + verticalDistanceTraveled, sporeFloatingAreaHeight);

      context.beginPath();
      context.arc(positionX, positionY, sporeParticle.radiusInPixels, 0, Math.PI * 2);
      context.fill();
    });

    context.globalAlpha = 1;
  }
}
