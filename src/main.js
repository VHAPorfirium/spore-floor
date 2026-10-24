import { GameConfiguration } from "./domain/GameConfiguration.js";
import { FloorGenerator } from "./domain/FloorGenerator.js";
import { createAnomalyCatalog } from "./domain/anomalies/anomalyCatalog.js";
import { GameSession } from "./application/GameSession.js";
import { GamePhase } from "./application/GamePhase.js";
import { KeyboardInputReader } from "./infrastructure/KeyboardInputReader.js";
import { CanvasHallwayRenderer } from "./infrastructure/CanvasHallwayRenderer.js";
import { HallwayAudioDirector } from "./infrastructure/audio/HallwayAudioDirector.js";
import { PlaytestLogExporter } from "./infrastructure/PlaytestLogExporter.js";
import { buildInformation } from "./buildInformation.js";

const maximumElapsedSecondsPerFrame = 0.05;

function readGameModesFromUrl() {
  const urlParameters = new URLSearchParams(window.location.search);
  return {
    // Na build de release o modo debug não existe, para o jogador não ver as respostas.
    isDebugModeEnabled: !buildInformation.isReleaseBuild && urlParameters.has("debug"),
    isPlaytestModeEnabled: urlParameters.has("playtest"),
  };
}

/** Telas em que um clique vale como apertar E. No corredor não, para um clique sem querer não virar decisão. */
const gamePhasesWhereClickActsAsInteract = new Set([GamePhase.showingTitleScreen, GamePhase.escapedTheLoop]);

/**
 * Dentro do iframe do itch.io, o teclado só funciona depois que o jogo recebe foco (um clique).
 * Por isso o clique também dá foco ao jogo e, na tela de título, já começa a partida.
 */
function listenToCanvasClicks(canvasElement) {
  const canvasClickState = { wasCanvasClickedSinceLastFrame: false };
  canvasElement.addEventListener("pointerdown", () => {
    window.focus();
    canvasElement.focus();
    canvasClickState.wasCanvasClickedSinceLastFrame = true;
  });
  return canvasClickState;
}

function combineKeyboardAndClickInput(playerInputState, canvasClickState, currentGamePhase) {
  const clickActsAsInteract = canvasClickState.wasCanvasClickedSinceLastFrame && gamePhasesWhereClickActsAsInteract.has(currentGamePhase);
  canvasClickState.wasCanvasClickedSinceLastFrame = false;
  return {
    ...playerInputState,
    wasInteractKeyJustPressed: playerInputState.wasInteractKeyJustPressed || clickActsAsInteract,
  };
}

async function startGame() {
  await document.fonts.ready;

  const { isDebugModeEnabled, isPlaytestModeEnabled } = readGameModesFromUrl();
  const canvasElement = document.getElementById("game-canvas");

  const hallwayAudioDirector = new HallwayAudioDirector(GameConfiguration);
  const floorGenerator = new FloorGenerator(
    createAnomalyCatalog(),
    GameConfiguration.chanceOfFloorHavingAnomaly,
    GameConfiguration.startingFloorNumber,
    Math.random,
    () => hallwayAudioDirector.isSoundAudibleToPlayer(),
  );
  const gameSession = new GameSession(GameConfiguration, floorGenerator);
  const keyboardInputReader = new KeyboardInputReader(window);
  const canvasHallwayRenderer = new CanvasHallwayRenderer(canvasElement, GameConfiguration, isDebugModeEnabled);
  const playtestLogExporter = new PlaytestLogExporter(buildInformation.gameVersion);

  const canvasClickState = listenToCanvasClicks(canvasElement);

  // O navegador só deixa tocar som depois de uma interação do jogador.
  window.addEventListener("keydown", () => hallwayAudioDirector.unlockAudio());
  window.addEventListener("pointerdown", () => hallwayAudioDirector.unlockAudio());
  document.addEventListener("visibilitychange", () => hallwayAudioDirector.pauseWhilePageIsHidden(document.hidden));

  let previousFrameTimestampInMilliseconds = performance.now();
  let previousGamePhase = gameSession.currentGamePhase;

  function handleInterfaceKeys(playerInputState) {
    if (playerInputState.wasMuteKeyJustPressed) {
      hallwayAudioDirector.toggleMute();
    }
    if (isPlaytestModeEnabled && playerInputState.wasSavePlaytestLogKeyJustPressed) {
      playtestLogExporter.downloadAsJsonFile(gameSession.decisionLog.decisionRecords);
    }
  }

  function printPlaytestSummaryWhenPlayerEscapes() {
    const hasJustEscaped = previousGamePhase !== GamePhase.escapedTheLoop && gameSession.currentGamePhase === GamePhase.escapedTheLoop;
    previousGamePhase = gameSession.currentGamePhase;
    if (isPlaytestModeEnabled && hasJustEscaped) {
      playtestLogExporter.printSummaryToConsole(gameSession.decisionLog.decisionRecords);
    }
  }

  function runGameLoopFrame(currentFrameTimestampInMilliseconds) {
    const elapsedSecondsSinceLastFrame = Math.min(
      maximumElapsedSecondsPerFrame,
      (currentFrameTimestampInMilliseconds - previousFrameTimestampInMilliseconds) / 1000,
    );
    previousFrameTimestampInMilliseconds = currentFrameTimestampInMilliseconds;
    const elapsedTimeInSeconds = currentFrameTimestampInMilliseconds / 1000;

    const playerInputState = combineKeyboardAndClickInput(
      keyboardInputReader.readPlayerInputState(),
      canvasClickState,
      gameSession.currentGamePhase,
    );
    handleInterfaceKeys(playerInputState);

    gameSession.update(playerInputState, elapsedSecondsSinceLastFrame);
    printPlaytestSummaryWhenPlayerEscapes();
    hallwayAudioDirector.update(gameSession, elapsedTimeInSeconds);
    canvasHallwayRenderer.render(gameSession, elapsedTimeInSeconds, {
      isSoundMuted: hallwayAudioDirector.isMuted,
      isPlaytestModeEnabled,
    });

    requestAnimationFrame(runGameLoopFrame);
  }

  requestAnimationFrame(runGameLoopFrame);
}

startGame();
