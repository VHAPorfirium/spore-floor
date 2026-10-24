/**
 * Todos os sons do jogo são gerados na hora com a Web Audio API (osciladores e ruído).
 * Assim não há arquivos de áudio para baixar nem licenças para creditar.
 */
const silentGain = 0.0001;
/** O filtro tira boa parte da energia do ruído; este ganho devolve o volume perdido. */
const filteredNoiseLoudnessCompensation = 6;

const chimeFirstNoteFrequency = 659.25;
const chimeSecondNoteFrequency = 523.25;
const chimeSecondNoteDelayInSeconds = 0.45;
const outOfTuneDetuneInCents = -150;

export class ProceduralSoundEffects {
  constructor(audioContext, outputNode) {
    this.audioContext = audioContext;
    this.outputNode = outputNode;
    this.whiteNoiseBuffer = this.createWhiteNoiseBuffer();
  }

  createWhiteNoiseBuffer() {
    const durationInSeconds = 2;
    const lengthInSamples = this.audioContext.sampleRate * durationInSeconds;
    const noiseBuffer = this.audioContext.createBuffer(1, lengthInSamples, this.audioContext.sampleRate);
    const noiseSamples = noiseBuffer.getChannelData(0);
    for (let sampleIndex = 0; sampleIndex < lengthInSamples; sampleIndex++) {
      noiseSamples[sampleIndex] = Math.random() * 2 - 1;
    }
    return noiseBuffer;
  }

  /** Envelope curto: sobe rápido até o volume e cai até o silêncio. */
  createDecayingGain(startTime, peakVolume, attackInSeconds, decayInSeconds) {
    const envelopeGain = this.audioContext.createGain();
    envelopeGain.gain.setValueAtTime(silentGain, startTime);
    envelopeGain.gain.exponentialRampToValueAtTime(peakVolume, startTime + attackInSeconds);
    envelopeGain.gain.exponentialRampToValueAtTime(silentGain, startTime + attackInSeconds + decayInSeconds);
    return envelopeGain;
  }

  playFilteredNoiseBurst({ startDelayInSeconds = 0, volume, filterType, filterFrequency, attackInSeconds, decayInSeconds, stereoPan = 0 }) {
    const startTime = this.audioContext.currentTime + startDelayInSeconds;
    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = this.whiteNoiseBuffer;
    // O ruído tem 2 segundos; em loop ele serve para sons mais longos (como o vento).
    noiseSource.loop = true;

    const noiseFilter = this.audioContext.createBiquadFilter();
    noiseFilter.type = filterType;
    noiseFilter.frequency.value = filterFrequency;

    const envelopeGain = this.createDecayingGain(startTime, volume * filteredNoiseLoudnessCompensation, attackInSeconds, decayInSeconds);
    const stereoPanner = this.audioContext.createStereoPanner();
    stereoPanner.pan.value = stereoPan;

    noiseSource.connect(noiseFilter).connect(envelopeGain).connect(stereoPanner).connect(this.outputNode);
    const randomOffsetInsideNoiseInSeconds = Math.random() * 1.5;
    noiseSource.start(startTime, randomOffsetInsideNoiseInSeconds, attackInSeconds + decayInSeconds + 0.05);
  }

  playFootstep({ volume, stereoPan = 0, startDelayInSeconds = 0 }) {
    this.playFilteredNoiseBurst({
      startDelayInSeconds,
      volume,
      stereoPan,
      filterType: "lowpass",
      filterFrequency: 340 + Math.random() * 140,
      attackInSeconds: 0.008,
      decayInSeconds: 0.15,
    });
  }

  playTone({ frequency, waveform, volume, startDelayInSeconds = 0, attackInSeconds, decayInSeconds, detuneInCents = 0 }) {
    const startTime = this.audioContext.currentTime + startDelayInSeconds;
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = waveform;
    oscillator.frequency.value = frequency;
    oscillator.detune.value = detuneInCents;

    const envelopeGain = this.createDecayingGain(startTime, volume, attackInSeconds, decayInSeconds);
    oscillator.connect(envelopeGain).connect(this.outputNode);
    oscillator.start(startTime);
    oscillator.stop(startTime + attackInSeconds + decayInSeconds + 0.05);
  }

