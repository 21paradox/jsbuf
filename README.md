# karma-sauce-example

> An example of using the [Karma](http://karma-runner.github.io/) test runner with [Sauce Labs](https://saucelabs.com)' browser cloud to run JavaScript unit tests.

![sauce-labs-loves-karma](images/sauce-loves-karma.png)

[![david-dm-status-badge](https://david-dm.org/saucelabs/karma-sauce-example/dev-status.png)](https://david-dm.org/saucelabs/karma-sauce-example#info=devDependencies&view=table)
## Getting Started

To get started, clone the repo:

```bash
git clone https://github.com/saucelabs/karma-sauce-example.git && cd karma-sauce-example
```

Then run the following command to install the Karma command line interface globally and this repo's local node dependencies:

```bash
npm install -g karma-cli && npm install 
```

*Note: make sure you have [node.js](http://nodejs.org/) installed before running the above command.* 

## Running Karma locally

You then can run Karma locally to see how it works with the `karma start` command. Try saving a source file in the `src` folder or a test file in the `test` folder to see Karma automatically re-run the tests on the latest source code. 

By default, this example runs [jasmine](http://jasmine.github.io/2.0/introduction.html) tests in Chrome and Firefox on your local machine, and you can add more browsers that you have installed in the `karma.conf.js`'s `browsers` array.

## Running Karma with the [karma-sauce-launcher](https://github.com/karma-runner/karma-sauce-launcher) plugin

To use Karma with Sauce, add your Sauce Labs username and access key to the `sauce.json` file (if you don't have an account, you can sign up [here](https://saucelabs.com/signup/plan/free)).

You can now run the unit tests on Sauce with the `karma start karma.conf-ci.js` command. Note that this will by default start [Sauce Connect](https://saucelabs.com/docs/connect) to establish a secure tunnel between your local machine and Sauce's cloud. To speed up the time it takes to connect to Sauce's cloud, you can start Sauce Connect in the background by using one of the [binaries](https://saucelabs.com/docs/connect) or the [Mac app](https://saucelabs.com/mac) and then setting the `startConnect` option to `false` in the `karma.conf-ci.js` file (make sure to change it back to `true` before running on CI).

## Using the karma-sauce-launcher in CI

It is cool to run your unit tests on Sauce locally while you develop, but even cooler to run them on a continuous integration system with every commit to your codebase. To integrate your CI with Sauce check out the instructions for [Travis](http://saucelabs.com/opensource/travis), [Jenkins](http://saucelabs.com/jenkins), or [Bamboo](http://saucelabs.com/bamboo).

The provided `karma.conf-ci.js` file already is set up to read environment variables on CI so you shouldn't need to modify it as long as the `process.env.SAUCE_USERNAME` and `process.env.SAUCE_ACCESS_KEY` are set properly during the build.

### Example CI integration

This repo demonstrates using Sauce with Travis CI. Here is a status badge which shows the build status of this repo's master branch and links to the latest build:
[![Build Status](https://travis-ci.org/saucelabs/karma-sauce-example.png?branch=master)](https://travis-ci.org/saucelabs/karma-sauce-example)

*Note: the build is failing on purpose as a demo of Sauce catching bugs in different browsers.*
