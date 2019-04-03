const BASE_URL = process.env.COMIC_READER_BASE_URL || '/comic/reader/api'
const DB_FILE = process.env.COMIC_READER_DB_FILE || './comics.sqlite'
const DEBUG = process.env.COMIC_READER_DEBUG || false

const knex = require('knex')({
  client: 'sqlite3',
  connection: { filename: DB_FILE },
  useNullAsDefault: false
})

if (DEBUG) {
  knex.on('query', console.log)
}

function filterGalleries(knex, params) {
  let query = knex('gallery_tags as gts')
    .groupBy('gts.gallery')
    .whereNotIn('gts.gallery', knex('gallery_tags').whereIn('tag', params.excludedTags).select('gallery'))
    .join('galleries', 'gts.gallery', '=', 'galleries.id')
    .where('galleries.title', 'like', `%${params.title}%`)

  if (params.includedTags.length > 0) {
    query = query
      .whereIn('tag', params.includedTags)
      .havingRaw(`count(gts.gallery) = ${params.includedTags.length}`)
  }

  if (params.downloadsOnly) {
    query = query
      .join('gallery_downloads', 'galleries.id', '=', 'gallery_downloads.gallery')
  }

  return query
}

function searchGalleries(knex, params) {
  return filterGalleries(knex, params)
    .leftJoin('gallery_downloads as gds', 'galleries.id', '=', 'gds.gallery')
    .select('galleries.*', 'gds.location as location')
    .orderBy('galleries.uploaded', 'desc')
    .offset(params.bookOffset)
    .limit(params.bookCount)
}

function searchTags(knex, params) {
  return knex('tags')
    .select('id')
    .where('id', 'like', `%${params.tag}%`)
    .orderBy('id', 'asc')
    .limit(params.tagCount)
}

function searchTagRanks(knex, params) {
  let query = knex
    .from(filterGalleries(knex, params).as('g1'))
    .join('gallery_tags', 'g1.gallery', '=', 'gallery_tags.gallery')

  if (params.tagCategories.length > 0) {
    query = query
      .join('tags', 'gallery_tags.tag', '=', 'tags.id')
      .whereIn('tags.category', params.tagCategories)
  }
  
  return query
    .whereNotIn('gallery_tags.tag', params.includedTags)
    .select('gallery_tags.tag as tag')
    .count('gallery_tags.tag as count')
    .groupBy('gallery_tags.tag')
    .orderBy('count', 'desc')
    .limit(params.tagCount)
}

module.exports = function(app) {
  app.post(BASE_URL + '/books', (req, res) => {
    const body = req.body
    searchGalleries(knex, {
	title: body.title || '',
	includedTags: body.includedTags || [],
	excludedTags: body.excludedTags || [],
	downloadsOnly: body.downloadsOnly,
	bookCount: body.bookCount || 10,
	bookOffset: body.bookOffset || 0
      }).then(results => {
      res.setHeader('Content-Type', 'application/json')
      res.send(results)
    })
  })

  app.post(BASE_URL + '/tags', (req, res) => {
    const body = req.body
    searchTags(knex, {
	tag: body.tag || '',
	tagCount: body.tagCount || 5
      }).then(results => {
      res.setHeader('Content-Type', 'application/json')
      res.send(results)
    })
  })

  app.post(BASE_URL + '/tag-ranks', (req, res) => {
    const body = req.body
    searchTagRanks(knex, {
	title: body.title || '',
	includedTags: body.includedTags || [],
	excludedTags: body.excludedTags || [],
	downloadsOnly: body.downloadsOnly,
	tagCategories: body.tagCategories || [],
	tagCount: body.tagCount || 5
      }).then(results => {
      res.setHeader('Content-Type', 'application/json')
      res.send(results)
    })
  })
}
