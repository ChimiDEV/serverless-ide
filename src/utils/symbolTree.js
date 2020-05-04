import _ from 'lodash/fp';
import flatten from 'flat';
import { getValueNode } from './yml';

// type ServerlessCustomSymbol = {
//   label: string;
//   keyPath: string;
//   description?: string | null;
// };

// type ServerlessSymbolTree = {
//   _custom: object;
//   get(path: string | string[]): unknown;
//   symbols: ServerlessCustomSymbol[];
// };

const extractCustom = _.getOr({}, 'custom');
const lastKeyPart = _.pipe(_.split('.'), _.last);
const keyPaths = _.pipe(flatten, _.keys);

const extractSymbols = document =>
  _.pipe(
    keyPaths,
    _.map(keyPath => ({
      label: lastKeyPart(keyPath),
      keyPath,
      description: getValueNode(document)(keyPath).comment,
    })),
  );

// Applies one argument to all functions
const toAll = (...fns) => x => fns.map(fn => fn(x));

// Wrap a object in a key (additionally transform with fn before)
const wrapIn = _.curry((key, o) => _.set(key, o, {}));
const wrapInWith = _.curry((key, fn, o) => wrapIn(key, fn(o)));

const customSymbolTree = (sls, document) =>
  _.pipe(
    toAll(
      wrapInWith('_custom', extractCustom),
      wrapInWith('get', ({ custom }) => p => _.get(p, custom)),
      wrapInWith('symbols', _.pipe(extractCustom, extractSymbols(document))),
    ),
    _.mergeAll,
  )(sls);

export default customSymbolTree;
