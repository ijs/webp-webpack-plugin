// run in the broswers
; (function webpWebpackPluginRuntime() {
  function detectWebp() {
    var canvas, supportCanvas
    canvas = document.createElement('canvas')
    supportCanvas = canvas.getContext && canvas.getContext('2d')
    if (supportCanvas) {
      canvas.width = canvas.height = 1
      return canvas.toDataURL('image/webp', 0.01).indexOf('image/webp') !== -1
    } else {
      return false
    }
  }
  function isUrl(url) {
    return /^(\/\/|https?)\:\/\/[a-z0-9]\./.test(url)
  }

  function isWebp(url) {
    if (isUrl(url)) {
      return url.split('.').pop().indexOf('webp') !== -1
    }
    return false
  }

  if (detectWebp()) {
    window.addEventListener('DOMContentLoaded', function () {
      var imgs = document.querySelectorAll('img')
      var i, img, src
      for (i in imgs) {
        if (imgs.hasOwnProperty(i)) {
          img = imgs[i]
          src = img.getAttribute(window.__webp_webpack_plugin_img_src__) || img.src
          img.src = isUrl(src)
            ? isWebp(src) ? src : src + '.webp'
            : src
        }
      }
    })
  }
})()