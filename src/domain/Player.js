export class Player {
  constructor(initialPositionX, minimumPositionX, maximumPositionX) {
    this.positionX = initialPositionX;
    this.minimumPositionX = minimumPositionX;
    this.maximumPositionX = maximumPositionX;
    this.isFacingRight = true;
    this.isWalking = false;
    this.walkingAnimationTimeInSeconds = 0;
  }

  walk(walkingDirection, walkingSpeedInPixelsPerSecond, elapsedSecondsSinceLastFrame) {
    const isTryingToWalk = walkingDirection !== 0;
    if (!isTryingToWalk) {
      this.isWalking = false;
      return;
    }

    this.isFacingRight = walkingDirection > 0;
    const desiredPositionX = this.positionX + walkingDirection * walkingSpeedInPixelsPerSecond * elapsedSecondsSinceLastFrame;
    const nextPositionX = Math.min(this.maximumPositionX, Math.max(this.minimumPositionX, desiredPositionX));

    // Empurrando a parede o jogador vira para o lado, mas não anda (nem mexe as pernas, nem faz som de passo).
    this.isWalking = nextPositionX !== this.positionX;
    if (!this.isWalking) {
      return;
    }

    this.walkingAnimationTimeInSeconds += elapsedSecondsSinceLastFrame;
    this.positionX = nextPositionX;
  }

  stopWalking() {
    this.isWalking = false;
  }

  teleportTo(positionX) {
    this.positionX = positionX;
    this.isFacingRight = true;
    this.isWalking = false;
  }

  isNear(targetPositionX, maximumDistanceInPixels) {
    return Math.abs(this.positionX - targetPositionX) <= maximumDistanceInPixels;
  }

  /** Quantos passos o jogador já deu. Usado para sincronizar o som dos passos com as pernas. */
  countStepsTaken(stepDurationInSeconds) {
    return Math.floor(this.walkingAnimationTimeInSeconds / stepDurationInSeconds);
  }
}
