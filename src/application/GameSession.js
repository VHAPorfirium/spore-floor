import { GamePhase } from "./GamePhase.js";
import { PlayerDecision } from "../domain/PlayerDecision.js";
import { Player } from "../domain/Player.js";
import { isPlayerDecisionCorrect, calculateNextFloorNumber, hasPlayerEscaped } from "../domain/LoopRules.js";

const distanceBetweenElevatorAndPlayerSpawnInPixels = 110;

export class GameSession {
  constructor(gameConfiguration, floorGenerator) {
    this.gameConfiguration = gameConfiguration;
    this.floorGenerator = floorGenerator;
    this.playerSpawnPositionX = gameConfiguration.elevatorPositionX + distanceBetweenElevatorAndPlayerSpawnInPixels;

    this.player = new Player(
      this.playerSpawnPositionX,
      gameConfiguration.elevatorPositionX - 40,
      gameConfiguration.stairwellDoorPositionX + 40,
    );

    this.startNewRun();
  }

  startNewRun() {
    this.currentFloorState = this.floorGenerator.generateFloor(this.gameConfiguration.startingFloorNumber);
    this.player.teleportTo(this.playerSpawnPositionX);
    this.currentGamePhase = GamePhase.exploringHallway;
    this.floorTransitionMessage = "";
    this.remainingFloorTransitionSeconds = 0;
    this.pendingNextFloorNumber = null;
  }

  update(playerInputState, elapsedSecondsSinceLastFrame) {
    if (this.currentGamePhase === GamePhase.exploringHallway) {
      this.updateHallwayExploration(playerInputState, elapsedSecondsSinceLastFrame);
      return;
    }

    if (this.currentGamePhase === GamePhase.changingFloor) {
      this.updateFloorTransition(elapsedSecondsSinceLastFrame);
      return;
    }

    if (this.currentGamePhase === GamePhase.escapedTheLoop && playerInputState.wasInteractKeyJustPressed) {
      this.startNewRun();
    }
  }

  updateHallwayExploration(playerInputState, elapsedSecondsSinceLastFrame) {
    this.player.walk(
      playerInputState.walkingDirection,
      this.gameConfiguration.playerWalkingSpeedInPixelsPerSecond,
      elapsedSecondsSinceLastFrame,
    );

    const availablePlayerDecision = this.findAvailablePlayerDecision();
    if (playerInputState.wasInteractKeyJustPressed && availablePlayerDecision !== null) {
      this.applyPlayerDecision(availablePlayerDecision);
    }
  }

  /** Retorna a decisão que o jogador pode tomar na posição atual, ou null se não estiver perto de nada. */
  findAvailablePlayerDecision() {
    const interactionDistanceInPixels = this.gameConfiguration.interactionDistanceInPixels;

    if (this.player.isNear(this.gameConfiguration.elevatorPositionX, interactionDistanceInPixels)) {
      return PlayerDecision.turnBackToElevator;
    }
    if (this.player.isNear(this.gameConfiguration.stairwellDoorPositionX, interactionDistanceInPixels)) {
      return PlayerDecision.proceedThroughStairwellDoor;
    }
    return null;
  }

  applyPlayerDecision(playerDecision) {
    const wasDecisionCorrect = isPlayerDecisionCorrect(this.currentFloorState, playerDecision);
    this.pendingNextFloorNumber = calculateNextFloorNumber(
      this.currentFloorState.floorNumber,
      wasDecisionCorrect,
      this.gameConfiguration.startingFloorNumber,
    );

    this.floorTransitionMessage = this.createFloorTransitionMessage(wasDecisionCorrect, this.pendingNextFloorNumber);
    this.remainingFloorTransitionSeconds = this.gameConfiguration.floorTransitionDurationInSeconds;
    this.currentGamePhase = GamePhase.changingFloor;
  }

  createFloorTransitionMessage(wasDecisionCorrect, nextFloorNumber) {
    if (hasPlayerEscaped(nextFloorNumber)) {
      return "The doors open to cold night air.";
    }
    if (!wasDecisionCorrect) {
      return `Something followed you. Floor ${nextFloorNumber}.`;
    }
    return `Floor ${nextFloorNumber}`;
  }

  updateFloorTransition(elapsedSecondsSinceLastFrame) {
    this.remainingFloorTransitionSeconds -= elapsedSecondsSinceLastFrame;
    if (this.remainingFloorTransitionSeconds > 0) {
      return;
    }

    if (hasPlayerEscaped(this.pendingNextFloorNumber)) {
      this.currentGamePhase = GamePhase.escapedTheLoop;
      return;
    }

    this.currentFloorState = this.floorGenerator.generateFloor(this.pendingNextFloorNumber);
    this.player.teleportTo(this.playerSpawnPositionX);
    this.currentGamePhase = GamePhase.exploringHallway;
  }

  /** Progresso de 0 a 1 da transição de andar, usado pelo renderizador para o fade. */
  get floorTransitionProgress() {
    const totalSeconds = this.gameConfiguration.floorTransitionDurationInSeconds;
    return 1 - this.remainingFloorTransitionSeconds / totalSeconds;
  }
}
