import { test } from "node:test";
import assert from "node:assert/strict";
import { FloorGenerator } from "../src/domain/FloorGenerator.js";
import { createAnomalyCatalog } from "../src/domain/anomalies/anomalyCatalog.js";

const alwaysReturnZero = () => 0;
const alwaysReturnAlmostOne = () => 0.99;

test("the starting floor never has an anomaly", () => {
  const floorGenerator = new FloorGenerator(createAnomalyCatalog(), 1, 10, alwaysReturnZero);
  assert.equal(floorGenerator.generateFloor(10).hasAnomaly, false);
});

test("other floors get an anomaly when the random roll is below the chance", () => {
  const floorGenerator = new FloorGenerator(createAnomalyCatalog(), 0.5, 10, alwaysReturnZero);
  assert.equal(floorGenerator.generateFloor(8).hasAnomaly, true);
});

test("other floors stay normal when the random roll is above the chance", () => {
  const floorGenerator = new FloorGenerator(createAnomalyCatalog(), 0.5, 10, alwaysReturnAlmostOne);
  assert.equal(floorGenerator.generateFloor(8).hasAnomaly, false);
});

test("every anomaly actually changes the hallway", () => {
  const normalFloorGenerator = new FloorGenerator([], 0, 10, alwaysReturnAlmostOne);
  const normalLayoutAsText = JSON.stringify(normalFloorGenerator.generateFloor(5).hallwayLayout);

  createAnomalyCatalog().forEach((anomaly) => {
    const singleAnomalyGenerator = new FloorGenerator([anomaly], 1, 10, alwaysReturnZero);
    const changedLayoutAsText = JSON.stringify(singleAnomalyGenerator.generateFloor(5).hallwayLayout);
    assert.notEqual(changedLayoutAsText, normalLayoutAsText, `${anomaly.anomalyIdentifier} changed nothing`);
  });
});

test("the same anomaly is never chosen on two floors in a row", () => {
  const [firstAnomaly, secondAnomaly] = createAnomalyCatalog();
  const floorGenerator = new FloorGenerator([firstAnomaly, secondAnomaly], 1, 10, alwaysReturnZero);
  const firstFloorAnomaly = floorGenerator.generateFloor(9).activeAnomaly;
  const secondFloorAnomaly = floorGenerator.generateFloor(8).activeAnomaly;
  assert.notEqual(firstFloorAnomaly, secondFloorAnomaly);
});

test("an empty anomaly catalog always generates normal floors", () => {
  const floorGenerator = new FloorGenerator([], 1, 10, alwaysReturnZero);
  assert.equal(floorGenerator.generateFloor(8).hasAnomaly, false);
});

test("sound-only anomalies are never chosen while the player cannot hear sound", () => {
  const soundOnlyAnomalies = createAnomalyCatalog().filter((anomaly) => anomaly.requiresSoundToNotice);
  assert.ok(soundOnlyAnomalies.length > 0, "the catalog should have at least one sound-only anomaly");

  const playerWithoutSound = () => false;
  const floorGenerator = new FloorGenerator(soundOnlyAnomalies, 1, 10, alwaysReturnZero, playerWithoutSound);
  for (let floorNumber = 9; floorNumber >= 1; floorNumber--) {
    assert.equal(floorGenerator.generateFloor(floorNumber).hasAnomaly, false);
  }
});

test("sound-only anomalies can be chosen when the player hears sound", () => {
  const soundOnlyAnomalies = createAnomalyCatalog().filter((anomaly) => anomaly.requiresSoundToNotice);
  const playerWithSound = () => true;
  const floorGenerator = new FloorGenerator(soundOnlyAnomalies, 1, 10, alwaysReturnZero, playerWithSound);
  assert.equal(floorGenerator.generateFloor(9).hasAnomaly, true);
});

test("a single anomaly can repeat when it is the only one available", () => {
  const [onlyAnomaly] = createAnomalyCatalog();
  const floorGenerator = new FloorGenerator([onlyAnomaly], 1, 10, alwaysReturnZero);
  assert.equal(floorGenerator.generateFloor(9).activeAnomaly, onlyAnomaly);
  assert.equal(floorGenerator.generateFloor(8).activeAnomaly, onlyAnomaly);
});

test("only the out-of-tune chime needs sound to be noticed", () => {
  const soundOnlyIdentifiers = createAnomalyCatalog()
    .filter((anomaly) => anomaly.requiresSoundToNotice)
    .map((anomaly) => anomaly.anomalyIdentifier);
  assert.deepEqual(soundOnlyIdentifiers, ["elevator-chime-out-of-tune"]);
});
