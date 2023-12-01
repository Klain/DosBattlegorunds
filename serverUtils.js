// serverUtils.js
import fs from 'fs';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

class UsersIO {
    constructor(arg_path = "./users.json") {
        this._path = arg_path;
    }
    async init() {
        try {
            const _file = await fs.promises.readFile(this._path, 'utf-8');
            return JSON.parse(_file);
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.promises.writeFile(this._path, '{ "_lastId": 0 }', 'utf-8');
                return { _lastId: 0 };
            } else {
                console.error(`Error al leer el fichero:${this._path}`, error.message);
                return { _lastId: 0 };
            }
        }
    }
    async saveUsers(arg_users) {
        try {
            await fs.promises.writeFile(this._path, JSON.stringify(arg_users), 'utf-8');
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.promises.writeFile(this._path, '{ "_lastId": 0 }', 'utf-8');
                this.saveUsers(arg_users);
            } else {
                console.error(`Error al escribir el fichero:${this._path}`, error.message);
            }
        }
    }
}
class UsersManager {
    constructor() {
        this._io = new UsersIO();
    }
    async init() {
        this._users = await this._io.init();
    }
    getLastId() {
        return this._users._lastId;
    }
    incrementLastId(arg_increment = 1) {
        this._users._lastId += arg_increment;
    }
    /**
    * @returns {Array<Object>}
    */
    getUsers() {
        return Object.values(this._users);
    }
    setUsers(arg_users) {
        this._users = arg_users;
    }
    saveUsers(arg_users) {
        this._io.saveUsers(arg_users);
    }
    async addUser(arg_user) {
        if (!this.getUserByName(arg_user.name)) {
            this.incrementLastId();
            const _idSession = uuidv4();
            if (!this.checkUserByIdSession(_idSession)) {
                const _user = { idSession: _idSession, idUser: this.getLastId(), name: arg_user.name, password: await this.encryptPassword(arg_user.password), lastSeen: Date.now() };
                this.saveUser(_user);
                console.log('Usuario añadido correctamente.');
                return _user;
            }
        } else {
            return false;
        }
    }
    saveUser(arg_user) {
        this._users[arg_user.idSession] = arg_user;
        this._io.saveUsers(this._users);
    }
    getUsersCount() {
        return Object.keys(this._users).length - 1;
    }
    createUserSession(arg_idSession) {
        const _user = this.getUserByIdSession(arg_idSession);
        if (_user) {
            return { idSession: arg_idSession, name: _user.name };
        } else {
            return false;
        }
    }
    getUserByName(arg_name) {
        const _users = this.getUsers();
        for (const _user of _users) {
            if (_user.name === arg_name) {
                return _user;
            }
        }
        return false;
    }
    async checkUserPassword(arg_user) {
        const _user = this.getUserByName(arg_user.name);
        if (_user) {
            const isCorrect = await bcrypt.compare(arg_user.password, _user.password);
            return isCorrect;
        }
        return false;
    }
    checkUserByIdSession(arg_idSession) {
        return arg_idSession in this._users;
    }
    getUserByIdSession(arg_idSession) {
        return this._users[arg_idSession];
    }
    getUserByIdUser(arg_idUser) {
        const _users = this.getUsers();
        for (const _user in _users) {
            if (_user.idUser === arg_idUser) {
                return _user;
            }
        }
        return false;
    }
    async removeUserByIdSession(arg_idSession) {
        if (this.checkUserByIdSession(arg_idSession)) {
            delete this._users[arg_idSession];
            console.log('Usuario eliminado correctamente.');
            this._io.saveUsers(this._users);
            return true;
        } else {
            console.error('Usuario no encontrado.');
            return false;
        }
    }
    async updatePasswordBySession(arg_session) {
        console.dir(arg_session);
        if (this.checkUserByIdSession(arg_session.idSession)) {
            let _user = this.getUserByIdSession(arg_session.idSession);
            if (await bcrypt.compare(arg_session.oldPassword, _user.password)) {
                _user.password = await this.encryptPassword(arg_session.password);
                this.saveUser(_user);
                console.log('Contraseña Usuario Actualizada');
                this.saveUsers(this._users);
                return true;
            }
        } else {
            console.error('Usuario no encontrado.');
            return false;
        }
    }
    async encryptPassword(arg_password) {
        const saltRounds = 10;
        const hash = await bcrypt.hash(arg_password, saltRounds);
        return hash;
    }
    /*pendiente
    getNombreUsuarioPorsession(_session) {
        if (this._users[_session]) {
            return this._users[_session].nombre;
        } else {
            console.log("getNombreUsuarioPorsession: Usuario no encontrado");
            return false;
        }

    }
    async setNombreUsuarioPorsession(_session, nuevoNombre) {
        if (this._users[_session]) {
            this._users[_session].nombre = nuevoNombre;
            this.io.saveUsers(this._users);
            console.log('Nombre de usuario actualizado correctamente.');
            return true;
        } else {
            console.error('Usuario no encontrado.');
            return false;
        }
    }
    async actualizarUsuario(_usuario) {
        this._users[Object.key(_usuario)[0]] = _usuario;
        this.io.saveUsers(this._users);
    }
    getNombreUsuarioPorId(_id) {
        let _user = this.getUserById(_id);
        if (_user) {
            return _user.nombre;
        } else {
            console.log("getNombreUsuarioPorId: Usuario no encontrado");
            return false;
        }

    }
    getContraseñaUsuarioPorId(_id) {
        return this._users[_id]?.contraseña || null;
    }
    async setContraseñaUsuarioPorId(_id, _nuevaContraseña) {
        if (this._users[_id]) {
            this._users[_id].contraseña = _nuevaContraseña;
            this.io.saveUsers(this._users);
            console.log('Contraseña de usuario actualizada correctamente.');
            return true;
        } else {
            console.error('Usuario no encontrado.');
            return false;
        }
    }
    */
}
class MapManager {
    constructor() {
        this._lobbyRenderer = new LobbyRenderer();
        this._mapRendered = new MapRenderer(5, 5);
        this._players = {};
        this._idMap = uuidv4();
        this._maxPlayers = 2;
        this._fistRender = false;
    }

