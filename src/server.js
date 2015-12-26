import Server from 'socket.io';

const io = new Server().attach(8080);

console.log('listening');

io.on('connection', (socket) => {
  console.log('someone connected');
  socket.on('disconnect', () => {
    console.log('someone disconnected');
  });
});
