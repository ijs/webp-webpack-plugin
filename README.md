# webp-webpack-plugin

![Build Status](https://travis-ci.org/jiangtao/webp-webpack-plugin.svg?branch=master)
[![codecov](https://img.shields.io/codecov/c/github/jiangtao/webp-webpack-plugin.svg?style=flat-square)](https://codecov.io/gh/jiangtao/webp-webpack-plugin)
[![dependencies](https://img.shields.io/david/jiangtao/webp-webpack-plugin.svg?style=flat-square)](https://david-dm.org/jiangtao/webp-webpack-plugin)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/jiangtao/webp-webpack-plugin/master/LICENSE)

[简体中文文档](./README_zh-CN.md)

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
            quality: 80,
            inject: true, // inject the default runtime code
            injectCode: '' // inject your code
        }
    })
]
```

## WebPWebpackPlugin options

- match regexp that help plugin match the images need to transform to webp
- inject default false. When the value is false, not inject the runtime code. The priority level is lower than the option `injectCode`
- injectCode default ''. If the value is not empty, the priority level is more than the option `inject`
- limit default 0. If the image is smaller than the limit (in bytes) the image will not be transformed to webp

tips： the inject runtime code help to replace the image src with webp format.


## principle

- webp transform 

change the webpack plugin `emit` and modify the  `compilation.assets` object, then generate the webp format image with the same hash as the original img src

- inject runtime code

Thanks to [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) that support  [event hooks](https://github.com/jantimon/html-webpack-plugin#events)

## diff version webpack 

[diff version webpack comparison and configuration][https://github.com/jiangtao/webpack-diff-version-test]

## ChangeLog

- [2017-09-19] inject the code that can replace the img src by support webp and developers can inject your custom code
- [2017-10-05] add tests, travis, eslint and fix webpack2,3 bugs


## LICENSE

MIT




