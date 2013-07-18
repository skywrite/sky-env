var pp = require('parentpath')

var me = module.exports

me.removePrivate = function(dir) {
  if (!dir) return null

  if (dir.indexOf('/private/tmp') === 0)  //MAC OS X symlinks /tmp to /private/tmp
    dir = dir.replace('/private', '');
  return dir
}

me.findBaseDirSync = function() {
  return pp.sync('sky/config.json')
}