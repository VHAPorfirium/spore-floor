import { GamePhase } from "./GamePhase.js";
import { Player } from "../domain/Player.js";
import { PlayerDecision } from "../domain/PlayerDecision.js";
import { isPlayerDecisionCorrect, calculateNextFloorNumber, hasPlayerEscaped } from "../domain/LoopRules.js";

const distanceBetweenElevatorAndPlayerSpawnInPixels = 110;
/** Tempo mínimo na tela final, para o jogador não pular o resultado apertando E sem parar. */
const minimumSecondsOnEscapeScreen = 1.5;

/** Orquestra uma partida: tela de título, corredor, notas, troca de andar e fuga. */
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

    this.prepareFreshRun();
    this.currentGamePhase = GamePhase.showingTitleScreen;
  }

  startNewRun() {
    this.prepareFreshRun();
    this.currentGamePhase = GamePhase.exploringHallway;
  }

  prepareFreshRun() {
    this.currentFloorState = this.floorGenerator.generateFloor(this.gameConfiguration.startingFloorNumber);
    this.player.teleportTo(this.playerSpawnPositionX);
    this.floorTransitionMessage = "";
    this.remainingFloorTransitionSeconds = 0;
    this.pendingNextFloorNumber = null;
    this.lastPlayerDecision = null;
    this.wasLastDecisionCorrect = null;
    this.elapsedRunTimeInSeconds = 0;
    this.numberOfTimesSentBackToStartingFloor = 0;
    this.secondsSpentOnEscapeScreen = 0;
  }

  update(playerInputState, elapsedSecondsSinceLastFrame) {
    switch (this.currentGamePhase) {
      case GamePhase.showingTitleScreen:
        this.updateTitleScreen(playerInputState);
        return;
      case GamePhase.exploringHallway:
        this.elapsedRunTimeInSeconds += elapsedSecondsSinceLastFrame;
        this.updateHallwayExploration(playerInputState, elapsedSecondsSinceLastFrame);
        return;
      case GamePhase.readingMaintenanceNote:
        this.elapsedRunTimeInSeconds += elapsedSecondsSinceLastFrame;
        this.updateMaintenanceNoteReading(playerInputState);
        return;
      case GamePhase.changingFloor:
        this.elapsedRunTimeInSeconds += elapsedSecondsSinceLastFrame;
        this.updateFloorTransition(elapsedSecondsSinceLastFrame);
        return;
      case GamePhase.escapedTheLoop:
        this.secondsSpentOnEscapeScreen += elapsedSecondsSinceLastFrame;
        this.updateEscapeScreen(playerInputState);
        return;
    }
  }

  updateTitleScreen(playerInputState) {
    if (playerInputState.wasInteractKeyJustPressed) {
      this.startNewRun();
    }
  }

  updateHallwayExploration(playerInputState, elapsedSecondsSinceLastFrame) {
    this.player.walk(
      playerInputState.walkingDirection,
      this.gameConfiguration.playerWalkingSpeedInPixelsPerSecond,
      elapsedSecondsSinceLastFrame,
    );

    if (!playerInputState.wasInteractKeyJustPressed) {
      return;
    }

    const availablePlayerDecision = this.findAvailablePlayerDecision();
    if (availablePlayerDecision !== null) {
      this.applyPlayerDecision(availablePlayerDecision);
      return;
    }

    if (this.isPlayerNearMaintenanceNote()) {
      this.player.stopWalking();
      this.currentGamePhase = GamePhase.readingMaintenanceNote;
    }
  }

  updateMaintenanceNoteReading(playerInputState) {
    if (playerInputState.wasInteractKeyJustPressed) {
      this.currentGamePhase = GamePhase.exploringHallway;
    }
  }

  updateEscapeScreen(playerInputState) {
    const canLeaveEscapeScreen = this.secondsSpentOnEscapeScreen >= minimumSecondsOnEscapeScreen;
    if (canLeaveEscapeScreen && playerInputState.wasInteractKeyJustPressed) {
      this.currentGamePhase = GamePhase.showingTitleScreen;
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

  isPlayerNearMaintenanceNote() {
    const maintenanceNote = this.currentFloorState.hallwayLayout.maintenanceNote;
    if (maintenanceNote === null) {
      return false;
    }
    return this.player.isNear(maintenanceNote.positionX, this.gameConfiguration.interactionDistanceInPixels);
  }

  applyPlayerDecision(playerDecision) {
    const wasDecisionCorrect = isPlayerDecisionCorrect(this.currentFloorState, playerDecision);
    this.lastPlayerDecision = playerDecision;
    this.wasLastDecisionCorrect = wasDecisionCorrect;
    if (!wasDecisionCorrect) {
      this.numberOfTimesSentBackToStartingFloor += 1;
    }

    this.pendingNextFloorNumber = calculateNextFloorNumber(
      this.currentFloorState.floorNumber,
      wasDecisionCorrect,
      this.gameConfiguration.startingFloorNumber,
    );

    this.player.stopWalking();
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
      this.secondsSpentOnEscapeScreen = 0;
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
