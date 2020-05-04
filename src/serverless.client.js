import { LanguageClient, TransportKind } from 'vscode-languageclient';
// eslint-disable-next-line import/no-unresolved
import { workspace } from 'vscode';

// eslint-disable-next-line import/prefer-default-export
export const initClient = serverModule =>
  // Initializing the client also starts the connection. This will launch the server as well
  new LanguageClient(
    'slsLanguageServer',
    'Serverless Language Server',
    {
      // Options to control the language server
      run: { module: serverModule, transport: TransportKind.ipc },
      debug: {
        module: serverModule,
        transport: TransportKind.ipc,
        options: { execArgv: ['--nolazy', '--inspect=6010'] },
      },
    },
    {
      // Options to control the language client
      documentSelector: [{ language: 'yaml', pattern: '**/serverless.yml' }],
      synchronize: {
        fileEvents: workspace.createFileSystemWatcher('**/serverless.yml'),
      },
    },
  ).start();
