import { hallwayColorPalette as colors } from "../hallwayColorPalette.js";
import { logicalScreenWidth, logicalScreenHeight, ceilingBottomY, floorTopY } from "../hallwayRenderingMeasurements.js";

const wallpaperStripeSpacingInPixels = 36;
const wallpaperStripeWidthInPixels = 6;
const baseboardHeightInPixels = 14;

export class HallwayStructureDrawer {
  constructor(drawingContext, hallwayLengthInPixels) {
    this.drawingContext = drawingContext;
    this.hallwayLengthInPixels = hallwayLengthInPixels;
  }

  draw(cameraOffsetX) {
    const context = this.drawingContext;
    const wallHeight = floorTopY - ceilingBottomY;

    context.fillStyle = colors.ceiling;
    context.fillRect(0, 0, this.hallwayLengthInPixels, ceilingBottomY);

    context.fillStyle = colors.wallpaper;
    context.fillRect(0, ceilingBottomY, this.hallwayLengthInPixels, wallHeight);

    context.fillStyle = colors.wallpaperStripe;
    const firstVisibleStripeX = Math.floor(cameraOffsetX / wallpaperStripeSpacingInPixels) * wallpaperStripeSpacingInPixels;
    const lastVisibleStripeX = cameraOffsetX + logicalScreenWidth;
    for (let stripePositionX = firstVisibleStripeX; stripePositionX < lastVisibleStripeX; stripePositionX += wallpaperStripeSpacingInPixels) {
      context.fillRect(stripePositionX, ceilingBottomY, wallpaperStripeWidthInPixels, wallHeight);
    }

    context.fillStyle = colors.baseboard;
    context.fillRect(0, floorTopY - baseboardHeightInPixels, this.hallwayLengthInPixels, baseboardHeightInPixels);

    context.fillStyle = colors.floorCarpet;
    context.fillRect(0, floorTopY, this.hallwayLengthInPixels, logicalScreenHeight - floorTopY);
  }
}
