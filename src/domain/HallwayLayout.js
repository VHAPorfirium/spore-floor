const doorPositionsX = [520, 820, 1120, 1420, 1720, 2020];
const paintingPositionsX = [670, 1270, 1870];
const ceilingLampPositionsX = [370, 670, 970, 1270, 1570, 1870, 2170];

function formatDoorNumber(floorNumber, doorIndex) {
  const doorSequenceNumber = String(doorIndex + 1).padStart(2, "0");
  return `${floorNumber}${doorSequenceNumber}`;
}

export function createNormalHallwayLayout(floorNumber) {
  return {
    floorNumber,
    doors: doorPositionsX.map((positionX, doorIndex) => ({
      positionX,
      doorNumberText: formatDoorNumber(floorNumber, doorIndex),
    })),
    paintings: paintingPositionsX.map((positionX) => ({
      positionX,
      isUpsideDown: false,
    })),
    ceilingLamps: ceilingLampPositionsX.map((positionX) => ({ positionX })),
    exitSign: { text: "EXIT" },
    moldPatches: [],
  };
}
