import yml from 'yaml';
import YAMLSourceMap from 'yaml-source-map';

/**
 * @returns {[Error, any, any, yml.Document.Parsed]}
 */
export default str => {
  const sourceMap = new YAMLSourceMap();
  try {
    const ymlDocument = yml.parseDocument(str, {
      keepCstNodes: true /* must specify this */,
    });

    return [null, sourceMap.index(ymlDocument), sourceMap, ymlDocument];
  } catch (_) {
    // parseDocument does not provide errors with line count. Use parse again...
    try {
      return yml.parse(str, { prettyErrors: true });
    } catch (err) {
      return [err, null, null];
    }
  }
};
