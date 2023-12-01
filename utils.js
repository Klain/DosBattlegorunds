//utils.js
import fs from 'fs';


class UsersIO {
    constructor(arg_path = "./.session") {
        this._path = arg_path;
    }
    async init() {
        try {
            const _file = await fs.promises.readFile(this._path, 'utf-8');
            return JSON.parse(_file);
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.promises.writeFile(this._path, "", 'utf-8');
            }
        }
    }
    async saveSession(arg_session) {
        try {
            await fs.promises.writeFile(this._path, JSON.stringify(arg_session), 'utf-8');
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.promises.writeFile(this._path, '', 'utf-8');
                guardarsession(arg_session);
            } else {
                console.error(`Error al escribir el fichero:${this._path}`, error.message);
            }
        }
    }
    async deleteSession() {
        try {
            if (fs.existsSync(this._path)) {
                fs.unlinkSync(this._path);
                console.log(`El archivo ${this._path} ha sido eliminado.`);
            } else {
                console.log(`El archivo ${this._path} no existe.`);
            }
        } catch (error) {

            console.error(`Error al eliminar el fichero:${this._path}`, error.message);

        }
    }
}
class UserManager {
    constructor() {
    }
    async init() {
        this._io = new UsersIO();
        this.session = await this._io.init();
    }
    async saveSession(arg_session) {
        this.session = arg_session;
        await this._io.saveSession(arg_session);
    }
    async deleteSession() {
        this.session = null;
        await this._io.deleteSession();
    }

    getSession() {
        return this.session;
    }
    setSession(arg_key, arg_value) {
        return this.session[arg_key] = arg_value;
    }
}
class GameManager {
    constructor() {
    }
    isValidPosition(arg_x, arg_y, arg_screen) {
        const rows = arg_screen.length;
        const columns = arg_screen[0].length;
        if (rows === 0) {
            return false;
        }
        if (arg_x >= 1 && arg_x < columns - 1 && arg_y >= 1 && arg_y < rows - 1) {
            return true;
        } else {
            return false;
        }
    }
    moveUser(arg_direction, arg_user, arg_screen) {
        if (arg_direction != undefined) {
            const _newX = arg_user.session.X + (arg_direction === 'right' ? 1 : arg_direction === 'left' ? -1 : 0);
            const _newY = arg_user.session.Y + (arg_direction === 'down' ? 1 : arg_direction === 'up' ? -1 : 0);
            if (this.isValidPosition(_newX, _newY, arg_screen)) {
                arg_user.session.X = _newX;
                arg_user.session.Y = _newY;
            }
        }
    }
    moveUserRandom(arg_user, arg_screen) {
        const _directions = ['up', 'down', 'left', 'right'];
        const _randomDirection = _directions[Math.floor(Math.random() * _directions.length)];

        const _newX = arg_user.session.X + (_randomDirection === 'right' ? 1 : _randomDirection === 'left' ? -1 : 0);
        const _newY = arg_user.session.Y + (_randomDirection === 'down' ? 1 : _randomDirection === 'up' ? -1 : 0);

        if (this.isValidPosition(_newX, _newY, arg_screen)) {
            arg_user.session.X = _newX;
            arg_user.session.Y = _newY;
        }
    }
}

export { UserManager, GameManager };