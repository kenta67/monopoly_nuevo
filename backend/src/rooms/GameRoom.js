const { Room, Client } = require('colyseus');
const { Schema, MapSchema, type } = require('@colyseus/schema');

// Esquema para el jugador
class Player extends Schema {
  constructor() {
    super();
    this.id = "";
    this.name = "";
    this.character = "";
    this.position = 0;
    this.money = 1500;
    this.properties = [];
    this.inJail = false;
    this.jailTurns = 0;
    this.connected = true;
  }
}
type("string")(Player.prototype, "id");
type("string")(Player.prototype, "name");
type("string")(Player.prototype, "character");
type("number")(Player.prototype, "position");
type("number")(Player.prototype, "money");
type(["string"])(Player.prototype, "properties");
type("boolean")(Player.prototype, "inJail");
type("number")(Player.prototype, "jailTurns");
type("boolean")(Player.prototype, "connected");

// Esquema para la propiedad
class Property extends Schema {
  constructor() {
    super();
    this.id = 0;
    this.name = "";
    this.type = "";
    this.color = "";
    this.price = 0;
    this.rent = 0;
    this.owner = null;
  }
}
type("number")(Property.prototype, "id");
type("string")(Property.prototype, "name");
type("string")(Property.prototype, "type");
type("string")(Property.prototype, "color");
type("number")(Property.prototype, "price");
type("number")(Property.prototype, "rent");
type("string")(Property.prototype, "owner");

// Esquema para el estado del juego
class GameState extends Schema {
  constructor() {
    super();
    this.players = new MapSchema();
    this.board = new MapSchema();
    this.currentPlayer = "";
    this.dice = { die1: 0, die2: 0 };
    this.gameStarted = false;
    this.gameOver = false;
    this.winner = "";
  }
}
type({ map: Player })(GameState.prototype, "players");
type({ map: Property })(GameState.prototype, "board");
type("string")(GameState.prototype, "currentPlayer");
type("string")(GameState.prototype, "winner");
type("boolean")(GameState.prototype, "gameStarted");
type("boolean")(GameState.prototype, "gameOver");

