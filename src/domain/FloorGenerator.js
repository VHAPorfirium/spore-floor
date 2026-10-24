import { FloorState } from "./FloorState.js";
import { createNormalHallwayLayout } from "./HallwayLayout.js";

const playerAlwaysHearsSound = () => true;

export class FloorGenerator {
  /**
   * canPlayerHearSound: função que diz se o jogador está com som agora.
   * Sem som, anomalias que só dá para ouvir não são sorteadas.
   */
  constructor(
    anomalyCatalog,
    chanceOfFloorHavingAnomaly,
    startingFloorNumber,
    generateRandomNumberBetweenZeroAndOne,
    canPlayerHearSound = playerAlwaysHearsSound,
  ) {
    this.anomalyCatalog = anomalyCatalog;
    this.chanceOfFloorHavingAnomaly = chanceOfFloorHavingAnomaly;
    this.startingFloorNumber = startingFloorNumber;
    this.generateRandomNumberBetweenZeroAndOne = generateRandomNumberBetweenZeroAndOne;
    this.canPlayerHearSound = canPlayerHearSound;
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

    const anomaliesThatCanBeChosen = this.listAnomaliesThatCanBeChosenNow();
    const hasNoAnomalyToChooseFrom = anomaliesThatCanBeChosen.length === 0;
    if (hasNoAnomalyToChooseFrom) {
      return null;
    }

    const floorShouldHaveAnomaly = this.generateRandomNumberBetweenZeroAndOne() < this.chanceOfFloorHavingAnomaly;
    if (!floorShouldHaveAnomaly) {
      return null;
    }

    const randomAnomalyIndex = Math.floor(this.generateRandomNumberBetweenZeroAndOne() * anomaliesThatCanBeChosen.length);
    const chosenAnomaly = anomaliesThatCanBeChosen[randomAnomalyIndex];
    this.previouslyChosenAnomaly = chosenAnomaly;
    return chosenAnomaly;
  }

  /**
   * Só anomalias que o jogador consegue perceber agora,
   * e sem repetir a do andar anterior (a não ser que ela seja a única possível).
   */
  listAnomaliesThatCanBeChosenNow() {
    const isPlayerHearingSound = this.canPlayerHearSound();
    const noticeableAnomalies = this.anomalyCatalog.filter(
      (anomaly) => isPlayerHearingSound || !anomaly.requiresSoundToNotice,
    );
    const anomaliesWithoutRepetition = noticeableAnomalies.filter((anomaly) => anomaly !== this.previouslyChosenAnomaly);
    return anomaliesWithoutRepetition.length > 0 ? anomaliesWithoutRepetition : noticeableAnomalies;
  }
}
