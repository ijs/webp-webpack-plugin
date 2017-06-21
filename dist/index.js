'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * reference: 
 * https://github.com/lcxfs1991/blog/issues/1
 * https://webpack.github.io/docs/how-to-write-a-plugin.html
 * why: https://isux.tencent.com/introduction-of-webp.html
 */

const sharp = require('sharp');

const defaultOpts = {
    match: /\.(png|jpe?g)$/,
    // http://sharp.dimens.io/en/stable/api-output/#webp
    webp: {
        quality: 80
    }
};

module.exports = class WebpWebpackPlugin {
    constructor(opts) {
        this.opts = Object.assign({}, defaultOpts, opts);
    }

    apply(compiler) {
        var _this = this;

        return _asyncToGenerator(function* () {
            compiler.plugin('emit', (() => {
                var _ref = _asyncToGenerator(function* (compilation, next) {
                    let assets, assetPath;
                    assets = Object.keys(compilation.assets).filter(function (assetPath) {
                        return _this.opts.match.test(assetPath);
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
                return Object.assign(clone(raw), { _value: yield _this2._convertWebp(raw._value) });
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