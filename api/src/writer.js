const fs = require('fs')
const util = require('util')
const fetch = require('node-fetch')

const BASE_URL = process.env.COMIC_WRITER_BASE_URL || '/comic/writer/api'
const IMGS_PATH = process.env.COMIC_WRITER_IMGS_PATH || './imgs'
const DATA_PATH = process.env.COMIC_WRITER_DATA_PATH || './data'
const OCR_URL = process.env.COMIC_WRITER_OCR_URL || 'http://localhost:5000'
const OCR_PATH = process.env.COMIC_WRITER_OCR_PATH || '/ocr-data'

fs.readFileAsync = util.promisify(fs.readFile)
fs.writeFileAsync = util.promisify(fs.writeFile)

module.exports = function(app) {
  app.get(BASE_URL + '/g/:bookId/:pageId', (req, res) => {
    const pagePath = `/${req.params.bookId}/${req.params.pageId}`

    fs.readFileAsync(DATA_PATH + pagePath + '.json', { encoding: 'utf-8' })
    .catch(e => '{ "boxes": [] }')
    .then(results => {
      res.setHeader('Content-Type', 'application/json')
      res.send(JSON.parse(results))
    })
  })

  app.post(BASE_URL + '/g/:bookId/:pageId', (req, res) => {
    const pagePath = `/${req.params.bookId}/${req.params.pageId}`

    fs.writeFileAsync(DATA_PATH + pagePath + '.json', JSON.stringify(req.body, null, 2))
    .then(results => {
      res.setHeader('Content-Type', 'application/json')
      res.send({ result: 'OK' })
    })
  })

  app.post(BASE_URL + '/g/:bookId/:pageId/ocr', (req, res) => {
    const pagePath = `/${req.params.bookId}/_/${req.params.pageId}`
    const boxfile = DATA_PATH + pagePath.replace('/_/', '/') + '.json'

    fs.readFileAsync(boxfile)
    .then(results =>
      fetch(OCR_URL + '/run-ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boxes: JSON.parse(results).boxes,
          imgfile: IMGS_PATH + pagePath.replace('/_/', '/'),
          textfile: OCR_PATH + pagePath.replace('/_/', '/text/'),
          pagefile: OCR_PATH + pagePath.replace('/_/', '/page/') + '.png'
        })
      })
    )
    .then(results => results.json())
    .then(results => { fs.writeFileAsync(boxfile, JSON.stringify(results, null, 2)); return results })
    .then(results => {
      res.setHeader('Content-Type', 'application/json')
      res.send(results)
    })
  })
}