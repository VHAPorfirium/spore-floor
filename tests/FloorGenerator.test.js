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
