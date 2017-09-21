'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * reference: 
 * https://github.com/lcxfs1991/blog/issues/1
 * https://webpack.github.io/docs/how-to-write-a-plugin.html
 * why: https://isux.tencent.com/introduction-of-webp.html
 */

const sharp = require('sharp');
const minify = require('minify');
const fs = require('fs');
const path = require('path');

const defaultOpts = {
  match: /\.(png|jpe?g)$/,
  // http://sharp.dimens.io/en/stable/api-output/#webp
  webp: {
    quality: 80
  },
  inject: true,
  imgSrc: 'data-src',
  minify: true
};

const runtimePath = path.resolve(__dirname, './runtime.js');

module.exports = class WebpWebpackPlugin {
  constructor(opts) {
    this.opts = Object.assign({}, defaultOpts, opts);
  }

  apply(compiler) {
    var _this = this;

    return _asyncToGenerator(function* () {
      let injectScripts, opts;
      opts = _this.opts;

      compiler.plugin('emit', (() => {
        var _ref = _asyncToGenerator(function* (compilation, next) {
          let assets, assetPath;
          assets = Object.keys(compilation.assets).filter(function (assetPath) {
            return opts.match.test(assetPath);
          });

          for (assetPath of assets) {
            if (!compilation.assets[`${assetPath}.webp`]) {
              compilation.assets[`${assetPath}.webp`] = yield _this.wrapWebpRaw(compilation.assets[assetPath], `${assetPath}.webp`);
            }
          }

          next();
        });

        return function (_x, _x2) {
          return _ref.apply(this, arguments);
        };
      })());

      compiler.plugin('compilation', function (compilation) {
        compilation.plugin('html-webpack-plugin-alter-asset-tags', (() => {
          var _ref2 = _asyncToGenerator(function* (htmlPluginData, next) {

            if (opts.inject) {
              injectScripts = injectScripts || (yield _this._getInjectRuntime(runtimePath, opts));

              if (injectScripts) {
                htmlPluginData.head.unshift(injectScripts);
                console.log('[webp plugin]:', 'inject successfully');
              }
            } else if (opts.injectCode) {
              htmlPluginData.head.unshift(opts.injectCode);
            }

            next(null, htmlPluginData);
          });

          return function (_x3, _x4) {
            return _ref2.apply(this, arguments);
          };
        })());
      });
    })();
  }
  // inject default runtime code, replace all img tags src
  _getInjectRuntime(path, opts) {
    return _asyncToGenerator(function* () {
      let injectScripts;
      try {
        injectScripts = {
          tagName: 'script',
          closeTag: true,
          attributes: {
            type: 'text/javascript'
          },
          innerHTML: `window.__webp_webpack_plugin_img_src__='${opts.imgSrc}';`
        };
        if (opts.minify) {
          injectScripts.innerHTML += yield compress(path);
        } else {
          injectScripts.innerHTML += yield read(path);
        }
      } catch (e) {
        injectScripts = null;
      }
      return injectScripts;
    })();
  }

  _convertWebp(inputBuffer) {
    return new Promise((resolve, reject) => {
      sharp(inputBuffer).webp(this.opts.webp).toBuffer((err, data, info) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(data);
      });
    });
  }

  wrapWebpRaw(raw, filename) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      if (raw._value) {
        return Object.assign(clone(raw), { _value: yield _this2._convertWebp(raw._value), existsAt: `${raw.existsAt}.webp` });
      } else {
        return;
      }
    })();
  }
};

function clone(src) {
  let result, ret;
  result = {};

  for (ret in src) {
    if (typeof src[ret] === 'object') {
      result[ret] = clone(src[ret]);
    } else {
      result[ret] = src[ret];
    }
  }

  return result;
}

function read(filename, encoding = 'utf-8') {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, { encoding: encoding }, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}

function compress(filename) {
  return new Promise((resolve, reject) => {
    minify(filename, (error, data) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(data);
    });
  });
}