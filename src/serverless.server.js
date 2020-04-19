/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import Ajv from 'ajv';
import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  DidChangeConfigurationNotification,
  TextDocumentSyncKind,
  DiagnosticSeverity,
  Range,
} from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import parseYML from './utils/parseYml';
import schema from '../schemas/serverless.schema.json';

const connection = createConnection(ProposedFeatures.all);
const cConsole = connection.console;
const documents = new TextDocuments(TextDocument);
// Keep the client capabilities as global
let clientCapabilities;

const settingsCache = {};
const getSettings = resourceUri =>
  settingsCache[resourceUri] ??
  connection.workspace
    .getConfiguration({
      scopeUri: resourceUri,
      section: 'slsLanguageServer',
    })
    .then(config => {
      settingsCache[resourceUri] = config;
      return config;
    });

connection.onInitialize(({ capabilities }) => {
  // Keep client capabilities in state
  clientCapabilities = capabilities;

  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      completionProvider: {
        resolveProvider: false,
      },
      workspace: {
        workspaceFolders: {
          supported: capabilities?.workspace?.workspaceFolders ?? false,
          changeNotifications: true,
        },
      },
    },
  };
});

connection.onInitialized(() => {
  if (clientCapabilities?.workspace?.configuration) {
    // Register for all configuration changes.
    connection.client.register(
      DidChangeConfigurationNotification.type,
      undefined,
    );
  }
});

/**
 *
 * @param {TextDocument} document
 */
const validateServerlessYml = async (document, settings) => {
  cConsole.log('Starting to validate Document');

  // First check if the yaml file is valid
  const [err, sls, sourceMap] = parseYML(document.getText());
  if (err) {
    cConsole.error('Failed to parse YAML');
    console.log(err);
    const { start, end } = err.linePos;
    return settings.showYAMLError
      ? [
          {
            range: Range.create(
              start.line - 1,
              start.col - 1,
              end.line - 1,
              end.col - 1,
            ),
            severity: DiagnosticSeverity.Error,
            code: 'FAILED_YML_PARSE',
            source: 'Serverless Language Server',
            message: err.message,
          },
        ]
      : [];
  }

  // console.log(sls);
  // Validate against serverless schema
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const valid = validate(sls);
  if (!valid) {
    const validateError = validate.errors[0];
    if (!validateError.dataPath) {
      return [
        {
          range: Range.create(0, 0, document.lineCount, 1000),
          severity: DiagnosticSeverity.Error,
          code: 'INVALID_SLS_CONFIG',
          source: 'Serverless Language Server',
          message: validateError.message,
        },
      ];
    }
    const { start: errStart, end: errEnd } = sourceMap.lookup(
      validateError.dataPath.split('.').slice(1),
      sls,
    );
    console.log({ errStart, errEnd });
    return [
      {
        range: Range.create(
          errStart.line - 1,
          errStart.col - 1,
          errEnd.line - 1,
          errEnd.col - 1,
        ),
        severity: DiagnosticSeverity.Error,
        code: 'INVALID_SLS_CONFIG',
        source: 'Serverless Language Server',
        message: validateError.message,
      },
    ];
  }

  return [];
  // connection.sendDiagnostics({
  //   uri: document.uri,
  //   version: document.version,
  //   diagnostics: [
  //     Diagnostic.create(
  //       Range.create(0, 0, 0, 10),
  //       'Something is wrong here',
  //       DiagnosticSeverity.Error,
  //       'FAILED_PARSE',
  //       'Serverless Language Server',
  //     ),
  //   ],
  // });
};

documents.onDidChangeContent(async ({ document }) => {
  connection.sendDiagnostics({
    uri: document.uri,
    version: document.version,
    diagnostics: await validateServerlessYml(
      document,
      await getSettings(document.uri),
    ),
  });
});

connection.onCompletion(() => {
  return [];
});

// // This handler provides the initial list of the completion items.
// connection.onCompletion(_textDocumentPosition => {
//   // The pass parameter contains the position of the text document in
//   // which code complete got requested. For the example we ignore this
//   // info and always provide the same completion items.
// return [
//   {
//     label: 'TypeScript',
//     kind: CompletionItemKind.Text,
//     data: 1,
//   },
//   {
//     label: 'JavaScript',
//     kind: CompletionItemKind.Text,
//     data: 2,
//   },
// ];
// });

// // This handler resolves additional information for the item selected in
// // the completion list.
// connection.onCompletionResolve(item => {
//   if (item.data === 1) {
//     item.detail = 'TypeScript details';
//     item.documentation = 'TypeScript documentation';
//   } else if (item.data === 2) {
//     item.detail = 'JavaScript details';
//     item.documentation = 'JavaScript documentation';
//   }
//   return item;
// });

documents.listen(connection);
connection.listen();
