import _ from 'lodash/fp';
import flatten from 'flat';

const getValueNode = document =>
  _.pipe(
    _.split('.'),
    p => [document.get('custom').get(p[0], true), p.slice(1)],
    ([initValue, paths]) =>
      _.reduce((node, path) => node.get(path, true), initValue, paths),
  );

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
const wrapIn = _.curry((wrap, res) => _.set(wrap, res, {}));
const wrapInWith = _.curry((wrap, fn, res) => wrapIn(wrap, fn(res)));

/**
 * Parses the `custom` object of SLS to a simple symbol tree
 * @returns {{_custom: any, get: function, symbols: {label: string, keyPath: string, description: string}[]}}
 */
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
