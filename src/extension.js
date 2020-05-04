import path from 'path';
import _ from 'lodash/fp';
// eslint-disable-next-line import/no-unresolved
import { window } from 'vscode';
import { initClient } from './serverless.client';

const absoluteServerPath = context =>
  context.asAbsolutePath(path.join('dist', 'serverless.server.js'));

const pushDisposable = _.curry((context, disposable) =>
  context.subscriptions.push(disposable),
);

export const activate = context =>
  _.pipe(absoluteServerPath, initClient, pushDisposable(context))(context);

export const deactivate = () =>
  window.showInformationMessage('Stopping Serverless Language Server...');

module.exports = {
  activate,
  deactivate,
};
