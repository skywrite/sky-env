
'use strict'

module.exports = function(baseDir) {
  return new SkyEnv(baseDir)
}
module.exports.SkyEnv = SkyEnv

var fs = require('fs-extra')
  , path = require('path')
  , jsoncfg = require('jsoncfg')
  , S = require('string')
  , sutil = require('./util') 


var CFG_FILE = 'sky/config.json'; //relative to the base dir


function SkyEnv (baseDir) {
  if (!baseDir) throw new Error("Must pass in baseDir into SkyEnv")

  this.baseDir = baseDir
  this.configFile = path.join(this.baseDir, CFG_FILE)
  this.configs = null
  this.themePaths = {}
}

SkyEnv.prototype.loadConfigsSync = function() {
  var dirs = ['./', './sky']
    , configs = {}
    , errors = {}
    , _this = this

  dirs.forEach(function(dir) {
    var cfgs = jsoncfg.loadFilesSync(path.join(_this.baseDir, dir))
    errors = sutil.extend(errors, cfgs.errors)
    configs = sutil.extend(configs, cfgs)
  })

  configs.errors = errors
  this.configs = configs
  return this
}

/****************************
 * Properties
 ****************************/

//articleIndex
Object.defineProperty(SkyEnv.prototype, 'articleIndex', {
  get: function() {
    return this.configs.get('config:articles.index') || 'index.html'
  }
})

//indexTitle
Object.defineProperty(SkyEnv.prototype, 'indexTitle', {
  get: function() {
    var title = ''
    if (this.configs.get('config:site.name')) {
      title = this.configs.get('config:site.name')
      if (this.configs.get('config:site.tagline'))
        title += ': ' + this.configs.get('config:site.tagline')
    }
    return this.configs.get('config:site.title') || title || "Sky Site"
  }
})

//lastBuild
Object.defineProperty(SkyEnv.prototype, 'lastBuild', {
  get: function() {
    var lastBuild = new Date(0)
    if (this.configs.get('config:build.lastBuild'))
      lastBuild = new Date(this.configs.get('config:build.lastBuild'))
    return lastBuild
  }
})

//outputDir
Object.defineProperty(SkyEnv.prototype, 'outputDir', {
  get: function() {
    if (this.configs.get('config:build.outputDir')) 
      return path.resolve(path.join(this.baseDir, this.configs.get('config:build.outputDir')))
    else
      return path.resolve(path.join(this.baseDir, 'public'))
  }
})

//themeDir
Object.defineProperty(SkyEnv.prototype, 'themeDir', {
  get: function() {
    return path.join(this.baseDir, 'sky', 'themes', this.themeName) 
  }
})


//themeName
Object.defineProperty(SkyEnv.prototype, 'themeName', {
  get: function() {
    return this.configs.get('config:site.theme') || 'basic'
  }
})

/****************************
 * Methods
 ****************************/

SkyEnv.prototype.mdArticleToOutputFile = function(mdfile, data) {
  var outputDir = this.outputDir

  if (data) {
    var articleUrlFormat = this.configs.get('config:articles.urlformat') || "articles/{{date-year}}/{{date-month}}/{{slug}}.html"
    var relOut = S(articleUrlFormat).template(data).s
    return relOut
  } else {
    var base = path.basename(mdfile, '.md')
    return S(base).slugify() + '.html'
  }
}

//this is a bit verbose
SkyEnv.prototype.mdArticleToOutputFileWithPath = function() {
  return path.join(this.outputDir, this.mdArticleToOutputFile.apply(this, arguments))
}

SkyEnv.prototype.mdPageToOutputFileWithPath = function(mdfile, data) {
  var basedir = mdfile.split('pages/')[1]
  var dirs = basedir.split('/')
  dirs.pop()
  basedir = dirs.join('/')

  if (data) {
    if (!data.basedir) data.basedir = basedir

    var urlFormat = this.configs.get('config:pages.urlformat') || 'pages/{{basedir}}/{{slug}}.html'
    var relOut = S(urlFormat).template(data).s

    //clean extra '/'s
    relOut = path.join.apply(path, relOut.split('/'))
    return path.join(this.outputDir, relOut)
  } else {
    var base = path.basename(mdfile, '.md')
    var slug = S(base).slugify() + '.html'
    return path.join(this.outputDir, basedir, slug)
  }
}

SkyEnv.prototype.partialFile = function(partialName) {
  return this.path('sky', 'partials', partialName)
}

SkyEnv.prototype.path = function(paths) {
  paths = [].slice.call(arguments)
  paths.unshift(this.baseDir)

  return path.join.apply(path, paths)
}






