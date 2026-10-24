/**
 * Registro de cada decisão do jogador (para playtest e ajuste de dificuldade).
 * Guarda todas as partidas desde que a página abriu.
 */
export class DecisionLog {
  constructor() {
    this.decisionRecords = [];
  }

  recordDecision({ floorNumber, anomalyIdentifier, playerDecision, wasDecisionCorrect, secondsSpentOnFloor }) {
    this.decisionRecords.push({
      floorNumber,
      anomalyIdentifier,
      playerDecision,
      wasDecisionCorrect,
      secondsSpentOnFloor: Math.round(secondsSpentOnFloor * 10) / 10,
    });
  }
}

export const anomalyIdentifierForNormalFloors = "no-anomaly";

const minimumTimesSeenToJudgeDifficulty = 3;
const hitRatePercentageBelowWhichAnomalyIsTooHard = 30;
const hitRatePercentageAboveWhichAnomalyMayBeTooEasy = 90;
const averageSecondsBelowWhichAnomalyIsSpottedTooFast = 8;

export const AnomalyDifficultyVerdict = Object.freeze({
  notEnoughData: "NOT_ENOUGH_DATA",
  tooHard: "TOO_HARD",
  tooEasy: "TOO_EASY",
  balanced: "BALANCED",
});

/** Regra de ajuste combinada para o playtest: abaixo de 30% de acerto é difícil demais; acima de 90% e rápido, fácil demais. */
export function classifyAnomalyDifficulty(timesSeen, hitRatePercentage, averageSecondsOnFloor) {
  if (timesSeen < minimumTimesSeenToJudgeDifficulty) {
    return AnomalyDifficultyVerdict.notEnoughData;
  }
  if (hitRatePercentage < hitRatePercentageBelowWhichAnomalyIsTooHard) {
    return AnomalyDifficultyVerdict.tooHard;
  }
  const isSpottedTooFast = averageSecondsOnFloor < averageSecondsBelowWhichAnomalyIsSpottedTooFast;
  if (hitRatePercentage > hitRatePercentageAboveWhichAnomalyMayBeTooEasy && isSpottedTooFast) {
    return AnomalyDifficultyVerdict.tooEasy;
  }
  return AnomalyDifficultyVerdict.balanced;
}

/** Agrupa as decisões por anomalia: quantas vezes apareceu, taxa de acerto e tempo médio no andar. */
export function summarizeDecisionsByAnomaly(decisionRecords) {
  const decisionRecordsByAnomaly = new Map();
  decisionRecords.forEach((decisionRecord) => {
    const anomalyIdentifier = decisionRecord.anomalyIdentifier ?? anomalyIdentifierForNormalFloors;
    const recordsOfThisAnomaly = decisionRecordsByAnomaly.get(anomalyIdentifier) ?? [];
    recordsOfThisAnomaly.push(decisionRecord);
    decisionRecordsByAnomaly.set(anomalyIdentifier, recordsOfThisAnomaly);
  });

  const summaryRows = [...decisionRecordsByAnomaly.entries()].map(([anomalyIdentifier, recordsOfThisAnomaly]) => {
    const timesSeen = recordsOfThisAnomaly.length;
    const timesAnsweredCorrectly = recordsOfThisAnomaly.filter((decisionRecord) => decisionRecord.wasDecisionCorrect).length;
    const hitRatePercentage = Math.round((timesAnsweredCorrectly / timesSeen) * 100);
    const totalSecondsOnFloor = recordsOfThisAnomaly.reduce((secondsSum, decisionRecord) => secondsSum + decisionRecord.secondsSpentOnFloor, 0);
    const averageSecondsOnFloor = Math.round((totalSecondsOnFloor / timesSeen) * 10) / 10;

    return {
      anomalyIdentifier,
      timesSeen,
      timesAnsweredCorrectly,
      hitRatePercentage,
      averageSecondsOnFloor,
      difficultyVerdict: classifyAnomalyDifficulty(timesSeen, hitRatePercentage, averageSecondsOnFloor),
    };
  });

  return summaryRows.sort((firstRow, secondRow) => firstRow.hitRatePercentage - secondRow.hitRatePercentage);
}
