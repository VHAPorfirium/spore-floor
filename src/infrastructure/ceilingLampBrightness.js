import { CeilingLampFlickerPattern } from "../domain/CeilingLampFlickerPattern.js";

const steadyHumFrequency = 50;
const steadyHumIntensity = 0.03;

/** Soma de senos com frequências "quebradas": nunca repete um ritmo fácil de prever. */
const irregularFlickerFrequencies = [2.3, 5.7, 11.1];
const irregularFlickerPhases = [0, 1.3, 0.4];
const irregularFlickerThresholdToTurnOff = 1.6;
const brightnessWhileMomentarilyOff = 0.2;

/** Retorna o brilho da lâmpada de 0 (apagada) a 1 (acesa). Usado pela luminária e pela máscara de luz. */
export function calculateCeilingLampBrightness(ceilingLamp, elapsedTimeInSeconds) {
  if (ceilingLamp.flickerPattern === CeilingLampFlickerPattern.irregularFlicker) {
    return calculateIrregularFlickerBrightness(elapsedTimeInSeconds);
  }
  return 1 - steadyHumIntensity + Math.sin(elapsedTimeInSeconds * steadyHumFrequency) * steadyHumIntensity;
}

function calculateIrregularFlickerBrightness(elapsedTimeInSeconds) {
  const flickerSignal = irregularFlickerFrequencies.reduce(
    (signalSum, frequency, frequencyIndex) =>
      signalSum + Math.sin(elapsedTimeInSeconds * frequency + irregularFlickerPhases[frequencyIndex]),
    0,
  );
  const isLampMomentarilyOff = flickerSignal > irregularFlickerThresholdToTurnOff;
  return isLampMomentarilyOff ? brightnessWhileMomentarilyOff : 1;
}
