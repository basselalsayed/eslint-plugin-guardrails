import * as eslint from 'eslint';

/**
 * Generates an array of ESLint configurations based on provided directories and options.
 *
 * @param {string[]} directories - A list of directory names to include in the configuration.
 * @param {Object} options - Configuration options.
 * @param {string} [options.sourceDirectory='src'] - The root source directory for the project.
 * @param {string} [options.baseUrl='.'] - The base URL for module resolution.
 * @param {number} [options.staticUpwardPathDepth=3] - The maximum depth for upward directory import checks.
 *                                                     For example, a depth of 3 includes paths like '../../../' and '../../../index'.
 * @param {(dir: string) => string} [options.getAlias] - Optional function to transform a directory name into an import alias.
 *
 * @example
 * // Example usage of getAlias:
 * recommendedConfig(['components', 'utils'], {
 *   getAlias: (dir) => `@/${dir}`,
 * });
 *
 * @returns {import('eslint').Linter.Config[]} An array of ESLint configuration objects.
 */
declare function recommended(directories: string[], { sourceDirectory, baseUrl, staticUpwardPathDepth, getAlias, }: {
    sourceDirectory?: string;
    baseUrl?: string;
    staticUpwardPathDepth?: number;
    getAlias?: (dir: string) => string;
}): eslint.Linter.Config[];

declare namespace configs {
    export { recommended };
}
declare namespace _default {
    export { configs };
}

export { configs, _default as default };
