import { test } from "node:test";
import assert from "node:assert/strict";
import { FloorState } from "../src/domain/FloorState.js";
import { PlayerDecision } from "../src/domain/PlayerDecision.js";
import { isPlayerDecisionCorrect, calculateNextFloorNumber, hasPlayerEscaped } from "../src/domain/LoopRules.js";
import { createNormalHallwayLayout } from "../src/domain/HallwayLayout.js";
import { UpsideDownPaintingAnomaly } from "../src/domain/anomalies/UpsideDownPaintingAnomaly.js";

const normalFloor = new FloorState(9, createNormalHallwayLayout(9), null);
const floorWithAnomaly = new FloorState(9, createNormalHallwayLayout(9), new UpsideDownPaintingAnomaly());

test("on a normal floor, going through the door is correct", () => {
  assert.equal(isPlayerDecisionCorrect(normalFloor, PlayerDecision.proceedThroughStairwellDoor), true);
  assert.equal(isPlayerDecisionCorrect(normalFloor, PlayerDecision.turnBackToElevator), false);
});

test("on a floor with an anomaly, turning back is correct", () => {
  assert.equal(isPlayerDecisionCorrect(floorWithAnomaly, PlayerDecision.turnBackToElevator), true);
  assert.equal(isPlayerDecisionCorrect(floorWithAnomaly, PlayerDecision.proceedThroughStairwellDoor), false);
});

test("a correct decision goes one floor down and a wrong one resets", () => {
  assert.equal(calculateNextFloorNumber(7, true, 10), 6);
  assert.equal(calculateNextFloorNumber(7, false, 10), 10);
});

test("the player escapes when reaching floor zero", () => {
  assert.equal(hasPlayerEscaped(0), true);
  assert.equal(hasPlayerEscaped(1), false);
});
