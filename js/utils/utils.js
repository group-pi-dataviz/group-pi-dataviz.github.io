/**
 * Converte camelCase in dash-case
 * @param {string} str - Stringa in camelCase
 * @returns {string} - Stringa in dash-case
 * @example camelToDash('borderRadius') → 'border-radius'
 */
export function camelToDash(str) {
    return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
}

/**
 * Converte dash-case in camelCase
 * @param {string} str - Stringa in dash-case
 * @returns {string} - Stringa in camelCase
 * @example dashToCamel('border-radius') → 'borderRadius'
 */
export function dashToCamel(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}
