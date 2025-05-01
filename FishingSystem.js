<script type="module">
  class FishingSystem {
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
      const keys = this.scene.input.keyboard.addKeys('Q,E');
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
      return this.collected.has('fish1') && this.collected.has('fish2') && this.collected.has('fish3');
    }
  }

  let fishing;

  class NextScene extends Phaser.Scene {
    constructor() {
      super('NextScene');
    }

    create() {
      fishing = new FishingSystem(this);
      const cx = this.cameras.main.centerX;
      const cy = this.cameras.main.centerY;

      this.add.image(cx, cy, 'BG1').setDisplaySize(1920, 1080).setDepth(1);
      this.char = this.add.image(cx, cy, 'Char_Start').setDepth(9).setScale(1);

      this.input.once('pointerdown', () => {
        this.startFishingSequence();
      });
    }

    startFishingSequence() {
      const cx = this.cameras.main.centerX;
      const cy = this.cameras.main.centerY;

      const sequence = [
        { frame: 'Char_throw', delay: 300 },
        { frame: 'Char_throw2', delay: 300 },
        { frame: 'Char_idle1', delay: 0 }
      ];

      let index = 0;
      const playNext = () => {
        if (index < sequence.length) {
          this.char.setTexture(sequence[index].frame);
          this.time.delayedCall(sequence[index].delay, playNext);
          index++;
        } else {
          this.beginIdleAndFishingLogic();
        }
      };
      playNext();
    }

    beginIdleAndFishingLogic() {
      this.idleState = 0;
      const idleLoop = this.time.addEvent({
        delay: 600,
        callback: () => {
          this.idleState = 1 - this.idleState;
          this.char.setTexture(this.idleState === 0 ? 'Char_idle1' : 'Char_idle2');
        },
        loop: true
      });

      fishing.startFishing((result) => {
        idleLoop.remove();
        this.char.setTexture('Char_pull');

        this.time.delayedCall(600, () => {
          if (result.type === 'rock') {
            this.playRockBreak();
          } else {
            this.char.setTexture('Char_Fish');
            this.time.delayedCall(1000, () => {
              this.char.setTexture('Char_Start');
              if (fishing.hasWon()) {
                console.log("You collected all fish! 🎉");
              }
            });
          }
        });
      });
    }

    playRockBreak() {
      let toggle = false;
      const rockLoop = this.time.addEvent({
        delay: 400,
        callback: () => {
          this.char.setTexture(toggle ? 'Char_Broke1' : 'Char_Broke2');
          toggle = !toggle;
        },
        repeat: 4
      });

      this.time.delayedCall(2000, () => {
        rockLoop.remove();
        this.char.setTexture('Char_Start');
      });
    }
  }

  const config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    backgroundColor: '#000000',
    scene: [NextScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    audio: { disableWebAudio: false }
  };

  new Phaser.Game(config);
</script>
