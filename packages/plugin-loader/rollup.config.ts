import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import camelCase from 'lodash.camelcase'
import typescript from 'rollup-plugin-typescript2'
import replace from 'rollup-plugin-replace'
import json from 'rollup-plugin-json'
import serve from 'rollup-plugin-serve'

import react from 'react'
import reactDom from 'react-dom'
import tslib from 'tslib'
import * as muiUtils from '@material-ui/utils'
import * as reactIs from 'react-is'

const SERVE = process.env.SERVE === 'true'

const pkg = require('./package.json')

const libraryName = 'plugin-loader'

export default {
  input: `src/${libraryName}.ts`,
  output: [
    { file: pkg.main, name: camelCase(libraryName), format: 'umd', sourcemap: true },
    { file: pkg.module, format: 'es', sourcemap: true }
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [],
  watch: {
    include: 'src/**'
  },
  plugins: [
    // Allow json resolution
    json(),
    // Compile TypeScript files
    typescript({ useTsconfigDeclarationDir: true }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs({
      // include: 'node_modules/**',
      namedExports: {
        react: Object.keys(react),
        tslib: Object.keys(tslib),
        'react-dom': Object.keys(reactDom),
        '@material-ui/utils': Object.keys(muiUtils),
        'react-is': Object.keys(reactIs),
      }
    }),

    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),

    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),

    // Resolve source maps to the original source
    sourceMaps(),

    ...(SERVE
      ? [
          serve({
            contentBase: 'dist',
            port: 1269,
            headers: {
              'Access-Control-Allow-Origin': '*',
            }
          })
        ]
      : [])
  ]
}
