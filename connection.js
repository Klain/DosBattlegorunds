// clientConexion.js
import io from 'socket.io-client';

class ConnectionHandler {
    constructor() {
        this.socket = io('http://localhost:3000');
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    emitter(eventName, arg) {
        this.socket.emit(eventName, arg);
    }

    async socketHandler(eventName) {
        return new Promise((resolve) => {
            const socketHandler = (data) => {
                this.socket.off(eventName, socketHandler);
                resolve(data);
            };

            this.socket.on(eventName, socketHandler);
        });
    }
    /*
        loginSession(arg_session) {
            this.socket.emit('loginSession', arg_session);
        }
        async socketLoginSession() {
            return new Promise((resolve) => {
                const handleLoginSession = (data) => {
                    this.socket.off('loginSession', handleLoginSession);
                    resolve(data);
                };
    
                this.socket.on('loginSession', handleLoginSession);
            });
        }
        newUser(arg_usuario) {
            this.socket.emit('newUser', arg_usuario);
        }
        async socketNewUser() {
            return new Promise((resolve) => {
                const handleNewUser = (data) => {
                    this.socket.off('newUser', handleNewUser);
                    resolve(data);
                };
    
                this.socket.on('newUser', handleNewUser);
            });
        }
        login(arg_usuario) {
            this.socket.emit('login', arg_usuario);
        }
        async socketLogin() {
            return new Promise((resolve) => {
                const handleLogin = (data) => {
                    this.socket.off('login', handleLogin);
                    resolve(data);
                };
    
                this.socket.on('login', handleLogin);
            });
        }
        updatePassword(arg_session) {
            this.socket.emit('updatePassword', arg_session);
        }
        async socketUpdatePassword() {
            return new Promise((resolve) => {
                const handleUpdatePassword = (data) => {
                    this.socket.off('updatePassword', handleUpdatePassword);
                    resolve(data);
                };
    
                this.socket.on('updatePassword', handleUpdatePassword);
            });
        }
        removeUser(arg_session) {
            this.socket.emit('removeUser', arg_session);
        }
        async socketRemoveUser() {
            return new Promise((resolve) => {
                const handleRemoveUser = (data) => {
                    this.socket.off('removeUser', handleRemoveUser);
                    resolve(data);
                };
    
                this.socket.on('removeUser', handleRemoveUser);
            });
        }
        newGame(arg_session) {
            this.socket.emit('newGame', arg_session);
        }
        async socketNewGame() {
            return new Promise((resolve) => {
                const handleNewGame = (data) => {
                    this.socket.off('newGame', handleNewGame);
                    resolve(data);
                };
                this.socket.on('newGame', handleNewGame);
            });
        }
    
        lobby(arg_session) {
            this.socket.emit('lobby', arg_session);
        }
        async socketLobby() {
            return new Promise(async (resolve) => {
                const handleLobby = (data) => {
                    this.socket.off('lobby');
                    resolve(data);
                };
                this.socket.on('lobby', handleLobby);
            });
        }
        lobbyExit(arg_session) {
            this.socket.emit('lobbyExit', arg_session);
        }
        async socketLobbyExit() {
            return new Promise(async (resolve) => {
                const handleLobbyExit = (data) => {
                    this.socket.off('lobbyExit');
                    resolve(data);
                };
                this.socket.on('lobbyExit', handleLobbyExit);
            });
        }
        preGame(arg_session) {
            this.socket.emit('preGame', arg_session);
        }
        async socketPreGame() {
            return new Promise(async (resolve) => {
                const handlePreGame = (data) => {
                    this.socket.off('preGame');
                    resolve(data);
                };
                this.socket.on('preGame', handlePreGame);
            });
        }
        game(arg_session) {
            this.socket.emit('game', arg_session);
        }
        async socketGame() {
            return new Promise(async (resolve) => {
                const handleGame = (data) => {
                    this.socket.off('game');
                    resolve(data);
                };
                this.socket.on('game', handleGame);
            });
        }
        gameExit(arg_session) {
            this.socket.emit('gameExit', arg_session);
        }
        async socketGameExit() {
            return new Promise(async (resolve) => {
                const handleGameExit = (data) => {
                    this.socket.off('gameExit');
                    resolve(data);
                };
                this.socket.on('gameExit', handleGameExit);
            });
        }
        gameEnd(arg_session) {
            this.socket.emit('gameEnd', arg_session);
        }
    */
}

export { ConnectionHandler };
