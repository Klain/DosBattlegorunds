// server.js
console.clear();
import http from 'http';
import express from 'express';
import Emitter from 'events';
import { Server } from 'socket.io';
import { UsersManager, GameManager } from './serverUtils.js';

//Iniciamos el servidor
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const emitter = new Emitter();
let usersManager = new UsersManager();
let gameManager = new GameManager();
usersManager.init();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
io.on('connection', (socket) => {
  console.log('Un cliente se ha conectado');

  socket.on('newUser', async (data) => {
    let _newUser = await usersManager.addUser(data);
    if (_newUser) {
      let _session = usersManager.createUserSession(_newUser.idSession);
      _session.state = true;
      socket.emit("newUser", _session);
    } else {
      socket.emit("newUser", { state: false });
    }
  });
  socket.on('login', async (data) => {
    if (await usersManager.checkUserPassword(data)) {
      let _user = usersManager.getUserByName(data.name);
      let _session = usersManager.createUserSession(_user.idSession);
      _session.state = true;
      socket.emit("login", _session);
    } else {
      socket.emit("login", { state: false });
    }
  });
  socket.on('loginSession', async (data) => {
    if (usersManager.getUserByIdSession(data.idSession)) {
      let _session = usersManager.createUserSession(data.idSession);
      _session.state = true;
      socket.emit("loginSession", _session);
    }
    socket.emit("loginSession", { state: false });
  });
  socket.on('removeUser', async (data) => {
    if (await usersManager.removeUserByIdSession(data.idSession)) {
      socket.emit("removeUser", { state: true });
    } else {
      socket.emit("removeUser", { state: false });
    }
  });
  socket.on('updatePassword', async (data) => {
    if (await usersManager.updatePasswordBySession(data)) {
      socket.emit("updatePassword", { state: true });
    } else {
      socket.emit("updatePassword", { state: false });
    }
  });
  socket.on('newGame', (data) => {
    let _map = gameManager.getFirstNonFullMap();
    let resp = {};
    if (_map.addPlayer(data)) {
      resp.state = true;
      resp.idMap = _map.id();
      socket.emit('newGame', resp);
    } else {
      socket.emit('newGame', { state: false });
    }
  });
  socket.on('lobby', (data) => {
    let resp = {};
    if (gameManager.isMapIncluded(data.idMap)) {
      let _map = gameManager.getMap(data.idMap);
      if (_map.isIncluded(data.idSession)) {
        if (_map.getNumPlayers() == _map.getMaxPlayers()) {
          socket.emit('lobby', { state: true, preGame: true });
        } else {
          let _user = _map.getPlayerBySession(data.idSession);
          _user.lastSeen = Date.now();
          resp.state = true;
          resp.screen = _map.getLobbyRendered().renderLobby(undefined, _map.getNumPlayers(), _map.getMaxPlayers(), _map.getPlayers());
          socket.emit('lobby', resp);
        }
      } else {
        socket.emit('lobby', { state: false });
      }
    } else {
      socket.emit('lobby', { state: false });
    }
  });
  socket.on('lobbyExit', (data) => {
    if (gameManager.isMapIncluded(data.idMap)) {
      let _map = gameManager.getMap(data.idMap);
      if (_map.isIncluded(data.idSession)) {
        _map.deletePlayer(data.idSession);
        socket.emit('lobbyExit', { state: true });
      } else {
        socket.emit('lobbyExit', { state: false });
      }
    } else {
      socket.emit('lobbyExit', { state: false });
    }
  });
  socket.on('preGame', (data) => {
    let resp = {};
    if (gameManager.isMapIncluded(data.idMap)) {
      let _map = gameManager.getMap(data.idMap);
      if (_map.isIncluded(data.idSession)) {
        let _player = _map.getPlayerBySession(data.idSession);
        _map.getMapRendered().setRandomPosition(_map.getPlayers(), _player);
        _player.lastSeen = Date.now();
        _player.ready = true;
        resp.state = true;
        resp.X = _player.X;
        resp.Y = _player.Y;
        socket.emit('preGame', resp);
      } else {
        socket.emit('preGame', { state: false });
      }
    } else {
      socket.emit('preGame', { state: false });
    }
  });
  socket.on('game', (data) => {
    let resp = {};
    if (gameManager.isMapIncluded(data.idMap)) {
      let _map = gameManager.getMap(data.idMap);
      if (_map.isIncluded(data.idSession)) {
        let _player = _map.getPlayerBySession(data.idSession);
        _player.lastSeen = Date.now();
        resp.state = true;
        if (!_map.isFirstRender()) {
          _map.getMapRendered().renderMap(_map.getPlayers(), data.idSession);
          _map.setFirstRender(true);
        }
        if (!_map.checkAllPlayersReady()) {
          console.log(1);
          resp.delay = true;
        } else {
          resp.delay = false;
          resp.dead = _map.getPlayerBySession(data.idSession).dead;
          if (_map.checkOneLastSurvivor()) {
            resp.end = true;
          } else {
            resp.end = false;
            if (!_map.checkPlayerDead(data.idSession)) {

              _map.updatePlayer(data);
            }
            resp.screen = { map: _map.getMapRendered().renderMap(_map.getPlayers(), data.idSession), playersList: _map.getMapRendered().renderedPlayerList(_map.getPlayers(), data.idSession) };
          }
          socket.emit('game', resp);
        }
      } else {
        socket.emit('game', { state: false });
      }
    } else {
      socket.emit('game', { state: false });
    }
  });
  socket.on('gameEnd', (data) => {
    if (gameManager.isMapIncluded(data.idMap)) {
      let _map = gameManager.getMap(data.idMap);
      if (_map.isIncluded(data.idSession)) {
        _map.deletePlayer(data.idSession);
      }
    }
  });
  socket.on('gameExit', (data) => {
    if (gameManager.isMapIncluded(data.idMap)) {
      let _map = gameManager.getMap(data.idMap);
      if (_map.isIncluded(data.idSession)) {
        _map.deletePlayer(data.idSession);
        socket.emit('gameExit', { state: true });
      } else {
        socket.emit('gameExit', { state: false });
      }
    } else {
      socket.emit('gameExit', { state: false });
    }
  });
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
  emitter.on('lobbyPlayerClean', (map) => {
    const _players = map.getPlayers();
    const _playersToDelete = _players.filter(_player => (Date.now() - _player.lastSeen) > 10000);
    _playersToDelete.forEach(_player => {
      map.deletePlayer(_player.idSession);
    });
  });


  setInterval(() => {
    let _maps = gameManager.getMaps();
    if (_maps.length > 0) {
      for (const _map of _maps) {
        if (_map.getNumPlayers() == 0) {
          gameManager.deleteMap(_map.idMap);
        } else {
          emitter.emit('lobbyPlayerClean', _map);
        }
      }
    } else {
      console.log("Todo Limpio");
    }
  }, 10000);

  socket.on('updateUser', async (data) => {

  });
  socket.on('mensaje', (data) => {

  });
  socket.on('disconnect', (data) => {
  });
});

