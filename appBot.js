//index.js
/*




                case 'game':
                await conexion.sleep(1000);
                conexion.game(user.session);
                respServidor = await conexion.socketGame() || { estado: false };
                if (respServidor.estado == true) {
                    if (respServidor.delay == false) {
                        if (respServidor.end) {
                            posicion = "principal";
                            if (respServidor.dead) {
                                mensaje = "Esta vez has perdido pero puedes intentarlo de nuevo";
                            } else {
                                mensaje = "WINNER WINNER CHICKEN DINNER";
                            }
                            conexion.gameEnd(user.session);
                        } else {
                            await uiGame(undefined, respServidor.screen, respServidor.dead, respServidor.end, true);
                            gameManager.moverUsuarioAleatorio(user, respServidor.screen.mapa);
                        }
                    }
 */
//index.js
console.clear();
import { ConnectionHandler } from '../2_client/connection.js';
import { UserManager, GameManager } from '../2_client/utils.js';
import { uiStart, uiConnection, uiNewUser, uiMain, uiLobby, uiGame, uiSettings, uiUpdatePassword, uiDeleteAccount } from '../2_client/ui.js';

async function startApplication() {
    const argumentos = process.argv.slice(2);
    let _user = new UserManager();
    const connection = new ConnectionHandler();
    const gameManager = new GameManager();
    let respMenu = {}; let respServer = {}; let message = ''; let position = '';
    connection.emitter("newUser", { name: argumentos[0], password: '1' });
    connection.emitter("login", { name: argumentos[0], password: '1' });
    respServer = await connection.socketHandler("login");
    _user.session = { idSession: respServer.idSession, name: respServer.name };
    position = 'newGame';
    do {
        switch (position) {
            case 'start':
                position = await uiStart(message);
                break;
            case 'connection':

                respMenu = await uiConnection(message);
                if (respMenu != 'start') {
                    connection.emitter('login', respMenu);
                    respServer = await connection.socketHandler('login');
                    if (respServer.state) {
                        let _session = { idSession: respServer.idSession, name: respServer.name };
                        await _user.saveSession(_session);
                        position = 'main';
                    } else {
                        position = 'connection';
                        message = 'El usuario o la contraseña no son correctas';
                    }
                } else {
                    position = 'start';
                    break;
                }
                break;
            case 'newUser':
                respMenu = await uiNewUser(message);
                if (respMenu != 'start') {
                    connection.emitter('newUser', respMenu);
                    respServer = await connection.socketHandler('newUser');
                    if (respServer.state) {
                        let _session = { idSession: respServer.idSession, name: respServer.name };
                        await _user.saveSession(_session);
                        position = 'main';
                    } else {
                        position = 'newUser';
                    }
                } else {
                    position = 'start';
                }
                break;
            case 'main':

                position = await uiMain(message, _user.getSession().name);
                break;
            case 'settings':
                position = await uiSettings(message);
                break;
            case 'updatePassword':
                respMenu = await uiUpdatePassword(message);
                if (respMenu != 'settings') {
                    respMenu.idSession = _user.getSession().idSession;
                    connection.emitter('updatePassword', respMenu);
                    respServer = await connection.socketHandler('updatePassword');
                    if (respServer.state) {
                        message = 'Contraseña actualizada';

                    } else {
                        message = 'Error al actualizar Contraseña ';
                    }
                }
                position = 'settings';
                break;
            case 'deleteAccount':
                position = await uiDeleteAccount();
                if (position == 'deleteAccount') {
                    connection.emitter('removeUser', _user.getSession());
                    respServer = await connection.socketHandler('removeUser');
                    if (respServer.state) {
                        await _user.deleteSession();
                        process.exit();
                    } else {
                        message = 'El usuario no pudo ser eliminado.Pruebe mas tarde.'
                        position = 'settings';
                    }
                }
                break;
            case 'newGame':
                position = 'main';
                connection.emitter('newGame', _user.getSession());
                respServer = await connection.socketHandler('newGame');
                if (respServer.state) {
                    position = 'lobby';
                    _user.getSession().idMap = respServer.idMap;
                }
                break;
            case 'lobby':
                await connection.sleep(1000);
                connection.emitter('lobby', _user.getSession());
                respServer = await connection.socketHandler('lobby');
                if (respServer.state == true) {
                    if (respServer.preGame == true) {
                        position = 'pregame';
                    } else {
                        respMenu = await uiLobby(message, respServer.screen);
                        if (respMenu.exit) {
                            connection.emitter('lobbyExit', _user.getSession());
                            respServer = await connection.socketHandler('lobbyExit');
                            if (respServer.state == true) {
                                position = 'main';
                                delete _user.getSession().idMap;
                            }
                        }
                    }
                } else {
                    position = 'main';
                }
                break;
            case 'pregame':
                await connection.sleep(1000);
                connection.emitter('preGame', _user.getSession());
                respServer = await connection.socketHandler('preGame');
                if (respServer.state == true) {
                    _user.getSession().X = respServer.X;
                    _user.getSession().Y = respServer.Y;
                    position = 'game';
                } else {
                    position = 'main';
                }
                break;
            case 'game':
                await connection.sleep(1000);
                connection.emitter('game', _user.getSession());
                respServer = await connection.socketHandler('game');
                if (respServer.state == true) {
                    if (respServer.delay != true) {
                        if (respServer.end) {
                            position = 'main';
                            if (respServer.dead) {
                                message = 'Esta vez has perdido pero puedes intentarlo de nuevo';
                            } else {
                                message = 'WINNER WINNER CHICKEN DINNER';
                            }
                            connection.emitter('gameEnd', _user.getSession());
                        } else {
                            respMenu = await uiGame(message, respServer.screen, respServer.dead, respServer.end, true);
                            gameManager.moveUserRandom(_user, respServer.screen.map);
                            if (respMenu.exit) {
                                connection.emitter('gameExit', _user.getSession());
                                respServer = await connection.socketHandler('gameExit');
                                if (respServer.state) {
                                    delete _user.getSession().X;
                                    delete _user.getSession().Y;
                                    position = 'main';
                                }
                            }
                            if (respMenu.key) {
                                gameManager.moveUser(respMenu.key, _user, respServer.screen.map);
                            }
                        }
                    }
                } else {
                    position = 'main';
                }
                break;
            case 'exit':
                console.log('Saliendo de la aplicación. ¡Hasta luego!');
                process.exit(0);
                break;
            default:
                console.log('Opción no válida. Inténtalo de nuevo.');
                process.exit(0);
        }
    } while (true);
}
startApplication();