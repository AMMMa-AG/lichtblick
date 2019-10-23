/*
 * $Id: webpack.config.js 47519 2019-03-12 18:45:23Z robertj $
 *
 * Overrides Ionic webpack.config.js to expose some environment variables.
 */

"use strict";

const webpack = require('webpack');
const ionicConfig = require('@ionic/app-scripts/config/webpack.config.js');

const defines = new webpack.DefinePlugin({
  'process.env': {
    DISABLE_SHARING: JSON.stringify(process.env.DISABLE_SHARING === 'true'),
    WHITE_LABEL: JSON.stringify(process.env.WHITE_LABEL === 'true'),
    IONIC_ENV: JSON.stringify(process.env.IONIC_ENV),
    DEBUG: JSON.stringify(process.env.IONIC_ENV === 'dev'),
    RELEASE: JSON.stringify(process.env.IONIC_ENV === 'prod')
  }
});

ionicConfig.dev.plugins.push(defines);
ionicConfig.prod.plugins.push(defines);

// generate hashed chunks for cache busting
ionicConfig.prod.output['chunkFilename'] = "[name].[chunkhash].chunk.js";

module.exports = ionicConfig;
