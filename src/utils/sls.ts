export const extractVariables = (
  sls: string,
): { [key: string]: string } | undefined => {
  const regExp = /\${{([a-zA-Z]+):([a-zA-Z\.]+)}}/g;

  return sls.match(regExp)?.groups;
};
