import { extractVariables } from './sls';

export const validateSymbols = (sls: object) =>
  extractVariables(JSON.stringify(sls));
