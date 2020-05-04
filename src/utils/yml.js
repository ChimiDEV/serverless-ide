import _ from 'lodash/fp';
import { parseDocument, parse } from 'yaml';
import YAMLSourceMap from 'yaml-source-map';

export const getValueNode = document =>
  _.pipe(
    _.split('.'),
    p => [document.get('custom').get(p[0], true), p.slice(1)],
    ([initValue, paths]) =>
      _.reduce((node, path) => node.get(path, true), initValue, paths),
  );

export const parseYML = str => {
  const sourceMap = new YAMLSourceMap();
  try {
    const ymlDocument = parseDocument(str, {
      keepCstNodes: true /* must specify this */,
    });

    return [null, sourceMap.index(ymlDocument), sourceMap, ymlDocument];
  } catch (unusedErr) {
    // parseDocument does not provide errors with line count. Use parse again...
    try {
      return parse(str, { prettyErrors: true });
    } catch (err) {
      return [err];
    }
  }
};
