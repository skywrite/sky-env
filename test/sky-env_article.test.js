var testutil = require('testutil')
  , fs = require('fs-extra')
  , P = require('autoresolve')
  , skyenv  = require(P('lib/sky-env'))
  , SkyEnv = skyenv.SkyEnv
  , path = require('path')
  , pp = require('parentpath')
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

  describe('article', function() {
    describe('- articleIndex', function() {
      describe('> when specified in config', function() {
        it('should return the proper index file', function() {
          fs.writeJsonSync(CFG_FILE, {articles: {index: 'superIndex'}})
          var se = skyenv(tl.findBaseDirSync())
          se.loadConfigsSync()
          EQ (se.articleIndex, 'superIndex')
        })
      })

      describe('> when not specified in config', function() {
        it('should return the proper index file', function() {
          fs.writeJsonSync(CFG_FILE, {})
          var se = skyenv(tl.findBaseDirSync())
          se.loadConfigsSync()
          EQ (se.articleIndex, 'index.html')
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
          EQ (se.mdArticleToOutputFileWithPath(path.join(articlesDir, 'bitcoin-economics.md'), data), path.join(se.outputDir, data.slug))
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
          EQ (se.mdArticleToOutputFileWithPath(path.join(articlesDir, 'bitcoin-economics.md'), data), path.join(se.outputDir, expected))
        })
      })
    })
  })
})