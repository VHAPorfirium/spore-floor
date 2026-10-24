/**
 * Uma nota de manutenção por andar, sempre a mesma para o mesmo andar.
 * Lidas em ordem (do 10 ao 1), contam a história da infecção e dão dicas sobre as anomalias.
 */
const maintenanceLogTextByFloorNumber = Object.freeze({
  10: "MAINTENANCE LOG - DAY 1\nTenants report a sweet smell in the vents. Filters replaced. Nothing unusual.\n\nRule for the night shift: if anything on a floor is wrong, take the elevator. If nothing is wrong, take the stairs.",
  9: "DAY 3\nGrey dust on the ceiling lamps. It comes back an hour after cleaning. Ordered a stronger detergent.",
  8: "DAY 5\nThe hallway felt longer today. I counted the doors twice. Six. There are always six.",
  7: "DAY 8\nThe tenant in 704 stopped answering. Something soft is growing over the door numbers.",
  6: "DAY 11\nThe elevator chime sounded wrong this morning. Lower. Tired. I wrote it down so I would remember.",
  5: "DAY 13\nThe spores fall like snow in the lamp light. If they ever fall the other way, leave.",
  4: "DAY 16\nSomeone walks behind me when I walk. Stops when I stop. I no longer turn around.",
  3: "DAY 19\nThe building is testing us. It wants us to stop noticing. Keep noticing.",
  2: "DAY 22\nMy fingernails are green underneath. Two more floors. I can hear the street.",
  1: "DAY ??\nDon't trust the hallway. Trust what you remember. The door is right there.",
});

export function findMaintenanceLogTextForFloor(floorNumber) {
  return maintenanceLogTextByFloorNumber[floorNumber] ?? null;
}
