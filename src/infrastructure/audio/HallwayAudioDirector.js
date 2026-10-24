import { ProceduralSoundEffects } from "./ProceduralSoundEffects.js";
import { calculateCeilingLampBrightness } from "../ceilingLampBrightness.js";
import { GamePhase } from "../../application/GamePhase.js";
import { PlayerDecision } from "../../domain/PlayerDecision.js";
import { ElevatorChimeTone } from "../../domain/ElevatorChimeTone.js";

const masterVolume = 0.8;
const playerFootstepVolume = 0.2;
const followerFootstepVolume = 0.14;
const followerFootstepDelayInSeconds = 0.21;
const followerExtraStepAfterPlayerStopsInSeconds = 0.38;
const followerStereoPanBehindPlayer = 0.55;
const lampHumMaximumVolume = 0.02;
const droneVolumeOnTitleScreen = 0.05;
const droneVolumeOnCleanFloor = 0.03;
const extraDroneVolumeAtFullInfection = 0.13;

const phasesInsideTheHallway = new Set([GamePhase.exploringHallway, GamePhase.readingMaintenanceNote]);

/**
 * Observa a GameSession a cada frame e toca os sons quando algo muda
 * (chegou num andar, tomou uma decisão, deu um passo...).
 * A GameSession não sabe que o áudio existe.
 */
export class HallwayAudioDirector {
  constructor(gameConfiguration) {
    this.gameConfiguration = gameConfiguration;
    this.audioContext = null;
    this.isMuted = false;

    this.previousGamePhase = null;
    this.previousFloorState = null;
    this.previousNumberOfStepsTaken = 0;
    this.wasPlayerWalkingLastFrame = false;
  }

  /** O navegador só libera o áudio depois de uma tecla ou clique do jogador. */
  unlockAudio() {
    if (this.audioContext === null) {
      this.createAudioGraph();
    }
    if (this.audioContext !== null && this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }
  }

