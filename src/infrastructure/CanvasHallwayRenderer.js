import { hallwayColorPalette as colors } from "./hallwayColorPalette.js";
import { GamePhase } from "../application/GamePhase.js";
import { PlayerDecision } from "../domain/PlayerDecision.js";

const logicalScreenWidth = 960;
const logicalScreenHeight = 540;

const ceilingBottomY = 70;
const floorTopY = 430;

const signageFont = "bold 15px 'Arial Narrow', Arial, sans-serif";
const messageFontFamily = "'Special Elite', 'Courier New', serif";

/** Offsets fixos para o mofo não "tremer" a cada frame. */
const moldBlobOffsets = [
  { offsetX: 0, offsetY: 0, radiusScale: 1 },
  { offsetX: -0.7, offsetY: 0.4, radiusScale: 0.55 },
  { offsetX: 0.8, offsetY: -0.3, radiusScale: 0.6 },
  { offsetX: 0.3, offsetY: 0.9, radiusScale: 0.45 },
  { offsetX: -0.4, offsetY: -0.8, radiusScale: 0.4 },
  { offsetX: 1.2, offsetY: 0.6, radiusScale: 0.3 },
];

export class CanvasHallwayRenderer {
  constructor(canvasElement, gameConfiguration, isDebugModeEnabled) {
    this.canvasElement = canvasElement;
    this.drawingContext = canvasElement.getContext("2d");
    this.gameConfiguration = gameConfiguration;
    this.isDebugModeEnabled = isDebugModeEnabled;

    this.lightMaskCanvas = document.createElement("canvas");
    this.lightMaskContext = this.lightMaskCanvas.getContext("2d");

    this.resizeToFitWindow();
    window.addEventListener("resize", () => this.resizeToFitWindow());
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
    this.lightMaskCanvas.width = logicalScreenWidth;
    this.lightMaskCanvas.height = logicalScreenHeight;

    this.pixelsPerLogicalUnit = (displayedWidth * devicePixelRatio) / logicalScreenWidth;
  }

  render(gameSession, elapsedTimeInSeconds) {
    const context = this.drawingContext;
    context.setTransform(this.pixelsPerLogicalUnit, 0, 0, this.pixelsPerLogicalUnit, 0, 0);
    context.fillStyle = colors.backgroundBlack;
    context.fillRect(0, 0, logicalScreenWidth, logicalScreenHeight);

    if (gameSession.currentGamePhase === GamePhase.escapedTheLoop) {
      this.drawEscapeScreen();
      return;
    }

    const cameraOffsetX = this.calculateCameraOffsetX(gameSession.player.positionX);
    const hallwayLayout = gameSession.currentFloorState.hallwayLayout;

    context.save();
    context.translate(-cameraOffsetX, 0);
    this.drawHallwayStructure(cameraOffsetX);
    this.drawElevator(gameSession.currentFloorState.floorNumber);
    this.drawStairwellDoor(hallwayLayout.exitSign.text);
    hallwayLayout.doors.forEach((door) => this.drawApartmentDoor(door));
    hallwayLayout.paintings.forEach((painting) => this.drawPainting(painting));
    hallwayLayout.moldPatches.forEach((moldPatch) => this.drawMoldPatch(moldPatch));
    hallwayLayout.ceilingLamps.forEach((ceilingLamp) => this.drawCeilingLampFixture(ceilingLamp));
    this.drawPlayer(gameSession.player);
    context.restore();

    this.drawDarknessWithLampLight(hallwayLayout.ceilingLamps, cameraOffsetX, elapsedTimeInSeconds);
    this.drawHud(gameSession);

    if (gameSession.currentGamePhase === GamePhase.changingFloor) {
      this.drawFloorTransition(gameSession.floorTransitionProgress, gameSession.floorTransitionMessage);
    }

    if (this.isDebugModeEnabled) {
      this.drawDebugInformation(gameSession.currentFloorState);
    }
  }

  calculateCameraOffsetX(playerPositionX) {
    const maximumCameraOffsetX = this.gameConfiguration.hallwayLengthInPixels - logicalScreenWidth;
    const centeredCameraOffsetX = playerPositionX - logicalScreenWidth / 2;
    return Math.min(maximumCameraOffsetX, Math.max(0, centeredCameraOffsetX));
  }

