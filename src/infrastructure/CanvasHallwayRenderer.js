import { hallwayColorPalette as colors } from "./hallwayColorPalette.js";
import { logicalScreenWidth, logicalScreenHeight } from "./hallwayRenderingMeasurements.js";
import { GamePhase } from "../application/GamePhase.js";
import { HallwayStructureDrawer } from "./drawers/HallwayStructureDrawer.js";
import { ElevatorDrawer } from "./drawers/ElevatorDrawer.js";
import { StairwellDoorDrawer } from "./drawers/StairwellDoorDrawer.js";
import { ApartmentDoorDrawer } from "./drawers/ApartmentDoorDrawer.js";
import { PaintingDrawer } from "./drawers/PaintingDrawer.js";
import { MoldPatchDrawer } from "./drawers/MoldPatchDrawer.js";
import { CeilingLampFixtureDrawer } from "./drawers/CeilingLampFixtureDrawer.js";
import { StandingFigureDrawer } from "./drawers/StandingFigureDrawer.js";
import { PlayerDrawer } from "./drawers/PlayerDrawer.js";
import { FollowingPresenceDrawer } from "./drawers/FollowingPresenceDrawer.js";
import { AmbientSporesDrawer } from "./drawers/AmbientSporesDrawer.js";
import { DarknessWithLampLightDrawer } from "./drawers/DarknessWithLampLightDrawer.js";
import { HudDrawer } from "./drawers/HudDrawer.js";
import { ScreenOverlayDrawer } from "./drawers/ScreenOverlayDrawer.js";
import { DebugInformationDrawer } from "./drawers/DebugInformationDrawer.js";
import { InfectionStainDrawer } from "./drawers/InfectionStainDrawer.js";
import { MaintenanceNoteDrawer } from "./drawers/MaintenanceNoteDrawer.js";
import { InfectionTintDrawer } from "./drawers/InfectionTintDrawer.js";
import { TitleScreenDrawer } from "./drawers/TitleScreenDrawer.js";
import { SporeDriftDirection } from "../domain/SporeDriftDirection.js";

/** Esporos caindo atrás do título, como num andar já bem infectado. */
const titleScreenAmbientSpores = Object.freeze({ driftDirection: SporeDriftDirection.fallingDown, numberOfVisibleSpores: 90 });

/**
 * Orquestra o desenho de um frame: decide a ordem das camadas e a câmera.
 * Cada elemento do corredor é desenhado pelo seu próprio desenhista em ./drawers.
 */
export class CanvasHallwayRenderer {
  constructor(canvasElement, gameConfiguration, isDebugModeEnabled) {
    this.canvasElement = canvasElement;
    this.drawingContext = canvasElement.getContext("2d");
    this.gameConfiguration = gameConfiguration;
    this.isDebugModeEnabled = isDebugModeEnabled;

    this.createDrawers(this.drawingContext, gameConfiguration);
    this.resizeToFitWindow();
    window.addEventListener("resize", () => this.resizeToFitWindow());
  }

  createDrawers(drawingContext, gameConfiguration) {
    this.hallwayStructureDrawer = new HallwayStructureDrawer(drawingContext, gameConfiguration.hallwayLengthInPixels);
    this.elevatorDrawer = new ElevatorDrawer(drawingContext, gameConfiguration.elevatorPositionX);
    this.stairwellDoorDrawer = new StairwellDoorDrawer(drawingContext, gameConfiguration.stairwellDoorPositionX);
    this.apartmentDoorDrawer = new ApartmentDoorDrawer(drawingContext);
    this.paintingDrawer = new PaintingDrawer(drawingContext);
    this.moldPatchDrawer = new MoldPatchDrawer(drawingContext);
    this.ceilingLampFixtureDrawer = new CeilingLampFixtureDrawer(drawingContext);
    this.standingFigureDrawer = new StandingFigureDrawer(drawingContext);
    this.playerDrawer = new PlayerDrawer(drawingContext, gameConfiguration.playerStepDurationInSeconds);
    this.followingPresenceDrawer = new FollowingPresenceDrawer(drawingContext);
    this.ambientSporesDrawer = new AmbientSporesDrawer(drawingContext, gameConfiguration.hallwayLengthInPixels);
    this.darknessWithLampLightDrawer = new DarknessWithLampLightDrawer(drawingContext);
    this.hudDrawer = new HudDrawer(drawingContext, gameConfiguration.startingFloorNumber);
    this.screenOverlayDrawer = new ScreenOverlayDrawer(drawingContext);
    this.debugInformationDrawer = new DebugInformationDrawer(drawingContext);
    this.infectionStainDrawer = new InfectionStainDrawer(drawingContext);
    this.maintenanceNoteDrawer = new MaintenanceNoteDrawer(drawingContext);
    this.infectionTintDrawer = new InfectionTintDrawer(drawingContext);
    this.titleScreenDrawer = new TitleScreenDrawer(drawingContext);
  }

  resizeToFitWindow() {
    const scaleToFitWindow = Math.min(window.innerWidth / logicalScreenWidth, window.innerHeight / logicalScreenHeight);
    const displayedWidth = Math.floor(logicalScreenWidth * scaleToFitWindow);
    const displayedHeight = Math.floor(logicalScreenHeight * scaleToFitWindow);
    const devicePixelRatio = window.devicePixelRatio || 1;

    this.canvasElement.style.width = `${displayedWidth}px`;
    this.canvasElement.style.height = `${displayedHeight}px`;
    this.canvasElement.width = Math.floor(displayedWidth * devicePixelRatio);
    this.canvasElement.height = Math.floor(displayedHeight * devicePixelRatio);

    this.pixelsPerLogicalUnit = (displayedWidth * devicePixelRatio) / logicalScreenWidth;
  }

