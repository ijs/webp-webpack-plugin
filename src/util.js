const minify = require('minify')
const fs = require('fs')
module.exports = {
  read(filename, encoding = 'utf-8') {
    return new Promise((resolve, reject) => {
      fs.readFile(filename, { encoding: encoding }, (err, data) => {
        if (err) {
          return reject(err)
        }
        resolve(data)
      })
    })
  },
  compress(filename) {
    return new Promise((resolve, reject) => {
      minify(filename, (err, data) => {
        if (err) {
          return reject(err)
        }
        resolve(data)
      })
    })
  }
}