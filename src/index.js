/**
 * reference: 
 * https://github.com/lcxfs1991/blog/issues/1
 * https://webpack.github.io/docs/how-to-write-a-plugin.html
 * why: https://isux.tencent.com/introduction-of-webp.html
 */

const sharp = require('sharp')

const defaultOpts = {
    match: /\.(png|jpe?g)$/,
    // http://sharp.dimens.io/en/stable/api-output/#webp
    webp: {
        quality: 80
    }
}

module.exports = class WebpWebpackPlugin {
    constructor(opts) {
        this.opts = Object.assign({}, defaultOpts, opts)
    }

    async apply(compiler) {
        compiler.plugin('emit', async (compilation, next) => {
            let assets, assetPath
            assets = Object.keys(compilation.assets).filter(assetPath => this.opts.match.test(assetPath))

            for (assetPath of assets) {
                if (!compilation.assets[`${assetPath}.webp`]) {
                    compilation.assets[`${assetPath}.webp`] = await this.wrapWebpRaw(compilation.assets[assetPath], `${assetPath}.webp`)
                }
            }

            next()
        })
    }

    _convertWebp(inputBuffer) {
        return new Promise((resolve, reject) => {
            sharp(inputBuffer).webp(this.opts.webp).toBuffer((err, data, info) => {
                if (err) {
                    reject(err)
                    return
                }

                resolve(data)
            })
        })
    }

    async wrapWebpRaw(raw, filename) {
        if (raw._value) {
            return Object.assign(clone(raw), { _value: await this._convertWebp(raw._value) })
        } else {
            return
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

