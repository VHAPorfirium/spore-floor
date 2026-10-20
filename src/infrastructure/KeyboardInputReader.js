const keysThatWalkLeft = ["ArrowLeft", "KeyA"];
const keysThatWalkRight = ["ArrowRight", "KeyD"];
const keysThatInteract = ["KeyE", "Space", "Enter"];

export class KeyboardInputReader {
  constructor(eventTarget) {
    this.currentlyPressedKeyCodes = new Set();
    this.wasInteractKeyPressedSinceLastRead = false;

    eventTarget.addEventListener("keydown", (keyboardEvent) => this.handleKeyDown(keyboardEvent));
    eventTarget.addEventListener("keyup", (keyboardEvent) => this.handleKeyUp(keyboardEvent));
    eventTarget.addEventListener("blur", () => this.currentlyPressedKeyCodes.clear());
  }

  handleKeyDown(keyboardEvent) {
    const isGameKey = [...keysThatWalkLeft, ...keysThatWalkRight, ...keysThatInteract].includes(keyboardEvent.code);
    if (isGameKey) {
      keyboardEvent.preventDefault();
    }

    const isFirstPressOfInteractKey = keysThatInteract.includes(keyboardEvent.code) && !keyboardEvent.repeat;
    if (isFirstPressOfInteractKey) {
      this.wasInteractKeyPressedSinceLastRead = true;
    }

    this.currentlyPressedKeyCodes.add(keyboardEvent.code);
  }

  handleKeyUp(keyboardEvent) {
    this.currentlyPressedKeyCodes.delete(keyboardEvent.code);
  }

  isAnyKeyPressed(keyCodes) {
    return keyCodes.some((keyCode) => this.currentlyPressedKeyCodes.has(keyCode));
  }

  /** Lê o estado atual das teclas. O "acabou de apertar interagir" é consumido na leitura. */
  readPlayerInputState() {
    const isWalkingLeft = this.isAnyKeyPressed(keysThatWalkLeft);
    const isWalkingRight = this.isAnyKeyPressed(keysThatWalkRight);
    const walkingDirection = Number(isWalkingRight) - Number(isWalkingLeft);

    const wasInteractKeyJustPressed = this.wasInteractKeyPressedSinceLastRead;
    this.wasInteractKeyPressedSinceLastRead = false;

    return { walkingDirection, wasInteractKeyJustPressed };
  }
}
