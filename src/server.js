import dotenv from 'dotenv';
dotenv.load();

import fs from 'fs';
import crypto from 'crypto';
import Server from 'socket.io';
import Emulator from './emulator';
import { MOVES } from './moves';
import redis from './redis';

if (!process.env.ROM_FILE) {
  console.log('Please specify ROM_FILE in ENV');
  process.exit(1);
}

const port = process.env.PORT || '8090';
const io = new Server().attach(port);
const md5 = crypto.createHash('md5');

const rom = fs.readFileSync(process.env.ROM_FILE);
const hash = md5.update(rom).digest('hex');

let emu = new Emulator();
let count = 0;

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
        redis.set('gameState:' + hash, JSON.stringify(snap));
        console.log(new Date + ' - game saved!');
        save();
      }
    }, 60000)
  }
}

io.on('connection', (socket) => {
  count += 1;
  io.emit('player count', count);
  console.log('Someone connected, that makes ' + count);

  socket.on('disconnect', () => {
    count -= 1;
    io.emit('player count', count);
    console.log('Someone disconnected, that makes ' + count);
  });

  emu.getFrame((frame) => {
    socket.emit('frame', frame.toString('base64'));
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
console.log('Server started on port ' + port);