  drawHallwayStructure(cameraOffsetX) {
    const context = this.drawingContext;
    const hallwayLength = this.gameConfiguration.hallwayLengthInPixels;

    context.fillStyle = colors.ceiling;
    context.fillRect(0, 0, hallwayLength, ceilingBottomY);

    context.fillStyle = colors.wallpaper;
    context.fillRect(0, ceilingBottomY, hallwayLength, floorTopY - ceilingBottomY);

    context.fillStyle = colors.wallpaperStripe;
    const stripeSpacingInPixels = 36;
    const firstVisibleStripeX = Math.floor(cameraOffsetX / stripeSpacingInPixels) * stripeSpacingInPixels;
    for (let stripePositionX = firstVisibleStripeX; stripePositionX < cameraOffsetX + logicalScreenWidth; stripePositionX += stripeSpacingInPixels) {
      context.fillRect(stripePositionX, ceilingBottomY, 6, floorTopY - ceilingBottomY);
    }

    context.fillStyle = colors.baseboard;
    context.fillRect(0, floorTopY - 14, hallwayLength, 14);

    context.fillStyle = colors.floorCarpet;
    context.fillRect(0, floorTopY, hallwayLength, logicalScreenHeight - floorTopY);
  }

  drawElevator(floorNumber) {
    const context = this.drawingContext;
    const elevatorCenterX = this.gameConfiguration.elevatorPositionX;
    const elevatorWidth = 140;
    const elevatorHeight = 200;
    const elevatorLeftX = elevatorCenterX - elevatorWidth / 2;
    const elevatorTopY = floorTopY - elevatorHeight;

    context.fillStyle = colors.elevatorSteelShadow;
    context.fillRect(elevatorLeftX - 10, elevatorTopY - 10, elevatorWidth + 20, elevatorHeight + 10);
    context.fillStyle = colors.elevatorSteel;
    context.fillRect(elevatorLeftX, elevatorTopY, elevatorWidth / 2 - 2, elevatorHeight);
    context.fillRect(elevatorCenterX + 2, elevatorTopY, elevatorWidth / 2 - 2, elevatorHeight);

    const indicatorWidth = 56;
    const indicatorTopY = elevatorTopY - 46;
    context.fillStyle = colors.floorIndicatorBackground;
    context.fillRect(elevatorCenterX - indicatorWidth / 2, indicatorTopY, indicatorWidth, 28);
    context.fillStyle = colors.floorIndicatorDigits;
    context.font = "bold 20px 'Arial Narrow', Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(String(floorNumber), elevatorCenterX, indicatorTopY + 15);
  }

  drawStairwellDoor(exitSignText) {
    const context = this.drawingContext;
    const doorCenterX = this.gameConfiguration.stairwellDoorPositionX;
    const doorWidth = 84;
    const doorHeight = 180;
    const doorTopY = floorTopY - doorHeight;

    context.fillStyle = colors.apartmentDoorFrame;
    context.fillRect(doorCenterX - doorWidth / 2 - 8, doorTopY - 8, doorWidth + 16, doorHeight + 8);
    context.fillStyle = colors.stairwellDoor;
    context.fillRect(doorCenterX - doorWidth / 2, doorTopY, doorWidth, doorHeight);
    context.fillStyle = colors.elevatorSteel;
    context.fillRect(doorCenterX - doorWidth / 2 + 8, doorTopY + 92, doorWidth - 16, 8);

    const signWidth = 64;
    const signTopY = doorTopY - 44;
    context.fillStyle = colors.exitSignBackground;
    context.fillRect(doorCenterX - signWidth / 2, signTopY, signWidth, 24);
    context.fillStyle = colors.exitSignText;
    context.font = signageFont;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(exitSignText, doorCenterX, signTopY + 13);
  }

