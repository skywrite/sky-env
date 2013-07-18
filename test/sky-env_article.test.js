var testutil = require('testutil')
  , fs = require('fs-extra')
  , P = require('autoresolve')
  , skyenv  = require(P('lib/sky-env'))
  , SkyEnv = skyenv.SkyEnv
  , path = require('path')
  , pp = require('parentpath')

var TEST_DIR = null
  , CFG_FILE = null

describe('SkyEnv', function() {
  beforeEach(function() {
    TEST_DIR = testutil.createTestDir('sky')
    CFG_FILE = path.join(TEST_DIR, 'sky', 'config.json')
    fs.outputFileSync(CFG_FILE, '')
  })

  describe('article', function() {
    describe('- articleIndex', function() {
      describe('> when specified in config', function() {
        it('should return the proper index file', function() {
          process.chdir(TEST_DIR)
          fs.writeJsonSync(CFG_FILE, {articles: {index: 'superIndex'}})
          var se = skyenv(findBaseDirSync())
          se.loadConfigsSync()
          EQ (se.articleIndex, 'superIndex')
        })
      })

      describe('> when not specified in config', function() {
        it('should return the proper index file', function() {
          process.chdir(TEST_DIR)
          fs.writeJsonSync(CFG_FILE, {})
          var se = skyenv(findBaseDirSync())
          se.loadConfigsSync()
          EQ (se.articleIndex, 'index.html')
        })
      })
    })
  })
})