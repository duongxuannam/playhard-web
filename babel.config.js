module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
  plugins: [
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true,
      },
    ],
    [
      'module-resolver',
      {
        cwd: 'babelrc',
        alias: {
          controllers: './src/controllers',
          utils: './src/utils',
          routes: './src/routes',
          models: './src/models',
          services: './src/services',
        },
        extensions: ['.js'],
      },
    ],
  ],
  retainLines: true,
};
