import _ from 'lodash/fp';

export const file = _.curry((documentManager, uri) => documentManager.get(uri));

export default documentManager => ({
  file: file(documentManager),
});
