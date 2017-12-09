/**
 * reference: 
 * https://github.com/lcxfs1991/blog/issues/1
 * https://webpack.github.io/docs/how-to-write-a-plugin.html
 * why: https://isux.tencent.com/introduction-of-webp.html
 */
const sharp = require('sharp')
const path = require('path')
const fileType = require('file-type')
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
  injectCode: '',
  checkStrict: false,
  format: '[name].[ext].webp'
}

const runtimePath = path.resolve(__dirname, './runtime.js')

module.exports = class WebpWebpackPlugin {
  constructor(opts) {
    this.opts = Object.assign({}, defaultOpts, opts)
    // make the correct process to limit two format
    const validFormat = ['[name].[ext].webp', '[name].webp']
    if (validFormat.indexOf(this.opts.format) === -1) {
      throw new TypeError("options format is out of ['[name].[ext].webp','[name].webp']")
    }
  }

  async apply(compiler) {
    let injectScripts, opts
    opts = this.opts

    compiler.plugin('emit', async (compilation, next) => {
      let assets, assetPath
      assets = Object.keys(compilation.assets).filter(assetPath => opts.match.test(assetPath))

      for (assetPath of assets) {
        let raw = compilation.assets[assetPath]
        let targetPath = this._getFormatPath(assetPath)

        if (this._canConvert(raw) && raw.size() > opts.limit && !compilation.assets[`${assetPath}.webp`]) {
          compilation.assets[targetPath] = await this.wrapWebpRaw(raw, targetPath)
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

  _getFormatPath(assetPath) {

    const meta = path.parse(assetPath)
    const newPath = this.opts.format.replace(/\[(\w+)\]/g, ($0, $1) => {
      if ($1 === 'ext') {
        return meta[$1].substr(1)
      }
      return meta[$1] || ''
    })
    const { ext, name, base } = path.parse(newPath)
    return path.format(Object.assign(meta, { ext, name, base }))
  }
  /**
   * check webpack raw can be transformed to webp
   * @param {*} raw 
   * @param {*} assetPath 
   */
  _canConvert(raw, assetPath) {
    if (this.opts.checkStrict) {
      const type = fileType(raw.source())
      if (!type) return false
      return type.ext === 'png' || type.ext === 'jpg'
    } else {
      return true
    }

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
