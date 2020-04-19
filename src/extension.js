import { stopClient, initClient } from './serverless.client';

/**
 *
 * @param {vscode.ExtensionContext} context
 */
export const activate = context => {
  console.log(
    'Congratulations, your extension "Serverless IDE" is now active!',
  );

  initClient(context);
};

export const deactivate = () => {
  return stopClient();
};

module.exports = {
  activate,
  deactivate,
};
