# webp-webpack-plugin

generate the webp image, make the same `hash` of original image. For example, `vue.e3e41b1.jpg` and `vue.e3e41b1.jpg.webp` exists at the same env.

## Install

```npm
npm i -D webp-webpack-plugin 
// or
yarn add -D webp-webpack-plugin
```

## Usage

in the webpack.config.js, the options `webp` refer to [sharp webp options](http://sharp.dimens.io/en/stable/api-output/#webp) 

```javascript
plugins: [
    new WebPWebpackPlugin({
        match: /(jpe?g|png)$/,
        webp: {
            quality: 80 
        }
    })
]
```


