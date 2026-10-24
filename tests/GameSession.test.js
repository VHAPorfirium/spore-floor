import { test } from "node:test";
import assert from "node:assert/strict";
import { GameConfiguration } from "../src/domain/GameConfiguration.js";
import { FloorGenerator } from "../src/domain/FloorGenerator.js";
import { GameSession } from "../src/application/GameSession.js";
import { GamePhase } from "../src/application/GamePhase.js";
import { createAnomalyCatalog } from "../src/domain/anomalies/anomalyCatalog.js";

const noInput = { walkingDirection: 0, wasInteractKeyJustPressed: false };
const pressInteract = { walkingDirection: 0, wasInteractKeyJustPressed: true };
const oneFrameInSeconds = 0.016;

function createSessionInsideHallway(floorGenerator) {
  const gameSession = new GameSession(GameConfiguration, floorGenerator);
  gameSession.update(pressInteract, oneFrameInSeconds);
  return gameSession;
}

function createFloorGeneratorWithOnlyNormalFloors() {
  return new FloorGenerator([], 0, GameConfiguration.startingFloorNumber, () => 0.99);
}

function createFloorGeneratorWithAnomalyOnEveryFloor() {
  return new FloorGenerator(createAnomalyCatalog(), 1, GameConfiguration.startingFloorNumber, () => 0);
}

function goThroughStairwellDoor(gameSession) {
  gameSession.player.teleportTo(GameConfiguration.stairwellDoorPositionX);
  gameSession.update(pressInteract, oneFrameInSeconds);
}

function finishFloorTransition(gameSession) {
  gameSession.update(noInput, GameConfiguration.floorTransitionDurationInSeconds + 0.1);
}

test("the game starts on the title screen and the interact key enters the hallway", () => {
  const gameSession = new GameSession(GameConfiguration, createFloorGeneratorWithOnlyNormalFloors());
  assert.equal(gameSession.currentGamePhase, GamePhase.showingTitleScreen);

  gameSession.update(pressInteract, oneFrameInSeconds);
  assert.equal(gameSession.currentGamePhase, GamePhase.exploringHallway);
  assert.equal(gameSession.currentFloorState.floorNumber, GameConfiguration.startingFloorNumber);
});

test("going through the door on a normal floor goes down one floor", () => {
  const gameSession = createSessionInsideHallway(createFloorGeneratorWithOnlyNormalFloors());
  goThroughStairwellDoor(gameSession);
  assert.equal(gameSession.currentGamePhase, GamePhase.changingFloor);

  finishFloorTransition(gameSession);
  assert.equal(gameSession.currentFloorState.floorNumber, 9);
});

test("ten correct decisions in a row escape the loop", () => {
  const gameSession = createSessionInsideHallway(createFloorGeneratorWithOnlyNormalFloors());
  for (let decisionNumber = 0; decisionNumber < 10; decisionNumber++) {
    goThroughStairwellDoor(gameSession);
    finishFloorTransition(gameSession);
  }
  assert.equal(gameSession.currentGamePhase, GamePhase.escapedTheLoop);
  assert.equal(gameSession.numberOfTimesSentBackToStartingFloor, 0);
});

test("a wrong decision is counted and sends the player back to the starting floor", () => {
  const gameSession = createSessionInsideHallway(createFloorGeneratorWithAnomalyOnEveryFloor());
  goThroughStairwellDoor(gameSession);
  finishFloorTransition(gameSession);
  assert.equal(gameSession.currentFloorState.floorNumber, 9);

  goThroughStairwellDoor(gameSession);
  assert.equal(gameSession.wasLastDecisionCorrect, false);
  finishFloorTransition(gameSession);
  assert.equal(gameSession.currentFloorState.floorNumber, GameConfiguration.startingFloorNumber);
  assert.equal(gameSession.numberOfTimesSentBackToStartingFloor, 1);
});

test("the maintenance note opens and closes with the interact key", () => {
  const gameSession = createSessionInsideHallway(createFloorGeneratorWithOnlyNormalFloors());
  gameSession.player.teleportTo(GameConfiguration.maintenanceNotePositionX);

  gameSession.update(pressInteract, oneFrameInSeconds);
  assert.equal(gameSession.currentGamePhase, GamePhase.readingMaintenanceNote);

  gameSession.update({ walkingDirection: 1, wasInteractKeyJustPressed: false }, oneFrameInSeconds);
  assert.equal(gameSession.player.positionX, GameConfiguration.maintenanceNotePositionX, "player must not walk while reading");

  gameSession.update(pressInteract, oneFrameInSeconds);
  assert.equal(gameSession.currentGamePhase, GamePhase.exploringHallway);
});

test("the run timer only counts while playing", () => {
  const gameSession = new GameSession(GameConfiguration, createFloorGeneratorWithOnlyNormalFloors());
  gameSession.update(noInput, 5);
  assert.equal(gameSession.elapsedRunTimeInSeconds, 0);

  gameSession.update(pressInteract, oneFrameInSeconds);
  gameSession.update(noInput, 2);
  assert.equal(gameSession.elapsedRunTimeInSeconds, 2);
});

test("after escaping, the interact key returns to the title screen", () => {
  const gameSession = createSessionInsideHallway(createFloorGeneratorWithOnlyNormalFloors());
  for (let decisionNumber = 0; decisionNumber < 10; decisionNumber++) {
    goThroughStairwellDoor(gameSession);
    finishFloorTransition(gameSession);
  }
  gameSession.update(pressInteract, oneFrameInSeconds);
  assert.equal(gameSession.currentGamePhase, GamePhase.showingTitleScreen);
});