  drawApartmentDoor(door) {
    const context = this.drawingContext;
    const doorWidth = 74;
    const doorHeight = 172;
    const doorLeftX = door.positionX - doorWidth / 2;
    const doorTopY = floorTopY - doorHeight;

    context.fillStyle = colors.apartmentDoorFrame;
    context.fillRect(doorLeftX - 7, doorTopY - 7, doorWidth + 14, doorHeight + 7);
    context.fillStyle = colors.apartmentDoor;
    context.fillRect(doorLeftX, doorTopY, doorWidth, doorHeight);

    context.fillStyle = colors.brassNumberPlate;
    context.beginPath();
    context.arc(doorLeftX + doorWidth - 12, doorTopY + 96, 4, 0, Math.PI * 2);
    context.fill();

    const plateWidth = 44;
    const plateTopY = doorTopY + 22;
    context.fillRect(door.positionX - plateWidth / 2, plateTopY, plateWidth, 18);
    context.fillStyle = colors.brassNumberText;
    context.font = signageFont;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(door.doorNumberText, door.positionX, plateTopY + 10);
  }

  drawPainting(painting) {
    const context = this.drawingContext;
    const paintingWidth = 110;
    const paintingHeight = 72;
    const paintingCenterY = 205;

    context.save();
    context.translate(painting.positionX, paintingCenterY);
    if (painting.isUpsideDown) {
      context.rotate(Math.PI);
    }

    context.fillStyle = colors.pictureFrame;
    context.fillRect(-paintingWidth / 2 - 6, -paintingHeight / 2 - 6, paintingWidth + 12, paintingHeight + 12);
    context.fillStyle = colors.paintingSky;
    context.fillRect(-paintingWidth / 2, -paintingHeight / 2, paintingWidth, paintingHeight);

    context.fillStyle = colors.paintingSun;
    context.beginPath();
    context.arc(paintingWidth / 2 - 22, -paintingHeight / 2 + 18, 9, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = colors.paintingHill;
    context.beginPath();
    context.moveTo(-paintingWidth / 2, paintingHeight / 2);
    context.lineTo(-10, -4);
    context.lineTo(20, 14);
    context.lineTo(paintingWidth / 2, paintingHeight / 2);
    context.closePath();
    context.fill();

    context.restore();
  }

  drawMoldPatch(moldPatch) {
    const context = this.drawingContext;
    moldBlobOffsets.forEach((blobOffset, blobIndex) => {
      const blobRadius = moldPatch.radiusInPixels * blobOffset.radiusScale;
      context.fillStyle = blobIndex % 2 === 0 ? colors.sporeMoldDark : colors.sporeMoldLight;
      context.globalAlpha = 0.85;
      context.beginPath();
      context.arc(
        moldPatch.positionX + blobOffset.offsetX * moldPatch.radiusInPixels,
        moldPatch.positionY + blobOffset.offsetY * moldPatch.radiusInPixels,
        blobRadius,
        0,
        Math.PI * 2,
      );
      context.fill();
    });
    context.globalAlpha = 1;
  }

  drawCeilingLampFixture(ceilingLamp) {
    const context = this.drawingContext;
    context.fillStyle = colors.fluorescentTube;
    context.fillRect(ceilingLamp.positionX - 40, ceilingBottomY, 80, 7);
  }

  drawPlayer(player) {
    const context = this.drawingContext;
    const legSwingAmount = player.isWalking ? Math.sin(player.walkingAnimationTimeInSeconds * 10) * 7 : 0;
    const facingDirection = player.isFacingRight ? 1 : -1;

    context.fillStyle = colors.playerSilhouette;
    context.fillRect(player.positionX - 9 + legSwingAmount, floorTopY - 48, 8, 48);
    context.fillRect(player.positionX + 1 - legSwingAmount, floorTopY - 48, 8, 48);
    context.fillRect(player.positionX - 14, floorTopY - 104, 28, 60);

    context.beginPath();
    context.arc(player.positionX + facingDirection * 2, floorTopY - 118, 14, 0, Math.PI * 2);
    context.fill();
  }

  /** Escurece a tela inteira e "recorta" a luz embaixo de cada lâmpada. */
  drawDarknessWithLampLight(ceilingLamps, cameraOffsetX, elapsedTimeInSeconds) {
    const maskContext = this.lightMaskContext;
    maskContext.globalCompositeOperation = "source-over";
    maskContext.clearRect(0, 0, logicalScreenWidth, logicalScreenHeight);
    maskContext.fillStyle = "rgba(4, 5, 3, 0.86)";
    maskContext.fillRect(0, 0, logicalScreenWidth, logicalScreenHeight);

    maskContext.globalCompositeOperation = "destination-out";
    const subtleFluorescentHum = 0.97 + Math.sin(elapsedTimeInSeconds * 50) * 0.03;

    ceilingLamps.forEach((ceilingLamp) => {
      const lampScreenX = ceilingLamp.positionX - cameraOffsetX;
      const lightGradient = maskContext.createRadialGradient(lampScreenX, ceilingBottomY, 10, lampScreenX, ceilingBottomY + 120, 260);
      lightGradient.addColorStop(0, `rgba(0, 0, 0, ${subtleFluorescentHum})`);
      lightGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      maskContext.fillStyle = lightGradient;
      maskContext.fillRect(lampScreenX - 280, 0, 560, logicalScreenHeight);
    });

    this.drawingContext.drawImage(this.lightMaskCanvas, 0, 0, logicalScreenWidth, logicalScreenHeight);
  }

  drawHud(gameSession) {
    const context = this.drawingContext;
    context.textAlign = "left";
    context.textBaseline = "top";
    context.fillStyle = colors.interfaceTextDimmed;
    context.font = `18px ${messageFontFamily}`;
    context.fillText(`Floor ${gameSession.currentFloorState.floorNumber}`, 24, 20);

    const isOnStartingFloor = gameSession.currentFloorState.floorNumber === this.gameConfiguration.startingFloorNumber;
    if (isOnStartingFloor && gameSession.currentGamePhase === GamePhase.exploringHallway) {
      context.font = `15px ${messageFontFamily}`;
      context.fillText("If anything on this floor is wrong, turn back to the elevator.", 24, floorTopY + 14);
      context.fillText("If nothing is wrong, go through the stairwell door.", 24, floorTopY + 36);
    }

    const interactionHintText = this.createInteractionHintText(gameSession);
    if (interactionHintText !== null && gameSession.currentGamePhase === GamePhase.exploringHallway) {
      context.textAlign = "center";
      context.fillStyle = colors.interfaceText;
      context.font = `18px ${messageFontFamily}`;
      context.fillText(interactionHintText, logicalScreenWidth / 2, logicalScreenHeight - 44);
    }
  }

  createInteractionHintText(gameSession) {
    const availablePlayerDecision = gameSession.findAvailablePlayerDecision();
    if (availablePlayerDecision === PlayerDecision.turnBackToElevator) {
      return "[E] Take the elevator back";
    }
    if (availablePlayerDecision === PlayerDecision.proceedThroughStairwellDoor) {
      return "[E] Go through the door";
    }
    return null;
  }

  drawFloorTransition(floorTransitionProgress, floorTransitionMessage) {
    const context = this.drawingContext;
    const fadeInPortionOfTransition = 0.25;
    const darknessOpacity = Math.min(1, floorTransitionProgress / fadeInPortionOfTransition);

    context.fillStyle = `rgba(0, 0, 0, ${darknessOpacity})`;
    context.fillRect(0, 0, logicalScreenWidth, logicalScreenHeight);

    if (darknessOpacity >= 1) {
      context.fillStyle = colors.interfaceText;
      context.font = `26px ${messageFontFamily}`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(floorTransitionMessage, logicalScreenWidth / 2, logicalScreenHeight / 2);
    }
  }

  drawEscapeScreen() {
    const context = this.drawingContext;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = colors.interfaceText;
    context.font = `30px ${messageFontFamily}`;
    context.fillText("You left the building.", logicalScreenWidth / 2, logicalScreenHeight / 2 - 20);
    context.fillStyle = colors.interfaceTextDimmed;
    context.font = `17px ${messageFontFamily}`;
    context.fillText("Press E to go back inside.", logicalScreenWidth / 2, logicalScreenHeight / 2 + 26);
  }

  drawDebugInformation(floorState) {
    const context = this.drawingContext;
    const debugText = floorState.hasAnomaly ? `DEBUG anomaly: ${floorState.activeAnomaly.anomalyDescription}` : "DEBUG anomaly: none";
    context.textAlign = "right";
    context.textBaseline = "top";
    context.fillStyle = "#ff6b6b";
    context.font = "13px Arial, sans-serif";
    context.fillText(debugText, logicalScreenWidth - 16, 16);
  }
}
