var test = require('ava')
var webpack = require('webpack')
var fs = require('fs')
var path = require('path')
var semver = require('semver')
var version = semver.major(require('webpack/package.json').version)
var HtmlWebpackPlugin = require('html-webpack-plugin')

process.chdir(__dirname)

var Plugin = require('../src/index')

var pluginDefault
var pluginInjectRuntime
var pluginInjectCustomCode
var util


test.beforeEach(t => {
  util = require('../src/util')
  pluginDefault = webpackCreator('default')
  pluginInjectRuntime = webpackCreator('runtime')
  pluginInjectCustomCode = webpackCreator('custom')
})

test('plugin default opts', t => {
  t.is(pluginDefault.plugin.opts.match instanceof RegExp, true)
  t.is(pluginDefault.plugin.opts.webp.quality, 80)
  t.is(pluginDefault.plugin.opts.inject, false)
  t.is(pluginDefault.plugin.opts.imgSrc, 'data-src')
  t.is(pluginDefault.plugin.opts.minify, true)
  t.true(pluginDefault.plugin.opts.injectCode.length === 0)
})

test('plugin inject runtime opts', t => {
  t.is(pluginInjectRuntime.plugin.opts.match instanceof RegExp, true)
  t.is(pluginInjectRuntime.plugin.opts.webp.quality, 80)
  t.is(pluginInjectRuntime.plugin.opts.inject, true)
  t.is(pluginInjectRuntime.plugin.opts.imgSrc, 'data-src')
  t.is(pluginInjectRuntime.plugin.opts.minify, true)
  t.true(pluginInjectRuntime.plugin.opts.injectCode.length === 0)
})

test('plugin inject custom code opts', t => {
  t.is(pluginInjectCustomCode.plugin.opts.match instanceof RegExp, true)
  t.is(pluginInjectCustomCode.plugin.opts.webp.quality, 80)
  t.is(pluginInjectCustomCode.plugin.opts.inject, false)
  t.is(pluginInjectCustomCode.plugin.opts.imgSrc, 'data-src')
  t.is(pluginInjectCustomCode.plugin.opts.minify, true)
  t.true(pluginInjectCustomCode.plugin.opts.injectCode.length !== 0)
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


test.cb('webpack default run', t => {
  pluginDefault.compiler.run((err, stats) => {
    if (err) {
      t.throws(function() {
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

test.cb('webpack inject runtime', t => {
  pluginInjectRuntime.compiler.run((err, stats) => {
    if (err) {
      t.throws(function() {
        throw err
      })
    }
    t.true(fs.readFileSync(pluginInjectRuntime.mainPath, { encoding: 'utf-8' }).indexOf('window.__webp_webpack_plugin_img_src__') !== -1)
    t.end()
  })
})

test.cb('webpack inject custom code', t => {
  pluginInjectCustomCode.compiler.run((err, stats) => {
    if (err) {
      t.throws(function() {
        throw err
      })
    }

    t.true(fs.readFileSync(pluginInjectCustomCode.mainPath, { encoding: 'utf-8' }).indexOf('test webp-webpack-plugin') !== -1)
    t.end()

  })
})

function webpackCreator(type) {
  var pluginOpts = {
    default: {
      mainPath: path.resolve(process.cwd(), 'dist/index.html'),
      plugins: [],
      opts: {},
      compiler: null
    },
    runtime: {
      mainPath: path.resolve(process.cwd(), 'dist/index-runtime.html'),
      plugins: [],
      opts: {
        inject: true,
        minify: true
      },
      compiler: null
    },
    custom: {
      mainPath: path.resolve(process.cwd(), 'dist/index-custom.html'),
      plugins: [],
      opts: {
        injectCode: "console.log('test webp-webpack-plugin')"
      },
      compiler: null
    }
  }
  var opts = pluginOpts[type].opts
  var plugin = new Plugin(opts)
  var plugins = pluginOpts[type].plugins.concat(
    new HtmlWebpackPlugin({
      filename: pluginOpts[type].mainPath
    }),
    new Plugin(opts)
  )
  var config = require(`./config/webpack${version}`)
  config.plugins = plugins

  return {
    mainPath: pluginOpts[type].mainPath,
    plugin,
    compiler: webpack(config)
  }
}