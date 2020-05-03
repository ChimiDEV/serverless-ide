import * as _ from 'lodash/fp';
import { TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

/**
 * @param {TextDocuments}
 */
export const file = _.curry(
  (documentManager: TextDocuments<TextDocument>, uri: string) =>
    documentManager.get(uri),
);

export default (
  documentManager: TextDocuments<TextDocument>,
): { file(uri: string): TextDocument | undefined } => ({
  file: file(documentManager),
});
