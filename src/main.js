import { GameConfiguration } from "./domain/GameConfiguration.js";
import { FloorGenerator } from "./domain/FloorGenerator.js";
import { createAnomalyCatalog } from "./domain/anomalies/anomalyCatalog.js";
import { GameSession } from "./application/GameSession.js";
import { KeyboardInputReader } from "./infrastructure/KeyboardInputReader.js";
import { CanvasHallwayRenderer } from "./infrastructure/CanvasHallwayRenderer.js";
import { HallwayAudioDirector } from "./infrastructure/audio/HallwayAudioDirector.js";

const maximumElapsedSecondsPerFrame = 0.05;

async function startGame() {
  await document.fonts.ready;

  const isDebugModeEnabled = new URLSearchParams(window.location.search).has("debug");

  const floorGenerator = new FloorGenerator(
    createAnomalyCatalog(),
    GameConfiguration.chanceOfFloorHavingAnomaly,
    GameConfiguration.startingFloorNumber,
    Math.random,
  );
  const gameSession = new GameSession(GameConfiguration, floorGenerator);
  const keyboardInputReader = new KeyboardInputReader(window);
  const canvasHallwayRenderer = new CanvasHallwayRenderer(
    document.getElementById("game-canvas"),
    GameConfiguration,
    isDebugModeEnabled,
  );
  const hallwayAudioDirector = new HallwayAudioDirector(GameConfiguration);

  // O navegador só deixa tocar som depois de uma interação do jogador.
  window.addEventListener("keydown", () => hallwayAudioDirector.unlockAudio());
  window.addEventListener("pointerdown", () => hallwayAudioDirector.unlockAudio());

  let previousFrameTimestampInMilliseconds = performance.now();

  function runGameLoopFrame(currentFrameTimestampInMilliseconds) {
    const elapsedSecondsSinceLastFrame = Math.min(
      maximumElapsedSecondsPerFrame,
      (currentFrameTimestampInMilliseconds - previousFrameTimestampInMilliseconds) / 1000,
    );
    previousFrameTimestampInMilliseconds = currentFrameTimestampInMilliseconds;
    const elapsedTimeInSeconds = currentFrameTimestampInMilliseconds / 1000;

    const playerInputState = keyboardInputReader.readPlayerInputState();
    if (playerInputState.wasMuteKeyJustPressed) {
      hallwayAudioDirector.toggleMute();
    }

    gameSession.update(playerInputState, elapsedSecondsSinceLastFrame);
    hallwayAudioDirector.update(gameSession, elapsedTimeInSeconds);
    canvasHallwayRenderer.render(gameSession, elapsedTimeInSeconds);

    requestAnimationFrame(runGameLoopFrame);
  }

  requestAnimationFrame(runGameLoopFrame);
}

startGame();
