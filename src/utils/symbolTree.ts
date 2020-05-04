import _ from 'lodash/fp';
import { getValueNode, ParsedYML } from './yml';
import flatten from 'flat';

export type ServerlessCustomSymbol = {
  label: string;
  keyPath: string;
  unused: boolean;
  description?: string | null;
};

export type ServerlessSymbolTree = {
  _custom: object;
  get(path: string | string[]): unknown;
  symbols: ServerlessCustomSymbol[];
};

const extractCustom = _.getOr({}, 'custom');
const lastKeyPart = _.pipe(_.split('.'), _.last);
const keyPaths = _.pipe(flatten, _.keys);

const extractSymbols = (
  document: ParsedYML,
): ((sls: object) => ServerlessCustomSymbol[]) =>
  _.pipe(
    keyPaths,
    _.map((keyPath: string) => ({
      label: lastKeyPart(keyPath)!,
      keyPath,
      unused: false,
      description: getValueNode(document)(keyPath).comment,
    })),
  );

// Applies one argument to all functions
const toAll = (...fns: Function[]) => (x: object): object[] =>
  fns.map(fn => fn(x));

// Wrap a object in a key (additionally transform with fn before)
const wrapIn = _.curry((key: string, o: object) => _.set(key, o, {}));
const wrapInWith = _.curry((key: string, fn: Function, o: object) =>
  wrapIn(key, fn(o)),
);

const customSymbolTree = (
  sls: object,
  document: ParsedYML,
): ServerlessSymbolTree =>
  _.pipe(
    toAll(
      wrapInWith('_custom', extractCustom),
      wrapInWith('get', ({ custom }) => (p: string | string[]): unknown =>
        _.get(p, custom),
      ),
      wrapInWith('symbols', _.pipe(extractCustom, extractSymbols(document))),
    ),
    _.mergeAll,
  )(sls);

export default customSymbolTree;
