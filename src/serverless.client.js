import path from 'path';
// eslint-disable-next-line import/no-unresolved
import { workspace } from 'vscode'; // vscode does exist

import { LanguageClient, TransportKind } from 'vscode-languageclient';

let client;

export const initClient = context => {
  // The server is implemented in node
  const serverModule = context.asAbsolutePath(
    path.join('dist', 'serverless.server.js'),
  );

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: { execArgv: ['--nolazy', '--inspect=6010'] },
    },
  };

  // Options to control the language client
  const clientOptions = {
    documentSelector: [{ language: 'yaml', pattern: '**/serverless.yml' }],
    synchronize: {
      fileEvents: workspace.createFileSystemWatcher('**/serverless.yml'),
    },
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    'slsLanguageServer',
    'Serverless Language Server',
    serverOptions,
    clientOptions,
  );

  // Start the client. This will also launch the server
  client.start();
  console.log('Language Client started');
};

export const stopClient = () => {
  if (!client) {
    return undefined;
  }
  console.log('Language Client will be stopped');
  return client.stop();
};
