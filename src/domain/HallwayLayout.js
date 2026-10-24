import { CeilingLampFlickerPattern } from "./CeilingLampFlickerPattern.js";
import { SporeDriftDirection } from "./SporeDriftDirection.js";
import { ElevatorIndicatorColor } from "./ElevatorIndicatorColor.js";
import { ElevatorChimeTone } from "./ElevatorChimeTone.js";
import { GameConfiguration } from "./GameConfiguration.js";
import { calculateFloorInfectionLevel } from "./FloorInfection.js";
import { findMaintenanceLogTextForFloor } from "./maintenanceLogs.js";

export const apartmentDoorPositionsX = Object.freeze([520, 820, 1120, 1420, 1720, 2020]);
export const paintingPositionsX = Object.freeze([670, 1270, 1870]);
export const ceilingLampPositionsX = Object.freeze([370, 670, 970, 1270, 1570, 1870, 2170]);

/**
 * Manchas da "doença" do prédio. Ficam sempre no alto da parede, encostadas no teto,
 * para nunca se confundirem com a anomalia de mofo (que fica perto do rodapé).
 * Quanto mais infectado o andar, mais manchas desta lista aparecem, sempre na mesma ordem.
 */
const infectionStainPositions = Object.freeze([
  { positionX: 450, positionY: 82, radiusInPixels: 11 },
  { positionX: 1990, positionY: 86, radiusInPixels: 14 },
  { positionX: 1180, positionY: 80, radiusInPixels: 9 },
  { positionX: 760, positionY: 88, radiusInPixels: 13 },
  { positionX: 1650, positionY: 82, radiusInPixels: 10 },
  { positionX: 300, positionY: 90, radiusInPixels: 15 },
  { positionX: 2140, positionY: 84, radiusInPixels: 12 },
  { positionX: 1460, positionY: 92, radiusInPixels: 16 },
  { positionX: 900, positionY: 80, radiusInPixels: 10 },
  { positionX: 1820, positionY: 90, radiusInPixels: 17 },
  { positionX: 580, positionY: 94, radiusInPixels: 18 },
  { positionX: 1330, positionY: 86, radiusInPixels: 12 },
  { positionX: 2060, positionY: 96, radiusInPixels: 19 },
  { positionX: 1050, positionY: 92, radiusInPixels: 15 },
]);

const minimumNumberOfVisibleSpores = 30;
const additionalSporesAtFullInfection = 100;

function formatDoorNumber(floorNumber, doorIndex) {
  const doorSequenceNumber = String(doorIndex + 1).padStart(2, "0");
  return `${floorNumber}${doorSequenceNumber}`;
}

function createMaintenanceNote(floorNumber) {
  const maintenanceLogText = findMaintenanceLogTextForFloor(floorNumber);
  if (maintenanceLogText === null) {
    return null;
  }
  return { positionX: GameConfiguration.maintenanceNotePositionX, text: maintenanceLogText };
}

/** Corredor "correto". As anomalias recebem uma cópia nova dele e alteram só o que precisam. */
export function createNormalHallwayLayout(floorNumber) {
  const infectionLevel = calculateFloorInfectionLevel(floorNumber, GameConfiguration.startingFloorNumber);
  const numberOfInfectionStains = Math.round(infectionLevel * infectionStainPositions.length);

  return {
    floorNumber,
    infectionLevel,
    elevatorIndicatorText: String(floorNumber),
    elevatorIndicatorColor: ElevatorIndicatorColor.amber,
    elevatorChimeTone: ElevatorChimeTone.inTune,
    doors: apartmentDoorPositionsX.map((positionX, doorIndex) => ({
      positionX,
      doorNumberText: formatDoorNumber(floorNumber, doorIndex),
      isDoorNumberCoveredByFungus: false,
    })),
    paintings: paintingPositionsX.map((positionX) => ({
      positionX,
      isUpsideDown: false,
      isSunVisible: true,
    })),
    ceilingLamps: ceilingLampPositionsX.map((positionX) => ({
      positionX,
      flickerPattern: CeilingLampFlickerPattern.steadyHum,
    })),
    exitSign: { text: "EXIT" },
    maintenanceNote: createMaintenanceNote(floorNumber),
    infectionStains: infectionStainPositions.slice(0, numberOfInfectionStains).map((stain) => ({ ...stain })),
    moldPatches: [],
    ambientSpores: {
      driftDirection: SporeDriftDirection.fallingDown,
      numberOfVisibleSpores: Math.round(minimumNumberOfVisibleSpores + infectionLevel * additionalSporesAtFullInfection),
    },
    standingFigures: [],
    isSomethingFollowingPlayer: false,
  };
}
