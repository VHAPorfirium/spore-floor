import { FloorState } from "./FloorState.js";
import { createNormalHallwayLayout } from "./HallwayLayout.js";

export class FloorGenerator {
  constructor(anomalyCatalog, chanceOfFloorHavingAnomaly, startingFloorNumber, generateRandomNumberBetweenZeroAndOne) {
    this.anomalyCatalog = anomalyCatalog;
    this.chanceOfFloorHavingAnomaly = chanceOfFloorHavingAnomaly;
    this.startingFloorNumber = startingFloorNumber;
    this.generateRandomNumberBetweenZeroAndOne = generateRandomNumberBetweenZeroAndOne;
  }

  generateFloor(floorNumber) {
    const hallwayLayout = createNormalHallwayLayout(floorNumber);
    const activeAnomaly = this.chooseAnomalyForFloor(floorNumber);

    if (activeAnomaly !== null) {
      activeAnomaly.applyToHallwayLayout(hallwayLayout);
    }

    return new FloorState(floorNumber, hallwayLayout, activeAnomaly);
  }

  chooseAnomalyForFloor(floorNumber) {
    const isStartingFloor = floorNumber === this.startingFloorNumber;
    if (isStartingFloor) {
      return null;
    }

    const floorShouldHaveAnomaly = this.generateRandomNumberBetweenZeroAndOne() < this.chanceOfFloorHavingAnomaly;
    if (!floorShouldHaveAnomaly) {
      return null;
    }

    const randomAnomalyIndex = Math.floor(this.generateRandomNumberBetweenZeroAndOne() * this.anomalyCatalog.length);
    return this.anomalyCatalog[randomAnomalyIndex];
  }
}
