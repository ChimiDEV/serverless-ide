import _ from 'lodash/fp';
import { AST, parseDocument, parse, Document as YMLDocument } from 'yaml';
import YAMLSourceMap from 'yaml-source-map';
import { YAMLError } from 'yaml/util';

export type LinePos = {
  line: number;
  col: number;
};

export type Location = {
  filename?: string;
  start: LinePos;
  end: LinePos;
};

export type ParsedYML = YMLDocument.Parsed;

export const getValueNode = (
  document: ParsedYML,
): ((path: string) => AST.Node) =>
  _.pipe(
    _.split('.'),
    (p: string[]): [AST.Collection, string[]] => [
      document.get('custom').get(p[0], true),
      p.slice(1),
    ],
    ([initValue, paths]): AST.Node =>
      _.reduce((node, path) => node.get(path, true), initValue, paths),
  );

export const parseYML = (
  str: string,
): [
  YAMLError | null,
  object?,
  { lookup(path: string[], object: object): Location }?,
  ParsedYML?,
] => {
  const sourceMap = new YAMLSourceMap();
  try {
    const ymlDocument = parseDocument(str, {
      keepCstNodes: true /* must specify this */,
    });

    return [null, sourceMap.index(ymlDocument), sourceMap, ymlDocument];
  } catch (_) {
    // parseDocument does not provide errors with line count. Use parse again...
    try {
      return parse(str, { prettyErrors: true });
    } catch (err) {
      return [err];
    }
  }
};
