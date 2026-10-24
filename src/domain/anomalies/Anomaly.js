/**
 * Contrato que toda anomalia deve seguir.
 * Para criar uma nova anomalia, estenda esta classe e implemente applyToHallwayLayout.
 *
 * focusPositionX: posição X do corredor onde a anomalia aparece.
 * Usada pelo anomaly-preview.html para centralizar a câmera nela.
 *
 * requiresSoundToNotice: true para anomalias que só dá para perceber ouvindo.
 * Elas não são sorteadas enquanto o jogador está sem som.
 */
export class Anomaly {
  constructor(anomalyIdentifier, anomalyDescription, focusPositionX, requiresSoundToNotice = false) {
    this.anomalyIdentifier = anomalyIdentifier;
    this.anomalyDescription = anomalyDescription;
    this.focusPositionX = focusPositionX;
    this.requiresSoundToNotice = requiresSoundToNotice;
  }

  applyToHallwayLayout(hallwayLayout) {
    throw new Error(`${this.anomalyIdentifier} must implement applyToHallwayLayout`);
  }
}
