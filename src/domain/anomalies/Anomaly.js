/**
 * Contrato que toda anomalia deve seguir.
 * Para criar uma nova anomalia, estenda esta classe e implemente applyToHallwayLayout.
 *
 * focusPositionX: posição X do corredor onde a anomalia aparece.
 * Usada pelo anomaly-preview.html para centralizar a câmera nela.
 */
export class Anomaly {
  constructor(anomalyIdentifier, anomalyDescription, focusPositionX) {
    this.anomalyIdentifier = anomalyIdentifier;
    this.anomalyDescription = anomalyDescription;
    this.focusPositionX = focusPositionX;
  }

  applyToHallwayLayout(hallwayLayout) {
    throw new Error(`${this.anomalyIdentifier} must implement applyToHallwayLayout`);
  }
}
