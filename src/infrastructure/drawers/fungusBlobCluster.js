import { hallwayColorPalette as colors } from "../hallwayColorPalette.js";

/** Offsets fixos para o fungo não "tremer" a cada frame. */
const fungusBlobOffsets = [
  { offsetX: 0, offsetY: 0, radiusScale: 1 },
  { offsetX: -0.7, offsetY: 0.4, radiusScale: 0.55 },
  { offsetX: 0.8, offsetY: -0.3, radiusScale: 0.6 },
  { offsetX: 0.3, offsetY: 0.9, radiusScale: 0.45 },
  { offsetX: -0.4, offsetY: -0.8, radiusScale: 0.4 },
  { offsetX: 1.2, offsetY: 0.6, radiusScale: 0.3 },
];

/** Desenha um aglomerado de manchas de fungo. Compartilhado por mofo na parede, porta e figura infectada. */
export function drawFungusBlobCluster(drawingContext, centerX, centerY, radiusInPixels, opacity) {
  drawingContext.globalAlpha = opacity;
  fungusBlobOffsets.forEach((blobOffset, blobIndex) => {
    drawingContext.fillStyle = blobIndex % 2 === 0 ? colors.sporeMoldDark : colors.sporeMoldLight;
    drawingContext.beginPath();
    drawingContext.arc(
      centerX + blobOffset.offsetX * radiusInPixels,
      centerY + blobOffset.offsetY * radiusInPixels,
      radiusInPixels * blobOffset.radiusScale,
      0,
      Math.PI * 2,
    );
    drawingContext.fill();
  });
  drawingContext.globalAlpha = 1;
}
