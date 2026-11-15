const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('../webpack.config.js');

const compiler = Webpack(webpackConfig);
const devServerOptions = Object.assign({}, webpackConfig.devServer, {
  open: false,
});
const server = new WebpackDevServer(devServerOptions, compiler);

const runServer = async () => {
  console.log('Starting dev server on port 3000...');
  await server.start();
  console.log('Project is running at: http://localhost:3000');
};

runServer().catch(err => {
  console.error(err);
});
