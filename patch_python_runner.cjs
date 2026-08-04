const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const pythonRunner = `
import { spawn } from 'child_process';
function runPythonWorker(command: any): Promise<any> {
    return new Promise((resolve) => {
        const py = spawn('python3', ['tg_worker.py']);
        let output = '';
        py.stdout.on('data', data => output += data.toString());
        py.stderr.on('data', data => console.error(data.toString()));
        py.on('close', () => {
            try {
                const lines = output.trim().split('\\n');
                resolve(JSON.parse(lines[lines.length - 1]));
            } catch (e) {
                resolve({ success: false, message: "Python error" });
            }
        });
        py.stdin.write(JSON.stringify(command) + '\\n');
        py.stdin.end();
    });
}
`;

code = code.replace(`import express from 'express';`, `import express from 'express';\n${pythonRunner}`);
fs.writeFileSync('server.ts', code);
