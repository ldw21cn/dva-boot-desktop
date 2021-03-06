const path = require('path');
const { injectBabelPlugin } = require('react-app-rewired');
const rewireLess = require('react-app-rewire-less-modules');
const removeWebpackPlugins = require('react-app-rewire-unplug');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');

module.exports = function override(config, env) {
  config.target = 'electron-renderer';

  config.resolve = {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      components: path.resolve(__dirname, 'src/components'),
      assets: path.resolve(__dirname, 'src/assets'),
      package: path.resolve(__dirname, 'package.json'),
      utils: path.resolve(__dirname, 'src/utils')
    }
  };

  if (env === 'development') {
    config = injectBabelPlugin(['dva-hmr'], config);
  } else {
    // 替换uglify为uglify-es否则,build时会出错
    config = removeWebpackPlugins(config, env, {
      pluginNames: ['UglifyJsPlugin']
    });
    config.plugins = (config.plugins || []).concat([
      new ParallelUglifyPlugin({
        uglifyES: {}
      })
    ]);
  }

  config = injectBabelPlugin('transform-decorators-legacy', config);
  config = injectBabelPlugin(
    ['import', { libraryName: 'antd', style: true }],
    config
  );

  config.externals = {};

  return rewireLess.withLoaderOptions(
    `${env === 'production' ? 'app' : '[local]'}-[hash:base64:8]`,
    {
      modifyVars: {}
    }
  )(config, env);
};
