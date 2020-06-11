import { resolve, join } from 'path';
import { ensureDir, readdir, remove } from 'fs-extra';
import { terser } from 'rollup-plugin-terser';
import { getBabelInputPlugin } from '@rollup/plugin-babel';

import { name } from './package.json';

const config = {
  name,
  srcPath: 'src',
  srcFiles: ['main.js'],
  distPath: 'dist',
  // first defines rollup format value, second filename postfix (defaults to firsts)
  formats: [['iife', ''], ['es'], ['cjs'], ['amd']],
  steps: [
    {},
    { shouldMinify: true },
    { es5: true },
    { es5: true, shouldMinify: true },
  ],
};

const createRollupConfig = ({ shouldMinify, es5 }) => ({
  input: config.srcFiles.map((file) => resolve(config.srcPath, file)),
  output: config.formats.map(([format, filePostfix = format]) => ({
    name: config.name,
    file: resolve(
      config.distPath,
      `${config.name.toLowerCase()}${filePostfix ? `.${filePostfix}` : ''}${
        es5 ? '.es5' : ''
      }${shouldMinify ? '.min' : ''}.js`,
    ),
    format,
  })),
  plugins: [
    shouldMinify && terser(),
    es5 && getBabelInputPlugin({ babelHelpers: 'bundled' }),
  ],
});

export default async () => {
  // ensure that the output path exists
  await ensureDir(config.distPath);

  // empty the output folder, except for README
  await Promise.all(
    (await readdir(config.distPath))
      .filter((fileName) => fileName !== 'README.md')
      .map((fileName) => remove(join(config.distPath, fileName))),
  );

  // generate and run an array of rollup configs
  return config.steps.map(createRollupConfig);
};
