'use strict'

module.exports = function(baseDir) {
  return new SkyEnv(baseDir)
}
module.exports.SkyEnv = SkyEnv

var fs = require('fs-extra')
  , path = require('path')
  , jsoncfg = require('jsoncfg')
  , S = require('string') 
  , tmpl = require('./template_file')


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
    errors = _.extend(errors, cfgs.errors)
    configs = _.extend(configs, cfgs)
  })

  configs.errors = errors
  this.configs = configs
  return this
}

SkyEnv.prototype.loadThemePathsSync = function() {
  var retObj = this.themePaths
    , tdir = this.getThemeDir()

  retObj.layout = tmpl.findFromBaseSync(tdir, 'layout')
  retObj.article = tmpl.findFromBaseSync(path.join(tdir, 'article'), 'article')
  retObj.articleIndex = tmpl.findFromBaseSync(path.join(tdir, 'article'), 'index')

  return retObj
}

SkyEnv.prototype.getArticleIndex = function() {
  return this.configs.get('config:articles.index') || 'index.html'
}

SkyEnv.prototype.getIndexTitle = function() {
  var title = ''
  if (this.configs.get('config:site.name')) {
    title = this.configs.get('config:site.name')

    if (this.configs.get('config:site.tagline'))
      title += ': ' + this.configs.get('config:site.tagline')
  }
  
  return this.configs.get('config:site.title') || title || "Sky Site"
}

SkyEnv.prototype.getLastBuild = function() {
  var lastBuild = new Date(0)
  if (this.configs.get('config:build.lastBuild'))
    lastBuild = new Date(this.configs.get('config:build.lastBuild'))
  return lastBuild
}

SkyEnv.prototype.getPartialFile = function(file) {
  return this.path('sky', 'partials', file)
}

SkyEnv.prototype.getOutputDir = function() {
  if (this.configs.get('config:build.outputDir')) 
    return path.resolve(path.join(this.baseDir, this.configs.get('config:build.outputDir')))
  else
    return path.resolve(path.join(this.baseDir, 'public'))
}

SkyEnv.prototype.getThemeName = function() {
  return this.configs.get('config:site.theme') || 'basic'
}

SkyEnv.prototype.getThemeDir = function() {
  return path.join(this.baseDir, 'sky', 'themes', this.getThemeName()) 
}

SkyEnv.prototype.mdArticleToOutputFile = function(mdfile, data) {
  var outputDir = this.getOutputDir()

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
  return path.join(this.getOutputDir(), this.mdArticleToOutputFile.apply(this, arguments))
}

SkyEnv.prototype.path = function(paths) {
  var paths = Array.prototype.slice.call(arguments, 0)
  paths.unshift(this.baseDir)

  return path.join.apply(path, paths)
}