  render(gameSession, elapsedTimeInSeconds) {
    const context = this.drawingContext;
    context.setTransform(this.pixelsPerLogicalUnit, 0, 0, this.pixelsPerLogicalUnit, 0, 0);
    context.fillStyle = colors.backgroundBlack;
    context.fillRect(0, 0, logicalScreenWidth, logicalScreenHeight);

    if (gameSession.currentGamePhase === GamePhase.showingTitleScreen) {
      this.ambientSporesDrawer.draw(titleScreenAmbientSpores, 0, elapsedTimeInSeconds);
      this.titleScreenDrawer.draw(elapsedTimeInSeconds);
      return;
    }

    if (gameSession.currentGamePhase === GamePhase.escapedTheLoop) {
      this.screenOverlayDrawer.drawEscapeScreen(gameSession.elapsedRunTimeInSeconds, gameSession.numberOfTimesSentBackToStartingFloor);
      return;
    }

    this.drawHallwayScene(gameSession, elapsedTimeInSeconds);

    if (gameSession.currentGamePhase === GamePhase.readingMaintenanceNote) {
      this.screenOverlayDrawer.drawMaintenanceNoteReading(gameSession.currentFloorState.hallwayLayout.maintenanceNote.text);
    }

    if (gameSession.currentGamePhase === GamePhase.changingFloor) {
      this.screenOverlayDrawer.drawFloorTransition(gameSession.floorTransitionProgress, gameSession.floorTransitionMessage);
    }

    if (this.isDebugModeEnabled) {
      this.debugInformationDrawer.draw(gameSession.currentFloorState);
    }
  }

  /** O corredor com câmera, luz, doença e HUD. */
  drawHallwayScene(gameSession, elapsedTimeInSeconds) {
    const context = this.drawingContext;
    const cameraOffsetX = this.calculateCameraOffsetX(gameSession.player.positionX);
    const hallwayLayout = gameSession.currentFloorState.hallwayLayout;

    context.save();
    context.translate(-cameraOffsetX, 0);
    this.drawHallwayWorld(hallwayLayout, gameSession.player, cameraOffsetX, elapsedTimeInSeconds);
    context.restore();

    this.darknessWithLampLightDrawer.draw(hallwayLayout.ceilingLamps, cameraOffsetX, elapsedTimeInSeconds, hallwayLayout.infectionLevel);
    this.infectionTintDrawer.draw(hallwayLayout.infectionLevel);

    // Depois do tingimento verde: senão o laranja do painel fica esverdeado nos andares mais doentes
    // e o jogador pode confundir com a anomalia do painel verde.
    context.save();
    context.translate(-cameraOffsetX, 0);
    this.drawGlowingSigns(hallwayLayout);
    context.restore();

    this.hudDrawer.draw(gameSession);
  }

  /** Desenha tudo que pertence ao corredor, em coordenadas do mundo, de trás para frente. */
  drawHallwayWorld(hallwayLayout, player, cameraOffsetX, elapsedTimeInSeconds) {
    this.hallwayStructureDrawer.draw(cameraOffsetX);
    this.elevatorDrawer.draw();
    this.stairwellDoorDrawer.draw();
    hallwayLayout.doors.forEach((door) => this.apartmentDoorDrawer.draw(door));
    hallwayLayout.paintings.forEach((painting) => this.paintingDrawer.draw(painting));
    hallwayLayout.infectionStains.forEach((infectionStain) => this.infectionStainDrawer.draw(infectionStain));
    if (hallwayLayout.maintenanceNote !== null) {
      this.maintenanceNoteDrawer.draw(hallwayLayout.maintenanceNote);
    }
    hallwayLayout.moldPatches.forEach((moldPatch) => this.moldPatchDrawer.draw(moldPatch));
    hallwayLayout.ceilingLamps.forEach((ceilingLamp) => this.ceilingLampFixtureDrawer.draw(ceilingLamp, elapsedTimeInSeconds));
    hallwayLayout.standingFigures.forEach((standingFigure) => this.standingFigureDrawer.draw(standingFigure, elapsedTimeInSeconds));

    if (hallwayLayout.isSomethingFollowingPlayer) {
      this.followingPresenceDrawer.draw(player);
    }
    this.playerDrawer.draw(player);
    this.ambientSporesDrawer.draw(hallwayLayout.ambientSpores, cameraOffsetX, elapsedTimeInSeconds);
  }

  /** Painéis e placas iluminados por dentro aparecem mesmo no escuro. */
  drawGlowingSigns(hallwayLayout) {
    this.elevatorDrawer.drawGlowingFloorIndicator(hallwayLayout.elevatorIndicatorText, hallwayLayout.elevatorIndicatorColor);
    this.stairwellDoorDrawer.drawGlowingExitSign(hallwayLayout.exitSign.text);
  }

  calculateCameraOffsetX(playerPositionX) {
    const maximumCameraOffsetX = this.gameConfiguration.hallwayLengthInPixels - logicalScreenWidth;
    const centeredCameraOffsetX = playerPositionX - logicalScreenWidth / 2;
    return Math.min(maximumCameraOffsetX, Math.max(0, centeredCameraOffsetX));
  }
}
