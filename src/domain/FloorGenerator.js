import { FloorState } from "./FloorState.js";
import { createNormalHallwayLayout } from "./HallwayLayout.js";

export class FloorGenerator {
  constructor(anomalyCatalog, chanceOfFloorHavingAnomaly, startingFloorNumber, generateRandomNumberBetweenZeroAndOne) {
    this.anomalyCatalog = anomalyCatalog;
    this.chanceOfFloorHavingAnomaly = chanceOfFloorHavingAnomaly;
    this.startingFloorNumber = startingFloorNumber;
    this.generateRandomNumberBetweenZeroAndOne = generateRandomNumberBetweenZeroAndOne;
    this.previouslyChosenAnomaly = null;
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

    const hasNoAnomalyToChooseFrom = this.anomalyCatalog.length === 0;
    if (hasNoAnomalyToChooseFrom) {
      return null;
    }

    const floorShouldHaveAnomaly = this.generateRandomNumberBetweenZeroAndOne() < this.chanceOfFloorHavingAnomaly;
    if (!floorShouldHaveAnomaly) {
      return null;
    }

    const anomaliesThatCanBeChosen = this.listAnomaliesThatCanBeChosenNow();
    const randomAnomalyIndex = Math.floor(this.generateRandomNumberBetweenZeroAndOne() * anomaliesThatCanBeChosen.length);
    const chosenAnomaly = anomaliesThatCanBeChosen[randomAnomalyIndex];
    this.previouslyChosenAnomaly = chosenAnomaly;
    return chosenAnomaly;
  }

  /** Evita a mesma anomalia duas vezes seguidas, para o jogador não sentir que o jogo travou. */
  listAnomaliesThatCanBeChosenNow() {
    const hasOnlyOneAnomaly = this.anomalyCatalog.length <= 1;
    if (hasOnlyOneAnomaly) {
      return this.anomalyCatalog;
    }
    return this.anomalyCatalog.filter((anomaly) => anomaly !== this.previouslyChosenAnomaly);
  }
}
