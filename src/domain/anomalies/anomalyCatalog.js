import { SwappedDoorNumbersAnomaly } from "./SwappedDoorNumbersAnomaly.js";
import { UpsideDownPaintingAnomaly } from "./UpsideDownPaintingAnomaly.js";
import { ChangedExitSignTextAnomaly } from "./ChangedExitSignTextAnomaly.js";
import { MoldPatchOnWallAnomaly } from "./MoldPatchOnWallAnomaly.js";
import { FungusCoveringDoorNumberAnomaly } from "./FungusCoveringDoorNumberAnomaly.js";
import { LampFlickeringOutOfRhythmAnomaly } from "./LampFlickeringOutOfRhythmAnomaly.js";
import { SporesDriftingUpwardAnomaly } from "./SporesDriftingUpwardAnomaly.js";
import { FootstepsBehindPlayerAnomaly } from "./FootstepsBehindPlayerAnomaly.js";
import { ElevatorIndicatorGlowsGreenAnomaly } from "./ElevatorIndicatorGlowsGreenAnomaly.js";
import { ElevatorChimeOutOfTuneAnomaly } from "./ElevatorChimeOutOfTuneAnomaly.js";
import { MissingApartmentDoorAnomaly } from "./MissingApartmentDoorAnomaly.js";
import { PaintingSunMissingAnomaly } from "./PaintingSunMissingAnomaly.js";
import { InfectedFigureAtHallwayEndAnomaly } from "./InfectedFigureAtHallwayEndAnomaly.js";

/** Para adicionar uma anomalia nova, basta registrá-la aqui. */
export function createAnomalyCatalog() {
  return [
    // Clássicas (estilo Exit 8)
    new SwappedDoorNumbersAnomaly(),
    new UpsideDownPaintingAnomaly(),
    new ChangedExitSignTextAnomaly(),
    new ElevatorIndicatorGlowsGreenAnomaly(),
    new MissingApartmentDoorAnomaly(),
    new PaintingSunMissingAnomaly(),
    // Ligadas à infecção por esporos
    new MoldPatchOnWallAnomaly(),
    new FungusCoveringDoorNumberAnomaly(),
    new LampFlickeringOutOfRhythmAnomaly(),
    new SporesDriftingUpwardAnomaly(),
    new FootstepsBehindPlayerAnomaly(),
    new InfectedFigureAtHallwayEndAnomaly(),
    // Só de áudio
    new ElevatorChimeOutOfTuneAnomaly(),
  ];
}
