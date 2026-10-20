import { PlayerDecision } from "./PlayerDecision.js";

export function isPlayerDecisionCorrect(floorState, playerDecision) {
  if (floorState.hasAnomaly) {
    return playerDecision === PlayerDecision.turnBackToElevator;
  }
  return playerDecision === PlayerDecision.proceedThroughStairwellDoor;
}

export function calculateNextFloorNumber(currentFloorNumber, wasDecisionCorrect, startingFloorNumber) {
  if (!wasDecisionCorrect) {
    return startingFloorNumber;
  }
  return currentFloorNumber - 1;
}

export function hasPlayerEscaped(floorNumber) {
  return floorNumber <= 0;
}
