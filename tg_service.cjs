const { spawn } = require('child_process');

function runPythonWorker(command) {
    return new Promise((resolve, reject) => {
        const py = spawn('python3', ['tg_worker.py']);
        let output = '';
        let errorOutput = '';

        py.stdout.on('data', (data) => {
            output += data.toString();
        });

        py.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        py.on('close', (code) => {
            try {
                // There might be some logs in stdout, we just need the last JSON line
                const lines = output.trim().split('\n');
                const lastLine = lines[lines.length - 1];
                resolve(JSON.parse(lastLine));
            } catch (e) {
                console.error("Python Error:", errorOutput);
                resolve({ success: false, message: "Internal Error: " + (errorOutput || output) });
            }
        });
        
        py.stdin.write(JSON.stringify(command) + '\n');
        py.stdin.end();
    });
}

module.exports = { runPythonWorker };
