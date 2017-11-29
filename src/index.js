/**
 * reference: 
 * https://github.com/lcxfs1991/blog/issues/1
 * https://webpack.github.io/docs/how-to-write-a-plugin.html
 * why: https://isux.tencent.com/introduction-of-webp.html
 */
const sharp = require('sharp')
const path = require('path')
const fileType = require('file-type');
const { read, compress } = require('./util')

const defaultOpts = {
  match: /\.(png|jpe?g)$/,
  // http://sharp.dimens.io/en/stable/api-output/#webp
  webp: {
    quality: 80
  },
  limit: 0,
  inject: false,
  imgSrc: 'data-src',
  minify: true,
  injectCode: ''
}

const runtimePath = path.resolve(__dirname, './runtime.js')

module.exports = class WebpWebpackPlugin {
  constructor(opts) {
    this.opts = Object.assign({}, defaultOpts, opts)
  }

  async apply(compiler) {
    let injectScripts, opts
    opts = this.opts

    compiler.plugin('emit', async (compilation, next) => {
      let assets, assetPath
      assets = Object.keys(compilation.assets).filter(assetPath => opts.match.test(assetPath))

      for (assetPath of assets) {
        let raw = compilation.assets[assetPath];
        if (_this._canConvert(raw.source()) && raw.size() > opts.limit && !compilation.assets[`${assetPath}.webp`]) {
          compilation.assets[`${assetPath}.webp`] = await this.wrapWebpRaw(raw, `${assetPath}.webp`)
        }
      }

      next()
    })

    compiler.plugin('compilation', compilation => {

      compilation.plugin('html-webpack-plugin-alter-asset-tags', async (htmlPluginData, next) => {
        if (opts.injectCode) {
          htmlPluginData.head.unshift({
            tagName: 'script',
            closeTag: true,
            attributes: {
              type: 'text/javascript'
            },
            innerHTML: opts.injectCode
          })
        } else if (opts.inject) {
          if (!injectScripts) {
            injectScripts = await this._getInjectRuntime(runtimePath, opts)
          }
          if (injectScripts) {
            htmlPluginData.head.unshift(injectScripts)
            console.log('[webp webpack plugin]: inject runtime code successfully')
          }
        }
        next(null, htmlPluginData)
      })
    })
  }
  // inject default runtime code, replace all img tags src
  async _getInjectRuntime(path, opts) {
    let injectScripts
    try {
      injectScripts = {
        tagName: 'script',
        closeTag: true,
        attributes: {
          type: 'text/javascript'
        },
        innerHTML: `window.__webp_webpack_plugin_img_src__='${opts.imgSrc}';`
      }
      if (opts.minify) {
        injectScripts.innerHTML += await compress(path)
      } else {
        /* istanbul ignore next */
        injectScripts.innerHTML += await read(path)
      }
      
    } catch (e) {
      /* istanbul ignore next */
      injectScripts = null
    }
    return injectScripts
  }

  _canConvert(inputBuffer) {
    const type = fileType(inputBuffer);
    if (!type) return false;

    return type.ext === 'png' || type.ext === 'jpg';
  }

  _convertWebp(inputBuffer) {
    return new Promise((resolve, reject) => {
      sharp(inputBuffer).webp(this.opts.webp).toBuffer((err, data, info) => {
        /* istanbul ignore if */
        if (err) {
          return reject(err)
        }

        resolve(data)
      })
    })
  }

  async wrapWebpRaw(raw, filename) {
    if (raw._value) {
      const value = await this._convertWebp(raw._value)
      return Object.assign(clone(raw), {
        _value: value,
        source() {
          return value
        },
        size() {
          return value.length
        }
      })
    }
  }
}

function clone(src) {
  let result, ret
  result = {}

  for (ret in src) {
    if (typeof src[ret] === 'object') {
      result[ret] = clone(src[ret])
    } else {
      result[ret] = src[ret]
    }
  }

  return result
}
