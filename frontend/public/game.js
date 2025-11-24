$(document).ready(function() {
    // Variables globales
    let client = null;
    let room = null;
    let players = [];
    let currentPlayerId = null;
    let gameActive = false;
    let diceRolled = false;
    let selectedCharacter = null;
    let playerName = "";
    
    // Definición de personajes disponibles
    const characters = [
        { id: "dog", name: "Perro", icon: "fas fa-dog", color: "#8B4513" },
        { id: "cat", name: "Gato", icon: "fas fa-cat", color: "#FF69B4" },
        { id: "car", name: "Coche", icon: "fas fa-car", color: "#FF0000" },
        { id: "hat", name: "Sombrero", icon: "fas fa-hat-cowboy", color: "#00FF00" },
        { id: "ship", name: "Barco", icon: "fas fa-ship", color: "#0000FF" },
        { id: "rocket", name: "Cohete", icon: "fas fa-rocket", color: "#800080" }
    ];
    
    // Definición del tablero
    const board = [
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
    
    // Inicializar el cliente Colyseus
    function initClient(serverUrl) {
        try {
            client = new Colyseus.Client(serverUrl);
            console.log("Cliente Colyseus inicializado con URL:", serverUrl);
            return true;
        } catch (error) {
            console.error("Error al inicializar cliente:", error);
            showModal("Error de Conexión", 
                "No se pudo conectar al servidor. Verifica la URL y que el servidor esté ejecutándose.");
            return false;
        }
    }
    
    // Configurar eventos de la interfaz
    function setupEventListeners() {
        // Botón para aplicar configuración del servidor
        $("#apply-server-config").click(applyServerConfig);
        
        // Botones de creación/unirse a sala
        $("#create-public-room").click(() => createRoom("public"));
        $("#create-private-room").click(() => createRoom("private"));
        $("#join-public-room").click(() => joinPublicRoom());
        $("#join-private-room").click(() => joinPrivateRoom());
        $("#copy-room-id").click(copyRoomId);
        $("#start-anyway").click(startGameAnyway);
        
        // Selección de personaje
        $(".character-option").click(function() {
            $(".character-option").removeClass("selected");
            $(this).addClass("selected");
            selectedCharacter = $(this).data("character");
        });
        
        $("#select-character").click(selectCharacter);
        $("#player-name").on("input", function() {
            playerName = $(this).val().trim();
        });
        
        // Botones del juego
        $("#roll-dice").click(rollDice);
        $("#end-turn").click(endTurn);
        $("#buy-property").click(buyProperty);
        $("#modal-close").click(closeModal);
    }
    
    // Aplicar configuración del servidor
    function applyServerConfig() {
        const serverUrl = $("#server-url").val().trim();
        if (!serverUrl) {
            showModal("Error", "Por favor, ingresa una URL válida para el servidor.");
            return;
        }
        
        if (initClient(serverUrl)) {
            showModal("Configuración Aplicada", "Conexión al servidor establecida correctamente.");
        }
    }
    
    // Crear una nueva sala
    async function createRoom(roomType) {
        if (!client) {
            showModal("Error", "Primero configura la URL del servidor.");
            return;
        }
        
        try {
            const options = {
                name: "Monopolio Room",
                roomType: roomType
            };
            
            room = await client.create("game_room", options);
            setupRoomListeners();
            
            $("#multiplayer-modal").removeClass("active");
            $("#room-info").show();
            $("#room-id-value").text(room.id);
            $("#current-room-id").text(room.id);
            
            showWaitingScreen();
        } catch (e) {
            console.error("Error al crear sala:", e);
            showModal("Error", "No se pudo crear la sala. Verifica la conexión al servidor.");
        }
    }
    
    // Unirse a una sala pública
    async function joinPublicRoom() {
        if (!client) {
            showModal("Error", "Primero configura la URL del servidor.");
            return;
        }
        
        try {
            // Buscar salas públicas disponibles
            const rooms = await client.getAvailableRooms("game_room");
            const publicRooms = rooms.filter(room => 
                room.metadata && room.metadata.roomType === "public" && 
                room.clients < room.maxClients
            );
            
            if (publicRooms.length === 0) {
                // Si no hay salas públicas, crear una
                await createRoom("public");
                return;
            }
            
            // Unirse a una sala pública aleatoria
            const randomRoom = publicRooms[Math.floor(Math.random() * publicRooms.length)];
            room = await client.joinById(randomRoom.roomId);
            setupRoomListeners();
            
            $("#multiplayer-modal").removeClass("active");
            $("#current-room-id").text(room.id);
            showWaitingScreen();
        } catch (e) {
            console.error("Error al unirse a sala pública:", e);
            showModal("Error", "No se pudo unir a una sala pública. Verifica la conexión al servidor.");
        }
    }
    
    // Unirse a una sala privada
    async function joinPrivateRoom() {
        if (!client) {
            showModal("Error", "Primero configura la URL del servidor.");
            return;
        }
        
        const roomCode = $("#room-code").val().trim();
        
        if (!roomCode) {
            showModal("Error", "Por favor, ingresa un código de sala válido.");
            return;
        }
        
        try {
            room = await client.joinById(roomCode);
            setupRoomListeners();
            
            $("#multiplayer-modal").removeClass("active");
            $("#current-room-id").text(room.id);
            showWaitingScreen();
        } catch (e) {
            console.error("Error al unirse a sala privada:", e);
            showModal("Error", "No se pudo unir a la sala. Verifica el código y la conexión al servidor.");
        }
    }
    
    // Configurar listeners de la sala
    function setupRoomListeners() {
        room.onStateChange.once(state => {
            console.log("Estado inicial recibido:", state);
            updateGameState(state);
        });
        
        room.onStateChange(state => {
            updateGameState(state);
        });
        
        room.onMessage("waitingForPlayers", message => {
            $("#waiting-message").text(message.message);
            updateConnectedPlayers();
        });
        
        room.onMessage("gameStarted", message => {
            $("#waiting-modal").removeClass("active");
            $("#game-container").show();
            showModal("¡Comienza el juego!", message.message);
            updateGameUI();
        });
        
        room.onMessage("diceRolled", message => {
            updateDice(message.dice);
            updatePlayerPosition(message.playerId, message.position);
        });
        
        room.onMessage("propertyBought", message => {
            updatePropertyOwner(message.propertyId, message.playerId);
            showModal("Propiedad Comprada", 
                `${getPlayerName(message.playerId)} compró ${message.propertyName}`);
        });
        
        room.onMessage("rentPaid", message => {
            showModal("Pago de Alquiler", 
                `${getPlayerName(message.fromPlayer)} pagó $${message.amount} a ${getPlayerName(message.toPlayer)} por ${message.propertyName}`);
        });
        
        room.onMessage("taxPaid", message => {
            showModal("Impuestos Pagados", 
                `${getPlayerName(message.playerId)} pagó $${message.amount} en impuestos`);
        });
        
        room.onMessage("passedGo", message => {
            showModal("¡Pasaste por la Salida!", 
                `${getPlayerName(message.playerId)} cobró $${message.amount} por pasar por la salida`);
        });
        
        room.onMessage("goToJail", message => {
            showModal("¡A la Cárcel!", 
                `${getPlayerName(message.playerId)} fue enviado a la cárcel`);
        });
        
        room.onMessage("turnChanged", message => {
            currentPlayerId = message.currentPlayer;
            updateGameUI();
            
            if (currentPlayerId === room.sessionId) {
                showModal("Tu Turno", "Es tu turno. ¡Lanza los dados!");
            } else {
                showModal("Turno de Otro Jugador", 
                    `Es el turno de ${getPlayerName(message.currentPlayer)}`);
            }
        });
        
        room.onMessage("gameOver", message => {
            gameActive = false;
            const winnerName = getPlayerName(message.winner);
            showModal("¡Juego Terminado!", 
                `¡${winnerName} ha ganado el juego!`);
        });
        
        room.onLeave(code => {
            console.log("Desconectado de la sala:", code);
            showModal("Desconectado", "Te has desconectado de la sala.");
            resetGame();
        });
        
        room.onError(code => {
            console.error("Error en la sala:", code);
            showModal("Error", "Ha ocurrido un error en la sala.");
        });
    }
    
    // Mostrar pantalla de espera
    function showWaitingScreen() {
        $("#waiting-modal").addClass("active");
        updateConnectedPlayers();
        
        // Mostrar botón para iniciar de todas formas si hay al menos 2 jugadores
        if (players.length >= 2) {
            $("#start-anyway").show();
        }
    }
    
    // Actualizar contador de jugadores conectados
    function updateConnectedPlayers() {
        $("#connected-count").text(players.length);
    }
    
    // Iniciar juego con los jugadores actuales
    function startGameAnyway() {
        if (players.length >= 2) {
            room.send("startGame");
        } else {
            showModal("Error", "Se necesitan al menos 2 jugadores para iniciar el juego.");
        }
    }
    
    // Seleccionar personaje
    function selectCharacter() {
        if (!selectedCharacter) {
            showModal("Error", "Por favor, selecciona un personaje.");
            return;
        }
        
        if (!playerName) {
            playerName = `Jugador ${players.length + 1}`;
        }
        
        room.send("selectCharacter", {
            character: selectedCharacter,
            name: playerName
        });
        
        $("#character-modal").removeClass("active");
    }
    
    // Copiar ID de sala al portapapeles
    function copyRoomId() {
        const roomId = $("#room-id-value").text();
        navigator.clipboard.writeText(roomId).then(() => {
            showModal("Código Copiado", "El código de sala ha sido copiado al portapapeles.");
        });
    }
    
    // Actualizar estado del juego
    function updateGameState(state) {
        players = Array.from(state.players.values());
        currentPlayerId = state.currentPlayer;
        gameActive = state.gameStarted;
        
        if (gameActive) {
            updateGameUI();
        } else {
            updateConnectedPlayers();
            
            // Mostrar modal de selección de personaje si el juego no ha comenzado
            if (players.some(p => p.id === room.sessionId && p.character === "")) {
                $("#character-modal").addClass("active");
            }
        }
    }
    
    // Actualizar interfaz de juego
    function updateGameUI() {
        renderBoard();
        updatePlayerInfo();
        updatePropertyInfo();
        updateControls();
    }
    
    // Renderizar el tablero
    function renderBoard() {
        const $board = $("#board");
        $board.empty();
        
        for (let i = 0; i < 40; i++) {
            const cell = board[i];
            const $cell = $("<div>").addClass("cell");
            
            // Determinar la posición en la cuadrícula
            let row, col;
            if (i < 10) {
                row = 0;
                col = 10 - i;
            } else if (i < 20) {
                row = i - 10;
                col = 0;
            } else if (i < 30) {
                row = 10;
                col = i - 20;
            } else {
                row = 40 - i;
                col = 10;
            }
            
            $cell.css({
                "grid-row": `${row + 1} / span 1`,
                "grid-column": `${col + 1} / span 1`
            });
            
            // Añadir clases y contenido según el tipo de celda
            if (cell.type === "property") {
                $cell.addClass("property");
                $cell.css("border-left-color", cell.color);
                $cell.append(`<div class="property-name">${cell.name}</div>`);
                $cell.append(`<div class="property-price">$${cell.price}</div>`);
                
                // Mostrar propietario si existe
                const propertyState = room.state.board.get(i.toString());
                if (propertyState && propertyState.owner) {
                    const owner = players.find(p => p.id === propertyState.owner);
                    if (owner) {
                        const character = characters.find(c => c.id === owner.character);
                        $cell.append(`<div class="property-owned" style="color: ${character.color}">
                            <i class="${character.icon}"></i>
                        </div>`);
                    }
                }
            } else if (cell.type === "railroad") {
                $cell.addClass("railroad-cell");
                $cell.append(`<div><i class="fas fa-train"></i></div>`);
                $cell.append(`<div>${cell.name}</div>`);
            } else if (cell.type === "utility") {
                $cell.addClass("utility-cell");
                $cell.append(`<div><i class="fas fa-bolt"></i></div>`);
                $cell.append(`<div>${cell.name}</div>`);
            } else if (cell.type === "tax") {
                $cell.addClass("tax-cell");
                $cell.append(`<div><i class="fas fa-money-bill-wave"></i></div>`);
                $cell.append(`<div>${cell.name}</div>`);
            } else if (cell.type === "community" || cell.type === "chance") {
                $cell.addClass("card-cell");
                $cell.append(`<div><i class="fas fa-question-circle"></i></div>`);
                $cell.append(`<div>${cell.name}</div>`);
            } else if (i === 0 || i === 10 || i === 20 || i === 30) {
                $cell.addClass("corner");
                $cell.append(`<div>${cell.name}</div>`);
                
                if (i === 0) {
                    $cell.append(`<div><i class="fas fa-flag-checkered"></i></div>`);
                } else if (i === 10) {
                    $cell.append(`<div><i class="fas fa-gavel"></i></div>`);
                } else if (i === 20) {
                    $cell.append(`<div><i class="fas fa-parking"></i></div>`);
                } else if (i === 30) {
                    $cell.append(`<div><i class="fas fa-handcuffs"></i></div>`);
                }
            }
            
            // Añadir jugadores en esta celda
            players.forEach((player, index) => {
                if (player.position === i) {
                    const character = characters.find(c => c.id === player.character);
                    if (character) {
                        const $player = $("<div>").addClass("player");
                        $player.addClass(`player-${index + 1}`);
                        $player.css("background-color", character.color);
                        $player.html(`<i class="${character.icon} player-token"></i>`);
                        $cell.append($player);
                    }
                }
            });
            
            $board.append($cell);
        }
    }
    
    // Actualizar información de jugadores
    function updatePlayerInfo() {
        const $playerInfo = $("#player-info");
        $playerInfo.empty();
        
        $playerInfo.append("<h3>Jugadores</h3>");
        
        players.forEach((player, index) => {
            const isCurrent = currentPlayerId === player.id;
            const isMe = player.id === room.sessionId;
            const character = characters.find(c => c.id === player.character);
            
            if (!character) return;
            
            const $playerDiv = $("<div>").addClass("player-card");
            if (isCurrent) $playerDiv.addClass("current");
            if (!player.connected) $playerDiv.addClass("disconnected");
            
            $playerDiv.css("border-left-color", character.color);
            $playerDiv.html(`
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center;">
                        <i class="${character.icon}" style="color: ${character.color}; font-size: 24px; margin-right: 10px;"></i>
                        <div>
                            <strong>${player.name} ${isMe ? '(Tú)' : ''}</strong>
                            ${isCurrent ? '<span class="current-player-indicator"></span>' : ''}
                            ${!player.connected ? '<span style="color: red; margin-left: 5px;"><i class="fas fa-wifi-slash"></i></span>' : ''}
                        </div>
                    </div>
                    <div class="player-money">$${player.money}</div>
                </div>
                <div style="margin-top: 8px; font-size: 14px;">
                    <div>Propiedades: ${player.properties ? player.properties.length : 0}</div>
                    <div>${player.inJail ? '<i class="fas fa-lock"></i> En la cárcel' : '<i class="fas fa-lock-open"></i> Libre'}</div>
                </div>
            `);
            $playerInfo.append($playerDiv);
        });
    }
    
    // Actualizar información de propiedades
    function updatePropertyInfo() {
        const $propertyInfo = $("#property-info");
        $propertyInfo.empty();
        
        $propertyInfo.append("<h3>Información de la Casilla</h3>");
        
        const currentPlayer = players.find(p => p.id === room.sessionId);
        if (!currentPlayer) return;
        
        const currentCell = board[currentPlayer.position];
        const $propertyCard = $("<div>").addClass("property-card");
        
        if (currentCell.type === "property") {
            $propertyCard.css("border-left-color", currentCell.color);
            $propertyCard.html(`
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <div class="property-color" style="background-color: ${currentCell.color}"></div>
                    <strong>${currentCell.name}</strong>
                </div>
                <div>Precio: <strong>$${currentCell.price}</strong></div>
                <div>Alquiler: <strong>$${currentCell.rent}</strong></div>
            `);
            
            const propertyState = room.state.board.get(currentPlayer.position.toString());
            if (propertyState && propertyState.owner === null) {
                $propertyCard.append(`<div style="margin-top: 10px; color: #2e7d32;">
                    <i class="fas fa-info-circle"></i> Disponible para comprar
                </div>`);
            } else if (propertyState && propertyState.owner) {
                const owner = players.find(p => p.id === propertyState.owner);
                if (owner) {
                    const character = characters.find(c => c.id === owner.character);
                    $propertyCard.append(`<div style="margin-top: 10px; display: flex; align-items: center;">
                        <i class="${character.icon}" style="color: ${character.color}; margin-right: 5px;"></i>
                        Propiedad de <strong>${owner.name}</strong>
                    </div>`);
                }
            }
        } else {
            $propertyCard.css("border-left-color", "#999");
            $propertyCard.html(`
                <div><strong>${currentCell.name}</strong></div>
                <div style="margin-top: 10px;">${getCellDescription(currentCell)}</div>
            `);
        }
        
        $propertyInfo.append($propertyCard);
    }
    
    // Actualizar controles
    function updateControls() {
        const isMyTurn = currentPlayerId === room.sessionId;
        const currentPlayer = players.find(p => p.id === room.sessionId);
        
        $("#roll-dice").prop("disabled", !isMyTurn || diceRolled);
        $("#end-turn").prop("disabled", !isMyTurn || !diceRolled);
        
        // Habilitar botón de compra si es una propiedad sin dueño
        if (isMyTurn && currentPlayer) {
            const currentCell = board[currentPlayer.position];
            const propertyState = room.state.board.get(currentPlayer.position.toString());
            
            const canBuy = currentCell.type === "property" && 
                          propertyState && propertyState.owner === null && 
                          currentPlayer.money >= currentCell.price;
            
            $("#buy-property").prop("disabled", !canBuy);
        } else {
            $("#buy-property").prop("disabled", true);
        }
    }
    
    // Lanzar dados
    function rollDice() {
        if (currentPlayerId !== room.sessionId || diceRolled) return;
        
        // Animación de dados
        $(".die").addClass("rolling");
        
        setTimeout(() => {
            room.send("rollDice");
            diceRolled = true;
            $(".die").removeClass("rolling");
        }, 500);
    }
    
    // Comprar propiedad
    function buyProperty() {
        if (currentPlayerId !== room.sessionId) return;
        
        room.send("buyProperty");
    }
    
    // Terminar turno
    function endTurn() {
        if (currentPlayerId !== room.sessionId) return;
        
        room.send("endTurn");
        diceRolled = false;
    }
    
    // Actualizar dados
    function updateDice(dice) {
        $("#die1").text(dice.die1);
        $("#die2").text(dice.die2);
    }
    
    // Obtener descripción de la celda
    function getCellDescription(cell) {
        switch(cell.type) {
            case "special":
                if (cell.id === 0) return "<i class='fas fa-flag-checkered'></i> Cobras $200 cuando pasas por aquí";
                if (cell.id === 20) return "<i class='fas fa-parking'></i> Zona de estacionamiento gratuita";
                return "Casilla especial";
            case "community":
                return "<i class='fas fa-users'></i> Toma una carta de la caja de comunidad";
            case "tax":
                return `<i class='fas fa-money-bill-wave'></i> Debes pagar $${cell.amount} en impuestos`;
            case "railroad":
                return `<i class='fas fa-train'></i> Ferrocarril - Precio: $${cell.price}, Alquiler: $${cell.rent}`;
            case "utility":
                return `<i class='fas fa-bolt'></i> Servicio público - Precio: $${cell.price}`;
            case "jail":
                return "<i class='fas fa-gavel'></i> Estás de visita en la cárcel";
            case "goToJail":
                return "<i class='fas fa-handcuffs'></i> ¡Ve directo a la cárcel!";
            case "chance":
                return "<i class='fas fa-dice'></i> Toma una carta de suerte";
            default:
                return "Casilla del tablero";
        }
    }
    
    // Obtener nombre del jugador
    function getPlayerName(playerId) {
        const player = players.find(p => p.id === playerId);
        return player ? player.name : "Jugador";
    }
    
    // Mostrar modal
    function showModal(title, message) {
        $("#modal-title").text(title);
        $("#modal-message").html(message);
        $("#game-modal").addClass("active");
    }
    
    // Cerrar modal
    function closeModal() {
        $("#game-modal").removeClass("active");
    }
    
    // Reiniciar juego
    function resetGame() {
        room = null;
        players = [];
        currentPlayerId = null;
        gameActive = false;
        diceRolled = false;
        
        $("#game-container").hide();
        $("#waiting-modal").removeClass("active");
        $("#multiplayer-modal").addClass("active");
    }
    
    // Inicializar la aplicación
    function init() {
        setupEventListeners();
        
        // Intentar inicializar con URL por defecto
        const defaultServerUrl = $("#server-url").val();
        initClient(defaultServerUrl);
    }
    
    // Iniciar la aplicación
    init();
});