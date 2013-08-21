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

  describe('page', function() {
    describe('- mdPageToOutputFileWithPath(mdfile, [data])', function() {
      describe('> when no data is passed as an arg', function() {
        it('should return a file with slug based upon markdown file name', function() {
          var se = new SkyEnv('/tmp')
          se.configs = {get: function() { return ''}} //mock it up
          EQ (se.mdPageToOutputFileWithPath('/tmp/pages/bitcoin-economics.md'), '/tmp/public/bitcoin-economics.html')
          EQ (se.mdPageToOutputFileWithPath('/tmp/pages/super/long/bitcoin-economics.md'), '/tmp/public/super/long/bitcoin-economics.html')
        })
      })

      describe('> when urlformat exists', function() {
        it('should return the proper name with the data slug', function() {
          var pagesDir = path.join(TEST_DIR, 'pages')
          fs.writeJsonSync(CFG_FILE, {pages: {urlformat: 'pgs/{{basedir}}/{{slug}}'}})
          
          var se = new SkyEnv(tl.findBaseDirSync())
          se.loadConfigsSync()
          var data = {
            slug: 'burt-and-ernie'
          }
          EQ (se.mdPageToOutputFileWithPath(path.join(pagesDir, 'bitcoin-economics.md'), data), path.join(se.outputDir, 'pgs', data.slug))
          EQ (se.mdPageToOutputFileWithPath(path.join(pagesDir, 'subdir', 'bitcoin-economics.md'), data), path.join(se.outputDir, 'pgs', 'subdir', data.slug))
        })
      })

      describe('> when urlformat does not exist', function() {
        it('should return the proper name with the data slug', function() {
          var pagesDir = path.join(TEST_DIR, 'pages')
          fs.writeJsonSync(CFG_FILE, {})
          
          var se = new SkyEnv(tl.findBaseDirSync())
          se.loadConfigsSync()
          var data = {
            slug: 'burt-and-ernie'
          }

          var expected = "pages/burt-and-ernie.html"
          EQ (se.mdPageToOutputFileWithPath(path.join(pagesDir, 'bitcoin-economics.md'), data), path.join(se.outputDir, expected))
        })
      })
    })
  })
})