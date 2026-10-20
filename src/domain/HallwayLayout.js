import { CeilingLampFlickerPattern } from "./CeilingLampFlickerPattern.js";
import { SporeDriftDirection } from "./SporeDriftDirection.js";

export const apartmentDoorPositionsX = Object.freeze([520, 820, 1120, 1420, 1720, 2020]);
export const paintingPositionsX = Object.freeze([670, 1270, 1870]);
export const ceilingLampPositionsX = Object.freeze([370, 670, 970, 1270, 1570, 1870, 2170]);

function formatDoorNumber(floorNumber, doorIndex) {
  const doorSequenceNumber = String(doorIndex + 1).padStart(2, "0");
  return `${floorNumber}${doorSequenceNumber}`;
}

/** Corredor "correto". As anomalias recebem uma cópia nova dele e alteram só o que precisam. */
export function createNormalHallwayLayout(floorNumber) {
  return {
    floorNumber,
    elevatorIndicatorText: String(floorNumber),
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
    moldPatches: [],
    ambientSpores: { driftDirection: SporeDriftDirection.fallingDown },
    standingFigures: [],
    isSomethingFollowingPlayer: false,
  };
}
