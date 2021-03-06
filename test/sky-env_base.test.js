var testutil = require('testutil')
  , fs = require('fs-extra')
  , P = require('autoresolve')
  , skyenv  = require(P('lib/sky-env'))
  , SkyEnv = skyenv.SkyEnv
  , path = require('path')
  , tl = require(P('test/testlib/util'))

var TEST_DIR = null
  , CFG_FILE = null


describe('SkyEnv', function() {
  beforeEach(function() {
    TEST_DIR = testutil.createTestDir('sky')
    CFG_FILE = path.join(TEST_DIR, 'sky', 'config.json')
    fs.outputFileSync(CFG_FILE, '')
    process.chdir(TEST_DIR)
  })

  describe('- indexTitle', function() {
    describe('> when nothing is set', function() {
      it('should return basic title', function() {
        fs.writeJsonSync(CFG_FILE, {})
        var se = new SkyEnv(tl.findBaseDirSync())
        se.loadConfigsSync()
        EQ (se.indexTitle, 'Sky Site')
      })
    })

    describe('> when name is set', function() {
      it('should return name', function() {
        fs.writeJsonSync(CFG_FILE, {site: {name: 'Cool Blog'}})
        var se = new SkyEnv(tl.findBaseDirSync())
        se.loadConfigsSync()
        EQ (se.indexTitle, 'Cool Blog')
      })
    })

    describe('> when name and tagline are set', function() {
      it('should return name and tagline', function() {
        fs.writeJsonSync(CFG_FILE, {site: {name: 'Cool Blog', tagline: 'where cool people visit'}})
        var se = new SkyEnv(tl.findBaseDirSync())
        se.loadConfigsSync()
        EQ (se.indexTitle, 'Cool Blog: where cool people visit')
      })
    })

    describe('> when name, tagline, and title are set', function() {
      it('should return title', function() {
        fs.writeJsonSync(CFG_FILE, {site: {name: 'Cool Blog', tagline: 'where cool people visit', title: 'TITLE'}})
        var se = new SkyEnv(tl.findBaseDirSync())
        se.loadConfigsSync()
        EQ (se.indexTitle, 'TITLE')
      })
    })
  })

  describe('- lastBuild', function() {
    describe('> when not set', function() {
      it('should return the default 0 date', function() {
        fs.writeJsonSync(CFG_FILE, {})
        var se = new SkyEnv(tl.findBaseDirSync())
        se.loadConfigsSync()
        EQ (se.lastBuild.getTime(), new Date(0).getTime())
      })
    })

    describe('> when set', function() {
      it('should return the  date', function() {
        fs.writeJsonSync(CFG_FILE, {build: {lastBuild: '2013-04-01'}})
        var se = new SkyEnv(tl.findBaseDirSync())
        se.loadConfigsSync()
        EQ (se.lastBuild.getTime(), new Date('2013-04-01').getTime())
      })
    })
  })

  describe('- outputDir', function() {
    describe('> when outputDir is specified', function() {
      it('should return the absolute output dir', function() {
        fs.writeJsonSync(CFG_FILE, {build: {outputDir: 'superman/'}})
        var se = new SkyEnv(tl.findBaseDirSync())
        se.loadConfigsSync()
        EQ (tl.removePrivate(se.outputDir), path.join(TEST_DIR, 'superman'))
      })
    })

    describe('> when outputDir is not specified', function() {
      it('should return the absolute output dir', function() {
        fs.writeJsonSync(CFG_FILE, {})
        var se = new SkyEnv(tl.findBaseDirSync())
        se.loadConfigsSync()
        EQ (tl.removePrivate(se.outputDir), path.join(TEST_DIR, 'public'))
      })
    })
  })

  describe('- partialFile()', function() {
    it('should return the file path from the partial name', function() {
      var dir = tl.findBaseDirSync()
      var se = skyenv(dir)

      //purposely doesn't include extension
      EQ (se.partialFile('googleAnalytics'), path.join(dir, 'sky', 'partials', 'googleAnalytics'))

    })
  })

  describe('- themeName', function() {
    describe('> when specified in config', function() {
      it('it should return the proper theme', function() {
        fs.writeJsonSync(CFG_FILE, {site: {theme: 'shiny'}})
        var se = new SkyEnv(tl.findBaseDirSync())
        se.loadConfigsSync()
        EQ (se.themeName, 'shiny')
      })
    })

    describe('> when its not specified in config', function() {
      it('it should return the proper theme', function() {
        fs.writeJsonSync(CFG_FILE, {})
        var se = new SkyEnv(tl.findBaseDirSync())
        se.loadConfigsSync()
        EQ (se.themeName, 'basic')
      })
    })
  })

  describe('- themeDir', function() {
    it('should retrieve the theme dir', function() {        
      var se = skyenv(tl.findBaseDirSync())
      se.loadConfigsSync()
      EQ (tl.removePrivate(se.themeDir), path.join(TEST_DIR, 'sky', 'themes', se.themeName))
    })
  })

  describe('- path()', function() {
    it('should join all the arguments with the base directory', function() {
      var baseDir = tl.findBaseDirSync()
      var se = skyenv(baseDir)
      var cfgFile = se.path('sky', 'config.json')
      EQ (cfgFile, path.join(baseDir, 'sky', 'config.json'))
    })
  })
})


