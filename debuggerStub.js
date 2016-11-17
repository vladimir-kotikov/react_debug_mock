/* jshint unused: true, undef: true, node: true, esversion: 6 */

const fs = require('fs');
const vm = require('vm');
const path = require('path');
const Module = require('module');
const messages = require('./messages');

const debuggerWorker = path.resolve(__dirname, 'debuggerWorker.js');
const debuggeeScript = path.resolve(__dirname, 'index.android.js');

function runInContext(scriptPath, context) {
    let fileContents = fs.readFileSync(scriptPath, 'utf8');
    vm.runInContext(fileContents, context, scriptPath);
}

// init sandbox
function createSandbox(scripttorun) {
    let scriptToRunModule = new Module(scripttorun);
    scriptToRunModule.paths = Module._nodeModulePaths(path.dirname(scripttorun));
    // In order for __debug_.require("aNonInternalPackage") to work, we need to initialize where
    // node searches for packages. We invoke the same method that node does:
    // https://github.com/nodejs/node/blob/de1dc0ae2eb52842b5c5c974090123a64c3a594c/lib/module.js#L452

    let sandbox = {
        __debug__: {
            require: (filePath) => scriptToRunModule.require(filePath),
        },
        __filename: scripttorun,
        __dirname: path.dirname(scripttorun),
        self: null,
        console: console,
        require: (filePath) => scriptToRunModule.require(filePath), // Give the sandbox access to require("<filePath>");
        importScripts: (url) => runInContext(debuggeeScript, sandboxContext), // Import script like using <script/>
        // Post message back to the UI thread - noop since we don't have packager/app attached
        postMessage: (object) => {},
        onmessage: null,
        postMessageArgument: null,
    };

    sandbox.self = sandbox;

    return sandbox;
}

let sandbox = createSandbox(debuggerWorker);
let sandboxContext = vm.createContext(sandbox);

runInContext(debuggerWorker, sandboxContext);

const postMessageScript = new vm.Script("onmessage({ data: postMessageArgument });");
let messageCount = 0;
let messagesInterval = setInterval(() => {
    // Simulate messages sent by react packager to debugger worker
    sandbox.postMessageArgument = messages[messageCount];
    postMessageScript.runInContext(sandboxContext);

    messageCount++;
    if (messageCount >= messages.length) {
        clearInterval(messagesInterval);
    }
}, 300);

