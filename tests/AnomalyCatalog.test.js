import { test } from "node:test";
import assert from "node:assert/strict";
import { createAnomalyCatalog } from "../src/domain/anomalies/anomalyCatalog.js";
import { GameConfiguration } from "../src/domain/GameConfiguration.js";
import { createNormalHallwayLayout } from "../src/domain/HallwayLayout.js";

const minimumNumberOfAnomalies = 12;

test(`the catalog has at least ${minimumNumberOfAnomalies} anomalies`, () => {
  assert.ok(createAnomalyCatalog().length >= minimumNumberOfAnomalies);
});

test("every anomaly has a unique identifier", () => {
  const anomalyIdentifiers = createAnomalyCatalog().map((anomaly) => anomaly.anomalyIdentifier);
  assert.equal(new Set(anomalyIdentifiers).size, anomalyIdentifiers.length);
});

test("every anomaly has a focus position inside the hallway", () => {
  createAnomalyCatalog().forEach((anomaly) => {
    const isInsideHallway = anomaly.focusPositionX >= 0 && anomaly.focusPositionX <= GameConfiguration.hallwayLengthInPixels;
    assert.ok(isInsideHallway, `${anomaly.anomalyIdentifier} has focusPositionX ${anomaly.focusPositionX}`);
  });
});

test("applying an anomaly does not change the next normal hallway", () => {
  createAnomalyCatalog().forEach((anomaly) => {
    const hallwayLayoutWithAnomaly = createNormalHallwayLayout(5);
    anomaly.applyToHallwayLayout(hallwayLayoutWithAnomaly);
    assert.notDeepEqual(hallwayLayoutWithAnomaly, createNormalHallwayLayout(5), `${anomaly.anomalyIdentifier} leaked`);
  });
});
