# webp-webpack-plugin

[English Docs](./README.md)

本插件用于生成 `.webp`格式的图片, 保证与原图生成的`hash`一致。举个例子： `vue.e3e41b1.jpg`和`vue.e3e41b1.jpg.webp`同时存在。 

## 下载

```npm
npm i -D webp-webpack-plugin 
// or
yarn add -D webp-webpack-plugin
```

## 使用

在 `webpack.config.js`配置中，, 参数`webp`是图片转换webp工具`sharp`的[配置](http://sharp.dimens.io/en/stable/api-output/#webp) 

```javascript
plugins: [
    new WebPWebpackPlugin({
        match: /(jpe?g|png)$/,
        inject: false, 
        injectCode: '' 
        webp: {
            quality: 80
        }
    })
]
```

## WebPWebpackPlugin参数

- match 符合正则表达式的图片转换成webp
- inject 默认是false， 默认不插入runtime代码，优先级低于 injectCode
- injectCode 默认为空，不为空 优先级高于 inject:true, 插入自定义的runtime代码

注： runtime代码主要用来对图片进行 webp图片替换逻辑


## 原理

- webp转换原理，通过改变webpack plugin `emit`事件时的 `compilation.assets` 对象，生成文件
- 注入代码逻辑， 感谢 [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) 提供[事件钩子](https://github.com/jantimon/html-webpack-plugin#events)

## 修改历史

[2017-09-19] 默认注入runtime代码，支持注入自定义runtime代码

## 不同版本的webpack比较和配置 

[不同版本的webpack比较和配置][https://github.com/jiangtao/webpack-diff-version-test]

## License 

MIT(开源许可协议)



