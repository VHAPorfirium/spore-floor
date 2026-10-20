export class FloorState {
  constructor(floorNumber, hallwayLayout, activeAnomaly) {
    this.floorNumber = floorNumber;
    this.hallwayLayout = hallwayLayout;
    this.activeAnomaly = activeAnomaly;
  }

  get hasAnomaly() {
    return this.activeAnomaly !== null;
  }
}
