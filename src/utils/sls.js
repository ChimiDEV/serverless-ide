export const extractVariables = sls => {
  const regExp = /\${{([a-zA-Z]+):([a-zA-Z.]+)}}/g;

  return sls.match(regExp)?.groups;
};
