import vscode from 'vscode';
// import { init } from 'vscode-nls-i18n';

// import commands from './commands';
// import { logger } from './logger';

import { WebSocket } from 'ws';

var defaultPort = process.env.NODE_ENV === 'production' ? 1111 : 2222;


function sayHello() {
	vscode.window.showInformationMessage(`Hello Boss [${process.env.NODE_ENV}]`);
} 

export function activate(context: vscode.ExtensionContext): void {

    console.log('ext Activated!',process.env)

	var isFocused = true

	vscode.window.showInformationMessage(`At your service Boss! - Able [${defaultPort}] [${process.env.NODE_ENV}] `);
	
	vscode.window.onDidChangeWindowState(winState => {
		console.log(winState)
		isFocused = winState.focused
	})
	
    const ws = new WebSocket(`ws://localhost:${defaultPort}`);
	// console.log(ws, textEditor.document.fileName)

	ws.on('error', function error(err) {
		// vscode.window.showInformationMessage(`[Error] Please check if Schnell is running and listening on ${port}`);
		console.log('ws error', err);

	});
	ws.on('open', function open() {
		console.log('ws open');
		ws.send(`id:code.Code`);
	});

	ws.on('message', function message(data) {
		console.log('received: %s', data, isFocused);
		// vscode.window.showInformationMessage(`${data} ${isFocused}`);

		if (!isFocused) return

		switch (`${data}`) {
			case `say-hello`:
				// open vscode new-Window with small size
				// make terminal fullscreen and add in editor like tabs
				// remove menubar, activity bar

				sayHello();
				break;

			default:
				break;
		}
	});

	ws.on('close', function message(data) {
		// vscode.window.showInformationMessage('Schnell : Disconnected!');
		console.log('ws close');
	});

    // init(context.extensionPath);
    // console.log(process.env.NODE_ENV)
    // logger.log(`language: ${vscode.env.language}`);
    // const { remoteName } = vscode.env;
    // if (remoteName) {
    //     logger.log(`active extension in ${remoteName} remote environment`);
    // }

    // commands.forEach((command) => {
    //     context.subscriptions.push(vscode.commands.registerCommand(command.identifier!, command.handler));
    // });
}

export function deactivate(): void {
    // logger.dispose();
}
