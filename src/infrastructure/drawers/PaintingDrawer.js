import { hallwayColorPalette as colors } from "../hallwayColorPalette.js";

const paintingWidth = 110;
const paintingHeight = 72;
const paintingCenterY = 205;
const pictureFrameThickness = 6;
const paintingSunRadius = 9;

export class PaintingDrawer {
  constructor(drawingContext) {
    this.drawingContext = drawingContext;
  }

  draw(painting) {
    const context = this.drawingContext;
    context.save();
    context.translate(painting.positionX, paintingCenterY);
    if (painting.isUpsideDown) {
      context.rotate(Math.PI);
    }

    context.fillStyle = colors.pictureFrame;
    context.fillRect(
      -paintingWidth / 2 - pictureFrameThickness,
      -paintingHeight / 2 - pictureFrameThickness,
      paintingWidth + pictureFrameThickness * 2,
      paintingHeight + pictureFrameThickness * 2,
    );
    context.fillStyle = colors.paintingSky;
    context.fillRect(-paintingWidth / 2, -paintingHeight / 2, paintingWidth, paintingHeight);

    if (painting.isSunVisible) {
      this.drawPaintingSun();
    }
    this.drawPaintingHill();

    context.restore();
  }

  drawPaintingSun() {
    const context = this.drawingContext;
    context.fillStyle = colors.paintingSun;
    context.beginPath();
    context.arc(paintingWidth / 2 - 22, -paintingHeight / 2 + 18, paintingSunRadius, 0, Math.PI * 2);
    context.fill();
  }

  drawPaintingHill() {
    const context = this.drawingContext;
    context.fillStyle = colors.paintingHill;
    context.beginPath();
    context.moveTo(-paintingWidth / 2, paintingHeight / 2);
    context.lineTo(-10, -4);
    context.lineTo(20, 14);
    context.lineTo(paintingWidth / 2, paintingHeight / 2);
    context.closePath();
    context.fill();
  }
}