// Definición del tablero
const BOARD = [
  { id: 0, name: "SALIDA", type: "special", action: "collect", amount: 200 },
  { id: 1, name: "Mediterráneo", type: "property", color: "brown", price: 60, rent: 2, owner: null },
  { id: 2, name: "Caja Comunidad", type: "community" },
  { id: 3, name: "Báltico", type: "property", color: "brown", price: 60, rent: 4, owner: null },
  { id: 4, name: "Impuesto", type: "tax", amount: 200 },
  { id: 5, name: "Ferrocarril Reading", type: "railroad", price: 200, rent: 25, owner: null },
  { id: 6, name: "Oriental", type: "property", color: "lightblue", price: 100, rent: 6, owner: null },
  { id: 7, name: "Suerte", type: "chance" },
  { id: 8, name: "Vermont", type: "property", color: "lightblue", price: 100, rent: 6, owner: null },
  { id: 9, name: "Connecticut", type: "property", color: "lightblue", price: 120, rent: 8, owner: null },
  { id: 10, name: "CÁRCEL", type: "jail" },
  { id: 11, name: "San Carlos", type: "property", color: "pink", price: 140, rent: 10, owner: null },
  { id: 12, name: "Compañía Eléctrica", type: "utility", price: 150, owner: null },
  { id: 13, name: "Estados", type: "property", color: "pink", price: 140, rent: 10, owner: null },
  { id: 14, name: "Virginia", type: "property", color: "pink", price: 160, rent: 12, owner: null },
  { id: 15, name: "Ferrocarril Pensilvania", type: "railroad", price: 200, rent: 25, owner: null },
  { id: 16, name: "San James", type: "property", color: "orange", price: 180, rent: 14, owner: null },
  { id: 17, name: "Caja Comunidad", type: "community" },
  { id: 18, name: "Tennessee", type: "property", color: "orange", price: 180, rent: 14, owner: null },
  { id: 19, name: "New York", type: "property", color: "orange", price: 200, rent: 16, owner: null },
  { id: 20, name: "PARKING GRATUITO", type: "special" },
  { id: 21, name: "Kentucky", type: "property", color: "red", price: 220, rent: 18, owner: null },
  { id: 22, name: "Suerte", type: "chance" },
  { id: 23, name: "Indiana", type: "property", color: "red", price: 220, rent: 18, owner: null },
  { id: 24, name: "Illinois", type: "property", color: "red", price: 240, rent: 20, owner: null },
  { id: 25, name: "Ferrocarril B&O", type: "railroad", price: 200, rent: 25, owner: null },
  { id: 26, name: "Atlantic", type: "property", color: "yellow", price: 260, rent: 22, owner: null },
  { id: 27, name: "Ventnor", type: "property", color: "yellow", price: 260, rent: 22, owner: null },
  { id: 28, name: "Compañía de Agua", type: "utility", price: 150, owner: null },
  { id: 29, name: "Marvin Gardens", type: "property", color: "yellow", price: 280, rent: 24, owner: null },
  { id: 30, name: "IR A LA CÁRCEL", type: "goToJail" },
  { id: 31, name: "Pacific", type: "property", color: "green", price: 300, rent: 26, owner: null },
  { id: 32, name: "North Carolina", type: "property", color: "green", price: 300, rent: 26, owner: null },
  { id: 33, name: "Caja Comunidad", type: "community" },
  { id: 34, name: "Pennsylvania", type: "property", color: "green", price: 320, rent: 28, owner: null },
  { id: 35, name: "Ferrocarril Short Line", type: "railroad", price: 200, rent: 25, owner: null },
  { id: 36, name: "Suerte", type: "chance" },
  { id: 37, name: "Park Place", type: "property", color: "darkblue", price: 350, rent: 35, owner: null },
  { id: 38, name: "Impuesto de Lujo", type: "tax", amount: 100 },
  { id: 39, name: "Boardwalk", type: "property", color: "darkblue", price: 400, rent: 50, owner: null }
];

