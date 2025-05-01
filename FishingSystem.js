// FishingSystem.js (modular logic)
export default class FishingSystem {
  constructor(scene) {
    this.scene = scene;
    this.reset();
  }

  reset() {
    this.collected = new Set();
    this.fishTypes = ['fish1', 'fish2', 'fish3'];
    this.active = false;
    this.qeScore = 0;
  }

  hasWon() {
    return this.fishTypes.every(fish => this.collected.has(fish));
  }

  startFishing(callback) {
    if (this.active) return;
    this.active = true;
    this.qeScore = 0;

    const { char, time } = this.scene;
    char.setTexture('Char_throw');

    time.delayedCall(400, () => {
      char.setTexture('Char_throw2');
      time.delayedCall(300, () => {
        this.startIdleLoop(callback);
      });
    });
  }

  startIdleLoop(callback) {
    const { char, time, input } = this.scene;
    char.setTexture('Char_idle1');

    this.idleState = 0;
    this.idleLoop = time.addEvent({
      delay: 600,
      callback: () => {
        this.idleState = 1 - this.idleState;
        char.setTexture(this.idleState === 0 ? 'Char_idle1' : 'Char_idle2');
      },
      loop: true
    });

    this.keyListener = input.keyboard.on('keydown', (event) => {
      if (event.key.toLowerCase() === 'q' || event.key.toLowerCase() === 'e') {
        this.qeScore += 1;
      }
    });

    time.delayedCall(4000, () => {
      this.idleLoop.remove();
      input.keyboard.off('keydown', this.keyListener);
      this.resolveFishing(callback);
    });
  }

  resolveFishing(callback) {
    const { char, time } = this.scene;
    char.setTexture('Char_pull');

    time.delayedCall(500, () => {
      const result = this.determineResult();

      if (result.type === 'rock') {
        char.setTexture('Char_Broke1');
        time.delayedCall(500, () => {
          char.setTexture('Char_Broke2');
          time.delayedCall(1500, () => {
            char.setTexture('Char_Start');
            this.active = false;
          });
        });
      } else {
        char.setTexture('Char_Fish');
        this.collected.add(result.type);
        time.delayedCall(1000, () => {
          char.setTexture('Char_Start');
          this.active = false;
        });
      }

      callback(result);
    });
  }

  determineResult() {
    let score = this.qeScore;
    let rand = Math.random() * 100;

    if (score >= 5) rand -= 10;
    else if (score <= 2) rand += 15;

    if (rand < 50) return { type: 'fish1' };
    if (rand < 80) return { type: 'fish2' };
    if (rand < 95) return { type: 'fish3' };
    return { type: 'rock' };
  }
}
