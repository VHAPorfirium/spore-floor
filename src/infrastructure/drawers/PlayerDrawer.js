import { hallwayColorPalette as colors } from "../hallwayColorPalette.js";
import { floorTopY } from "../hallwayRenderingMeasurements.js";

const legSwingAmountInPixels = 7;
const shadowHorizontalRadius = 22;
const shadowVerticalRadius = 5;

export class PlayerDrawer {
  constructor(drawingContext, playerStepDurationInSeconds) {
    this.drawingContext = drawingContext;
    // Cada meia volta do seno é um passo: assim as pernas batem no chão junto com o som dos passos.
    this.legSwingSpeed = Math.PI / playerStepDurationInSeconds;
  }

  draw(player) {
    this.drawShadowOnFloor(player.positionX);
    this.drawBody(player);
  }

  drawShadowOnFloor(shadowCenterX) {
    const context = this.drawingContext;
    context.fillStyle = colors.castShadow;
    context.beginPath();
    context.ellipse(shadowCenterX, floorTopY + 3, shadowHorizontalRadius, shadowVerticalRadius, 0, 0, Math.PI * 2);
    context.fill();
  }

  drawBody(player) {
    const context = this.drawingContext;
    const legSwingAmount = player.isWalking ? Math.sin(player.walkingAnimationTimeInSeconds * this.legSwingSpeed) * legSwingAmountInPixels : 0;
    const facingDirection = player.isFacingRight ? 1 : -1;

    context.fillStyle = colors.playerSilhouette;
    context.fillRect(player.positionX - 9 + legSwingAmount, floorTopY - 48, 8, 48);
    context.fillRect(player.positionX + 1 - legSwingAmount, floorTopY - 48, 8, 48);
    context.fillRect(player.positionX - 14, floorTopY - 104, 28, 60);

    context.beginPath();
    context.arc(player.positionX + facingDirection * 2, floorTopY - 118, 14, 0, Math.PI * 2);
    context.fill();
  }
}
