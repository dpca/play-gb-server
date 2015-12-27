import Gameboy from 'gameboy';
import Canvas from 'canvas';
import EventEmitter from 'events';

export default class Emulator extends EventEmitter {
  constructor() {
    super();
    this.canvas = new Canvas(160, 144);
    this.gameboyOpts = { drawEvents: true };
  }

  startWithRom(rom) {
    this.gameboy = Gameboy(this.canvas, rom, this.gameboyOpts);
    this.gameboy.start();
  }

  startWithState(state) {
    this.gameboy = Gameboy(this.canvas, '', this.gameboyOpts);
    this.gameboy.returnFromState(state);
  }

  run() {
    let gb = this.gameboy;
    gb.stopEmulator = 1;
    this.loop = setInterval(gb.run.bind(gb), 8);
    gb.on('draw', () => {
      this.canvas.toBuffer((err, buf) => {
        if (err) {
          throw err;
        } else {
          this.emit('frame', buf);
        }
      });
    });
    this.running = true;
  }

  snapshot() {
    if (!this.running) return;
    return this.gameboy.saveState();
  }

  move(key) {
    if (!this.running) return this;
    if (key >= 0 && key < 8) {
      let gb = this.gameboy;
      gb.JoyPadEvent(key, true);
      setTimeout(() => {
        gb.JoyPadEvent(key, false);
      }, 50);
    }
    return this;
  }

  destroy() {
    if (this.destroyed) return this;
    clearInterval(this.loop);
    this.gameboy.JoyPadEvent = () => {};
    this.destroyed = true;
    this.running = false;
    this.canvas = null
    this.gameboy = null;
    return this;
  }
}
