import {
  LanguageClient,
  TransportKind,
  Disposable,
} from 'vscode-languageclient';
import { workspace } from 'vscode';

export const initClient = (serverModule: string): Disposable =>
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
