/**
 * Quanto o corredor está tomado pelos esporos: 0 no andar inicial, 1 no último andar antes da saída.
 * É sempre o mesmo valor para o mesmo andar, para o jogador aprender o "normal" de cada andar
 * e não confundir a doença do prédio com uma anomalia.
 */
export function calculateFloorInfectionLevel(floorNumber, startingFloorNumber) {
  const floorsDescended = startingFloorNumber - floorNumber;
  const totalFloorsToDescend = startingFloorNumber - 1;
  const infectionLevel = floorsDescended / totalFloorsToDescend;
  return Math.min(1, Math.max(0, infectionLevel));
}
