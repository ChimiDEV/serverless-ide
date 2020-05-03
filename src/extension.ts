import path from 'path';
import _ from 'lodash/fp';
import { window, ExtensionContext } from 'vscode';
import { initClient } from './serverless.client';
import { Disposable } from 'vscode-languageclient';

const absoluteServerPath = (context: ExtensionContext): string =>
  context.asAbsolutePath(path.join('dist', 'serverless.server.js'));

const pushDisposable = _.curry(
  (context: ExtensionContext, disposable: Disposable): number =>
    context.subscriptions.push(disposable),
);

export const activate = (context: ExtensionContext): number =>
  _.pipe(absoluteServerPath, initClient, pushDisposable(context))(context);

export const deactivate = (): void => {
  window.showInformationMessage('Stopping Serverless Language Server...');
};

module.exports = {
  activate,
  deactivate,
};
