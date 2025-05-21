/**
 * Generates a list of restricted import paths for all index.ts(x) files in a module.
 *
 * @param {string} dirAbsolutePath - Absolute path to the module directory (e.g. src/components)
 * @param {string} alias - Import alias for the module (e.g. \@/components)
 * @param {number} depth - The maximum depth of upward directory traversal to generate.
 *                             A depth of 3 will generate paths like '../../../' and '../../../index'.
 * @returns {Array<{ name: string, message: string }>}
 */
export function getRestrictedIndexImports(dirAbsolutePath: string, alias: string, depth: number): Array<{
    name: string;
    message: string;
}>;