  /** "Ding-dong" de chegada. Desafinado, a segunda nota fica estranhamente baixa. */
  playElevatorChime(isOutOfTune) {
    const secondNoteDetuneInCents = isOutOfTune ? outOfTuneDetuneInCents : 0;
    this.playChimeNote(chimeFirstNoteFrequency, 0, 0);
    this.playChimeNote(chimeSecondNoteFrequency, chimeSecondNoteDelayInSeconds, secondNoteDetuneInCents);
  }

  playChimeNote(frequency, startDelayInSeconds, detuneInCents) {
    const sharedNoteSettings = { startDelayInSeconds, detuneInCents, attackInSeconds: 0.01, decayInSeconds: 1.4 };
    this.playTone({ ...sharedNoteSettings, frequency, waveform: "sine", volume: 0.16 });
    this.playTone({ ...sharedNoteSettings, frequency: frequency * 2, waveform: "sine", volume: 0.03 });
  }

  playElevatorDeparture() {
    this.playFilteredNoiseBurst({ volume: 0.25, filterType: "lowpass", filterFrequency: 140, attackInSeconds: 0.3, decayInSeconds: 1.2 });
  }

  playStairwellDoor() {
    this.playFilteredNoiseBurst({ volume: 0.35, filterType: "lowpass", filterFrequency: 220, attackInSeconds: 0.01, decayInSeconds: 0.4 });
    this.playTone({ frequency: 130, waveform: "sawtooth", volume: 0.025, attackInSeconds: 0.08, decayInSeconds: 0.5 });
  }

  /** Grave e dissonante: o jogador errou e "algo o seguiu". */
  playWrongDecisionSting() {
    const stingSettings = { waveform: "sawtooth", volume: 0.06, startDelayInSeconds: 0.35, attackInSeconds: 0.6, decayInSeconds: 1.2 };
    this.playTone({ ...stingSettings, frequency: 55 });
    this.playTone({ ...stingSettings, frequency: 58.3 });
  }

  playEscapeWind() {
    this.playFilteredNoiseBurst({ volume: 0.2, filterType: "bandpass", filterFrequency: 520, attackInSeconds: 1.5, decayInSeconds: 3.5 });
  }

  /** Som contínuo com volume ajustável. Começa mudo. */
  createSustainedSound(connectSourcesToGain) {
    const volumeGain = this.audioContext.createGain();
    volumeGain.gain.value = 0;
    volumeGain.connect(this.outputNode);
    connectSourcesToGain(volumeGain);

    const volumeSmoothingTimeInSeconds = 0.08;
    return {
      setVolume: (volume) => volumeGain.gain.setTargetAtTime(volume, this.audioContext.currentTime, volumeSmoothingTimeInSeconds),
    };
  }

  /** Zumbido elétrico das lâmpadas fluorescentes (50 Hz e harmônico de 100 Hz). */
  createFluorescentLampHum() {
    return this.createSustainedSound((volumeGain) => {
      const lowpassFilter = this.audioContext.createBiquadFilter();
      lowpassFilter.type = "lowpass";
      lowpassFilter.frequency.value = 420;
      lowpassFilter.connect(volumeGain);

      [{ frequency: 50, waveform: "sine" }, { frequency: 100, waveform: "sawtooth" }].forEach(({ frequency, waveform }) => {
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = waveform;
        oscillator.frequency.value = frequency;
        oscillator.connect(lowpassFilter);
        oscillator.start();
      });
    });
  }

  /** Ar pesado do prédio: ruído grave que cresce com a infecção. */
  createInfectionDrone() {
    return this.createSustainedSound((volumeGain) => {
      const noiseSource = this.audioContext.createBufferSource();
      noiseSource.buffer = this.whiteNoiseBuffer;
      noiseSource.loop = true;

      const bandpassFilter = this.audioContext.createBiquadFilter();
      bandpassFilter.type = "bandpass";
      bandpassFilter.frequency.value = 160;
      bandpassFilter.Q.value = 0.9;

      const lowRumble = this.audioContext.createOscillator();
      lowRumble.type = "sine";
      lowRumble.frequency.value = 41;
      const lowRumbleGain = this.audioContext.createGain();
      lowRumbleGain.gain.value = 0.5;

      noiseSource.connect(bandpassFilter).connect(volumeGain);
      lowRumble.connect(lowRumbleGain).connect(volumeGain);
      noiseSource.start();
      lowRumble.start();
    });
  }
}
