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

  describe('- getOutputDir()', function() {
    describe('> when outputDir is specified', function() {
      it('should return the absolute output dir', function() {
        fs.writeJsonSync(CFG_FILE, {build: {outputDir: 'superman/'}})
        
        var se = new SkyEnv(tl.findBaseDirSync())
        se.loadConfigsSync()
        EQ (tl.removePrivate(se.getOutputDir()), path.join(TEST_DIR, 'superman'))
      })
    })

    describe('> when outputDir is not specified', function() {
      it('should return the absolute output dir', function() {
        fs.writeJsonSync(CFG_FILE, {})
        
        var se = new SkyEnv(tl.findBaseDirSync())
        se.loadConfigsSync()
        EQ (tl.removePrivate(se.getOutputDir()), path.join(TEST_DIR, 'public'))
      })
    })
  })

  describe('- mdArticleToOutputFileWithPath(mdfile, [data])', function() {
    describe('> when no data is passed as an arg', function() {
      it('should return a file with slug based upon markdown file name', function() {
        var se = new SkyEnv('/tmp')
        se.configs = {get: function() { return ''}} //mock it up
        EQ (se.mdArticleToOutputFileWithPath('/tmp/articles/bitcoin-economics.md'), '/tmp/public/bitcoin-economics.html')
      })
    })

    describe('> when urlformat exists', function() {
      it('should return the proper name with the data slug', function() {
        var articlesDir = path.join(TEST_DIR, 'articles')
        fs.writeJsonSync(CFG_FILE, {articles: {urlformat: '{{slug}}'}})
        
        var se = new SkyEnv(tl.findBaseDirSync())
        se.loadConfigsSync()
        var data = {
          slug: 'burt-and-ernie'
        }
        EQ (se.mdArticleToOutputFileWithPath(path.join(articlesDir, 'bitcoin-economics.md'), data), path.join(se.getOutputDir(), data.slug))
      })
    })

    describe('> when urlformat does not exist', function() {
      it('should return the proper name with the data slug', function() {
        var articlesDir = path.join(TEST_DIR, 'articles')
        fs.writeJsonSync(CFG_FILE, {})
        
        var se = new SkyEnv(tl.findBaseDirSync())
        se.loadConfigsSync()
        var data = {
          slug: 'burt-and-ernie',
          'date-year': '2011',
          'date-month': '04'
        }

        var expected = "articles/2011/04/burt-and-ernie.html"
        EQ (se.mdArticleToOutputFileWithPath(path.join(articlesDir, 'bitcoin-economics.md'), data), path.join(se.getOutputDir(), expected))
      })
    })
  })

  describe('- getIndexTitle()', function() {
    describe('> when nothing is set', function() {
      it('should return basic title', function() {
        fs.writeJsonSync(CFG_FILE, {})
        
        var se = new SkyEnv(tl.findBaseDirSync())
        se.loadConfigsSync()
        EQ (se.getIndexTitle(), 'Sky Site')
      })
    })

    describe('> when name is set', function() {
      it('should return name', function() {
        fs.writeJsonSync(CFG_FILE, {site: {name: 'Cool Blog'}})
        
        var se = new SkyEnv(tl.findBaseDirSync())
        se.loadConfigsSync()
        EQ (se.getIndexTitle(), 'Cool Blog')
      })
    })

    describe('> when name and tagline are set', function() {
      it('should return name and tagline', function() {
        fs.writeJsonSync(CFG_FILE, {site: {name: 'Cool Blog', tagline: 'where cool people visit'}})
        
        var se = new SkyEnv(tl.findBaseDirSync())
        se.loadConfigsSync()
        EQ (se.getIndexTitle(), 'Cool Blog: where cool people visit')
      })
    })

    describe('> when name, tagline, and title are set', function() {
      it('should return title', function() {
        fs.writeJsonSync(CFG_FILE, {site: {name: 'Cool Blog', tagline: 'where cool people visit', title: 'TITLE'}})
        
        var se = new SkyEnv(tl.findBaseDirSync())
        se.loadConfigsSync()
        EQ (se.getIndexTitle(), 'TITLE')
      })
    })
  })

  describe('- getLastBuild()', function() {
    describe('> when not set', function() {
      it('should return the default 0 date', function() {
        fs.writeJsonSync(CFG_FILE, {})
        
        var se = new SkyEnv(tl.findBaseDirSync())
        se.loadConfigsSync()
        EQ (se.getLastBuild().getTime(), new Date(0).getTime())
      })
    })

    describe('> when set', function() {
      it('should return the  date', function() {
        fs.writeJsonSync(CFG_FILE, {build: {lastBuild: '2013-04-01'}})
        
        var se = new SkyEnv(tl.findBaseDirSync())
        se.loadConfigsSync()
        EQ (se.getLastBuild().getTime(), new Date('2013-04-01').getTime())
      })
    })
  })

  describe('- getThemeName()', function() {
    describe('> when specified in config', function() {
      it('it should return the proper theme', function() {
        fs.writeJsonSync(CFG_FILE, {site: {theme: 'shiny'}})
        
        var se = new SkyEnv(tl.findBaseDirSync())
        se.loadConfigsSync()
        EQ (se.getThemeName(), 'shiny')
      })
    })

    describe('> when its not specified in config', function() {
      it('it should return the proper theme', function() {
        fs.writeJsonSync(CFG_FILE, {})
        
        var se = new SkyEnv(tl.findBaseDirSync())
        se.loadConfigsSync()
        EQ (se.getThemeName(), 'basic')
      })
    })
  })

  describe('- getThemeDir()', function() {
    it('should retrieve the theme dir', function() {        
      var se = skyenv(tl.findBaseDirSync())
      se.loadConfigsSync()
      EQ (tl.removePrivate(se.getThemeDir()), path.join(TEST_DIR, 'sky', 'themes', se.getThemeName()))
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


