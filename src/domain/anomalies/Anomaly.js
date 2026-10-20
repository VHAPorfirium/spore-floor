/**
 * Contrato que toda anomalia deve seguir.
 * Para criar uma nova anomalia, estenda esta classe e implemente applyToHallwayLayout.
 */
export class Anomaly {
  constructor(anomalyIdentifier, anomalyDescription) {
    this.anomalyIdentifier = anomalyIdentifier;
    this.anomalyDescription = anomalyDescription;
  }

  applyToHallwayLayout(hallwayLayout) {
    throw new Error(`${this.anomalyIdentifier} must implement applyToHallwayLayout`);
  }
}
