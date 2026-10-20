import { test } from "node:test";
import assert from "node:assert/strict";
import { GameConfiguration } from "../src/domain/GameConfiguration.js";
import { FloorGenerator } from "../src/domain/FloorGenerator.js";
import { GameSession } from "../src/application/GameSession.js";
import { GamePhase } from "../src/application/GamePhase.js";

const noInput = { walkingDirection: 0, wasInteractKeyJustPressed: false };
const pressInteract = { walkingDirection: 0, wasInteractKeyJustPressed: true };

function createSessionWithOnlyNormalFloors() {
  const floorGenerator = new FloorGenerator([], 0, GameConfiguration.startingFloorNumber, () => 0.99);
  return new GameSession(GameConfiguration, floorGenerator);
}

function walkPlayerToStairwellDoor(gameSession) {
  gameSession.player.teleportTo(GameConfiguration.stairwellDoorPositionX);
}

function finishFloorTransition(gameSession) {
  gameSession.update(noInput, GameConfiguration.floorTransitionDurationInSeconds + 0.1);
}

test("going through the door on a normal floor goes down one floor", () => {
  const gameSession = createSessionWithOnlyNormalFloors();
  walkPlayerToStairwellDoor(gameSession);
  gameSession.update(pressInteract, 0.016);
  assert.equal(gameSession.currentGamePhase, GamePhase.changingFloor);

  finishFloorTransition(gameSession);
  assert.equal(gameSession.currentFloorState.floorNumber, 9);
});

test("ten correct decisions in a row escape the loop", () => {
  const gameSession = createSessionWithOnlyNormalFloors();
  for (let decisionNumber = 0; decisionNumber < 10; decisionNumber++) {
    walkPlayerToStairwellDoor(gameSession);
    gameSession.update(pressInteract, 0.016);
    finishFloorTransition(gameSession);
  }
  assert.equal(gameSession.currentGamePhase, GamePhase.escapedTheLoop);
});
