'use strict';

module.exports = {
  comments: false,
  plugins: ['@babel/transform-runtime'],
  presets: [
    [
      '@babel/env',
      {
        targets: 'Node >= 10',
        modules: process.env.BABEL_ESM ? false : 'cjs',
        shippedProposals: true,
        loose: true,
      },
    ],
  ],
};