    id() {
        return this._idMap;
    }
    isFirstRender() {
        return this._fistRender;
    }
    setFirstRender(arg_firstRender) {
        this._fistRender = arg_firstRender;
    }
    getMapRendered() {
        return this._mapRendered;
    }
    getLobbyRendered() {
        return this._lobbyRenderer;
    }
    isFull() {
        return this.getNumPlayers() >= this._maxPlayers;
    }
    addPlayer(arg_player) {
        if (!this.isFull()) {
            if (!this.isIncluded(arg_player.idSession)) {
                this._players[arg_player.idSession] = arg_player;
                this._players[arg_player.idSession].ready = false;
                this._players[arg_player.idSession].dead = false;
                this._players[arg_player.idSession].lastSeen = Date.now();
                return true;
            }
        }
        return false;
    }
    getPlayerBySession(arg_idSession) {
        return this._players[arg_idSession];
    }
    isIncluded(arg_idSession) {
        if (this._players[arg_idSession]) {
            return true;
        } else {
            return false;
        }
    }
    updatePlayer(arg_player) {
        if (this.getPlayerBySession(arg_player.idSession)) {
            if (this.getMapRendered().isValidPosition(arg_player.X, arg_player.Y)) {
                if (this.getMapRendered().isOccupiedPosition(arg_player.X, arg_player.Y, this.getPlayers())) {
                    let _losers = this._mapRendered.getPlayersOccupiedPosition(arg_player.X, arg_player.Y, this.getPlayers());
                    for (const _player of _losers) {
                        if (_player.idSession != arg_player.idSession) {
                            this.setPlayerDead(_player.idSession);
                        }
                    }
                }
                this.getPlayerBySession(arg_player.idSession).X = arg_player.X;
                this.getPlayerBySession(arg_player.idSession).Y = arg_player.Y;
            }
            return false;
        } else {
            return false;
        }
    }
    deletePlayer(arg_idSession) {
        if (this._players[arg_idSession]) {
            delete this._players[arg_idSession];
        } else {
            return false;
        }
    }
    setPlayerDead(arg_idSession) {
        if (this._players[arg_idSession]) {
            this._players[arg_idSession].dead = true;
        } else {
            return false;
        }
    }
    checkPlayerDead(arg_idSession) {
        if (this._players[arg_idSession]) {
            if (this._players[arg_idSession].dead == true) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    getNumPlayers() {
        return this.getPlayers().length;
    }
    getMaxPlayers() {
        return this._maxPlayers;
    }
    getPlayers() {
        return Object.values(this._players);
    }
    checkAllPlayersReady() {
        const _players = this.getPlayers();
        for (const _player of _players) {
            if (!_player.ready) {
                return false;
            }
        }
        return true;
    }
    checkOneLastSurvivor() {
        let _count = 0;
        let _sessionId = "";
        const _players = this.getPlayers();
        for (const _player of _players) {
            if (!_player.dead) {
                _count += 1;
                _sessionId = _player.idSession;
            }
        }
        if (_count <= 1) {
            return _sessionId;
        } else {
            return false;
        }

    }
}
class GameManager {
    constructor() {
        this._maps = [];
    }
    addMap() {
        const _newMap = new MapManager();
        this._maps.push(_newMap);
        return _newMap;
    }
    /**
    * @returns {MapManager}
    */
    getMap(arg_idMap) {
        for (const _map of this._maps) {
            if (_map.id() == arg_idMap) {
                return _map;
            }
        }
        return false;
    }
    getMaps() {
        return this._maps;
    }
    /**
 * @returns {MapManager} La primera instancia de MapManager que no está completamente llena.
    */
    getFirstNonFullMap() {
        for (const _map of this._maps) {
            if (!_map.isFull()) {
                return _map;
            }
        }
        return this.addMap();
    }
    isMapIncluded(arg_idMap) {
        for (const _map of this._maps) {
            if (_map.id() == arg_idMap) {
                return true;
            }
        }
        return false;
    }
    deleteMap(arg_idMap) {
        delete this._maps[arg_idMap];
    }
}
class LobbyRenderer {
    constructor() {
        this._lobbyRendered = [];
    }

    renderLobby(arg_title = "Lobby", arg_numCurrentPlayers, arg_numMaximumPlayers, arg_playersList) {
        const _widthMap = 50;
        const _separator = ' | ';

        const _titleRow = `== ${arg_title} ==\n`;
        const _playersRow = `Usuarios: ${arg_numCurrentPlayers}/${arg_numMaximumPlayers}\n`;
        const _separatorRow = '='.repeat(_widthMap) + '\n';

        this._lobbyRendered = _titleRow + _playersRow + _separatorRow;

        for (const _idPlayer of arg_playersList) {
            this._lobbyRendered += _idPlayer.name + _separator;
        }
        return this._lobbyRendered;

    }
}
class MapRenderer {
    constructor(arg_width, arg_height) {
        this._mapRendered = [];
        this._playerListRendered = [];
        this._width = arg_width;
        this._height = arg_height;
        this._createTime = Date.now();
    }
    isOccupiedPosition(arg_x, arg_y, arg_players) {
        return arg_players.some(player => player.X === arg_x && player.Y === arg_y);
    }
    getPlayersOccupiedPosition(arg_x, arg_y, arg_players) {
        return arg_players.filter(player => player.X === arg_x && player.Y === arg_y);
    }
    setRandomPosition(arg_players, arg_player) {
        let _x, _y;
        do {
            _x = Math.floor(Math.random() * (this._width - 2)) + 1; // Evitar posiciones en los bordes
            _y = Math.floor(Math.random() * (this._height - 2)) + 1;
        } while (this.isOccupiedPosition(_x, _y, arg_players));
        arg_player.X = _x;
        arg_player.Y = _y;
    }
    isValidPosition(arg_x, arg_y) {
        const _rows = this._mapRendered.length;
        const _column = this._mapRendered[0].length;
        if (_rows === 0) {
            return false;
        }
        if (arg_x >= 1 && arg_x < _column - 1 && arg_y >= 1 && arg_y < _rows - 1) {
            return true;
        } else {
            return false;
        }
    }
    renderMap(arg_players, arg_idSession) {
        this._mapRendered = [];
        //let alto = Math.round(this.height  - ((this.height  / 10) * ((Date.now() - this.createTime) / 10000)));
        //let ancho = Math.round(this.width - ((this.width / 10) * ((Date.now() - this.createTime) / 10000)));
        for (let i = 0; i < this._height; i++) {
            let _row = '';
            for (let j = 0; j < this._width; j++) {
                if (i === 0 || i === this._height - 1 || j === 0 || j === this._width - 1 || (i % 5 === 0 && j % 5 === 0)) {
                    _row += '#';
                } else {
                    const _deadPlayer = arg_players.find(player => player.X === j && player.Y === i && player.dead === true);
                    const _userPlayer = arg_players.find(player => player.X === j && player.Y === i && player.idSession === arg_idSession);
                    const _player = arg_players.find(player => player.X === j && player.Y === i);

                    _row += _deadPlayer ? 'O' : (_userPlayer ? 'P' : (_player ? 'X' : '.'));
                }
            }
            this._mapRendered.push(_row);
        }
        return this._mapRendered;
    }
    renderedPlayerList(arg_players = {}) {
        const _copiedPlayers = [...arg_players];

        for (const _player of _copiedPlayers) {
            if (_player.dead) {
                _player.name = 'XXXXXX';
            }
        }

        const _mapHeight = this._height;
        const _playersPerLine = Math.max(Math.floor(_copiedPlayers.length / _mapHeight), 1);
        const _playerSeparator = ' | ';

        for (let i = 0; i < _mapHeight; i++) {
            const _startPlayers = i * _playersPerLine;
            const _endPlayers = _startPlayers + _playersPerLine;
            const _rowPlayers = _copiedPlayers
                .slice(_startPlayers, _endPlayers)
                .map(player => player.name)
                .join(_playerSeparator);

            this._playerListRendered.push(_rowPlayers);
        }
        return this._playerListRendered;
    }
}

export { UsersManager, GameManager };
