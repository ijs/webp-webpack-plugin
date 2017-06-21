/**
 * reference: 
 * https://github.com/lcxfs1991/blog/issues/1
 * https://webpack.github.io/docs/how-to-write-a-plugin.html
 */
const defaultOpts = {
    match: /\.(png|jpe?g)$/
}

function WebPWebpackPlugin(opts) {
    this.opts = Object.assign({}, defaultOpts, opts)
}

WebPWebpackPlugin.prototype.apply = function(compiler) {
    compiler.plugin('emit', (compilation, next) => {
        Object.keys(compilation.assets)
            .filter(assetPath => this.opts.match.test(assetPath))
            .map(assetPath => compilation.assets[`${assetPath}.webp`] = compilation.assets[assetPath])

        next()
    })
}

module.exports = WebPWebpackPlugin