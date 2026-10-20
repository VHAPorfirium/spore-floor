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
    this.playerDrawer = new PlayerDrawer(drawingContext);
    this.followingPresenceDrawer = new FollowingPresenceDrawer(drawingContext);
    this.ambientSporesDrawer = new AmbientSporesDrawer(drawingContext, gameConfiguration.hallwayLengthInPixels);
    this.darknessWithLampLightDrawer = new DarknessWithLampLightDrawer(drawingContext);
    this.hudDrawer = new HudDrawer(drawingContext, gameConfiguration.startingFloorNumber);
    this.screenOverlayDrawer = new ScreenOverlayDrawer(drawingContext);
    this.debugInformationDrawer = new DebugInformationDrawer(drawingContext);
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

    if (gameSession.currentGamePhase === GamePhase.escapedTheLoop) {
      this.screenOverlayDrawer.drawEscapeScreen();
      return;
    }

    const cameraOffsetX = this.calculateCameraOffsetX(gameSession.player.positionX);
    const hallwayLayout = gameSession.currentFloorState.hallwayLayout;

    context.save();
    context.translate(-cameraOffsetX, 0);
    this.drawHallwayWorld(hallwayLayout, gameSession.player, cameraOffsetX, elapsedTimeInSeconds);
    context.restore();

    this.darknessWithLampLightDrawer.draw(hallwayLayout.ceilingLamps, cameraOffsetX, elapsedTimeInSeconds);
    this.hudDrawer.draw(gameSession);

    if (gameSession.currentGamePhase === GamePhase.changingFloor) {
      this.screenOverlayDrawer.drawFloorTransition(gameSession.floorTransitionProgress, gameSession.floorTransitionMessage);
    }

    if (this.isDebugModeEnabled) {
      this.debugInformationDrawer.draw(gameSession.currentFloorState);
    }
  }

  /** Desenha tudo que pertence ao corredor, em coordenadas do mundo, de trás para frente. */
  drawHallwayWorld(hallwayLayout, player, cameraOffsetX, elapsedTimeInSeconds) {
    this.hallwayStructureDrawer.draw(cameraOffsetX);
    this.elevatorDrawer.draw(hallwayLayout.elevatorIndicatorText);
    this.stairwellDoorDrawer.draw(hallwayLayout.exitSign.text);
    hallwayLayout.doors.forEach((door) => this.apartmentDoorDrawer.draw(door));
    hallwayLayout.paintings.forEach((painting) => this.paintingDrawer.draw(painting));
    hallwayLayout.moldPatches.forEach((moldPatch) => this.moldPatchDrawer.draw(moldPatch));
    hallwayLayout.ceilingLamps.forEach((ceilingLamp) => this.ceilingLampFixtureDrawer.draw(ceilingLamp, elapsedTimeInSeconds));
    hallwayLayout.standingFigures.forEach((standingFigure) => this.standingFigureDrawer.draw(standingFigure, elapsedTimeInSeconds));

    if (hallwayLayout.isSomethingFollowingPlayer) {
      this.followingPresenceDrawer.draw(player);
    }
    this.playerDrawer.draw(player);
    this.ambientSporesDrawer.draw(hallwayLayout.ambientSpores, cameraOffsetX, elapsedTimeInSeconds);
  }

  calculateCameraOffsetX(playerPositionX) {
    const maximumCameraOffsetX = this.gameConfiguration.hallwayLengthInPixels - logicalScreenWidth;
    const centeredCameraOffsetX = playerPositionX - logicalScreenWidth / 2;
    return Math.min(maximumCameraOffsetX, Math.max(0, centeredCameraOffsetX));
  }
}
