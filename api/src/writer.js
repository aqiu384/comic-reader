const fs = require('fs')
const util = require('util')
const fetch = require('node-fetch')

const OCR_URL = process.env.TEXT_DETECTOR_OCR_URL || 'http://localhost:5000'
const OCR_PATH = process.env.TEXT_DETECTOR_OCR_PATH || '/ocr-data'
const BASE_URL = process.env.TEXT_DETECTOR_BASE_URL || '/comic/writer/api'
const PAGES_PATH = process.env.TEXT_DETECTOR_PAGES_PATH || './pages'

fs.readFileAsync = util.promisify(fs.readFile)
fs.writeFileAsync = util.promisify(fs.writeFile)

module.exports = function(app) {
  app.get(BASE_URL + '/g/:bookId/:pageId', (req, res) => {
    const pagePath = `/${req.params.bookId}/${req.params.pageId}`

    fs.readFileAsync(PAGES_PATH + pagePath + '.json', { encoding: 'utf-8' })
    .then(results => {
      res.setHeader('Content-Type', 'application/json')
      res.send({ 'boxes': JSON.parse(results) })
    })
  })

  app.post(BASE_URL + '/g/:bookId/:pageId', (req, res) => {
    const body = req.body
    const pagePath = `/${req.params.bookId}/${req.params.pageId}`

    fs.writeFileAsync(PAGES_PATH + pagePath + '.json', JSON.stringify(body.boxes, null, 2))
    .then(results => {
      res.setHeader('Content-Type', 'application/json')
      res.send({ result: 'OK' })
    })
  })

  app.post(BASE_URL + '/ocr/:bookId/:pageId', (req, res) => {
    const pagePath = `/${req.params.bookId}/${req.params.pageId}`

    fetch(OCR_URL + '/run-ocr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        boxfile: PAGES_PATH + pagePath + '.json',
        imgfile: PAGES_PATH + pagePath,
        textfile: OCR_PATH + pagePath + '-text.png',
        pagefile: OCR_PATH + pagePath + '-page.png',
        newboxfile: OCR_PATH + pagePath + '.json'
      })
    })
    .then(results => results.json())
    .then(results => {
      res.setHeader('Content-Type', 'application/json')
      res.send(results)
    })
  })
}
