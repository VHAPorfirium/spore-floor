import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateFloorInfectionLevel } from "../src/domain/FloorInfection.js";
import { createNormalHallwayLayout } from "../src/domain/HallwayLayout.js";
import { findMaintenanceLogTextForFloor } from "../src/domain/maintenanceLogs.js";

const startingFloorNumber = 10;

test("the starting floor is clean and the last floor is fully infected", () => {
  assert.equal(calculateFloorInfectionLevel(10, startingFloorNumber), 0);
  assert.equal(calculateFloorInfectionLevel(1, startingFloorNumber), 1);
});

test("the infection grows with every floor descended", () => {
  for (let floorNumber = 10; floorNumber > 1; floorNumber--) {
    const infectionOnThisFloor = calculateFloorInfectionLevel(floorNumber, startingFloorNumber);
    const infectionOnFloorBelow = calculateFloorInfectionLevel(floorNumber - 1, startingFloorNumber);
    assert.ok(infectionOnFloorBelow > infectionOnThisFloor, `floor ${floorNumber - 1} should be sicker than ${floorNumber}`);
  }
});

test("deeper floors have more stains and more spores in the air", () => {
  const cleanLayout = createNormalHallwayLayout(10);
  const sickLayout = createNormalHallwayLayout(1);
  assert.equal(cleanLayout.infectionStains.length, 0);
  assert.ok(sickLayout.infectionStains.length > 0);
  assert.ok(sickLayout.ambientSpores.numberOfVisibleSpores > cleanLayout.ambientSpores.numberOfVisibleSpores);
});

test("infection stains never sit near the baseboard, where the mold anomaly lives", () => {
  const sickLayout = createNormalHallwayLayout(1);
  const lowestAllowedStainPositionY = 120;
  sickLayout.infectionStains.forEach((stain) => assert.ok(stain.positionY < lowestAllowedStainPositionY));
});

test("every floor from 10 to 1 has a maintenance note", () => {
  for (let floorNumber = 10; floorNumber >= 1; floorNumber--) {
    assert.equal(typeof findMaintenanceLogTextForFloor(floorNumber), "string");
  }
});
