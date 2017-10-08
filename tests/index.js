var test = require('ava')
var webpack = require('webpack')
var fs = require('fs')
var path = require('path')
var semver = require('semver')
var version = semver.major(require('webpack/package.json').version)
var HtmlWebpackPlugin = require('html-webpack-plugin')

process.chdir(__dirname)

var Plugin = require('../src/index')
var compiler
var config
var plugin
var util

test.beforeEach(t => {
  util = require('../src/util')
  config = require(`./config/webpack${version}`)
  plugin = new Plugin({
    inject: true,
    minify: true,
    injectCode: "console.log('hello webp webpack plugin')" // the code just for tests
  })
  config.plugins = (config.plugins || []).concat(new HtmlWebpackPlugin({
    filename: path.resolve(process.cwd(), 'dist/index.html')
  }), plugin)
  compiler = webpack(config)
})

test.cb('util compress', t => {
  util.compress('./src/entry.js').then(data => {
    t.true(data === "console.log('test webp-webpack-plugin');require('./assets/pic.jpg')")
    t.end()
  })

  util.compress('./src/entry1.js').catch(err => {
    t.true(!!err)
    t.end()
  })
})

test.cb('util read', t => {
  util.read('./src/entry.js').then(data => {
    t.true(data === "console.log('test webp-webpack-plugin')\r\nrequire('./assets/pic.jpg')")
    t.end()
  })

  util.compress('./src/entry1.js').catch(err => {
    t.true(!!err)
    t.end()
  })
})


test('plugin default opts', t => {
  t.is(plugin.opts.match instanceof RegExp, true)
  t.is(plugin.opts.webp.quality, 80)
  t.is(plugin.opts.inject, true)
  t.is(plugin.opts.imgSrc, 'data-src')
  t.is(plugin.opts.minify, true)
  t.true(plugin.opts.injectCode.length !== 0)
})

test.cb('webpack run', t => {
  compiler.run((err, stats) => {
    if (err) {
      t.throws(function () {
        throw err
      })
    }

    const assets = stats.compilation.assets
    const [originalPath, transformedPath] = Object.keys(assets)
      .filter(chunkname => /^img\//.test(chunkname))

    Object.keys(assets).forEach(k => {
      t.true(fs.existsSync(assets[k].existsAt))
    })

    t.true(originalPath + '.webp' === transformedPath)
    t.end()
  })
})