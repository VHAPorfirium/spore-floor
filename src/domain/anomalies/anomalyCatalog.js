import { SwappedDoorNumbersAnomaly } from "./SwappedDoorNumbersAnomaly.js";
import { UpsideDownPaintingAnomaly } from "./UpsideDownPaintingAnomaly.js";
import { ChangedExitSignTextAnomaly } from "./ChangedExitSignTextAnomaly.js";
import { MoldPatchOnWallAnomaly } from "./MoldPatchOnWallAnomaly.js";

/** Para adicionar uma anomalia nova, basta registrá-la aqui. */
export function createAnomalyCatalog() {
  return [
    new SwappedDoorNumbersAnomaly(),
    new UpsideDownPaintingAnomaly(),
    new ChangedExitSignTextAnomaly(),
    new MoldPatchOnWallAnomaly(),
  ];
}