class GameRoom extends Room {
  onCreate(options) {
    this.maxClients = 4;
    this.setState(new GameState());
    
    // Inicializar el tablero
    BOARD.forEach(cell => {
      const property = new Property();
      property.id = cell.id;
      property.name = cell.name;
      property.type = cell.type;
      property.color = cell.color || "";
      property.price = cell.price || 0;
      property.rent = cell.rent || 0;
      property.owner = cell.owner || null;
      this.state.board.set(cell.id.toString(), property);
    });
    
    // Manejar mensajes del cliente
    this.onMessage("selectCharacter", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.character = data.character;
        player.name = data.name || `Jugador ${Array.from(this.state.players.keys()).indexOf(client.sessionId) + 1}`;
        
        // Si todos los jugadores han seleccionado personaje, iniciar juego
        if (Array.from(this.state.players.values()).every(p => p.character !== "")) {
          this.state.gameStarted = true;
          this.state.currentPlayer = Array.from(this.state.players.keys())[0];
          this.broadcast("gameStarted", { 
            message: "¡El juego ha comenzado!", 
            currentPlayer: this.state.currentPlayer 
          });
        }
      }
    });
    
    this.onMessage("rollDice", (client, data) => {
      if (this.state.currentPlayer === client.sessionId && this.state.gameStarted) {
        const die1 = Math.floor(Math.random() * 6) + 1;
        const die2 = Math.floor(Math.random() * 6) + 1;
        
        this.state.dice = { die1, die2 };
        
        const player = this.state.players.get(client.sessionId);
        if (player) {
          this.movePlayer(player, die1 + die2);
        }
        
        this.broadcast("diceRolled", { 
          playerId: client.sessionId, 
          dice: { die1, die2 },
          position: player.position
        });
      }
    });
    
    this.onMessage("buyProperty", (client, data) => {
      if (this.state.currentPlayer === client.sessionId && this.state.gameStarted) {
        const player = this.state.players.get(client.sessionId);
        const property = this.state.board.get(player.position.toString());
        
        if (property && property.type === "property" && property.owner === null && player.money >= property.price) {
          property.owner = client.sessionId;
          player.money -= property.price;
          player.properties.push(property.id.toString());
          
          this.broadcast("propertyBought", {
            playerId: client.sessionId,
            propertyId: property.id,
            propertyName: property.name
          });
        }
      }
    });
    
    this.onMessage("endTurn", (client, data) => {
      if (this.state.currentPlayer === client.sessionId && this.state.gameStarted) {
        this.nextTurn();
      }
    });
    
    this.onMessage("startGame", (client, data) => {
      if (this.state.players.size >= 2 && !this.state.gameStarted) {
        this.state.gameStarted = true;
        this.state.currentPlayer = Array.from(this.state.players.keys())[0];
        this.broadcast("gameStarted", { 
          message: "¡El juego ha comenzado!", 
          currentPlayer: this.state.currentPlayer 
        });
      }
    });
  }
  
  onJoin(client, options) {
    const player = new Player();
    player.id = client.sessionId;
    this.state.players.set(client.sessionId, player);
    
    // Si hay al menos 2 jugadores, se puede iniciar el juego
    if (this.state.players.size >= 2 && !this.state.gameStarted) {
      this.broadcast("waitingForPlayers", { 
        message: `Esperando selección de personajes (${this.state.players.size}/${this.maxClients})` 
      });
    }
  }
  
  onLeave(client, consented) {
    const player = this.state.players.get(client.sessionId);
    if (player) {
      player.connected = false;
      
      // Si el jugador actual se desconecta, pasar al siguiente turno
      if (this.state.currentPlayer === client.sessionId) {
        this.nextTurn();
      }
    }
  }
  
  onDispose() {
    console.log("Sala eliminada");
  }
  
  movePlayer(player, steps) {
    const newPosition = (player.position + steps) % 40;
    
    // Verificar si pasó por la salida
    if (newPosition < player.position) {
      player.money += 200;
      this.broadcast("passedGo", { playerId: player.id, amount: 200 });
    }
    
    player.position = newPosition;
    
    // Procesar la celda en la que cayó
    const cell = this.state.board.get(newPosition.toString());
    if (cell.type === "property" && cell.owner && cell.owner !== player.id) {
      const owner = this.state.players.get(cell.owner);
      if (owner) {
        player.money -= cell.rent;
        owner.money += cell.rent;
        
        this.broadcast("rentPaid", {
          fromPlayer: player.id,
          toPlayer: cell.owner,
          amount: cell.rent,
          propertyName: cell.name
        });
      }
    } else if (cell.type === "tax") {
      const taxAmount = cell.id === 4 ? 200 : 100; // Impuesto sobre la renta o lujo
      player.money -= taxAmount;
      this.broadcast("taxPaid", { playerId: player.id, amount: taxAmount });
    } else if (cell.type === "goToJail") {
      player.position = 10; // Ir a la cárcel
      player.inJail = true;
      this.broadcast("goToJail", { playerId: player.id });
    }
    
    // Verificar si el jugador se quedó sin dinero
    if (player.money < 0) {
      this.state.gameOver = true;
      this.state.winner = this.findWinner();
      this.broadcast("gameOver", { winner: this.state.winner });
    }
  }
  
  nextTurn() {
    const playerIds = Array.from(this.state.players.keys());
    const currentIndex = playerIds.indexOf(this.state.currentPlayer);
    const nextIndex = (currentIndex + 1) % playerIds.length;
    
    this.state.currentPlayer = playerIds[nextIndex];
    
    this.broadcast("turnChanged", { 
      currentPlayer: this.state.currentPlayer 
    });
  }
  
  findWinner() {
    let winner = "";
    let maxMoney = -1;
    
    this.state.players.forEach((player, id) => {
      if (player.money > maxMoney && player.connected) {
        maxMoney = player.money;
        winner = id;
      }
    });
    
    return winner;
  }
}

module.exports = { GameRoom };