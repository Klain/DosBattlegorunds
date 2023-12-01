import { spawn } from 'child_process';
const rutaScript = 'appBot.js';
const vecesAEjecutar = process.argv.slice(2);
const retardoEntreIteraciones = 2000; // 1 segundo

for (let i = 0; i < vecesAEjecutar; i++) {
    const argumentos = [`Bot${i}`];

    setTimeout(() => {
        const proceso = spawn('gnome-terminal', ['--', 'node', rutaScript, ...argumentos]);

        proceso.stdout.on('data', (datos) => {
            console.log(`Salida del proceso ${i + 1}: ${datos}`);
        });

        proceso.stderr.on('data', (error) => {
            console.error(`Error en el proceso ${i + 1}: ${error}`);
        });

        proceso.on('close', (codigo) => {
            console.log(`Proceso ${i + 1} cerrado con código de salida ${codigo}`);
        });
    }, i * retardoEntreIteraciones);
}