import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DecisionLog,
  summarizeDecisionsByAnomaly,
  classifyAnomalyDifficulty,
  AnomalyDifficultyVerdict,
  anomalyIdentifierForNormalFloors,
} from "../src/application/DecisionLog.js";
import { GameConfiguration } from "../src/domain/GameConfiguration.js";
import { FloorGenerator } from "../src/domain/FloorGenerator.js";
import { GameSession } from "../src/application/GameSession.js";
import { PlayerDecision } from "../src/domain/PlayerDecision.js";
import { createAnomalyCatalog } from "../src/domain/anomalies/anomalyCatalog.js";

function createDecisionRecord(anomalyIdentifier, wasDecisionCorrect, secondsSpentOnFloor) {
  return { floorNumber: 5, anomalyIdentifier, playerDecision: PlayerDecision.turnBackToElevator, wasDecisionCorrect, secondsSpentOnFloor };
}

test("the summary groups decisions by anomaly and calculates hit rate and average time", () => {
  const summaryRows = summarizeDecisionsByAnomaly([
    createDecisionRecord("painting-sun-missing", true, 10),
    createDecisionRecord("painting-sun-missing", false, 20),
    createDecisionRecord(null, true, 6),
  ]);
  const paintingRow = summaryRows.find((row) => row.anomalyIdentifier === "painting-sun-missing");
  assert.equal(paintingRow.timesSeen, 2);
  assert.equal(paintingRow.timesAnsweredCorrectly, 1);
  assert.equal(paintingRow.hitRatePercentage, 50);
  assert.equal(paintingRow.averageSecondsOnFloor, 15);
  assert.ok(summaryRows.some((row) => row.anomalyIdentifier === anomalyIdentifierForNormalFloors));
});

test("the summary lists the hardest anomalies first", () => {
  const summaryRows = summarizeDecisionsByAnomaly([
    createDecisionRecord("easy-anomaly", true, 5),
    createDecisionRecord("hard-anomaly", false, 30),
  ]);
  assert.equal(summaryRows[0].anomalyIdentifier, "hard-anomaly");
});

test("an empty log produces an empty summary", () => {
  assert.deepEqual(summarizeDecisionsByAnomaly([]), []);
});

test("the difficulty rule follows the playtest thresholds", () => {
  assert.equal(classifyAnomalyDifficulty(2, 0, 30), AnomalyDifficultyVerdict.notEnoughData);
  assert.equal(classifyAnomalyDifficulty(5, 20, 30), AnomalyDifficultyVerdict.tooHard);
  assert.equal(classifyAnomalyDifficulty(5, 100, 4), AnomalyDifficultyVerdict.tooEasy);
  assert.equal(classifyAnomalyDifficulty(5, 100, 20), AnomalyDifficultyVerdict.balanced);
  assert.equal(classifyAnomalyDifficulty(5, 60, 12), AnomalyDifficultyVerdict.balanced);
});

test("the decision log rounds the time to one decimal", () => {
  const decisionLog = new DecisionLog();
  decisionLog.recordDecision(createDecisionRecord(null, true, 12.3456));
  assert.equal(decisionLog.decisionRecords[0].secondsSpentOnFloor, 12.3);
});

test("the game session records every decision with the time spent on that floor", () => {
  const floorGenerator = new FloorGenerator(createAnomalyCatalog(), 1, GameConfiguration.startingFloorNumber, () => 0);
  const gameSession = new GameSession(GameConfiguration, floorGenerator);
  const pressInteract = { walkingDirection: 0, wasInteractKeyJustPressed: true };
  const noInput = { walkingDirection: 0, wasInteractKeyJustPressed: false };

  gameSession.update(pressInteract, 0.016);
  gameSession.update(noInput, 4);
  gameSession.player.teleportTo(GameConfiguration.stairwellDoorPositionX);
  gameSession.update(pressInteract, 0.016);
  gameSession.update(noInput, GameConfiguration.floorTransitionDurationInSeconds + 0.1);

  gameSession.update(noInput, 7);
  gameSession.player.teleportTo(GameConfiguration.elevatorPositionX);
  gameSession.update(pressInteract, 0.016);

  const [firstDecision, secondDecision] = gameSession.decisionLog.decisionRecords;
  assert.equal(firstDecision.floorNumber, 10);
  assert.equal(firstDecision.anomalyIdentifier, null);
  assert.equal(firstDecision.wasDecisionCorrect, true);
  assert.equal(firstDecision.secondsSpentOnFloor, 4);

  assert.equal(secondDecision.floorNumber, 9);
  assert.equal(typeof secondDecision.anomalyIdentifier, "string");
  assert.equal(secondDecision.playerDecision, PlayerDecision.turnBackToElevator);
  assert.equal(secondDecision.wasDecisionCorrect, true);
  assert.equal(secondDecision.secondsSpentOnFloor, 7);
});

test("the decision log survives starting a new run", () => {
  const gameSession = new GameSession(GameConfiguration, new FloorGenerator([], 0, 10, () => 0.99));
  gameSession.update({ walkingDirection: 0, wasInteractKeyJustPressed: true }, 0.016);
  gameSession.player.teleportTo(GameConfiguration.stairwellDoorPositionX);
  gameSession.update({ walkingDirection: 0, wasInteractKeyJustPressed: true }, 0.016);
  gameSession.startNewRun();
  assert.equal(gameSession.decisionLog.decisionRecords.length, 1);
});
