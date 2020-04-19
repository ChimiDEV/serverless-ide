import yml from 'yaml';
import YAMLSourceMap from 'yaml-source-map';

export default str => {
  const sourceMap = new YAMLSourceMap();
  try {
    const sls = sourceMap.index(
      yml.parseDocument(str, {
        keepCstNodes: true /* must specify this */,
        prettyErrors: true,
      }),
    );

    return [null, sls, sourceMap];
  } catch (_) {
    // parseDocument does not provide errors with line count. Use parse again...
    try {
      return yml.parse(str, { prettyErrors: true });
    } catch (err) {
      return [err, null, null];
    }
  }
};
