// forked from https://github.com/nickjj/esbuild-copy-static-files

const crypto = require('crypto')
const fs = require('fs')

const getDigest = (string) => {
  const hash = crypto.createHash('md5')
  const data = hash.update(string, 'utf-8')

  return data.digest('hex')
}

const getFileDigest = (path) => {
  if (!fs.existsSync(path)) {
    return null
  }

  if (fs.statSync(path).isDirectory()) {
    return null
  }

  return getDigest(fs.readFileSync(path))
}

function customFilter(src, dest) {
  if (!fs.existsSync(dest)) {
    return true
  }

  if (fs.statSync(dest).isDirectory()) {
    return true
  }

  return getFileDigest(src) !== getFileDigest(dest)
}

module.exports = (options = {}) => ({
  name: 'copy-static-files',
  setup(build) {
    const {
      dereference = true,
      errorOnExist = false,
      filter = customFilter,
      force = true,
      copyTasks = [],
      preserveTimestamps = true,
      recursive = true,
    } = options

    build.onEnd(() => {
      copyTasks.forEach(({from, to}) => fs.cpSync(from, to, {
        dereference,
        errorOnExist,
        filter,
        force,
        preserveTimestamps,
        recursive,
      }))
  })
  },
})