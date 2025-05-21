import path from 'node:path';

import { getRestrictedIndexImports } from './utils/getRestrictedIndexImports.js';

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
 */
export default function recommended(
  directories,
  {
    sourceDirectory = 'src',
    baseUrl = '.',
    staticUpwardPathDepth = 3,
    getAlias = undefined,
  }
) {
  const rulesPerDirectory = directories.map((dir) => {
    const alias = getAlias?.(dir) || dir;
    const absolutePath = path.resolve(baseUrl, sourceDirectory, dir);
    const restricted = getRestrictedIndexImports(
      absolutePath,
      alias,
      staticUpwardPathDepth
    );

    const forbid = directories
      .map((dir) => getAlias?.(dir) || dir)
      .flatMap((_alias) =>
        _alias === alias ? undefined : [`${_alias}/**/*`, `${_alias}/*`]
      )
      .filter(Boolean);

    return {
      files: [`src/${dir}/**/*.{ts,tsx}`],
      rules: {
        'import/no-internal-modules': ['error', { forbid }],
        'no-restricted-imports': [
          'error',
          {
            paths: [
              ...restricted,
              {
                name: alias,
                message: `Avoid importing '${alias}' from within ${dir}/. Use direct file paths.`,
              },
            ],
            patterns: [
              {
                group: ['../../**/*'],
                message: `Avoid deeply nested imports. Use direct alias imports instead.`,
              },
            ],
          },
        ],
      },
    };
  });

  return rulesPerDirectory;
}
