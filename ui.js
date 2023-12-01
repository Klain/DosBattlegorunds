//ui.js
console.clear();
import inquirer from 'inquirer';
import keypress from 'keypress';

function cleanScreen() {
    console.clear();
}
function uiHeader(arg_title = false) {
    if (arg_title) {
        console.log('============================================');
        console.log(`          DOS BATTLEGROUNDS - ${arg_title}`);
        console.log('============================================\n');
    }

}
function uiWelcome(arg_name = false) {
    if (arg_name) {
        console.log(`\nBienvenido ${arg_name}`);
    }

}
function uiMessage(arg_message = false) {
    if (arg_message) {
        console.log(arg_message + "\n");
    }
}
async function uiStart(arg_message = false) {
    cleanScreen();
    uiHeader("Menu");
    uiMessage(arg_message);

    const optionsMenu = [
        { name: '1.Conectarse', value: 'connection' },
        { name: '2.Nuevo Usuario', value: 'newUser' },
        { name: '0.Salir', value: 'exit' }
    ];

    const answer = await inquirer.prompt({
        type: 'list',
        name: 'option',
        message: 'Selecciona una opción:',
        choices: optionsMenu,
        default: 'connection'
    });

    return answer.option;
}
async function uiConnection(arg_message = false) {
    cleanScreen();
    uiHeader("Conexion");
    uiMessage(arg_message);
    const optionsMenu = [
        {
            type: 'list',
            name: 'action',
            message: 'Seleccione una opción:',
            choices: ['Conectarse', 'Salir'],
        },
        {
            type: 'input',
            name: 'name',
            message: 'Introduzca el usuario',
            when: (answers) => answers.action === 'Conectarse',
        },
        {
            type: 'password',
            name: 'password',
            message: 'Introduzca la contraseña',
            when: (answers) => answers.action === 'Conectarse',
        },
    ];
    const answer = await inquirer.prompt(optionsMenu);
    if (answer.action === 'Salir') {
        return 'start';
    } else {
        return { name: answer.name, password: answer.password };
    }

}
async function uiNewUser(arg_message = false) {
    cleanScreen();
    uiHeader("Nuevo Usuario");
    uiMessage(arg_message);
    const optionsMenu = [
        {
            type: 'list',
            name: 'action',
            message: 'Seleccione una opción:',
            choices: ['Registrar usuario', 'Salir'],
        },
        {
            type: 'input',
            name: 'name',
            message: 'Introduzca el usuario',
            when: (answers) => answers.action === 'Registrar usuario',
        },
        {
            type: 'password',
            name: 'password',
            message: 'Introduzca la contraseña',
            when: (answers) => answers.action === 'Registrar usuario',
        },
        {
            type: 'password',
            name: 'password2',
            message: 'Introduzca la contraseña de nuevo',
            when: (answers) => answers.action === 'Registrar usuario',
        },
    ];

    const answer = await inquirer.prompt(optionsMenu);

    if (answer.action === 'Salir') {
        return 'start';
    }

    if (answer.password === answer.password2) {
        return { name: answer.name, password: answer.password };
    } else {
        error = "Las contraseñas no coinciden.";
        uiNewUser(error);
    }
}
async function uiMain(arg_message = false, arg_name = false) {
    cleanScreen();
    uiHeader("Principal");
    uiMessage(arg_message);
    uiWelcome(arg_name);

    const optionsMenu = [
        { name: '1.Nuevo Juego', value: 'newGame' },
        { name: '2.Perfil', value: 'main' },
        { name: '3.Configuracion', value: 'settings' },
        { name: '0.Salir', value: 'exit' }
    ];

    const answer = await inquirer.prompt({
        type: 'list',
        name: 'option',
        message: 'Selecciona una opción:',
        choices: optionsMenu,
        default: 'exit'
    });

    return answer.option;
}
async function uiSettings(arg_message = false) {
    cleanScreen();
    uiHeader("Configuracion");
    uiMessage(arg_message);

    const optionsMenu = [
        { name: '1.Actualizar Contraseña', value: 'updatePassword' },
        { name: '2.Eliminar Cuenta', value: 'deleteAccount' },
        { name: '0.Volver', value: 'main' }
    ];
    const answer = await inquirer.prompt({
        type: 'list',
        name: 'option',
        message: 'Selecciona una opción:',
        choices: optionsMenu,
        default: 'main'
    });


    return answer.option;
}
async function uiUpdatePassword(arg_message = false) {
    cleanScreen();
    uiHeader("Actualizar Contraseña");
    uiMessage(arg_message);

    const optionsMenu = [
        {
            type: 'list',
            name: 'action',
            message: 'Seleccione una opción:',
            choices: ['Actualizar Contraseña', 'Salir'],
        },
        {
            type: 'input',
            name: 'oldPassword',
            message: 'Introduzca la contraseña actual',
            when: (answers) => answers.action === 'Actualizar Contraseña',
        },
        {
            type: 'password',
            name: 'password',
            message: 'Introduzca la contraseña nueva',
            when: (answers) => answers.action === 'Actualizar Contraseña',
        },
        {
            type: 'password',
            name: 'password2',
            message: 'Introduzca la contraseña de nuevo',
            when: (answers) => answers.action === 'Actualizar Contraseña',
        },
    ];

    const answer = await inquirer.prompt(optionsMenu);

    if (answer.action === 'Salir') {
        return 'settings';
    }

    if (answer.password === answer.password2) {
        return { oldPassword: answer.oldPassword, password: answer.password };
    } else {
        error = "Las contraseñas no coinciden.";
        uiUpdatePassword(error);
    }
}
async function uiDeleteAccount(arg_message = false) {
    cleanScreen();
    uiHeader("Eliminar Cuenta");
    uiMessage(arg_message);

    const optionsMenu = [
        { name: '1.Eliminar Cuenta', value: 'deleteAccount' },
        { name: '0.Volver', value: 'settings' }
    ];
    const answer = await inquirer.prompt({
        type: 'list',
        name: 'option',
        message: '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.',
        choices: optionsMenu,
        default: 'settings'
    });

    return answer.option;
}
async function uiLobby(arg_message = false, arg_screen = []) {
    cleanScreen();
    uiHeader("Nuevo Juego");
    uiMessage(arg_message);
    console.log(arg_screen);
    return handleControls(true);
}
async function uiGame(arg_message = false, arg_screen = { renderedMap: [], renderedPlayerList: [] }, arg_dead = false, arg_end = false, arg_bot = false) {
    cleanScreen();
    uiHeader("Battle");
    if (arg_dead) {
        arg_message = "Has muerto: Puedes esperar al final de la partida o salir."
    }
    if (arg_end) {
        arg_message = "La partida ha terminado, ya puedes volver al menu."
    }
    uiMessage(arg_message);

    for (let i = 0; i < arg_screen.map.length; i++) {
        console.log(arg_screen.map[i] + "      " + arg_screen.playersList[i]);
    }
    if (!arg_bot) {
        return handleControls(arg_dead);
    } else {
        return { false: true, exit: false, key: false }
    }
}
async function handleControls(arg_onlyExit = false, arg_timeoutMillis = 1000) {
    return new Promise((resolve) => {
        let _timeoutId;

        const handleKeypress = (ch, key) => {
            clearTimeout(_timeoutId);
            let _data = {};
            if (!arg_onlyExit) {
                if (key && key.name) {
                    if (key.name === 'up' || key.name === 'down' || key.name === 'left' || key.name === 'right') {
                        _data.key = key.name;
                        _data.exit = false;
                    }
                }
            }
            if (key && key.ctrl && key.name === 'c') {
                _data.exit = true;
                _data.key = false;
            }

            process.stdin.off('keypress', handleKeypress);
            resolve(_data);
        };

        keypress(process.stdin);
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('keypress', handleKeypress);

        _timeoutId = setTimeout(() => {
            process.stdin.off('keypress', handleKeypress);
            resolve({ idle: true, exit: false, key: false });
        }, arg_timeoutMillis);
    });
}


export { uiStart, uiConnection, uiNewUser, uiMain, uiLobby, uiGame, uiSettings, uiUpdatePassword, uiDeleteAccount }