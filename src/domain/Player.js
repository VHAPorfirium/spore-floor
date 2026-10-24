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
    this.isWalking = walkingDirection !== 0;
    if (!this.isWalking) {
      return;
    }

    this.isFacingRight = walkingDirection > 0;
    this.walkingAnimationTimeInSeconds += elapsedSecondsSinceLastFrame;

    const nextPositionX = this.positionX + walkingDirection * walkingSpeedInPixelsPerSecond * elapsedSecondsSinceLastFrame;
    this.positionX = Math.min(this.maximumPositionX, Math.max(this.minimumPositionX, nextPositionX));
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
