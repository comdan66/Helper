/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2021, @oawu/helper
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Path = require('path')
const FileSystem = require('fs')

const Typeof = {
  func: val => typeof val == 'function',
  bool: val => typeof val == 'boolean',
  object: val => typeof val == 'object',
  str: val => typeof val == 'string',
  arr: val => Typeof.object(val) && Array.isArray(val)
}

Typeof.str.notEmpty = val => Typeof.str(val) && val !== ''
Typeof.arr.notEmpty = val => Typeof.arr(val) && val.length

Typeof.func.or = (val, d4) => Typeof.func(val) ? val : d4
Typeof.bool.or = (val, d4) => Typeof.bool(val) ? val : d4
Typeof.object.or = (val, d4) => Typeof.object(val) ? val : d4
Typeof.str.or = (val, d4) => Typeof.str(val) ? val : d4
Typeof.arr.or = (val, d4) => Typeof.arr(val) ? val : d4
Typeof.str.notEmpty.or = (val, d4) => Typeof.str.notEmpty(val) ? val : d4
Typeof.arr.notEmpty.or = (val, d4) => Typeof.arr.notEmpty(val) ? val : d4

Typeof.func.do = (val, func) => Typeof.func(val) && Typeof.func(func) && func(val)
Typeof.bool.do = (val, func) => Typeof.bool(val) && Typeof.func(func) && func(val)
Typeof.object.do = (val, func) => Typeof.object(val) && Typeof.func(func) && func(val)
Typeof.str.do = (val, func) => Typeof.str(val) && Typeof.func(func) && func(val)
Typeof.arr.do = (val, func) => Typeof.arr(val) && Typeof.func(func) && func(val)
Typeof.str.notEmpty.do = (val, func) => Typeof.str.notEmpty(val) && Typeof.func(func) && func(val)
Typeof.arr.notEmpty.do = (val, func) => Typeof.arr.notEmpty(val) && Typeof.func(func) && func(val)

Typeof.func.do.or = (val, func, d4) => Typeof.func(val = Typeof.func.do(val, func)) ? val : d4
Typeof.bool.do.or = (val, func, d4) => Typeof.bool(val = Typeof.bool.do(val, func)) ? val : d4
Typeof.object.do.or = (val, func, d4) => Typeof.object(val = Typeof.object.do(val, func)) ? val : d4
Typeof.str.do.or = (val, func, d4) => Typeof.str(Typeof.str.do(val, func)) ? val : d4
Typeof.arr.do.or = (val, func, d4) => Typeof.arr(val = Typeof.arr.do(val, func)) ? val : d4
Typeof.str.notEmpty.do.or = (val, func, d4) => Typeof.str.notEmpty(Typeof.str.notEmpty.do(val, func)) ? val : d4
Typeof.arr.notEmpty.do.or = (val, func, d4) => Typeof.arr.notEmpty(Typeof.arr.notEmpty.do(val, func)) ? val : d4


module.exports = {
  Typeof,

  clean: _ => process.stdout.write("\x1b[2J\x1b[0f"),

  println: text => process.stdout.write('' + text + "\n"),

  scanDir (dir, recursive = true) {
    try { return this.exists(dir) ? FileSystem.readdirSync(dir).map(file => !['.', '..'].includes(file) ? recursive && this.access(dir + file) && this.isDirectory(dir + file) ? this.scanDir(dir + file + Path.sep, recursive) : [dir + file] : null).filter(t => t !== null).reduce((a, b) => a.concat(b), []) : [] }
    catch (_) { return [] }
  },

  exists: dir => {
    try { return FileSystem.existsSync(dir) }
    catch (e) { return false }
  },

  mkdir: (dir, recursive = false) => {
    try { return FileSystem.mkdirSync(dir, { recursive }), true }
    catch (e) { return false }
  },

  access (path, permission = FileSystem.constants.R_OK) {
    try { return FileSystem.accessSync(path, permission), true }
    catch (error) { return false }
  },

  isDirectory: path => !!FileSystem.statSync(path).isDirectory(),

  isFile: path => !!FileSystem.statSync(path).isFile(),

  isSub: (sub, main) => {
    return sub = sub.split('').map(s => s.charCodeAt(0)), main = main.split('').map(s => s.charCodeAt(0)).slice(0, sub.length), main !== false && sub.join('') === main.join('')
  },

  verifyDirs (base, dirs) {
    for (let dir of dirs.reduce((a, b) => { const last = a.pop(); return last === undefined ? [[b]] : [...a, last, last.concat(b)] }, []).map(dirs => dirs.length ? dirs.join(Path.sep) + Path.sep : ''))
      if (!(this.access(base + dir) && this.isDirectory(base + dir)))
        if (this.mkdir(base + dir), !(this.access(base + dir) && this.isDirectory(base + dir)))
          return false
    return true
  },

  argv: (keys, d4) => {
    keys = Typeof.str.do.or(keys, str => [str], keys)
    const argvs = process.argv.slice(2)
    for(let i = 0; i < argvs.length; i++)
      if (keys.indexOf(argvs[i]) !== -1)
        if (typeof argvs[i + 1] !== 'undefined' && argvs[i + 1][0] != '-')
          return argvs[i + 1]
    return d4
  }
}
