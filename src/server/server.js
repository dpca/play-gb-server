import express from 'express';

const app = express();

app.get('/', function(req, res) {
  res.send('Hello world');
});

var server = app.listen(3000, function() {
  console.log("App listening on *:3000");
});
