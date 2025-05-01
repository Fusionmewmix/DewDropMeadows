export class FishingSystem {
  constructor(scene) {
    this.scene = scene;
    this.collected = new Set();
  }

  reset() {
    this.collected.clear();
  }

  startFishing(callback) {
    this.points = 0;
    this.successInputs = [];
    const handler = (event) => {
      const key = event.key.toUpperCase();
      const last = this.successInputs[this.successInputs.length - 1];
      if ((key === 'Q' || key === 'E') && key !== last) {
        this.successInputs.push(key);
        this.points += 1;
      }
    };

    this.scene.input.keyboard.on('keydown', handler);
    this.scene.time.delayedCall(4000, () => {
      this.scene.input.keyboard.off('keydown', handler);
      const result = this.roll(this.points);
      if (result.type !== 'rock') this.collected.add(result.type);
      callback(result);
    });
  }

  roll(score) {
    let rng = Phaser.Math.Between(0, 100) + score * 5;
    if (rng > 95) return { type: 'fish3' };
    if (rng > 70) return { type: 'fish2' };
    if (rng > 40) return { type: 'fish1' };
    return { type: 'rock' };
  }

  hasWon() {
    return (
      this.collected.has('fish1') &&
      this.collected.has('fish2') &&
      this.collected.has('fish3')
    );
  }
}
