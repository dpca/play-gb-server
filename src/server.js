import dotenv from 'dotenv';
dotenv.load();
import fs from 'fs';
import Server from 'socket.io';
import Emulator from './emulator';
import { MOVES } from './moves';
import redis from './redis';
import crypto from 'crypto';
import msgpack from 'msgpack-lite';

if (!process.env.PORT) {
  console.log('Please specify PORT in ENV');
  process.exit(1);
}
if (!process.env.ROM_FILE) {
  console.log('Please specify ROM_FILE in ENV');
  process.exit(1);
}

const io = new Server().attach(process.env.PORT);
const md5 = crypto.createHash('md5');

const rom = fs.readFileSync(process.env.ROM_FILE);
const hash = md5.update(rom).digest('hex');

let emu = new Emulator();

function load() {
  emu.on('error', () => {
    console.log(new Date + ' error - restarting');
    emu.destroy();
    setTimeout(load, 1000);
  });

  emu.on('frame', (frame) => {
    io.emit('frame', frame.toString('base64'));
  });

  redis.get('gameState:' + hash, (err, state) => {
    if (err) throw err;
    if (state) {
      console.log('Starting emulator with state');
      emu.startWithState(JSON.parse(state));
    } else {
      console.log('Starting emulator from rom');
      emu.startWithRom(rom);
    }
    emu.run();
    save();
  });

  function save() {
    setTimeout(() => {
      let snap = emu.snapshot();
      if (snap) {
        redis.set('gameState:' + hash, JSON.stringify(snap))
        console.log(new Date + ' - game saved!');
        save()
      }
    }, 60000)
  }
}

console.log('Server started on port 8080');

io.on('connection', (socket) => {
  console.log('Someone connected');
  socket.on('disconnect', () => {
    console.log('Someone disconnected');
  });
  socket.on('message', (user, message) => {
    console.log("Message received from " + user.name + ": " + message);
    const move = message.trim().toLowerCase();
    const key = MOVES[move];
    if (key != null) emu.move(key);
    socket.broadcast.emit('remote message', user, message);
  });
});

load();
