/**
 * Create a GUID
 * @see https://stackoverflow.com/a/2117523/319711
 *
 * @returns RFC4122 version 4 compliant GUID
 */
export const uuid4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    // tslint:disable-next-line:no-bitwise
    const r = (Math.random() * 16) | 0;
    // tslint:disable-next-line:no-bitwise
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Convert 'camelCase' name to 'Camel case'
 * @param camelCase
 */
export const camelCaseToString = (camelCase: string) =>
  camelCase
    // two or more consequetive upper case letters are joined
    .replace(/([A-Z])([A-Z])/g, char => char[0] + char[1].toLowerCase())
    // insert a space before all caps
    .replace(/([A-Z])/g, ' $1')
    // downcase all characters
    .replace(/./g, char => char.toLowerCase())
    // uppercase the first character
    .replace(/^./i, char => char.toUpperCase());