  createAudioGraph() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }
    this.audioContext = new AudioContextClass();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = this.isMuted ? 0 : masterVolume;
    this.masterGain.connect(this.audioContext.destination);

    this.soundEffects = new ProceduralSoundEffects(this.audioContext, this.masterGain);
    this.fluorescentLampHum = this.soundEffects.createFluorescentLampHum();
    this.infectionDrone = this.soundEffects.createInfectionDrone();
  }

  /** Sem isto, o zumbido e o ruído continuam tocando com a aba escondida (o loop do jogo para, o áudio não). */
  pauseWhilePageIsHidden(isPageHidden) {
    if (this.audioContext === null) {
      return;
    }
    if (isPageHidden) {
      this.audioContext.suspend();
      return;
    }
    this.audioContext.resume();
  }

  isAudioReady() {
    return this.audioContext !== null && this.audioContext.state === "running";
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.audioContext !== null) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : masterVolume, this.audioContext.currentTime, 0.05);
    }
  }

  update(gameSession, elapsedTimeInSeconds) {
    const canPlaySound = this.isAudioReady();

    this.reactToGamePhaseChange(gameSession, canPlaySound);
    this.reactToFloorArrival(gameSession, canPlaySound);
    this.reactToFootsteps(gameSession, canPlaySound);

    if (canPlaySound) {
      this.updateSustainedSounds(gameSession, elapsedTimeInSeconds);
    }
  }

  reactToGamePhaseChange(gameSession, canPlaySound) {
    const currentGamePhase = gameSession.currentGamePhase;
    const hasPhaseChanged = currentGamePhase !== this.previousGamePhase;
    this.previousGamePhase = currentGamePhase;
    if (!hasPhaseChanged || !canPlaySound) {
      return;
    }

    if (currentGamePhase === GamePhase.changingFloor) {
      this.playPlayerDecisionSounds(gameSession);
    }
    if (currentGamePhase === GamePhase.escapedTheLoop) {
      this.soundEffects.playEscapeWind();
    }
  }

  playPlayerDecisionSounds(gameSession) {
    if (gameSession.lastPlayerDecision === PlayerDecision.turnBackToElevator) {
      this.soundEffects.playElevatorDeparture();
    } else {
      this.soundEffects.playStairwellDoor();
    }
    if (gameSession.wasLastDecisionCorrect === false) {
      this.soundEffects.playWrongDecisionSting();
    }
  }

  reactToFloorArrival(gameSession, canPlaySound) {
    const isExploring = gameSession.currentGamePhase === GamePhase.exploringHallway;
    const hasArrivedOnNewFloor = isExploring && gameSession.currentFloorState !== this.previousFloorState;
    if (!hasArrivedOnNewFloor) {
      return;
    }
    this.previousFloorState = gameSession.currentFloorState;
    if (canPlaySound) {
      const isChimeOutOfTune = gameSession.currentFloorState.hallwayLayout.elevatorChimeTone === ElevatorChimeTone.outOfTune;
      this.soundEffects.playElevatorChime(isChimeOutOfTune);
    }
  }

  reactToFootsteps(gameSession, canPlaySound) {
    const player = gameSession.player;
    const isExploring = gameSession.currentGamePhase === GamePhase.exploringHallway;
    const isPlayerWalking = isExploring && player.isWalking;
    const numberOfStepsTaken = player.countStepsTaken(this.gameConfiguration.playerStepDurationInSeconds);
    const hasTakenNewStep = numberOfStepsTaken !== this.previousNumberOfStepsTaken;
    const hasJustStoppedWalking = this.wasPlayerWalkingLastFrame && !isPlayerWalking;

    this.previousNumberOfStepsTaken = numberOfStepsTaken;
    this.wasPlayerWalkingLastFrame = isPlayerWalking;
    if (!canPlaySound) {
      return;
    }

    const isSomethingFollowingPlayer = isExploring && gameSession.currentFloorState.hallwayLayout.isSomethingFollowingPlayer;
    const stereoPanBehindPlayer = player.isFacingRight ? -followerStereoPanBehindPlayer : followerStereoPanBehindPlayer;

    if (isPlayerWalking && hasTakenNewStep) {
      this.soundEffects.playFootstep({ volume: playerFootstepVolume });
      if (isSomethingFollowingPlayer) {
        this.soundEffects.playFootstep({ volume: followerFootstepVolume, stereoPan: stereoPanBehindPlayer, startDelayInSeconds: followerFootstepDelayInSeconds });
      }
    }

    // O que segue o jogador dá um passo a mais depois que ele para.
    if (hasJustStoppedWalking && isSomethingFollowingPlayer) {
      this.soundEffects.playFootstep({ volume: followerFootstepVolume, stereoPan: stereoPanBehindPlayer, startDelayInSeconds: followerExtraStepAfterPlayerStopsInSeconds });
    }
  }

  updateSustainedSounds(gameSession, elapsedTimeInSeconds) {
    const currentGamePhase = gameSession.currentGamePhase;
    const isInsideTheHallway = phasesInsideTheHallway.has(currentGamePhase);
    const hallwayLayout = gameSession.currentFloorState.hallwayLayout;

    const nearestLampBrightness = isInsideTheHallway
      ? this.calculateBrightnessOfLampNearestToPlayer(hallwayLayout.ceilingLamps, gameSession.player.positionX, elapsedTimeInSeconds)
      : 0;
    this.fluorescentLampHum.setVolume(nearestLampBrightness * lampHumMaximumVolume);

    this.infectionDrone.setVolume(this.calculateDroneVolume(currentGamePhase, hallwayLayout.infectionLevel));
  }

  calculateBrightnessOfLampNearestToPlayer(ceilingLamps, playerPositionX, elapsedTimeInSeconds) {
    const lampNearestToPlayer = ceilingLamps.reduce((nearestLamp, ceilingLamp) =>
      Math.abs(ceilingLamp.positionX - playerPositionX) < Math.abs(nearestLamp.positionX - playerPositionX) ? ceilingLamp : nearestLamp,
    );
    return calculateCeilingLampBrightness(lampNearestToPlayer, elapsedTimeInSeconds);
  }

  calculateDroneVolume(currentGamePhase, infectionLevel) {
    if (currentGamePhase === GamePhase.showingTitleScreen) {
      return droneVolumeOnTitleScreen;
    }
    if (currentGamePhase === GamePhase.escapedTheLoop) {
      return 0;
    }
    return droneVolumeOnCleanFloor + infectionLevel * extraDroneVolumeAtFullInfection;
  }
}
