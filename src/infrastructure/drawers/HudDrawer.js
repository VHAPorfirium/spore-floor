import { hallwayColorPalette as colors } from "../hallwayColorPalette.js";
import { logicalScreenWidth, logicalScreenHeight, floorTopY, messageFontFamily } from "../hallwayRenderingMeasurements.js";
import { GamePhase } from "../../application/GamePhase.js";
import { PlayerDecision } from "../../domain/PlayerDecision.js";

const interactionHintTextByPlayerDecision = Object.freeze({
  [PlayerDecision.turnBackToElevator]: "[E] Take the elevator back",
  [PlayerDecision.proceedThroughStairwellDoor]: "[E] Go through the door",
});

export class HudDrawer {
  constructor(drawingContext, startingFloorNumber) {
    this.drawingContext = drawingContext;
    this.startingFloorNumber = startingFloorNumber;
  }

  draw(gameSession) {
    this.drawFloorNumber(gameSession.currentFloorState.floorNumber);

    const isPlayerExploringHallway = gameSession.currentGamePhase === GamePhase.exploringHallway;
    if (!isPlayerExploringHallway) {
      return;
    }

    const isOnStartingFloor = gameSession.currentFloorState.floorNumber === this.startingFloorNumber;
    if (isOnStartingFloor) {
      this.drawRulesExplanation();
    }

    const availablePlayerDecision = gameSession.findAvailablePlayerDecision();
    if (availablePlayerDecision !== null) {
      this.drawInteractionHint(interactionHintTextByPlayerDecision[availablePlayerDecision]);
      return;
    }

    if (gameSession.isPlayerNearMaintenanceNote()) {
      this.drawInteractionHint("[E] Read the note");
    }
  }

  drawFloorNumber(floorNumber) {
    const context = this.drawingContext;
    context.textAlign = "left";
    context.textBaseline = "top";
    context.fillStyle = colors.interfaceTextDimmed;
    context.font = `18px ${messageFontFamily}`;
    context.fillText(`Floor ${floorNumber}`, 24, 20);
  }

  drawRulesExplanation() {
    const context = this.drawingContext;
    context.textAlign = "left";
    context.textBaseline = "top";
    context.fillStyle = colors.interfaceTextDimmed;
    context.font = `15px ${messageFontFamily}`;
    context.fillText("If anything on this floor is wrong, turn back to the elevator.", 24, floorTopY + 14);
    context.fillText("If nothing is wrong, go through the stairwell door.", 24, floorTopY + 36);
  }

  drawInteractionHint(interactionHintText) {
    const context = this.drawingContext;
    context.textAlign = "center";
    context.textBaseline = "top";
    context.fillStyle = colors.interfaceText;
    context.font = `18px ${messageFontFamily}`;
    context.fillText(interactionHintText, logicalScreenWidth / 2, logicalScreenHeight - 44);
  }
}
