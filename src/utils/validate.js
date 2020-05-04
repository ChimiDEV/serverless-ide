import { extractVariables } from './sls';

export const validateSymbols = sls => extractVariables(JSON.stringify(sls));
