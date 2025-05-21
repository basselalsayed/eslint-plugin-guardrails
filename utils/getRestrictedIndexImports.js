import fs from 'node:fs';
import path from 'node:path';

/**
 * Generates a list of relative upward import paths (e.g., '../../..', '../../../index'),
 * each paired with a standardized warning message. Useful for linting or discouraging
 * deep relative imports in favor of aliases or absolute paths.
 *
 * @param {number} [depth=3] - The maximum depth of upward directory traversal to generate.
 *                             A depth of 3 will generate paths like '../../../' and '../../../index'.
 * @returns {Array<{ name: string, message: string }>} An array of objects containing the import path (`name`)
 *                                                     and a message discouraging its usage.
 *
 * @example
 * const paths = generateStaticUpwardPaths(2);
 * // Output:
 * // [
 * //   { name: '../../index', message: "Avoid importing '../../index'. Use aliased or direct file paths." },
 * //   { name: '../..', message: "Avoid importing '../..'. Use aliased or direct file paths." },
 * //   { name: '../index', message: "Avoid importing '../index'. Use aliased or direct file paths." },
 * //   { name: '..', message: "Avoid importing '..'. Use aliased or direct file paths." }
 * // ]
 */
function generateStaticUpwardPaths(depth = 3) {
  const paths = [];

  for (let i = depth; i >= 1; i--) {
    const base = Array(i).fill('..').join('/');
    paths.push(`${base}/index`, base);
  }

  return paths.map((name) => ({
    name,
    message: `Avoid importing '${name}'. Use aliased or direct file paths.`,
  }));
}

/**
 * Recursively walks through a directory and collects relative paths to all index.ts or index.tsx files.
 *
 * @param {string} dir - Absolute path to start walking from.
 * @param {string} baseRelativePath - Relative path from the module root (used for nested structure).
 * @returns {string[]} - List of relative paths to directories containing index files.
 */
function findIndexFileDirs(dir, baseRelativePath = '') {
  const indexDirs = [];
  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const relPath = path.join(baseRelativePath, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      indexDirs.push(...findIndexFileDirs(fullPath, relPath));
    } else if (
      (entry === 'index.ts' || entry === 'index.tsx') &&
      baseRelativePath !== ''
    ) {
      indexDirs.push(baseRelativePath);
    }
  }

  return indexDirs;
}

/**
 * Generates a list of restricted import paths for all index.ts(x) files in a module.
 *
 * @param {string} dirAbsolutePath - Absolute path to the module directory (e.g. src/components)
 * @param {string} alias - Import alias for the module (e.g. @/components)
 * @param {number} depth - The maximum depth of upward directory traversal to generate.
 *                             A depth of 3 will generate paths like '../../../' and '../../../index'.
 * @returns {Array<{ name: string, message: string }>}
 */
export function getRestrictedIndexImports(dirAbsolutePath, alias, depth) {
  const indexDirs = findIndexFileDirs(dirAbsolutePath);

  const staticUpwardPaths = generateStaticUpwardPaths(depth);

  const indexPathViolations = indexDirs.flatMap((relPath) => [
    {
      message: `Avoid importing index file: ${alias}/${relPath}/index.ts. Import specific files instead.`,
      name: `${alias}/${relPath}`,
    },
    {
      message: `Avoid importing index file: ../${relPath}/index.ts. Import specific files instead.`,
      name: `../${relPath}`,
    },
  ]);

  return [...staticUpwardPaths, ...indexPathViolations];
}
