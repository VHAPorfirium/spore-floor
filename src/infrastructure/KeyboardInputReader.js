const keysThatWalkLeft = ["ArrowLeft", "KeyA"];
const keysThatWalkRight = ["ArrowRight", "KeyD"];
const keysThatInteract = ["KeyE", "Space", "Enter"];
const keysThatToggleMute = ["KeyM"];
const keysThatSavePlaytestLog = ["KeyL"];
const allGameKeys = [...keysThatWalkLeft, ...keysThatWalkRight, ...keysThatInteract, ...keysThatToggleMute, ...keysThatSavePlaytestLog];

export class KeyboardInputReader {
  constructor(eventTarget) {
    this.currentlyPressedKeyCodes = new Set();
    this.wasInteractKeyPressedSinceLastRead = false;
    this.wasMuteKeyPressedSinceLastRead = false;
    this.wasSavePlaytestLogKeyPressedSinceLastRead = false;

    eventTarget.addEventListener("keydown", (keyboardEvent) => this.handleKeyDown(keyboardEvent));
    eventTarget.addEventListener("keyup", (keyboardEvent) => this.handleKeyUp(keyboardEvent));
    eventTarget.addEventListener("blur", () => this.currentlyPressedKeyCodes.clear());
  }

  handleKeyDown(keyboardEvent) {
    if (allGameKeys.includes(keyboardEvent.code)) {
      keyboardEvent.preventDefault();
    }

    const isFirstPress = !keyboardEvent.repeat;
    if (isFirstPress && keysThatInteract.includes(keyboardEvent.code)) {
      this.wasInteractKeyPressedSinceLastRead = true;
    }
    if (isFirstPress && keysThatToggleMute.includes(keyboardEvent.code)) {
      this.wasMuteKeyPressedSinceLastRead = true;
    }
    if (isFirstPress && keysThatSavePlaytestLog.includes(keyboardEvent.code)) {
      this.wasSavePlaytestLogKeyPressedSinceLastRead = true;
    }

    this.currentlyPressedKeyCodes.add(keyboardEvent.code);
  }

  handleKeyUp(keyboardEvent) {
    this.currentlyPressedKeyCodes.delete(keyboardEvent.code);
  }

  isAnyKeyPressed(keyCodes) {
    return keyCodes.some((keyCode) => this.currentlyPressedKeyCodes.has(keyCode));
  }

  /** Lê o estado atual das teclas. Os "acabou de apertar" são consumidos na leitura. */
  readPlayerInputState() {
    const isWalkingLeft = this.isAnyKeyPressed(keysThatWalkLeft);
    const isWalkingRight = this.isAnyKeyPressed(keysThatWalkRight);
    const walkingDirection = Number(isWalkingRight) - Number(isWalkingLeft);

    const playerInputState = {
      walkingDirection,
      wasInteractKeyJustPressed: this.wasInteractKeyPressedSinceLastRead,
      wasMuteKeyJustPressed: this.wasMuteKeyPressedSinceLastRead,
      wasSavePlaytestLogKeyJustPressed: this.wasSavePlaytestLogKeyPressedSinceLastRead,
    };
    this.wasInteractKeyPressedSinceLastRead = false;
    this.wasMuteKeyPressedSinceLastRead = false;
    this.wasSavePlaytestLogKeyPressedSinceLastRead = false;
    return playerInputState;
  }
}
