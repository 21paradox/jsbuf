var fs = require('fs');

module.exports = function(config) {

  // Use ENV vars on Travis and sauce.json locally to get credentials
  if (!process.env.SAUCE_USERNAME) {
    if (!fs.existsSync('sauce.json')) {
      console.log('Create a sauce.json with your credentials based on the sauce-sample.json file.');
      process.exit(1);
    } else {
      process.env.SAUCE_USERNAME = require('./sauce').username;
      process.env.SAUCE_ACCESS_KEY = require('./sauce').accessKey;
    }
  }

  // Browsers to run on Sauce Labs
//  var customLaunchers = {
//    'SL_Chrome': {
//      base: 'SauceLabs',
//      browserName: 'chrome'
//    },
//    'SL_InternetExplorer': {
//      base: 'SauceLabs',
//      browserName: 'internet explorer',
//      version: '10'
//    },
//    'SL_FireFox': {
//      base: 'SauceLabs',
//      browserName: 'firefox',
//    }
//  };
  

  var browsers = [];

  ['42', '28'].forEach(function (version) {
      ['WIN7', 'WIN8.1', 'WIN8', 'XP'].forEach(function (platform) {
          browsers.push({
              browserName: 'googlechrome',
              platform: platform,
              version: version
          });
      });
  });

  ['11', '10', '9', '8'].forEach(function (val) {
      browsers.push({
          browserName: 'internet explorer',
          platform: 'WIN7',
          version: val
      });
  });

  browsers = browsers.concat([
      {
          browserName: 'internet explorer',
          platform: 'WIN8.1',
          version: '11'
      },

      {
          browserName: 'internet explorer',
          platform: 'WIN8',
          version: '10'
      },

      {
          browserName: 'internet explorer',
          platform: 'XP',
          version: '8'
      },

      {
          browserName: 'safari',
          platform: 'OS X 10.10',
          version: '8.0'
      },

      {
          browserName: 'firefox',
          platform: 'WIN7',
          version: 37
      },

      {
          browserName: 'firefox',
          platform: 'WIN8',
          version: 37
      },

      {
          browserName: 'firefox',
          platform: 'WIN8.1',
          version: 37
      }
  ]);

  ['7', '6'].forEach(function (val) {
      browsers.push({
          browserName: 'internet explorer',
          platform: 'XP',
          version: val
      });
  });

  var customLaunchers = {};
  browsers.forEach(function (val, key) {
      val.base = 'SauceLabs';
      customLaunchers[key] = val;
  });
  
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'build/jsbuf.js',
      'test/Long.js',
      'test/ByteBufferAB.js',
      'test/ProtoBuf.js',
      'test/spec-all.js'
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots', 'saucelabs'],


    // web server port
    port: 9876,

    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    sauceLabs: {
      testName: 'Karma and Sauce Labs demo'
    },
    captureTimeout: 120000,
    customLaunchers: browsers,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: Object.keys(browsers),
    singleRun: true
  });
  
};
