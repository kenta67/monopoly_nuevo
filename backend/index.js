const express = require('express');
const { createServer } = require('http');
const { Server } = require('colyseus');
const { monitor } = require('@colyseus/monitor');
const cors = require('cors');
const { GameRoom } = require('./src/rooms/GameRoom');

const port = process.env.PORT || 2567;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Crear servidor HTTP y servidor Colyseus
const gameServer = new Server({
  server: createServer(app),
  express: app
});

// Registrar la sala del juego
gameServer.define('game_room', GameRoom);

// Ruta para el monitor de Colyseus
app.use('/colyseus', monitor());

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Ruta principal - información del servidor
app.get('/', (req, res) => {
  res.json({
    name: 'Monopoly Server',
    version: '1.0.0',
    status: 'running',
    rooms: gameServer.roomCount || 0,
    endpoints: {
      websocket: `ws://${req.headers.host}`,
      health: '/health',
      monitor: '/colyseus'
    }
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Iniciar servidor
gameServer.listen(port);
console.log(`Servidor ejecutándose en puerto ${port}`);
console.log(`Monitor disponible en: http://localhost:${port}/colyseus`);