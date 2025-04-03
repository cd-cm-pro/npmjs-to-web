const { exec } = require('child_process');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// ["a", "b", "c", "d"] -> {"a": "b", "c": "d"}
Array.prototype.toObject = function () {
    let arr = this; 
    if (arr.length % 2 !== 0) {
        throw new Error("Array length must be even");
    }
    const obj = {};
    for (let i = 0; i < arr.length; i += 2) {
        obj[arr[i]] = arr[i + 1];
    }
    return obj;
};

const arg = {
    "--execModuleName": {
        "description": "The name of the module to execute",
        "type": "string",
        "required": true
    },
    "--resultFileName": {
        "description": "The name of the result file",
        "type": "string",
        "value": "result.js",
        "required": false
    },
    "--help": {
        "description": "Show help",
        "type": "boolean",
        "value": false,
        "required": false
    }
};

const args = process.argv.slice(2);

const argKeys = Object.keys(arg);

if (args.includes("--help")) {
    console.log("Usage: node index.js [options]");
    console.log("Options:");
    argKeys.forEach((key) => {
        console.log(`  ${key}: ${arg[key].description}`);
    });
    process.exit(0);
}

argKeys.forEach((key) => {
    const index = args.indexOf(key);
    if (index !== -1) {
        if (arg[key].type === "boolean") {
            arg[key].value = true; // boolean 타입의 경우 true로 설정
        } else {
            const value = args[index + 1];
            if (value === undefined || value.startsWith("--")) {
                console.error(`Value for ${key} is required`);
                process.exit(1);
            }
            arg[key].value = value;
        }
    } else if (arg[key].required) {
        console.error(`${key} is required`);
        process.exit(1);
    }
});

const execModuleName = arg["--execModuleName"].value;

if (!execModuleName || typeof execModuleName !== 'string') {
    console.error("Invalid module name provided for --execModuleName");
    process.exit(1);
}

const buildDir = path.join(__dirname, "build");
const distDir = path.join(__dirname, "dist");
const srcDir = path.join(__dirname, "build", "src");

if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true, force: true });
}
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}

fs.mkdirSync(buildDir);
fs.mkdirSync(srcDir);
fs.mkdirSync(distDir);

exec(`npm install ${execModuleName} --prefix ${buildDir}`, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error installing ${execModuleName}: ${error.message}`);
        return;
    }
    if (stderr) {
        console.warn(`Warning: ${stderr}`);
    }
    console.log(`stdout: ${stdout}`);

    fs.writeFileSync(`${buildDir}/webpack.config.js`, `
const path = require('path');

module.exports = {
    entry: './build/src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    mode: 'production'
};
`);

    fs.writeFileSync(`${buildDir}/src/index.js`, `
const ${execModuleName.replace(/-/g, "_")} = require('${execModuleName}');
window.${execModuleName.replace(/-/g, "_")} = ${execModuleName.replace(/-/g, "_")};
`);

    const webpackProcess = spawn('npx', ['webpack', '--config', `${buildDir}/webpack.config.js`], { 
        stdio: ['inherit', 'pipe', 'pipe'], 
        shell: true 
    });

    webpackProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    webpackProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    webpackProcess.on('error', (error) => {
        console.error(`Error running webpack: ${error.message}`);
    });

    webpackProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Webpack process exited with code ${code}`);
            return;
        }

        fs.writeFileSync(`${distDir}/${arg["--resultFileName"].value}`, fs.readFileSync(`${buildDir}/dist/bundle.js`));
        console.log(`Result file created at ${distDir}/${arg["--resultFileName"].value}`);
    });
});