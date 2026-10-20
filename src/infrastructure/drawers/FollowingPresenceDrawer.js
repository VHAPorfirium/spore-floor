import { hallwayColorPalette as colors } from "../hallwayColorPalette.js";
import { floorTopY } from "../hallwayRenderingMeasurements.js";

const distanceBehindPlayerInPixels = 115;
const shadowHorizontalRadius = 22;
const shadowVerticalRadius = 5;

/** Uma sombra sem dono, sempre atrás do jogador. O som dos passos entra com o áudio. */
export class FollowingPresenceDrawer {
  constructor(drawingContext) {
    this.drawingContext = drawingContext;
  }

  draw(player) {
    const context = this.drawingContext;
    const directionBehindPlayer = player.isFacingRight ? -1 : 1;
    const shadowCenterX = player.positionX + directionBehindPlayer * distanceBehindPlayerInPixels;

    context.fillStyle = colors.castShadow;
    context.beginPath();
    context.ellipse(shadowCenterX, floorTopY + 3, shadowHorizontalRadius, shadowVerticalRadius, 0, 0, Math.PI * 2);
    context.fill();
  }
}
