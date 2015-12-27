import dotenv from 'dotenv';
dotenv.load();
import fs from 'fs';
import Server from 'socket.io';
import Emulator from './emulator';

if (!process.env.PORT) {
  console.log('Please specify PORT in ENV');
  process.exit(1);
}
if (!process.env.ROM_FILE) {
  console.log('Please specify ROM_FILE in ENV');
  process.exit(1);
}

const io = new Server().attach(process.env.PORT);
const rom = fs.readFileSync(process.env.ROM_FILE);

console.log('listening');

io.on('connection', (socket) => {
  console.log('someone connected');
  socket.on('disconnect', () => {
    console.log('someone disconnected');
  });
  socket.on('message', (user, message) => {
    console.log("Message received from " + user.name + ": " + message);
    socket.broadcast.emit('remote message', user, message);
  });
});

let emu;

function load() {
  emu = new Emulator();

  emu.on('error', () => {
    emu.destroy();
    setTimeout(load, 1000);
  });

  emu.on('frame', (frame) => {
    io.emit('frame', frame.toString('base64'));
  });

  emu.startWithRom(rom);
  emu.run();
}

load();
