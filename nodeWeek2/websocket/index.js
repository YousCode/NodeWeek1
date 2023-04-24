const express = require('express');
const app = express();
const port = 9000;
const socket = require('socket.io');

// Servir les fichiers statiques dans le dossier "public"
app.use(express.static('public'));

app.set('view engine', 'pug');

app.get('/pug', (req, res) => {
  res.render('index', { title: 'Hey', message: 'Hello there!' });
});

const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const io = socket(server);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('chat message', (message) => {
    console.log(`Received message: ${message}`);
    io.emit('chat message', message);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});
